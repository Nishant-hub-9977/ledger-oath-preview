// Strict canonical JSON contract for LedgerOath payment reviews.
// Both the live Gemini analysis and the deterministic fallback return this shape.

export type DecisionStatus = "ESCALATE" | "APPROVE" | "REJECT";
export type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

export type PolicyCheck = {
  check: string;
  result: "PASS" | "FAIL" | "WARNING";
  evidence: string;
  impact: string;
};

export type AgentStep = {
  agent: string;
  status: "complete" | "running" | "pending";
  confidence: number;
  findings: string;
  evidenceSummary: string;
  output: string;
};

export type CanonicalReview = {
  reviewId: string;
  decision: DecisionStatus;
  riskScore: number;
  riskLevel: RiskLevel;
  status: string;
  vendor: {
    name: string;
    verificationStatus: string;
    riskSignals: string[];
  };
  invoice: {
    invoiceNumber: string;
    amount: string;
    amountDisplay: string;
    currency: string;
    dueDate: string | null;
    poReference: string | null;
    paymentTerms: string;
    description: string;
  };
  policyChecks: PolicyCheck[];
  agentTimeline: AgentStep[];
  approvalRoute: { role: string; reason: string; required: boolean }[];
  simulatedPaymentInstruction: {
    status: "SIMULATED_ONLY";
    payee: string;
    amount: string;
    amountDisplay: string;
    currency: string;
    releaseCondition: string;
    warning: string;
  };
  auditDossier: {
    executiveSummary: string;
    rationale: string;
    riskSignals: string[];
    missingDocuments: string[];
    finalGovernanceDecision: DecisionStatus;
    nextActions: string[];
  };
};

export const NORTHLINE_CANONICAL: CanonicalReview = {
  reviewId: "LO-2026-001",
  decision: "ESCALATE",
  riskScore: 72,
  riskLevel: "HIGH",
  status: "Human review required",
  vendor: {
    name: "Northline Systems Pvt. Ltd.",
    verificationStatus: "VERIFIED_WITH_WARNINGS",
    riskSignals: [
      "Vendor bank details changed within 14 days",
      "Vendor verified but requires secondary approval",
    ],
  },
  invoice: {
    invoiceNumber: "NS-2026-044",
    amount: "842500",
    amountDisplay: "₹8,42,500",
    currency: "INR",
    dueDate: "2026-05-24",
    poReference: null,
    paymentTerms: "Requested 3 days earlier than Net 30",
    description: "B2B software implementation services",
  },
  policyChecks: [
    {
      check: "Purchase order reference",
      result: "FAIL",
      evidence: "No valid PO reference found on invoice",
      impact: "Payment cannot be auto-approved",
    },
    {
      check: "Single approver threshold",
      result: "FAIL",
      evidence: "Invoice amount ₹8,42,500 exceeds ₹5,00,000 threshold",
      impact: "Finance Controller and Procurement Head required",
    },
    {
      check: "Payment terms",
      result: "WARNING",
      evidence: "Payment requested 3 days earlier than standard terms",
      impact: "Early release requires approval",
    },
    {
      check: "Vendor bank change",
      result: "WARNING",
      evidence: "Bank details changed within the last 14 days",
      impact: "Secondary vendor verification required",
    },
  ],
  agentTimeline: [
    {
      agent: "Intake Agent",
      status: "complete",
      confidence: 99,
      findings: "Successfully ingested invoice and supporting documentation.",
      evidenceSummary: "Invoice request and vendor master data received.",
      output: "Case file opened.",
    },
    {
      agent: "Invoice Extraction Agent",
      status: "complete",
      confidence: 95,
      findings:
        "Extracted invoice amount, vendor, reference, and payment terms.",
      evidenceSummary: "Invoice NS-2026-044 for ₹8,42,500.",
      output: "Structured invoice record created.",
    },
    {
      agent: "Vendor Verification Agent",
      status: "complete",
      confidence: 88,
      findings:
        "Vendor exists in master data, but recent bank detail change was flagged.",
      evidenceSummary: "Bank details changed within 14 days.",
      output: "Verified with warnings.",
    },
    {
      agent: "Policy Compliance Agent",
      status: "complete",
      confidence: 92,
      findings: "Multiple policy exceptions found.",
      evidenceSummary:
        "Missing PO, threshold breach, early payment request.",
      output: "Policy escalation required.",
    },
    {
      agent: "Risk Scoring Agent",
      status: "complete",
      confidence: 90,
      findings: "Composite risk score calculated at 72.",
      evidenceSummary: "Medium-high risk due to stacked policy exceptions.",
      output: "Risk level HIGH.",
    },
    {
      agent: "Approval Routing Agent",
      status: "complete",
      confidence: 98,
      findings:
        "Finance Controller and Procurement Head approvals required.",
      evidenceSummary: "Threshold and vendor-risk controls activated.",
      output: "Escalation route generated.",
    },
    {
      agent: "Payment Instruction Agent",
      status: "complete",
      confidence: 100,
      findings: "Drafted simulated payment instruction, halted for approval.",
      evidenceSummary: "No real payment execution allowed.",
      output: "SIMULATED_ONLY.",
    },
    {
      agent: "Audit Dossier Agent",
      status: "complete",
      confidence: 100,
      findings: "Compiled governance record and audit dossier.",
      evidenceSummary: "All findings consolidated.",
      output: "Dossier ready.",
    },
  ],
  approvalRoute: [
    {
      role: "Finance Controller",
      reason: "Invoice exceeds single-approver threshold",
      required: true,
    },
    {
      role: "Procurement Head",
      reason: "Missing purchase order and vendor bank change",
      required: true,
    },
  ],
  simulatedPaymentInstruction: {
    status: "SIMULATED_ONLY",
    payee: "Northline Systems Pvt. Ltd.",
    amount: "842500",
    amountDisplay: "₹8,42,500",
    currency: "INR",
    releaseCondition:
      "Release only after Finance Controller and Procurement Head approval.",
    warning: "No real payment has been executed.",
  },
  auditDossier: {
    executiveSummary:
      "Invoice NS-2026-044 from Northline Systems Pvt. Ltd. for ₹8,42,500 has been reviewed and flagged for escalation due to missing PO reference, recent bank detail change, early payment request, and threshold breach.",
    rationale:
      "The stacked exceptions prevent automatic approval. The payment may proceed only after required approvals and secondary verification.",
    riskSignals: [
      "Missing purchase order reference",
      "Recent vendor bank detail change",
      "Amount exceeds single-approver threshold",
      "Payment requested earlier than standard terms",
    ],
    missingDocuments: [
      "Valid purchase order reference",
      "Secondary bank verification confirmation",
    ],
    finalGovernanceDecision: "ESCALATE",
    nextActions: [
      "Request valid PO reference",
      "Verify vendor bank details",
      "Route to Finance Controller",
      "Route to Procurement Head",
      "Keep payment instruction halted until approval",
    ],
  },
};

