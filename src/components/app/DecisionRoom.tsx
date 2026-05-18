import { useEffect, useRef } from "react";
import type { ReviewState, Verdict } from "@/lib/decision/types";

export function DecisionRoom({ review }: { review: ReviewState }) {
  const ref = useRef<HTMLElement | null>(null);
  const isDone = review.status === "done";
  const verdict = isDone ? review.verdict : null;

  useEffect(() => {
    if (isDone && ref.current) {
      const t = window.setTimeout(() => {
        ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 250);
      return () => window.clearTimeout(t);
    }
  }, [isDone]);

  return (
    <section
      id="decision-room-full"
      ref={ref}
      className="relative border-t border-border bg-background"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-muted/30 to-transparent" />
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
        <SectionLabel />
        {verdict ? <Verdict view={verdict} /> : <AwaitingState />}
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
          Decision Room
        </div>
        <h2 className="mt-6 font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">
          The verdict console.{" "}
          <span className="italic text-ivory-muted">Every reason, on the record.</span>
        </h2>
      </div>
      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
        Finance, procurement, and compliance see the same dossier — findings,
        thresholds, signatures required, and the halted instruction.
      </p>
    </div>
  );
}

function AwaitingState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/30 p-14 text-center backdrop-blur-sm">
      <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-border text-ivory-muted">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
          <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.1" />
          <path d="M9 5v4l2.5 1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      </div>
      <div className="font-display text-2xl tracking-tight text-foreground">
        Awaiting review
      </div>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Load the demo case in the Command Center above and run a payment review.
        The verdict, findings, and required signatures will assemble here.
      </p>
    </div>
  );
}

function Verdict({ view }: { view: Verdict }) {
  return (
    <div className="space-y-10">
      <VerdictHeader v={view} />

      <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <RiskRing score={view.riskScore} level={view.riskLevel} />
        <VendorInvoice v={view} />
      </div>

      <PolicyFindings v={view} />

      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <ApprovalRoute v={view} />
        <SimulatedInstruction v={view} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Rationale v={view} />
        <NextActions v={view} />
      </div>
    </div>
  );
}

function VerdictHeader({ v }: { v: Verdict }) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-8 backdrop-blur-sm">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ivory-muted/80">
            Review {v.reviewId}
          </div>
          <div className="mt-4 flex flex-wrap items-baseline gap-6">
            <span className="font-display text-6xl tracking-tight text-amber-restrained sm:text-7xl">
              {v.decision}
            </span>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-[0.2em] text-ivory-muted">
                Status
              </span>
              <span className="text-sm text-foreground">{v.status}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-10 gap-y-3 text-right">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-ivory-muted/80">
              Risk Score
            </div>
            <div className="mt-1 font-mono text-3xl text-amber-restrained">
              {v.riskScore}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-ivory-muted/80">
              Risk Level
            </div>
            <div className="mt-1 font-display text-2xl text-amber-restrained">
              {v.riskLevel}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-5">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-restrained/30 bg-amber-restrained/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-amber-restrained/90">
          <span className="h-1 w-1 rounded-full bg-amber-restrained" />
          SIMULATED_ONLY
        </span>
        <span className="text-xs text-ivory-muted/80">
          Simulated payment instruction only. No real payment has been executed.
        </span>
      </div>
    </div>
  );
}

function RiskRing({ score, level }: { score: number; level: string }) {
  const r = 64;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-8 backdrop-blur-sm">
      <div className="text-[10px] uppercase tracking-[0.22em] text-ivory-muted/80">
        Composite governance risk
      </div>
      <div className="mt-6 flex items-center gap-8">
        <div className="relative h-44 w-44 shrink-0">
          <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
            <circle
              cx="80"
              cy="80"
              r={r}
              fill="none"
              stroke="var(--hairline)"
              strokeWidth="6"
            />
            <circle
              cx="80"
              cy="80"
              r={r}
              fill="none"
              stroke="var(--amber-restrained)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 900ms cubic-bezier(.22,1,.36,1)" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-5xl text-amber-restrained">{score}</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ivory-muted">
              / 100
            </span>
          </div>
        </div>
        <div className="space-y-3 text-sm">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-ivory-muted/80">
              Level
            </div>
            <div className="mt-1 font-display text-2xl text-amber-restrained">{level}</div>
          </div>
          <div className="text-xs leading-relaxed text-muted-foreground">
            Weighted across vendor verification, policy conformance, budget exposure,
            and approval surface.
          </div>
        </div>
      </div>
    </div>
  );
}

