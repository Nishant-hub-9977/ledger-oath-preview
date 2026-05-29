import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { CelestialBackdrop } from "@/components/app/CelestialBackdrop";
import isoStack from "@/assets/atmos/iso-stack.png";
import {
  DEMO_CASE,
  type CaseFields,
  type ReviewState,
} from "@/lib/decision/types";
import {
  NORTHLINE_CANONICAL,
  toLegacyVerdict,
  type CanonicalReview,
} from "@/lib/decision/canonical";
import { analyzePaymentReview } from "@/lib/decision/analyze.functions";
import { saveReview, uploadInvoiceFile } from "@/lib/decision/persist";
import {
  LANGUAGES,
  CURRENCIES,
  REGION_PRESETS,
  formatAmount,
  type LanguageCode,
  type RegionCode,
  type CurrencyCode,
} from "@/lib/decision/intl";
import { useAuth } from "@/hooks/use-auth";

export function CommandCenter({
  fields,
  setFields,
  review,
  setReview,
}: {
  fields: CaseFields;
  setFields: React.Dispatch<React.SetStateAction<CaseFields>>;
  review: ReviewState;
  setReview: React.Dispatch<React.SetStateAction<ReviewState>>;
}) {
  const { user } = useAuth();
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [region, setRegion] = useState<RegionCode>("IN");
  const [currency, setCurrency] = useState<CurrencyCode>("INR");
  const caseNameRef = useRef<HTMLInputElement>(null);
  const analyze = useServerFn(analyzePaymentReview);

  const applyRegionPreset = (next: RegionCode) => {
    setRegion(next);
    const preset = REGION_PRESETS[next];
    setCurrency(preset.currency);
    setFields((f) => ({
      ...f,
      policyModel: preset.policy,
      routing: preset.routing,
    }));
    toast.success(`Loaded ${preset.label} preset`);
  };

  const update = <K extends keyof CaseFields>(key: K, value: CaseFields[K]) =>
    setFields((f) => ({ ...f, [key]: value }));

  const loadDemo = () => {
    setFields(DEMO_CASE);
    setReview({ status: "idle" });
  };

  const hasInputs =
    !!fields.invoiceData.trim() ||
    !!fields.vendorData.trim() ||
    !!fields.policyModel.trim();

  const persistReview = async (
    canonical: CanonicalReview,
    source: "live" | "fallback",
  ) => {
    if (!user) return;
    try {
      const saved = await saveReview({
        result: canonical,
        inputPayload: { fields, stagedFile: stagedFile?.name ?? null },
        source,
        isDemo: !hasInputs,
      });
      if (!saved) return;
      if (stagedFile) {
        const up = await uploadInvoiceFile({
          file: stagedFile,
          reviewDbId: saved.id,
        });
        if (!up.ok && up.error) toast.error(`Upload: ${up.error}`);
      }
      toast.success("Review saved and dossier created in your workspace.");
    } catch (err) {
      console.error("[persist]", err);
    }
  };

  const runReview = async () => {
    setReview({ status: "loading" });

    // Signed-out public demo: instant deterministic verdict, zero credits.
    if (!user) {
      const canonical = NORTHLINE_CANONICAL;
      window.setTimeout(() => {
        setReview({ status: "done", verdict: toLegacyVerdict(canonical) });
      }, 600);
      return;
    }

    // Signed-in: server fn handles live analysis or deterministic fallback.
    try {
      const res = await analyze({
        data: {
          caseName: fields.caseName,
          reviewId: fields.reviewId,
          vendorName: fields.vendor,
          invoiceAmount: fields.invoiceAmount,
          status: fields.status,
          invoiceText: fields.invoiceData,
          vendorMasterData: fields.vendorData,
          governancePolicyModel: fields.policyModel,
          costCenter: fields.costCenter,
          routingHeuristics: fields.routing,
          uploadedFileMetadata: stagedFile
            ? {
                name: stagedFile.name,
                size: stagedFile.size,
                type: stagedFile.type,
              }
            : null,
          useDemoFallback: false,
          outputLanguage: language,
          region,
          currency,
        },
      });
      setReview({ status: "done", verdict: toLegacyVerdict(res.result) });
      if (res.note) toast.message(res.note);
      // Fire-and-forget persistence.
      void persistReview(res.result, res.source);
    } catch (err) {
      console.error("[runReview]", err);
      const canonical = NORTHLINE_CANONICAL;
      setReview({ status: "done", verdict: toLegacyVerdict(canonical) });
      toast.error("Live analysis failed. Showing deterministic dossier.");
      void persistReview(canonical, "fallback");
    }
  };

  // External trigger: Hero "Run Demo Review" button dispatches this event.
  // For signed-out users: deterministic Northline verdict (no credits, no save).
  // For signed-in users: loads demo case into the form, then runs the full
  // analyze + persist flow so the dossier lands in their workspace ledger.
  const runReviewRef = useRef(runReview);
  runReviewRef.current = runReview;
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => {
      setFields(DEMO_CASE);
      // Defer one tick so the form reflects the demo case before analysis.
      window.setTimeout(() => {
        void runReviewRef.current();
        document
          .getElementById("command-center")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
        caseNameRef.current?.focus();
      }, 50);
    };
    window.addEventListener("lo:runDemo", handler);
    return () => window.removeEventListener("lo:runDemo", handler);
  }, [setFields]);

  return (
    <section
      id="command-center"
      className="relative overflow-hidden border-t border-border bg-secondary/10"
    >
      <CelestialBackdrop variant="chamber" intensity="subtle" />
      <img
        src={isoStack}
        alt=""
        aria-hidden
        loading="lazy"
        className="iso-lineart pointer-events-none absolute right-[-60px] top-12 hidden w-[440px] max-w-[36%] select-none xl:block 2xl:w-[520px]"
        style={{
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 70% at 70% 45%, #000 25%, transparent 72%)",
          maskImage:
            "radial-gradient(ellipse 60% 70% at 70% 45%, #000 25%, transparent 72%)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
        <SectionHeader />

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
          <div className="space-y-8">
            <Panel
              index="00"
              title="Jurisdiction & Locale"
              subtitle="Region preset, settlement currency, dossier language"
            >
              <div className="grid gap-4 sm:grid-cols-3">
                <SelectField
                  label="Region preset"
                  value={region}
                  onChange={(v) => applyRegionPreset(v as RegionCode)}
                  options={(Object.keys(REGION_PRESETS) as RegionCode[]).map((k) => ({
                    value: k,
                    label: REGION_PRESETS[k].label,
                  }))}
                />
                <SelectField
                  label="Currency"
                  value={currency}
                  onChange={(v) => setCurrency(v as CurrencyCode)}
                  options={CURRENCIES.map((c) => ({
                    value: c.code,
                    label: `${c.symbol}  ${c.code}`,
                  }))}
                />
                <SelectField
                  label="Dossier language"
                  value={language}
                  onChange={(v) => setLanguage(v as LanguageCode)}
                  options={LANGUAGES.map((l) => ({
                    value: l.code,
                    label: l.native,
                  }))}
                />
              </div>
              {fields.invoiceAmount ? (
                <div className="mt-4 flex items-center gap-2 font-mono text-[11px] text-ivory-muted/80">
                  <span className="text-ivory-muted/50">Formatted →</span>
                  <span className="text-amber-glow">
                    {formatAmount(fields.invoiceAmount, currency)}
                  </span>
                </div>
              ) : null}
            </Panel>

            <Panel
              index="01"
              title="Active Case File"
              subtitle="Identity of the payment under review"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Case name" value={fields.caseName} onChange={(v) => update("caseName", v)} placeholder="VENDOR_CASE.json" mono inputRef={caseNameRef} />
                <TextField label="Review ID" value={fields.reviewId} onChange={(v) => update("reviewId", v)} placeholder="LO-2026-000" mono />
                <TextField label="Vendor" value={fields.vendor} onChange={(v) => update("vendor", v)} placeholder="Legal entity name" />
                <TextField label="Invoice amount" value={fields.invoiceAmount} onChange={(v) => update("invoiceAmount", v)} placeholder="₹0,00,000" mono />
                <div className="sm:col-span-2">
                  <TextField label="Status" value={fields.status} onChange={(v) => update("status", v)} placeholder="Awaiting governance review" />
                </div>
              </div>
            </Panel>

            <Panel index="02" title="Invoice / Request Data" subtitle="Invoice details and payment terms">
              <TextArea value={fields.invoiceData} onChange={(v) => update("invoiceData", v)} rows={5} placeholder="Paste invoice details, payment terms, line items, PO references…" />
            </Panel>

            <Panel index="03" title="Vendor Master Data" subtitle="Vendor profile, bank details, recent changes">
              <TextArea value={fields.vendorData} onChange={(v) => update("vendorData", v)} rows={5} placeholder="Vendor profile, banking information, change history, KYC status…" />
            </Panel>

            <Panel index="04" title="Governance Policy Model" subtitle="Approval thresholds and compliance rules">
              <TextArea value={fields.policyModel} onChange={(v) => update("policyModel", v)} rows={5} placeholder="Approval limits, dual-control rules, exception handling…" />
            </Panel>

            <div className="grid gap-8 sm:grid-cols-2">
              <Panel index="05" title="Cost Center / WBS">
                <TextField value={fields.costCenter} onChange={(v) => update("costCenter", v)} placeholder="CC-XXX / WBS-XXXX" mono />
              </Panel>
              <Panel index="06" title="Routing Heuristics">
                <TextField value={fields.routing} onChange={(v) => update("routing", v)} placeholder="Region · Category · Tier" />
              </Panel>
            </div>

            <Panel index="07" title="Invoice Upload" subtitle="PDF or image · stored only when signed in">
              <Dropzone
                file={stagedFile}
                onFile={setStagedFile}
                signedIn={!!user}
              />
            </Panel>
          </div>

          <div className="lg:sticky lg:top-8 lg:self-start">
            <ReviewPreview
              fields={fields}
              review={review}
              onRun={runReview}
              onDemo={loadDemo}
              signedIn={!!user}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeader() {
  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-ivory-muted/80">
        <span className="h-px w-8 bg-border" />
        Command Center
      </div>
      <h2 className="mt-6 font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">
        Prepare a case. <span className="italic text-ivory-muted">Release nothing yet.</span>
      </h2>
      <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
        The operator console where finance, procurement, and compliance assemble
        the evidence LedgerOath will weigh before any payment instruction is cleared.
      </p>
    </div>
  );
}

function Panel({
  index,
  title,
  subtitle,
  children,
}: {
  index?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/40 p-7 backdrop-blur-sm">
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <div>
          <h3 className="font-display text-xl tracking-tight text-foreground">{title}</h3>
          {subtitle ? (
            <p className="mt-1 text-xs text-ivory-muted/80">{subtitle}</p>
          ) : null}
        </div>
        {index ? (
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ivory-muted/60">
            §{index}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  mono,
  inputRef,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
}) {
  return (
    <label className="block">
      {label ? (
        <span className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-ivory-muted/80">
          {label}
        </span>
      ) : null}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={[
          "w-full rounded-lg border border-border bg-background/40 px-3.5 py-2.5 text-sm text-foreground",
          "placeholder:text-ivory-muted/40 outline-none transition-colors",
          "focus:border-emerald-muted/60 focus:bg-background/60",
          mono ? "font-mono text-[13px]" : "",
        ].join(" ")}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-ivory-muted/80">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-background/40 px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-emerald-muted/60 focus:bg-background/60"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-nocturne text-foreground">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextArea({
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full resize-none rounded-lg border border-border bg-background/40 px-3.5 py-3 font-mono text-[13px] leading-relaxed text-foreground placeholder:text-ivory-muted/40 outline-none transition-colors focus:border-emerald-muted/60 focus:bg-background/60"
    />
  );
}

function Dropzone({
  file,
  onFile,
  signedIn,
}: {
  file: File | null;
  onFile: (f: File | null) => void;
  signedIn: boolean;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const pick = (f: File | null) => {
    if (!f) return onFile(null);
    const ALLOWED = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    if (!ALLOWED.includes(f.type)) {
      toast.error("Unsupported file. PDF, PNG, or JPG only.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error("File exceeds 10 MB limit.");
      return;
    }
    onFile(f);
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const f = e.dataTransfer.files?.[0] ?? null;
        pick(f);
      }}
      onClick={() => inputRef.current?.click()}
      className="cursor-pointer rounded-xl border border-dashed border-border bg-background/30 px-6 py-10 text-center transition-colors hover:border-ivory/40"
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/png,image/jpeg"
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0] ?? null)}
      />
      <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-border text-ivory-muted">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M8 11V3M4.5 6.5L8 3l3.5 3.5M3 13h10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="font-display text-base text-foreground">
        {file ? file.name : "Drop invoice PDF or image"}
      </div>
      <div className="mt-1 text-xs text-ivory-muted/70">
        {file
          ? `${(file.size / 1024).toFixed(1)} KB · click to replace`
          : "or click to browse · PDF, PNG, JPG · up to 10 MB"}
      </div>
      <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-restrained/30 bg-amber-restrained/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-amber-restrained/90">
        <span className="h-1 w-1 rounded-full bg-amber-restrained" />
        {signedIn
          ? "Uploaded to your workspace on Run"
          : "Sign in to persist uploads"}
      </div>
    </div>
  );
}

function ReviewPreview({
  fields,
  review,
  onRun,
  onDemo,
  signedIn,
}: {
  fields: CaseFields;
  review: ReviewState;
  onRun: () => void;
  onDemo: () => void;
  signedIn: boolean;
}) {
  const isDone = review.status === "done";
  const isLoading = review.status === "loading";

  const v = isDone ? review.verdict : null;
  const decision = v ? v.decision : isLoading ? "…" : "Waiting";
  const risk = v ? String(v.riskScore) : "—";
  const vendor = v ? v.vendor.name : fields.vendor || "—";
  const amount = v ? v.invoice.amount : fields.invoiceAmount || "—";
  const approvers = v ? v.requiredApproversShort : "—";

  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-6 bg-[radial-gradient(circle_at_50%_20%,color-mix(in_oklab,var(--emerald-muted)_8%,transparent),transparent_60%)]" />
      <div className="relative rounded-2xl border border-border bg-card/70 p-7 backdrop-blur-xl shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ivory-muted">
            <span className={[
              "h-1.5 w-1.5 rounded-full",
              isLoading ? "bg-amber-restrained animate-pulse" : isDone ? "bg-amber-restrained" : "bg-ivory-muted/40",
            ].join(" ")} />
            Review Preview
          </div>
          <span className="font-mono text-[10px] text-ivory-muted/60">
            {fields.reviewId || "LO-————"}
          </span>
        </div>

        <div className="pt-6">
          <div className="text-[11px] uppercase tracking-[0.2em] text-ivory-muted">Decision</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span
              className={[
                "font-display text-4xl tracking-tight",
                isDone ? "text-amber-restrained" : "text-ivory-muted/70",
              ].join(" ")}
            >
              {decision}
            </span>
            <span className="font-mono text-xs text-ivory-muted">
              {isLoading ? "running…" : isDone ? "human review" : "idle"}
            </span>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border pt-6">
          <PreviewField label="Risk Score" value={risk} mono accent={isDone} />
          <PreviewField label="Status" value={isDone ? "Escalated" : isLoading ? "Reviewing" : "Awaiting case input"} />
          <div className="col-span-2">
            <PreviewField label="Vendor" value={vendor} />
          </div>
          <PreviewField label="Amount" value={amount} mono />
          <PreviewField label="Approvers" value={approvers} small />
        </div>

        {isLoading ? (
          <div className="mt-6 flex items-center gap-3 border-t border-border pt-5 font-mono text-[11px] text-emerald-muted">
            <Spinner />
            {signedIn ? "Running governance review…" : "Loading reference dossier…"}
          </div>
        ) : null}

        <div className="mt-7 flex flex-col gap-3 border-t border-border pt-6">
          <button
            onClick={onRun}
            disabled={isLoading}
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-ivory px-5 py-3 text-sm font-medium text-navy-deep transition-colors duration-200 hover:bg-ivory/90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-muted/50"
          >
            {isLoading ? "Reviewing…" : "Run Payment Review"}
          </button>
          <button
            onClick={onDemo}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-3 text-sm text-foreground/90 transition-colors duration-200 hover:border-ivory/40 hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-muted/50"
          >
            Use Demo Case
          </button>
        </div>

        <p className="mt-5 inline-flex items-center gap-2 rounded-md border border-amber-restrained/30 bg-amber-restrained/5 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-amber-restrained">
          <span className="h-1 w-1 rounded-full bg-amber-restrained" />
          Simulated only · no real payment has been executed
        </p>
      </div>
    </div>
  );
}

function PreviewField({
  label,
  value,
  mono,
  accent,
  small,
}: {
  label: string;
  value: string;
  mono?: boolean;
  accent?: boolean;
  small?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-ivory-muted/80">{label}</div>
      <div
        className={[
          "mt-1.5",
          small ? "text-xs" : "text-sm",
          mono ? "font-mono" : "",
          accent ? "text-amber-restrained" : "text-foreground",
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="animate-spin" aria-hidden>
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.25" />
      <path d="M12.5 7a5.5 5.5 0 0 0-5.5-5.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}
