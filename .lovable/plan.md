# LedgerOath Phase 2 — finish the backend wiring

Goal: make the existing UI fully functional against Lovable Cloud while preserving the celestial editorial design, dark/light mode, and the public demo flow. No redesign, no new screens.

## 1. Auth-aware header (`AppChrome.tsx`)
- Read `useAuth()` once in `SiteHeader`.
- Signed-out: keep current "Sign in / Get access" links unchanged.
- Signed-in: replace those links with a small workspace badge (email initial + first name or email) and a "Sign out" mono link that calls `signOut()` then navigates to `/`.
- No new components, no popovers — inline only, same typography tokens.

## 2. CommandCenter → live analysis + save (`CommandCenter.tsx`)
- Replace the 1-second timeout in `runReview` with:
  1. `setReview({ status: "loading" })`
  2. Call `analyzePaymentReview({ data: { fields } })` server fn.
  3. Convert canonical → legacy via `toLegacyVerdict` for the existing dossier UI.
  4. `setReview({ status: "done", verdict })`.
- If `useAuth().user` exists: in background (non-blocking), `saveReview(...)`, then if the upload Dropzone has a staged file, `uploadInvoiceFile(...)`. Toast on success/failure; never block the verdict from rendering.
- If signed-out (public demo): skip persist + upload entirely. Result still renders — preserves hackathon demo reliability.
- Wire the existing Dropzone to a local `useState<File | null>` (it's currently visual-only).
- Keep the deterministic fallback already inside `analyzePaymentReview`; no client-side change needed for "Gemini missing" — it returns canonical either way.

## 3. Workspace page → real data (`routes/app.tsx`)
- Gate with `beforeLoad`: if no `supabase.auth.getUser()`, `redirect({ to: "/login" })`.
- Replace the hardcoded `RECENT_REVIEWS` constant with `listMyReviews(10)` invoked inside a `useEffect` + `useState` (keep it client-side to avoid loader/SSR auth race; the route is already gated).
- Empty state: "No reviews yet. Run the Northline demo to create your first dossier." + link to `/#command-center`.
- Each row gets a "View" link that navigates to `/#audit-dossier` with the saved `result_json` rehydrated through a tiny shared store (sessionStorage key `lo:viewReview`). Landing page reads it on mount once and replaces the dossier's verdict.
- Workspace bar: swap "Demo Operator" for the signed-in user's email (from `useAuth`).

## 4. Export tracking (`AuditDossier.tsx`)
- Pass an optional `dbId?: string` prop down from landing (only set when a saved review is loaded).
- In the `copy()` and `download` handlers, when `dbId` is set, call `recordExport({ paymentReviewDbId: dbId, exportType: "summary" | "json" | "markdown" })`. Fire-and-forget; ignore errors.
- No UI change.

## 5. Landing wiring (`routes/index.tsx`)
- On mount, read `sessionStorage.getItem("lo:viewReview")`. If present, parse, hydrate `review` state with `toLegacyVerdict(parsed)`, remember `dbId`, clear the key, and scroll to `#audit-dossier`.
- Pass `dbId` into `<AuditDossier />`.

## 6. No other changes
- Do not touch the celestial backdrop, isometric line art, typography, color tokens, theme toggle, or any motion code.
- Do not add real payments. Do not add new tables or migrations — schema is complete.
- Do not expose `LOVABLE_API_KEY`; it's only read inside `analyzePaymentReview.handler`.

## Technical notes
- All persistence is via existing helpers in `src/lib/decision/persist.ts` (no new file).
- `analyzePaymentReview` is already protected with `requireSupabaseAuth` only for the live Gemini path? Re-check: it must work for signed-out demo users too. If currently middleware-gated, split: the public demo path calls a pure client helper that returns `toCanonical(NORTHLINE_CANONICAL)` — no server round-trip, zero credits. Signed-in users hit the server fn for live analysis.
- This keeps credit usage at zero for the public demo and one Gemini call per signed-in real review.
- File upload validates type (PDF/PNG/JPG) and 10 MB cap inside `uploadInvoiceFile` already.

## Files touched (6)
```
src/components/app/AppChrome.tsx
src/components/app/CommandCenter.tsx
src/components/app/AuditDossier.tsx
src/routes/app.tsx
src/routes/index.tsx
src/lib/decision/analyze.functions.ts   (only if auth-gating needs to be relaxed)
```

End state: signed-out visitors get the instant deterministic demo; signed-in operators get live analysis, persisted reviews, file uploads, real recent-reviews list, viewable past dossiers, and audit-export logging — all on the existing UI.