function VendorInvoice({ v }: { v: Verdict }) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-8 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl tracking-tight">Vendor & Invoice</h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ivory-muted/80">
          Source dossier
        </span>
      </div>

      <div className="mt-6 space-y-5 border-t border-border pt-5">
        <Row label="Vendor" value={v.vendor.name} />
        <Row label="Vendor status" value={v.vendor.status} accent="amber" />
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          <Row label="Invoice ref." value={v.invoice.reference} mono />
          <Row label="Amount" value={v.invoice.amount} mono />
          <Row label="Currency" value={v.invoice.currency} mono />
          <Row label="Description" value={v.invoice.description} />
        </div>
        <Row label="Payment terms" value={v.invoice.terms} accent="amber" />
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  accent,
}: {
  label: string;
  value: string;
  mono?: boolean;
  accent?: "amber";
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-baseline gap-4">
      <div className="text-[10px] uppercase tracking-[0.2em] text-ivory-muted/80">
        {label}
      </div>
      <div
        className={[
          "text-sm",
          mono ? "font-mono text-[13px]" : "",
          accent === "amber" ? "text-amber-restrained" : "text-foreground",
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  );
}

function PolicyFindings({ v }: { v: Verdict }) {
  return (
    <div>
      <div className="mb-5 flex items-end justify-between">
        <h3 className="font-display text-2xl tracking-tight">Policy findings</h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ivory-muted/80">
          {v.findings.length} signals · {v.findings.filter((f) => f.severity === "FAIL").length} fail
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {v.findings.map((f, i) => (
          <FindingRow key={i} severity={f.severity} text={f.text} />
        ))}
      </div>
    </div>
  );
}

function FindingRow({
  severity,
  text,
}: {
  severity: "FAIL" | "WARNING";
  text: string;
}) {
  const isFail = severity === "FAIL";
  return (
    <div
      className={[
        "flex items-start gap-4 rounded-xl border bg-card/40 p-5 backdrop-blur-sm",
        isFail ? "border-destructive/40" : "border-amber-restrained/30",
      ].join(" ")}
    >
      <div
        className={[
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-mono text-[10px] uppercase tracking-[0.16em]",
          isFail
            ? "bg-destructive/15 text-destructive"
            : "bg-amber-restrained/10 text-amber-restrained",
        ].join(" ")}
      >
        {isFail ? "F" : "W"}
      </div>
      <div className="flex-1">
        <div
          className={[
            "font-mono text-[10px] uppercase tracking-[0.2em]",
            isFail ? "text-destructive" : "text-amber-restrained",
          ].join(" ")}
        >
          {severity}
        </div>
        <div className="mt-1 text-sm leading-relaxed text-foreground">{text}</div>
      </div>
    </div>
  );
}

function ApprovalRoute({ v }: { v: Verdict }) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-8 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl tracking-tight">Approval route</h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ivory-muted/80">
          Dual control
        </span>
      </div>
      <ol className="mt-6 space-y-5">
        {v.approvers.map((a, i) => (
          <li key={a.role} className="relative flex gap-5">
            <div className="flex flex-col items-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background font-mono text-xs text-ivory-muted">
                {String(i + 1).padStart(2, "0")}
              </div>
              {i < v.approvers.length - 1 ? (
                <div className="mt-1 h-full w-px flex-1 bg-border" />
              ) : null}
            </div>
            <div className="flex-1 pb-2">
              <div className="font-display text-lg text-foreground">{a.role}</div>
              <div className="mt-1 text-xs text-muted-foreground">{a.reason}</div>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/30 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ivory-muted">
                <span className="h-1 w-1 rounded-full bg-ivory-muted/60" />
                Awaiting signature
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function SimulatedInstruction({ v }: { v: Verdict }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-restrained/30 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--amber-restrained)_8%,transparent),transparent)] p-8">
      <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-amber-restrained">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-restrained" />
        Simulated payment instruction · HALTED
      </div>
      <div className="mt-5 font-display text-2xl leading-snug text-foreground">
        Requires {v.approvers.map((a) => a.role).join(" and ")} digital signatures before release.
      </div>
      <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-amber-restrained/15 pt-5 text-sm">
        <div>
          <dt className="text-[10px] uppercase tracking-[0.2em] text-ivory-muted/80">Beneficiary</dt>
          <dd className="mt-1">{v.vendor.name}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.2em] text-ivory-muted/80">Amount</dt>
          <dd className="mt-1 font-mono">{v.invoice.amount}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.2em] text-ivory-muted/80">Reference</dt>
          <dd className="mt-1 font-mono text-[13px]">{v.invoice.reference}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.2em] text-ivory-muted/80">State</dt>
          <dd className="mt-1 text-amber-restrained">Awaiting dual signature</dd>
        </div>
      </dl>
      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-amber-restrained/15 pt-5">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-restrained/30 bg-amber-restrained/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-amber-restrained">
          SIMULATED_ONLY
        </span>
        <span className="text-xs text-ivory-muted/80">
          No real payment has been executed.
        </span>
      </div>
    </div>
  );
}

function Rationale({ v }: { v: Verdict }) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-8 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl tracking-tight">Governance rationale</h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ivory-muted/80">
          For the record
        </span>
      </div>
      <p className="mt-6 border-l-2 border-emerald-muted/60 pl-5 font-display text-lg leading-relaxed text-foreground/95">
        {v.rationale}
      </p>
    </div>
  );
}

function NextActions({ v }: { v: Verdict }) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-8 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl tracking-tight">Next actions</h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ivory-muted/80">
          {v.nextActions.length} steps
        </span>
      </div>
      <ul className="mt-6 space-y-3">
        {v.nextActions.map((a, i) => (
          <li
            key={a}
            className="flex items-start gap-4 border-b border-border/70 pb-3 last:border-0 last:pb-0"
          >
            <span className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ivory-muted/70">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-sm leading-relaxed text-foreground">{a}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
