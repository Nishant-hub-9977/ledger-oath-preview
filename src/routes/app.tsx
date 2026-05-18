import { useEffect, useState } from "react";
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/app/AppChrome";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { listMyReviews, type SavedReview } from "@/lib/decision/persist";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Workspace — LedgerOath" },
      {
        name: "description",
        content:
          "LedgerOath workspace shell. Run reviews, view dossiers, and manage policy and vendor watchlists.",
      },
    ],
  }),
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href } as never,
      });
    }
  },
  component: WorkspacePage,
});

function WorkspacePage() {
  return (
    <div className="celestial-shell min-h-screen bg-background text-foreground grain">
      <SiteHeader variant="app" />
      <WorkspaceBar />
      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
        <Hero />
        <ModuleGrid />
        <RecentTable />
      </main>
      <SiteFooter />
      <Toaster />
    </div>
  );
}

function WorkspaceBar() {
  const { user } = useAuth();
  return (
    <div className="border-b border-border bg-secondary/20">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-3 lg:px-10">
        <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ivory-muted/80">
          <span className="text-foreground">Review Workspace</span>
          <span className="text-ivory-muted/50">/</span>
          <span className="normal-case tracking-normal">{user?.email ?? "Operator"}</span>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-restrained/30 bg-amber-restrained/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-amber-restrained">
          <span className="h-1 w-1 rounded-full bg-amber-restrained" />
          Simulated environment
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="mb-12 flex flex-wrap items-end justify-between gap-8">
      <div>
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-ivory-muted/80">
          <span className="h-px w-8 bg-border" />
          Workspace
        </div>
        <h1 className="mt-6 font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
          Governance console.{" "}
          <span className="italic text-ivory-muted">Review before release.</span>
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
          Launch a new payment review, revisit recent dossiers, or inspect the
          policy library that drives every decision.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/"
          hash="command-center"
          className="inline-flex items-center gap-2 rounded-full bg-ivory px-5 py-2.5 text-sm font-medium text-navy-deep transition-colors hover:bg-ivory/90"
        >
          New review
        </Link>
        <Link
          to="/"
          hash="audit-dossier"
          className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm text-ivory-muted transition-colors hover:border-ivory/40 hover:text-foreground"
        >
          View dossier
        </Link>
      </div>
    </section>
  );
}

type Module = {
  tag: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  hash?: string;
};

const MODULES: Module[] = [
  {
    tag: "01",
    title: "New payment review",
    body: "Load an invoice, vendor context, and policy model. The agent returns decision, risk, and required signatures.",
    cta: "Open command center",
    href: "/",
    hash: "command-center",
  },
  {
    tag: "02",
    title: "Recent reviews",
    body: "Audit-ready ledger of every payment instruction passed through the governance pipeline.",
    cta: "Jump to ledger",
    href: "/",
    hash: "audit-dossier",
  },
  {
    tag: "03",
    title: "Audit dossiers",
    body: "Exportable executive records with policy checks, risk signals, and approval routes for compliance review.",
    cta: "View dossier surface",
    href: "/",
    hash: "audit-dossier",
  },
  {
    tag: "04",
    title: "Policy library",
    body: "Single-approver limits, dual-control triggers, vendor-bank rules, and early-payment thresholds.",
    cta: "Explore architecture",
    href: "/",
    hash: "architecture",
  },
  {
    tag: "05",
    title: "Vendor watchlist",
    body: "Vendors with recent bank changes, threshold breaches, or open compliance signals stay surfaced here.",
    cta: "Review signals",
    href: "/",
    hash: "decision-room-full",
  },
  {
    tag: "06",
    title: "System notes",
    body: "Multi-agent timeline traces every intake, extraction, vendor, policy, and routing decision on the record.",
    cta: "Open timeline",
    href: "/",
    hash: "agent-timeline",
  },
];

