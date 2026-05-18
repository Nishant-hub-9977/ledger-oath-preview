import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CelestialBackdrop } from "@/components/app/CelestialBackdrop";
import type { ReviewState, Verdict } from "@/lib/decision/types";
import { recordExport } from "@/lib/decision/persist";

export function AuditDossier({
  review,
  dbId,
}: {
  review: ReviewState;
  dbId?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const isDone = review.status === "done";
  const verdict = isDone ? review.verdict : null;

  useEffect(() => {
    if (isDone && ref.current) {
      const t = window.setTimeout(() => {
        ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 600);
      return () => window.clearTimeout(t);
    }
  }, [isDone]);

  return (
    <section
      id="audit-dossier"
      ref={ref}
      className="relative overflow-hidden border-t border-border bg-background"
    >
      <CelestialBackdrop variant="archive" intensity="subtle" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-celestial-teal/30 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
        <SectionLabel />
        {verdict ? <Dossier v={verdict} dbId={dbId} /> : <Awaiting />}
      </div>
    </section>
  );
}

function SectionLabel() {
  return (
    <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
      <div>
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-ivory-muted/80">
          <span className="h-px w-8 bg-border" />
          Audit Dossier
        </div>
        <h2 className="mt-6 font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">
          The executive record.{" "}
          <span className="italic text-ivory-muted">Exportable, immutable, complete.</span>
        </h2>
      </div>
      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
        A structured dossier of every signal, signature, and instruction —
        ready for finance, compliance, and external auditors.
      </p>
    </div>
  );
}

function Awaiting() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/30 p-14 text-center backdrop-blur-sm">
      <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-border text-ivory-muted">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
          <rect x="3" y="2" width="12" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.1" />
          <path d="M6 6h6M6 9h6M6 12h4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      </div>
      <div className="font-display text-2xl tracking-tight text-foreground">
        Awaiting dossier
      </div>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Run a review to generate the audit document. The executive summary,
        findings, approvers, and exportable record will assemble here.
      </p>
    </div>
  );
}

function buildSummary(v: Verdict): string {
  return `Invoice ${v.invoice.reference} from ${v.vendor.name} for ${v.invoice.amount} has been reviewed and flagged for ${v.decision.toLowerCase()} due to missing PO reference, recent bank detail change, early payment request, and threshold breach. The payment may proceed only after purchase order validation, secondary bank verification, and dual approval from ${v.requiredApproversShort}.`;
}

function buildMarkdown(v: Verdict, summary: string): string {
  const findings = v.findings
    .map((f) => `- **${f.severity}** — ${f.text}`)
    .join("\n");
  const approvers = v.approvers
    .map((a) => `- **${a.role}** — ${a.reason}`)
    .join("\n");
  const actions = v.nextActions.map((a, i) => `${i + 1}. ${a}`).join("\n");
  return `# Audit Dossier — ${v.reviewId}

## Executive Summary
${summary}

## Final Governance Decision
- **Decision:** ${v.decision}
- **Risk Score:** ${v.riskScore}
- **Risk Level:** ${v.riskLevel}
- **Status:** ${v.status}

## Vendor & Invoice
- **Vendor:** ${v.vendor.name} (${v.vendor.status})
- **Invoice:** ${v.invoice.reference}
- **Amount:** ${v.invoice.amount} ${v.invoice.currency}
- **Description:** ${v.invoice.description}
- **Payment terms:** ${v.invoice.terms}

## Policy Checks & Risk Signals
${findings}

## Approval Route
${approvers}

## Simulated Payment Instruction
- Payee: ${v.vendor.name}
- Amount: ${v.invoice.amount}
- Currency: ${v.invoice.currency}
- Release condition: Release only after ${v.requiredApproversShort} approval
- **SIMULATED ONLY — No real payment has been executed.**

## Governance Rationale
${v.rationale}

## Next Actions
${actions}
`;
}

