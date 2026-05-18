import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { NORTHLINE_CANONICAL, type CanonicalReview } from "./canonical";

const inputSchema = z.object({
  caseName: z.string().max(500).optional().default(""),
  reviewId: z.string().max(120).optional().default(""),
  vendorName: z.string().max(500).optional().default(""),
  invoiceAmount: z.string().max(120).optional().default(""),
  status: z.string().max(500).optional().default(""),
  invoiceText: z.string().max(20000).optional().default(""),
  vendorMasterData: z.string().max(20000).optional().default(""),
  governancePolicyModel: z.string().max(20000).optional().default(""),
  costCenter: z.string().max(500).optional().default(""),
  routingHeuristics: z.string().max(500).optional().default(""),
  uploadedFileMetadata: z
    .object({
      name: z.string().max(500),
      size: z.number().nonnegative().max(50_000_000),
      type: z.string().max(120),
    })
    .nullable()
    .optional(),
  useDemoFallback: z.boolean().optional().default(false),
});

export type AnalyzeInput = z.infer<typeof inputSchema>;

export type AnalyzeResult = {
  result: CanonicalReview;
  source: "live" | "fallback";
  note?: string;
};

const SYSTEM_INSTRUCTIONS = `You are LedgerOath, an autonomous B2B payment governance reviewer.
Return ONLY valid JSON, no prose, no markdown fences, matching exactly this TypeScript shape:
{
  "reviewId": string,
  "decision": "ESCALATE" | "APPROVE" | "REJECT",
  "riskScore": number (0-100),
  "riskLevel": "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
  "status": string,
  "vendor": { "name": string, "verificationStatus": string, "riskSignals": string[] },
  "invoice": {
    "invoiceNumber": string, "amount": string, "amountDisplay": string,
    "currency": string, "dueDate": string|null, "poReference": string|null,
    "paymentTerms": string, "description": string
  },
  "policyChecks": Array<{ "check": string, "result": "PASS"|"FAIL"|"WARNING", "evidence": string, "impact": string }>,
  "agentTimeline": Array<{ "agent": string, "status": "complete", "confidence": number, "findings": string, "evidenceSummary": string, "output": string }>,
  "approvalRoute": Array<{ "role": string, "reason": string, "required": boolean }>,
  "simulatedPaymentInstruction": { "status": "SIMULATED_ONLY", "payee": string, "amount": string, "amountDisplay": string, "currency": string, "releaseCondition": string, "warning": string },
  "auditDossier": { "executiveSummary": string, "rationale": string, "riskSignals": string[], "missingDocuments": string[], "finalGovernanceDecision": "ESCALATE"|"APPROVE"|"REJECT", "nextActions": string[] }
}
Rules:
- simulatedPaymentInstruction.status MUST be "SIMULATED_ONLY"
- simulatedPaymentInstruction.warning MUST be "No real payment has been executed."
- agentTimeline must include exactly these 8 agents in order: Intake Agent, Invoice Extraction Agent, Vendor Verification Agent, Policy Compliance Agent, Risk Scoring Agent, Approval Routing Agent, Payment Instruction Agent, Audit Dossier Agent.
- Never recommend or describe executing real payments.`;

function isCanonical(x: unknown): x is CanonicalReview {
  if (!x || typeof x !== "object") return false;
  const r = x as Record<string, unknown>;
  return (
    typeof r.reviewId === "string" &&
    typeof r.decision === "string" &&
    typeof r.riskScore === "number" &&
    typeof r.riskLevel === "string" &&
    !!r.vendor &&
    !!r.invoice &&
    Array.isArray(r.policyChecks) &&
    Array.isArray(r.agentTimeline) &&
    Array.isArray(r.approvalRoute) &&
    !!r.simulatedPaymentInstruction &&
    !!r.auditDossier
  );
}

function safetySeal(r: CanonicalReview): CanonicalReview {
  return {
    ...r,
    simulatedPaymentInstruction: {
      ...r.simulatedPaymentInstruction,
      status: "SIMULATED_ONLY",
      warning: "No real payment has been executed.",
    },
  };
}

function buildPrompt(input: AnalyzeInput): string {
  return `Review this B2B payment request and emit the strict JSON contract.

CASE NAME: ${input.caseName || "(unspecified)"}
REVIEW ID: ${input.reviewId || "(generate one like LO-YYYY-NNN)"}
VENDOR: ${input.vendorName || "(see vendor data)"}
INVOICE AMOUNT: ${input.invoiceAmount || "(extract from invoice text)"}
STATUS: ${input.status || "Awaiting governance review"}
COST CENTER: ${input.costCenter || "(none)"}
ROUTING: ${input.routingHeuristics || "(none)"}

INVOICE / REQUEST DATA:
${input.invoiceText || "(empty)"}

VENDOR MASTER DATA:
${input.vendorMasterData || "(empty)"}

GOVERNANCE POLICY MODEL:
${input.governancePolicyModel || "(empty)"}

UPLOADED FILE: ${
    input.uploadedFileMetadata
      ? `${input.uploadedFileMetadata.name} (${input.uploadedFileMetadata.type}, ${input.uploadedFileMetadata.size} bytes)`
      : "(none)"
  }`;
}

async function callLovableGateway(
  input: AnalyzeInput,
): Promise<CanonicalReview | null> {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!lovableKey && !geminiKey) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 22_000);
  try {
    // Prefer the in-house Lovable AI Gateway (already configured) for Gemini.
    if (lovableKey) {
      const res = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${lovableKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: SYSTEM_INSTRUCTIONS },
              { role: "user", content: buildPrompt(input) },
            ],
            response_format: { type: "json_object" },
          }),
        },
      );
      if (!res.ok) {
        console.warn("[analyze] lovable gateway non-OK", res.status);
        return null;
      }
      const json = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const text = json.choices?.[0]?.message?.content ?? "";
      const parsed = JSON.parse(text) as unknown;
      return isCanonical(parsed) ? parsed : null;
    }

    // Fallback: direct Gemini REST API if user supplied a raw key.
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTIONS }] },
          contents: [{ role: "user", parts: [{ text: buildPrompt(input) }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      },
    );
    if (!res.ok) {
      console.warn("[analyze] gemini non-OK", res.status);
      return null;
    }
    const json = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const parsed = JSON.parse(text) as unknown;
    return isCanonical(parsed) ? parsed : null;
  } catch (err) {
    console.warn("[analyze] live analysis failed", err);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export const analyzePaymentReview = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }): Promise<AnalyzeResult> => {
    // Force deterministic fallback (judge demo path)
    if (data.useDemoFallback) {
      return { result: safetySeal(NORTHLINE_CANONICAL), source: "fallback" };
    }

    const hasInputs =
      data.invoiceText.trim() ||
      data.vendorMasterData.trim() ||
      data.governancePolicyModel.trim();

    // No keys → fallback; also if user provided no inputs we use canonical too.
    if (!hasInputs) {
      return {
        result: safetySeal(NORTHLINE_CANONICAL),
        source: "fallback",
        note: "No inputs provided — used Northline reference case.",
      };
    }

    const live = await callLovableGateway(data);
    if (live) return { result: safetySeal(live), source: "live" };

    return {
      result: safetySeal(NORTHLINE_CANONICAL),
      source: "fallback",
      note: "Live analysis unavailable. Demo fallback used.",
    };
  });