// Convert canonical → legacy Verdict shape consumed by existing UI.
import type { Verdict } from "./types";

export function toLegacyVerdict(r: CanonicalReview): Verdict {
  const approversShort = r.approvalRoute
    .map((a) => a.role)
    .join(" + ");
  const safeDecision: Verdict["decision"] =
    r.decision === "APPROVE" || r.decision === "REJECT" || r.decision === "ESCALATE"
      ? r.decision
      : "ESCALATE";
  const safeLevel: Verdict["riskLevel"] =
    r.riskLevel === "LOW" ||
    r.riskLevel === "MODERATE" ||
    r.riskLevel === "HIGH" ||
    r.riskLevel === "CRITICAL"
      ? r.riskLevel
      : "MODERATE";
  return {
    reviewId: r.reviewId,
    decision: safeDecision,
    riskScore: r.riskScore,
    riskLevel: safeLevel,
    status: r.status,
    vendor: {
      name: r.vendor.name,
      status: r.vendor.verificationStatus.replace(/_/g, " ").toLowerCase(),
    },
    invoice: {
      reference: r.invoice.invoiceNumber,
      amount: r.invoice.amountDisplay || r.invoice.amount,
      currency: r.invoice.currency,
      description: r.invoice.description,
      terms: r.invoice.paymentTerms,
    },
    findings: r.policyChecks
      .filter((c) => c.result !== "PASS")
      .map((c) => ({
        severity: c.result === "FAIL" ? "FAIL" : "WARNING",
        text: c.evidence,
      })),
    approvers: r.approvalRoute.map((a) => ({
      role: a.role,
      reason: a.reason,
    })),
    rationale: r.auditDossier.rationale,
    nextActions: r.auditDossier.nextActions,
    requiredApproversShort: approversShort,
  };
}
