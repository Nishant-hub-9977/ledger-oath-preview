// Client-side persistence helpers for payment reviews + file uploads.
// RLS scopes every query to the authenticated user automatically.
import { supabase } from "@/integrations/supabase/client";
import type { CanonicalReview } from "./canonical";

export type SavedReview = {
  id: string;
  review_id: string;
  vendor_name: string | null;
  invoice_amount_display: string | null;
  decision: string | null;
  risk_score: number | null;
  risk_level: string | null;
  status: string | null;
  is_demo: boolean | null;
  source_mode: string | null;
  result_json: CanonicalReview;
  created_at: string;
};

function parseAmount(display: string | null | undefined): number | null {
  if (!display) return null;
  const cleaned = display.replace(/[^0-9.-]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export async function getDefaultWorkspaceId(): Promise<string | null> {
  const { data } = await supabase
    .from("workspaces")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
}

export async function saveReview(opts: {
  result: CanonicalReview;
  inputPayload: unknown;
  source: "live" | "fallback";
  isDemo: boolean;
}): Promise<{ id: string } | null> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const workspaceId = await getDefaultWorkspaceId();
  const r = opts.result;

  const { data, error } = await supabase
    .from("payment_reviews")
    .insert({
      user_id: auth.user.id,
      workspace_id: workspaceId,
      review_id: r.reviewId,
      case_name: null,
      vendor_name: r.vendor.name,
      invoice_reference: r.invoice.invoiceNumber,
      invoice_amount: parseAmount(r.invoice.amount),
      invoice_amount_display: r.invoice.amountDisplay,
      currency: r.invoice.currency,
      decision: r.decision,
      risk_score: r.riskScore,
      risk_level: r.riskLevel,
      status: r.status,
      source_mode: opts.source,
      is_demo: opts.isDemo,
      input_payload: opts.inputPayload as never,
      result_json: r as never,
      executive_summary: r.auditDossier.executiveSummary,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[saveReview]", error);
    return null;
  }
  return { id: data.id };
}

export async function listMyReviews(limit = 20): Promise<SavedReview[]> {
  const { data, error } = await supabase
    .from("payment_reviews")
    .select(
      "id, review_id, vendor_name, invoice_amount_display, decision, risk_score, risk_level, status, is_demo, source_mode, result_json, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[listMyReviews]", error);
    return [];
  }
  return (data ?? []) as unknown as SavedReview[];
}

export async function uploadInvoiceFile(opts: {
  file: File;
  reviewDbId: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, error: "Not authenticated" };

  const ALLOWED = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
  if (!ALLOWED.includes(opts.file.type)) {
    return { ok: false, error: "Unsupported file type. PDF, PNG, JPG only." };
  }
  if (opts.file.size > 10 * 1024 * 1024) {
    return { ok: false, error: "File exceeds 10MB limit." };
  }

  const safeName = opts.file.name.replace(/[^A-Za-z0-9._-]/g, "_");
  const path = `${auth.user.id}/${opts.reviewDbId}/${Date.now()}-${safeName}`;

  const { error: upErr } = await supabase.storage
    .from("invoice-uploads")
    .upload(path, opts.file, { contentType: opts.file.type, upsert: false });
  if (upErr) {
    console.error("[uploadInvoiceFile]", upErr);
    return { ok: false, error: upErr.message };
  }

  const { error: rowErr } = await supabase.from("review_files").insert({
    user_id: auth.user.id,
    review_id: opts.reviewDbId,
    file_name: opts.file.name,
    file_path: path,
    file_type: opts.file.type,
    file_size: opts.file.size,
  });
  if (rowErr) {
    console.error("[uploadInvoiceFile row]", rowErr);
    return { ok: false, error: rowErr.message };
  }
  return { ok: true };
}

export async function recordExport(opts: {
  paymentReviewDbId: string;
  exportType: "summary" | "json" | "markdown";
}): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;
  await supabase.from("audit_exports").insert({
    user_id: auth.user.id,
    payment_review_id: opts.paymentReviewDbId,
    export_type: opts.exportType,
  });
}
