export type CaseFields = {
  caseName: string;
  reviewId: string;
  vendor: string;
  invoiceAmount: string;
  status: string;
  invoiceData: string;
  vendorData: string;
  policyModel: string;
  costCenter: string;
  routing: string;
};

export type Verdict = {
  reviewId: string;
  decision: "ESCALATE" | "APPROVE" | "REJECT";
  riskScore: number;
  riskLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  status: string;
  vendor: {
    name: string;
    status: string;
  };
  invoice: {
    reference: string;
    amount: string;
    currency: string;
    description: string;
    terms: string;
  };
  findings: { severity: "FAIL" | "WARNING"; text: string }[];
  approvers: { role: string; reason: string }[];
  rationale: string;
  nextActions: string[];
  requiredApproversShort: string;
};

export type ReviewState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; verdict: Verdict };

export const EMPTY_CASE: CaseFields = {
  caseName: "",
  reviewId: "",
  vendor: "",
  invoiceAmount: "",
  status: "",
  invoiceData: "",
  vendorData: "",
  policyModel: "",
  costCenter: "",
  routing: "",
};

export const DEMO_CASE: CaseFields = {
  caseName: "NORTHLINE_DEMO_CASE.json",
  reviewId: "LO-2026-001",
  vendor: "Northline Systems Pvt. Ltd.",
  invoiceAmount: "₹8,42,500",
  status: "Awaiting governance review",
  invoiceData: `Invoice reference: NS-2026-044
Amount: ₹8,42,500 INR
Description: B2B software implementation services
Payment terms: Requested 3 days earlier than Net 30
Purchase order: Missing`,
  vendorData: `Vendor: Northline Systems Pvt. Ltd.
Status: Verified with warnings
Risk signal: Bank account details changed within the last 14 days
Prior payments: 6 invoices cleared over 18 months
Tax registration: Active`,
  policyModel: `Single-approver limit: ₹5,00,000
Above threshold or recent vendor-bank change:
  → Finance Controller AND Procurement Head required
Early-payment requests outside Net 30 require justification
Missing PO triggers compliance review`,
  costCenter: "CC-IN-FIN-2204 / WBS: IMPL-NS-Q1",
  routing: "Region: IN · Category: Software · Tier: Enterprise",
};

export const NORTHLINE_VERDICT: Verdict = {
  reviewId: "LO-2026-001",
  decision: "ESCALATE",
  riskScore: 72,
  riskLevel: "HIGH",
  status: "Human review required",
  vendor: {
    name: "Northline Systems Pvt. Ltd.",
    status: "Verified with warnings",
  },
  invoice: {
    reference: "NS-2026-044",
    amount: "₹8,42,500",
    currency: "INR",
    description: "B2B software implementation services",
    terms: "Requested 3 days earlier than Net 30",
  },
  findings: [
    { severity: "FAIL", text: "No valid PO reference found on invoice" },
    { severity: "FAIL", text: "Amount ₹8,42,500 exceeds ₹5,00,000 single-approver limit" },
    { severity: "WARNING", text: "Payment requested 3 days earlier than standard terms" },
    { severity: "WARNING", text: "Vendor bank details changed within the last 14 days" },
  ],
  approvers: [
    {
      role: "Finance Controller",
      reason: "Invoice exceeds single-approver threshold",
    },
    {
      role: "Procurement Head",
      reason: "Missing purchase order and recent vendor bank change",
    },
  ],
  rationale:
    "The stacked exceptions prevent automatic approval. The payment may proceed only after purchase order validation, secondary vendor bank verification, and dual approval from Finance Controller and Procurement Head.",
  nextActions: [
    "Request valid purchase order reference",
    "Verify vendor bank details",
    "Route to Finance Controller",
    "Route to Procurement Head",
    "Keep payment instruction halted until approval",
  ],
  requiredApproversShort: "Finance Controller + Procurement Head",
};