function Dossier({ v, dbId }: { v: Verdict; dbId?: string }) {
  const summary = buildSummary(v);
  const json = JSON.stringify(v, null, 2);
  const markdown = buildMarkdown(v, summary);
  const [jsonOpen, setJsonOpen] = useState(false);

  const logExport = (kind: "summary" | "json" | "markdown") => {
    if (dbId) void recordExport({ paymentReviewDbId: dbId, exportType: kind });
  };

  async function copy(text: string, label: string, kind: "summary" | "json") {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
      logExport(kind);
    } catch {
      toast.error(`Couldn't copy ${label.toLowerCase()}`);
    }
  }

  function exportMarkdown() {
    try {
      const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `LedgerOath-${v.reviewId}-dossier.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Markdown downloaded");
      logExport("markdown");
    } catch {
      navigator.clipboard.writeText(markdown).then(
        () => {
          toast.success("Markdown copied to clipboard");
          logExport("markdown");
        },
        () => toast.error("Couldn't export markdown"),
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Bento grid */}
      <div className="grid auto-rows-min gap-3 lg:grid-cols-6">
        {/* Executive Summary — hero */}
        <Tile className="lg:col-span-6">
          <TileHeader
            eyebrow={`Dossier · ${v.reviewId}`}
            title="Executive summary"
            tag="01"
          />
          <p className="mt-6 font-display text-2xl leading-snug text-foreground sm:text-3xl">
            {summary}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-5 border-t border-border pt-5">
            <ActionButton onClick={() => copy(summary, "Summary", "summary")}>
              Copy summary
            </ActionButton>
            <ActionButton onClick={exportMarkdown}>
              Export markdown
            </ActionButton>
            <span className="ml-auto inline-flex items-center gap-2 rounded-full border border-amber-restrained/40 bg-amber-restrained/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-amber-restrained">
              <span className="h-1 w-1 rounded-full bg-amber-restrained" />
              SIMULATED ONLY · No real payment executed
            </span>
          </div>
        </Tile>

        {/* Final decision */}
        <Tile className="lg:col-span-2">
          <TileHeader eyebrow="Final decision" title="Governance verdict" tag="02" />
          <div className="mt-6 space-y-4">
            <div>
              <Label>Decision</Label>
              <div className="mt-1 font-display text-4xl text-amber-restrained">
                {v.decision}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <Stat label="Risk Score" value={String(v.riskScore)} accent />
              <Stat label="Risk Level" value={v.riskLevel} accent />
            </div>
            <div>
              <Label>Status</Label>
              <div className="mt-1 text-sm text-foreground">{v.status}</div>
            </div>
          </div>
        </Tile>

        {/* Policy checks */}
        <Tile className="lg:col-span-4">
          <TileHeader
            eyebrow="Policy checks"
            title="Result · evidence · impact"
            tag="03"
            meta={`${v.findings.length} signals`}
          />
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {v.findings.map((f, i) => (
              <PolicyCard key={i} severity={f.severity} text={f.text} />
            ))}
          </div>
        </Tile>

        {/* Risk signals */}
        <Tile className="lg:col-span-2">
          <TileHeader eyebrow="Risk signals" title="Top exposures" tag="04" />
          <ul className="mt-6 space-y-3">
            {[
              "Missing PO reference",
              "Bank details changed within 14 days",
              "Amount exceeds ₹5,00,000 single-approver limit",
              "Payment requested earlier than standard terms",
            ].map((r) => (
              <li key={r} className="flex items-start gap-3 text-sm text-foreground">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-restrained" />
                <span className="leading-relaxed">{r}</span>
              </li>
            ))}
          </ul>
        </Tile>

        {/* Approval route */}
        <Tile className="lg:col-span-2">
          <TileHeader eyebrow="Approval route" title="Required signatures" tag="05" />
          <ul className="mt-6 space-y-4">
            {v.approvers.map((a) => (
              <li key={a.role} className="flex items-start gap-3">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-emerald-muted/40 bg-emerald-muted/10 text-emerald-muted">
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
                    <path d="M2 5.5l2.2 2.2L9 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div>
                  <div className="font-display text-base text-foreground">{a.role}</div>
                  <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {a.reason}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Tile>

        {/* Simulated instruction */}
        <Tile
          className="lg:col-span-2 border-amber-restrained/30 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--amber-restrained)_8%,transparent),transparent)]"
        >
          <TileHeader
            eyebrow="Simulated instruction"
            title="Halted release"
            tag="06"
            accent
          />
          <dl className="mt-6 space-y-3 text-sm">
            <KV label="Payee" value={v.vendor.name} />
            <KV label="Amount" value={v.invoice.amount} mono />
            <KV label="Currency" value={v.invoice.currency} mono />
            <KV
              label="Release condition"
              value={`Release only after ${v.requiredApproversShort} approval`}
            />
          </dl>
          <div className="mt-5 rounded-md border border-amber-restrained/30 bg-amber-restrained/5 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-amber-restrained">
            SIMULATED ONLY · No real payment has been executed
          </div>
        </Tile>

        {/* Next actions */}
        <Tile className="lg:col-span-6">
          <TileHeader
            eyebrow="Next actions"
            title="Path to release"
            tag="07"
            meta={`${v.nextActions.length} steps`}
          />
          <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {v.nextActions.map((a, i) => (
              <li
                key={a}
                className="flex items-start gap-4 rounded-xl border border-border bg-card/40 p-4"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ivory-muted/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm leading-relaxed text-foreground">{a}</span>
              </li>
            ))}
          </ol>
        </Tile>

        {/* JSON record */}
        <Tile className="lg:col-span-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <TileHeader eyebrow="Machine-readable" title="JSON record" tag="08" />
            <div className="flex items-center gap-5">
              <ActionButton onClick={() => setJsonOpen((o) => !o)}>
                {jsonOpen ? "Hide JSON" : "Show JSON"}
              </ActionButton>
              <ActionButton onClick={() => copy(json, "JSON", "json")}>Copy JSON</ActionButton>
            </div>
          </div>
          {jsonOpen ? (
            <div className="mt-6 overflow-hidden rounded-xl border border-border bg-background/60">
              <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-4 py-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ivory-muted">
                  dossier.json · {v.reviewId}
                </span>
                <ActionButton onClick={() => copy(json, "JSON", "json")}>Copy</ActionButton>
              </div>
              <pre className="max-h-[420px] overflow-auto p-5 font-mono text-[12px] leading-relaxed text-foreground/90">
                {json}
              </pre>
            </div>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">
              Structured dossier payload for downstream ERP, ledger, and audit
              pipelines.
            </p>
          )}
        </Tile>
      </div>
    </div>
  );
}

function Tile({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-border bg-card/60 p-7 backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}

function TileHeader({
  eyebrow,
  title,
  tag,
  meta,
  accent,
}: {
  eyebrow: string;
  title: string;
  tag: string;
  meta?: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div
          className={`font-mono text-[10px] uppercase tracking-[0.22em] ${
            accent ? "text-amber-restrained" : "text-ivory-muted/80"
          }`}
        >
          {eyebrow}
        </div>
        <h3 className="mt-2 font-display text-xl tracking-tight text-foreground">
          {title}
        </h3>
      </div>
      <div className="flex items-center gap-3">
        {meta ? (
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ivory-muted/80">
            {meta}
          </span>
        ) : null}
        <span className="rounded-md border border-border px-2 py-0.5 font-mono text-[10px] text-ivory-muted/70">
          {tag}
        </span>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-[0.2em] text-ivory-muted/80">
      {children}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div
        className={`mt-1 font-display text-xl ${
          accent ? "text-amber-restrained" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function KV({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-[110px_1fr] items-baseline gap-3">
      <dt className="text-[10px] uppercase tracking-[0.2em] text-ivory-muted/80">
        {label}
      </dt>
      <dd className={mono ? "font-mono text-[13px] text-foreground" : "text-foreground"}>
        {value}
      </dd>
    </div>
  );
}

function PolicyCard({
  severity,
  text,
}: {
  severity: "FAIL" | "WARNING";
  text: string;
}) {
  const isFail = severity === "FAIL";
  return (
    <div
      className={`rounded-xl border bg-background/40 p-4 ${
        isFail ? "border-destructive/40" : "border-amber-restrained/30"
      }`}
    >
      <div
        className={`font-mono text-[10px] uppercase tracking-[0.2em] ${
          isFail ? "text-destructive" : "text-amber-restrained"
        }`}
      >
        {severity}
      </div>
      <div className="mt-2 text-sm leading-relaxed text-foreground">{text}</div>
      <div className="mt-3 text-[11px] text-muted-foreground">
        Evidence: source dossier · Impact:{" "}
        {isFail ? "blocks automatic approval" : "requires reviewer attention"}
      </div>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ivory-muted underline-offset-[6px] decoration-emerald-muted/60 transition-colors duration-200 hover:text-foreground hover:underline focus-visible:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-muted/40 rounded-sm"
    >
      {children}
    </button>
  );
}
