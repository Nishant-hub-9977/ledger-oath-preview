import { useEffect, useRef } from "react";
import { CelestialBackdrop } from "@/components/app/CelestialBackdrop";
import type { ReviewState } from "@/lib/decision/types";

const AGENTS: AgentEntry[] = [
  {
    name: "Intake Agent",
    confidence: 99,
    findings: "Successfully ingested invoice and supporting documentation.",
    evidence: "Invoice request and vendor master data received.",
    output: "Case file opened.",
  },
  {
    name: "Invoice Extraction Agent",
    confidence: 95,
    findings: "Extracted invoice amount, vendor, reference, and payment terms.",
    evidence: "Invoice NS-2026-044 for ₹8,42,500.",
    output: "Structured invoice record created.",
  },
  {
    name: "Vendor Verification Agent",
    confidence: 88,
    findings: "Vendor exists in master data, but recent bank detail change flagged.",
    evidence: "Bank details changed within 14 days.",
    output: "Verified with warnings.",
  },
  {
    name: "Policy Compliance Agent",
    confidence: 92,
    findings: "Multiple policy exceptions found.",
    evidence: "Missing PO, threshold breach, early payment request.",
    output: "Policy escalation required.",
  },
  {
    name: "Risk Scoring Agent",
    confidence: 90,
    findings: "Composite risk score calculated at 72.",
    evidence: "Medium-high risk due to stacked policy exceptions.",
    output: "Risk level HIGH.",
  },
  {
    name: "Approval Routing Agent",
    confidence: 98,
    findings: "Finance Controller and Procurement Head approvals required.",
    evidence: "Threshold and vendor-risk controls activated.",
    output: "Escalation route generated.",
  },
  {
    name: "Payment Instruction Agent",
    confidence: 100,
    findings: "Drafted simulated payment instruction, halted for approval.",
    evidence: "No real payment execution allowed.",
    output: "SIMULATED_ONLY.",
  },
  {
    name: "Audit Dossier Agent",
    confidence: 100,
    findings: "Compiled governance record and audit dossier.",
    evidence: "All findings consolidated.",
    output: "Dossier ready.",
  },
];

type AgentEntry = {
  name: string;
  confidence: number;
  findings: string;
  evidence: string;
  output: string;
};

export function AgentTimeline({ review }: { review: ReviewState }) {
  const ref = useRef<HTMLElement | null>(null);
  const isDone = review.status === "done";

  useEffect(() => {
    if (isDone && ref.current) {
      const t = window.setTimeout(() => {
        ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 900);
      return () => window.clearTimeout(t);
    }
  }, [isDone]);

  return (
    <section
      id="timeline"
      ref={ref}
      className="relative overflow-hidden border-t border-border bg-background"
    >
      <CelestialBackdrop variant="starchart" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-celestial-teal/30 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
        <SectionHeader />
        {isDone ? <TimelineCards /> : <AwaitingPlaceholder />}
      </div>
    </section>
  );
}

function SectionHeader() {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-ivory-muted/80">
        <span className="h-px w-8 bg-border" />
        Agent Timeline
      </div>
      <h2 className="mt-6 font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">
        Mission log.{" "}
        <span className="italic text-ivory-muted">Every agent, on the record.</span>
      </h2>
      <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
        A complete trace of the autonomous agents that weighed the evidence,
        measured the risk, and produced the verdict before any instruction was
        released.
      </p>
    </div>
  );
}

function AwaitingPlaceholder() {
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
        Run a payment review to see the agent timeline.
      </p>
    </div>
  );
}

function TimelineCards() {
  return (
    <div className="relative">
      {/* Connecting line — centered on the step circles (w-10 → 20px) */}
      <div className="absolute left-[20px] top-0 hidden h-full w-px border-l border-dashed border-border lg:block" />

      <div className="space-y-6">
        {AGENTS.map((agent, i) => (
          <AgentCard key={agent.name} index={i + 1} agent={agent} />
        ))}
      </div>
    </div>
  );
}

function AgentCard({ index, agent }: { index: number; agent: AgentEntry }) {
  return (
    <div className="relative flex gap-5 lg:gap-8">
      {/* Step indicator — uniform across breakpoints */}
      <div className="relative z-10 flex shrink-0 flex-col items-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background font-mono text-[11px] uppercase tracking-[0.16em] text-ivory-muted">
          {String(index).padStart(2, "0")}
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-sm lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-display text-xl tracking-tight text-foreground lg:text-2xl">
                {agent.name}
              </h3>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-muted/30 bg-emerald-muted/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-muted">
                <span className="h-1 w-1 rounded-full bg-emerald-muted" />
                complete
              </span>
            </div>
            <div className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {agent.findings}
            </div>
          </div>

          <div className="shrink-0 text-right">
            <div className="text-[10px] uppercase tracking-[0.2em] text-ivory-muted/80">
              Confidence
            </div>
            <div className="mt-1 font-mono text-xl text-foreground lg:text-2xl">
              {agent.confidence}%
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-ivory-muted/80">
              Evidence summary
            </div>
            <div className="mt-1.5 text-sm text-foreground/90">{agent.evidence}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-ivory-muted/80">
              Output
            </div>
            <div className="mt-1.5 text-sm text-foreground/90">{agent.output}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
