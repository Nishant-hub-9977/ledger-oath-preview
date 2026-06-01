import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AgentTimeline } from "@/components/app/AgentTimeline";
import { DemoBadge, Mark, SiteFooter, SiteHeader } from "@/components/app/AppChrome";
import { AuditDossier } from "@/components/app/AuditDossier";
import { CelestialBackdrop } from "@/components/app/CelestialBackdrop";
import { CommandCenter } from "@/components/app/CommandCenter";
import { DecisionRoom } from "@/components/app/DecisionRoom";
import { DemoReviewModal } from "@/components/app/DemoReviewModal";
import { Toaster } from "@/components/ui/sonner";
import { EMPTY_CASE, type CaseFields, type ReviewState } from "@/lib/decision/types";
import { NORTHLINE_CANONICAL, toLegacyVerdict, type CanonicalReview } from "@/lib/decision/canonical";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LedgerOath — Autonomous payment governance before money moves" },
      {
        name: "description",
        content:
          "LedgerOath reviews invoices, vendor context, policy rules, budget exposure, and approval risk before enterprise payments are released.",
      },
      { property: "og:title", content: "LedgerOath — Autonomous payment governance" },
      {
        property: "og:description",
        content:
          "An autonomous B2B payment governance agent that reviews every release before money moves.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  component: Landing,
});

const trustItems = [
  "Invoice Intelligence",
  "Vendor Verification",
  "Policy Review",
  "Risk Scoring",
  "Approval Routing",
  "Audit Dossier",
];

function Landing() {
  const [fields, setFields] = useState<CaseFields>(EMPTY_CASE);
  const [review, setReview] = useState<ReviewState>({ status: "idle" });
  const [viewDbId, setViewDbId] = useState<string | undefined>(undefined);
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.sessionStorage.getItem("lo:viewReview");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { dbId: string; result: CanonicalReview };
      setReview({ status: "done", verdict: toLegacyVerdict(parsed.result) });
      setViewDbId(parsed.dbId);
      window.sessionStorage.removeItem("lo:viewReview");
      window.setTimeout(() => {
        document
          .getElementById("audit-dossier")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    } catch (err) {
      console.warn("[viewReview hydrate]", err);
      window.sessionStorage.removeItem("lo:viewReview");
    }
  }, []);

  const proceedWithDemo = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("lo:runDemo"));
    }
  };

  return (
    <div id="top" className="celestial-shell min-h-screen bg-background text-foreground grain">
      <Header />
      <main>
        <Hero onRunDemo={() => setDemoModalOpen(true)} />
        <TrustStrip />
        <CommandCenter
          fields={fields}
          setFields={setFields}
          review={review}
          setReview={setReview}
        />
        <DecisionRoom review={review} />
        <AgentTimeline review={review} />
        <AuditDossier review={review} dbId={viewDbId} />
      </main>
      <Footer />
      <Toaster />
      <DemoReviewModal
        open={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        onProceed={proceedWithDemo}
      />
    </div>
  );
}

function Header() {
  return <SiteHeader variant="landing" />;
}


