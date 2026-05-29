// Internationalization primitives for LedgerOath.
// Kept dependency-free — no i18next, no Intl polyfills.

export type LanguageCode = "en" | "es" | "fr" | "de" | "ja" | "hi";
export type RegionCode = "IN" | "EU" | "US" | "UK" | "APAC";
export type CurrencyCode =
  | "INR"
  | "USD"
  | "EUR"
  | "GBP"
  | "JPY"
  | "SGD"
  | "AED";

export const LANGUAGES: { code: LanguageCode; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "fr", label: "French", native: "Français" },
  { code: "de", label: "German", native: "Deutsch" },
  { code: "ja", label: "Japanese", native: "日本語" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
];

export const CURRENCIES: { code: CurrencyCode; symbol: string; locale: string }[] = [
  { code: "INR", symbol: "₹", locale: "en-IN" },
  { code: "USD", symbol: "$", locale: "en-US" },
  { code: "EUR", symbol: "€", locale: "de-DE" },
  { code: "GBP", symbol: "£", locale: "en-GB" },
  { code: "JPY", symbol: "¥", locale: "ja-JP" },
  { code: "SGD", symbol: "S$", locale: "en-SG" },
  { code: "AED", symbol: "د.إ", locale: "ar-AE" },
];

export function formatAmount(
  raw: string | number,
  currency: CurrencyCode = "USD",
): string {
  const cfg = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[1];
  const num = typeof raw === "number" ? raw : Number(String(raw).replace(/[^\d.-]/g, ""));
  if (!Number.isFinite(num)) return String(raw);
  try {
    return new Intl.NumberFormat(cfg.locale, {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "JPY" ? 0 : 2,
    }).format(num);
  } catch {
    return `${cfg.symbol}${num.toLocaleString(cfg.locale)}`;
  }
}

// Region presets — drop straight into the Governance Policy Model field.
export const REGION_PRESETS: Record<
  RegionCode,
  { label: string; currency: CurrencyCode; policy: string; routing: string }
> = {
  IN: {
    label: "India · GST / RBI",
    currency: "INR",
    routing: "Region: IN · Category: Software · Tier: Enterprise",
    policy: `Single-approver limit: ₹5,00,000
Above threshold or recent vendor-bank change:
  → Finance Controller AND Procurement Head required
GST compliance: GSTIN must be present on invoice
RBI: foreign remittance > ₹5,00,000 requires Form 15CA/CB
Missing PO triggers compliance review`,
  },
  EU: {
    label: "EU · VAT / SEPA",
    currency: "EUR",
    routing: "Region: EU · Payment rail: SEPA · Tier: Enterprise",
    policy: `Single-approver limit: €5,000
VAT: valid VAT ID required for intra-EU B2B invoices (reverse charge)
SEPA: IBAN must match vendor master; SEPA mandate required for direct debit
DAC7 reporting flag for cross-border digital services
Dual approval required above €10,000 or for new IBAN within 14 days`,
  },
  US: {
    label: "US · ACH / W-9",
    currency: "USD",
    routing: "Region: US · Payment rail: ACH · Tier: Enterprise",
    policy: `Single-approver limit: $5,000
W-9 on file required for all US vendors; W-8BEN for foreign
1099-NEC tracking for non-employee compensation ≥ $600
ACH same-day above $25,000 requires Treasury sign-off
OFAC sanctions screen mandatory on new vendors`,
  },
  UK: {
    label: "UK · HMRC / BACS",
    currency: "GBP",
    routing: "Region: UK · Payment rail: BACS / Faster Payments",
    policy: `Single-approver limit: £4,000
HMRC: VAT registration must be verified for VAT-charged invoices
CIS deduction check for construction services
Faster Payments above £25,000 requires dual approval
Recent IBAN/sort-code change within 14 days escalates`,
  },
  APAC: {
    label: "APAC · MAS / cross-border",
    currency: "SGD",
    routing: "Region: APAC · Cross-border B2B",
    policy: `Single-approver limit: S$7,000
MAS reporting for cross-border payments > S$10,000
Withholding tax check for royalties, interest, service fees
FX hedging review required for non-SGD payments
Sanctions screen mandatory; PEP check for new vendors`,
  },
};