function ModuleGrid() {
  return (
    <section className="mb-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {MODULES.map((m) => (
        <article
          key={m.tag}
          className="group flex flex-col rounded-2xl border border-border bg-card/60 p-7 backdrop-blur-sm transition-colors hover:border-ivory/30"
        >
          <div className="flex items-start justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ivory-muted/80">
              Module
            </span>
            <span className="rounded-md border border-border px-2 py-0.5 font-mono text-[10px] text-ivory-muted/70">
              {m.tag}
            </span>
          </div>
          <h3 className="mt-5 font-display text-2xl tracking-tight text-foreground">
            {m.title}
          </h3>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
            {m.body}
          </p>
          <Link
            to={m.href}
            hash={m.hash}
            className="mt-6 inline-flex items-center gap-2 self-start font-mono text-[11px] uppercase tracking-[0.2em] text-foreground"
          >
            {m.cta}
            <svg
              width="12"
              height="12"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden
              className="transition-transform group-hover:translate-x-0.5"
            >
              <path
                d="M1 7h12M8 2l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </article>
      ))}
    </section>
  );
}

function RecentTable() {
  const [rows, setRows] = useState<SavedReview[] | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    listMyReviews(10).then((r) => {
      if (alive) setRows(r);
    });
    return () => {
      alive = false;
    };
  }, []);

  const openReview = (r: SavedReview) => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(
      "lo:viewReview",
      JSON.stringify({ dbId: r.id, result: r.result_json }),
    );
    navigate({ to: "/", hash: "audit-dossier" });
  };

  return (
    <section>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-ivory-muted/80">
            <span className="h-px w-8 bg-border" />
            Recent reviews
          </div>
          <h2 className="mt-4 font-display text-3xl tracking-tight">
            Your latest governance decisions
          </h2>
        </div>
        <Link
          to="/"
          hash="command-center"
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-ivory-muted hover:text-foreground"
        >
          New review →
        </Link>
      </div>

      {rows === null ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/30 p-10 text-center text-sm text-muted-foreground">
          Loading reviews…
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/30 p-12 text-center">
          <div className="font-display text-2xl text-foreground">No reviews yet</div>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Run the Northline demo or paste a real case in the command center to
            create your first dossier.
          </p>
          <Link
            to="/"
            hash="command-center"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-ivory px-5 py-2.5 text-sm font-medium text-navy-deep transition-colors hover:bg-ivory/90"
          >
            Open command center
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/30">
              <tr className="font-mono text-[10px] uppercase tracking-[0.2em] text-ivory-muted/80">
                <Th>Review ID</Th>
                <Th>Vendor</Th>
                <Th>Decision</Th>
                <Th className="text-right">Amount</Th>
                <Th>Risk</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.id}
                  className={i > 0 ? "border-t border-border" : undefined}
                >
                  <Td mono>{r.review_id}</Td>
                  <Td>{r.vendor_name ?? "—"}</Td>
                  <Td>
                    <DecisionPill decision={r.decision ?? "REVIEW"} />
                  </Td>
                  <Td mono className="text-right">
                    {r.invoice_amount_display ?? "—"}
                  </Td>
                  <Td>
                    <RiskPill level={r.risk_level ?? "—"} />
                  </Td>
                  <Td className="text-right">
                    <button
                      onClick={() => openReview(r)}
                      className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground hover:text-emerald-muted"
                    >
                      View →
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <th className={`px-5 py-3 ${className}`}>{children}</th>;
}

function Td({
  children,
  mono,
  className = "",
}: {
  children: React.ReactNode;
  mono?: boolean;
  className?: string;
}) {
  return (
    <td
      className={`px-5 py-4 align-middle text-foreground ${
        mono ? "font-mono text-[13px]" : ""
      } ${className}`}
    >
      {children}
    </td>
  );
}

function DecisionPill({ decision }: { decision: string }) {
  const d = decision.toUpperCase();
  const styles =
    d === "ESCALATE"
      ? "border-amber-restrained/40 bg-amber-restrained/10 text-amber-restrained"
      : d === "APPROVE" || d === "APPROVED"
      ? "border-emerald-muted/40 bg-emerald-muted/10 text-emerald-muted"
      : "border-border bg-secondary/40 text-ivory-muted";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ${styles}`}
    >
      <span
        className="h-1 w-1 rounded-full"
        style={{ backgroundColor: "currentColor" }}
      />
      {d}
    </span>
  );
}

function RiskPill({ level }: { level: string }) {
  const styles =
    level === "HIGH" || level === "CRITICAL"
      ? "text-amber-restrained"
      : level === "LOW"
      ? "text-emerald-muted"
      : "text-ivory-muted";
  return <span className={`font-mono text-[12px] ${styles}`}>{level}</span>;
}