function Hero({ onRunDemo }: { onRunDemo: () => void }) {
  return (
    <section id="product" className="relative overflow-hidden">
      <CelestialBackdrop variant="observatory" />
      <div className="relative mx-auto grid max-w-7xl gap-16 px-6 pb-24 pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-20 lg:px-10 lg:pb-32 lg:pt-28">
        <div className="flex flex-col justify-center">
          <div className="mb-8 flex flex-wrap items-center gap-2">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-ivory-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-muted" />
              Payment Governance · Observatory
            </div>
            <DemoBadge />
          </div>

          <h1 className="font-display text-[2.75rem] leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-[4.25rem]">
            Governance before money moves.{" "}
            <span className="italic text-ivory-muted">An observatory for every release.</span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            LedgerOath weighs invoice, vendor, policy, exposure, and approval
            against a single horizon — so no instruction leaves the ledger
            without provenance.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={onRunDemo}
              aria-label={`Run simulated demo payment review (sample decision: ${NORTHLINE_CANONICAL.decision}, risk score ${NORTHLINE_CANONICAL.riskScore} of 100)`}
              className="group inline-flex items-center gap-3 rounded-full bg-ivory px-6 py-3.5 text-sm font-medium text-navy-deep transition-all hover:bg-ivory/90"
            >
              Run Demo Review
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="transition-transform group-hover:translate-x-0.5" aria-hidden="true">
                <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <a href="#architecture" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              See the architecture →
            </a>
          </div>

          <p className="mt-10 inline-flex max-w-md items-center gap-2 rounded-md border border-amber-restrained/30 bg-amber-restrained/5 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-amber-restrained">
            <span className="h-1 w-1 rounded-full bg-amber-restrained" />
            Simulated only · no real payment has been executed
          </p>
        </div>

        <DecisionCard />
      </div>
    </section>
  );
}

function DecisionCard() {
  return (
    <div id="decision-room" className="relative flex items-center justify-center">
      <div className="pointer-events-none absolute -inset-10 bg-[radial-gradient(circle_at_50%_30%,color-mix(in_oklab,var(--emerald-muted)_10%,transparent),transparent_60%)]" />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card/70 p-7 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ivory-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-restrained" />
            Decision Room · Live
          </div>
          <span className="font-mono text-[10px] text-ivory-muted/60">REV-00428</span>
        </div>

        <div className="pt-6">
          <div className="text-[11px] uppercase tracking-[0.2em] text-ivory-muted">Decision</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-4xl tracking-tight text-amber-restrained">ESCALATE</span>
            <span className="font-mono text-xs text-ivory-muted">human review</span>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5">
          <Field label="Risk Score" value="72" mono accent />
          <Field label="Confidence" value="0.86" mono />
          <Field label="Vendor" value="Northline Systems Pvt. Ltd." />
          <Field label="Amount" value="₹8,42,500" mono />
        </div>

        <div className="mt-7 space-y-2.5 border-t border-border pt-5">
          <Check label="Invoice parsed & deduplicated" state="ok" />
          <Check label="Vendor verification passed" state="ok" />
          <Check label="Policy: exceeds Q4 vendor cap by 18%" state="warn" />
          <Check label="Budget exposure: 2 pending invoices" state="warn" />
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-border pt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-ivory-muted/70">
          <span>Audit dossier · generated</span>
          <span>1.42s</span>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
  accent,
}: {
  label: string;
  value: string;
  mono?: boolean;
  accent?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-ivory-muted/80">{label}</div>
      <div
        className={[
          "mt-1.5 text-sm",
          mono ? "font-mono" : "font-display text-base",
          accent ? "text-amber-restrained" : "text-foreground",
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  );
}

function Check({ label, state }: { label: string; state: "ok" | "warn" }) {
  const color = state === "ok" ? "var(--emerald-muted)" : "var(--amber-restrained)";
  return (
    <div className="flex items-center gap-3 text-xs text-ivory-muted">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
        {state === "ok" ? (
          <path d="M2 6.5l2.5 2.5L10 3.5" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <>
            <path d="M6 2v5" stroke={color} strokeWidth="1.25" strokeLinecap="round" />
            <circle cx="6" cy="9.5" r="0.7" fill={color} />
          </>
        )}
      </svg>
      <span className="leading-relaxed">{label}</span>
    </div>
  );
}

function TrustStrip() {
  return (
    <section id="architecture" className="border-y border-border bg-secondary/20">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <div className="mb-7 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-ivory-muted/80">
          <span className="h-px w-8 bg-border" />
          The review pipeline
        </div>
        <ul className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3 lg:grid-cols-6">
          {trustItems.map((item, i) => (
            <li key={item} className="flex items-baseline gap-3">
              <span className="font-mono text-[10px] text-ivory-muted/60">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-sm text-foreground/90">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Footer() {
  return <SiteFooter />;
}

