import * as DialogPrimitive from "@radix-ui/react-dialog";
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
  const canonical = NORTHLINE_CANONICAL;
  const decision = canonical.decision;
  const riskScore = canonical.riskScore;
  const vendor = canonical.vendor.name;
  const amount = canonical.invoice.amountDisplay;
  const currency = canonical.invoice.currency;
  const checks = canonical.policyChecks;
  const approvers = canonical.approvalRoute;

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 bg-midnight/80 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />
        <DialogPrimitive.Content
          aria-labelledby="demo-modal-title"
          aria-describedby="demo-modal-description"
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border bg-card/95 p-7 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.7)] backdrop-blur-xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:p-8"
          style={{ maxHeight: "calc(100dvh - 2rem)" }}
        >
          {/* Close button */}
          <DialogPrimitive.Close
            aria-label="Close demo review"
            className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-ivory-muted/70 transition-colors hover:border-ivory/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-muted/50"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
            </svg>
          </DialogPrimitive.Close>

          {/* Header */}
          <div className="mb-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ivory-muted/70">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-restrained" aria-hidden="true" />
            Simulated Review · Preview
          </div>

          <DialogPrimitive.Title
            id="demo-modal-title"
            className="font-display text-2xl tracking-tight text-foreground sm:text-3xl"
          >
            Decision summary
          </DialogPrimitive.Title>

          <DialogPrimitive.Description
            id="demo-modal-description"
            className="sr-only"
          >
            Simulated payment governance review for {vendor}. Decision: {decision}. Risk score {riskScore}.
            No real payment has been executed.
          </DialogPrimitive.Description>

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
              <div className="mt-1 font-mono text-2xl text-amber-restrained" aria-label={`Risk score ${riskScore} of 100`}>
                {riskScore}
              </div>
            </div>
          </div>

          {/* Meta grid */}
          <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <dt className="text-[10px] uppercase tracking-[0.2em] text-ivory-muted/80">Vendor</dt>
              <dd className="mt-1 text-sm text-foreground">{vendor}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.2em] text-ivory-muted/80">Amount</dt>
              <dd className="mt-1 font-mono text-sm text-foreground">
                {amount} <span className="text-ivory-muted/60">{currency}</span>
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.2em] text-ivory-muted/80">Status</dt>
              <dd className="mt-1 text-sm text-foreground">{canonical.status}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.2em] text-ivory-muted/80">Review ID</dt>
              <dd className="mt-1 font-mono text-sm text-foreground">{canonical.reviewId}</dd>
            </div>
          </dl>

          {/* Policy checks */}
          <section className="mt-6 border-t border-border pt-5" aria-labelledby="demo-modal-checks">
            <h3 id="demo-modal-checks" className="text-[10px] uppercase tracking-[0.2em] text-ivory-muted/80">
              Policy checks
            </h3>
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
                    aria-hidden="true"
                  />
                  <span className="leading-relaxed">
                    <span className="sr-only">{c.result}: </span>
                    {c.evidence}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Approval route */}
          <section className="mt-5 border-t border-border pt-5" aria-labelledby="demo-modal-approvers">
            <h3 id="demo-modal-approvers" className="text-[10px] uppercase tracking-[0.2em] text-ivory-muted/80">
              Required approvers
            </h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {approvers.map((a, i) => (
                <li
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/40 px-3 py-1 text-[11px] text-foreground"
                >
                  <span className="h-1 w-1 rounded-full bg-lavender-haze" aria-hidden="true" />
                  {a.role}
                </li>
              ))}
            </ul>
          </section>

          {/* Safety note */}
          <div
            role="note"
            aria-label="Safety note"
            className="mt-6 rounded-xl border border-amber-restrained/20 bg-amber-restrained/5 px-4 py-4"
          >
            <div className="flex items-start gap-3">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="mt-0.5 shrink-0 text-amber-restrained" aria-hidden="true">
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
            <DialogPrimitive.Close
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm text-foreground/90 transition-colors hover:border-ivory/40 hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-muted/50"
            >
              Close
            </DialogPrimitive.Close>
            <button
              type="button"
              onClick={() => {
                onClose();
                onProceed();
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-ivory px-5 py-2.5 text-sm font-medium text-navy-deep transition-colors hover:bg-ivory/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-muted/50"
            >
              Continue to Command Center
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
