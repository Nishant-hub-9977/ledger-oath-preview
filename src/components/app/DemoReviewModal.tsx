import { useEffect, useRef } from "react";
import { NORTHLINE_CANONICAL } from "@/lib/decision/canonical";

export function DemoReviewModal({
  open,
  onClose,
  onProceed,
}: {
  open: boolean;
  onClose: () => void;
  onProceed: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    closeButtonRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const canonical = NORTHLINE_CANONICAL;
  const decision = canonical.decision;
  const riskScore = canonical.riskScore;
  const vendor = canonical.vendor.name;
  const amount = canonical.invoice.amountDisplay;
  const currency = canonical.invoice.currency;
  const checks = canonical.policyChecks;
  const approvers = canonical.approvalRoute;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-6 py-16 sm:items-center sm:py-0"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-midnight/80 backdrop-blur-md" />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative w-full max-w-lg rounded-2xl border border-border bg-card/80 p-7 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.7)] backdrop-blur-xl sm:p-8"
      >
        {/* Close button */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-ivory-muted/70 transition-colors hover:border-ivory/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-muted/50"
          aria-label="Close"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ivory-muted/70">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-restrained" />
          Simulated Review · Preview
        </div>

        <h2
          id="demo-modal-title"
          className="font-display text-2xl tracking-tight text-foreground sm:text-3xl"
        >
          Decision summary
        </h2>

        {/* Decision block */}
        <div className="mt-6 flex items-baseline justify-between border-b border-border pb-5">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-ivory-muted">Decision</div>
            <div className="mt-1 font-display text-4xl tracking-tight text-amber-restrained">
              {decision}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-[0.2em] text-ivory-muted">Risk</div>
            <div className="mt-1 font-mono text-2xl text-amber-restrained">{riskScore}</div>
          </div>
        </div>

        {/* Meta grid */}
        <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-ivory-muted/80">Vendor</div>
            <div className="mt-1 text-sm text-foreground">{vendor}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-ivory-muted/80">Amount</div>
            <div className="mt-1 font-mono text-sm text-foreground">
              {amount} <span className="text-ivory-muted/60">{currency}</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-ivory-muted/80">Status</div>
            <div className="mt-1 text-sm text-foreground">{canonical.status}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-ivory-muted/80">Review ID</div>
            <div className="mt-1 font-mono text-sm text-foreground">{canonical.reviewId}</div>
          </div>
        </div>

        {/* Policy checks */}
        <div className="mt-6 border-t border-border pt-5">
          <div className="text-[10px] uppercase tracking-[0.2em] text-ivory-muted/80">Policy checks</div>
          <ul className="mt-3 space-y-2.5">
            {checks.map((c, i) => (
              <li key={i} className="flex items-start gap-3 text-xs text-ivory-muted">
                <span
                  className={[
                    "mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full",
                    c.result === "FAIL"
                      ? "bg-rose-dust"
                      : c.result === "WARNING"
                        ? "bg-amber-restrained"
                        : "bg-emerald-muted",
                  ].join(" ")}
                />
                <span className="leading-relaxed">{c.evidence}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Approval route */}
        <div className="mt-5 border-t border-border pt-5">
          <div className="text-[10px] uppercase tracking-[0.2em] text-ivory-muted/80">Required approvers</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {approvers.map((a, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/40 px-3 py-1 text-[11px] text-foreground"
              >
                <span className="h-1 w-1 rounded-full bg-lavender-haze" />
                {a.role}
              </span>
            ))}
          </div>
        </div>

        {/* Safety note */}
        <div className="mt-6 rounded-xl border border-amber-restrained/20 bg-amber-restrained/5 px-4 py-4">
          <div className="flex items-start gap-3">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="mt-0.5 shrink-0 text-amber-restrained" aria-hidden>
              <path d="M7 1.5l5.5 10H1.5L7 1.5z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 6v2.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
              <circle cx="7" cy="10" r="0.5" fill="currentColor" />
            </svg>
            <div>
              <div className="text-xs font-medium text-amber-restrained">Safety note</div>
              <p className="mt-1 text-[11px] leading-relaxed text-amber-restrained/80">
                This is a simulated governance review. No real payment has been executed, no
                ledger has been modified, and no external service has been contacted. All
                figures, vendors, and outcomes are synthetic.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm text-foreground/90 transition-colors hover:border-ivory/40 hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-muted/50"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onProceed();
            }}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-ivory px-5 py-2.5 text-sm font-medium text-navy-deep transition-colors hover:bg-ivory/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-muted/50"
          >
            Continue to Command Center
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
