import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

// --- Mocks must be declared before importing the module under test ---

// Mock the TanStack server-runtime request accessor.
const mockGetRequest = vi.fn();
vi.mock("@tanstack/react-start/server", () => ({
  getRequest: () => mockGetRequest(),
}));

// Mock createServerFn so importing the module doesn't require a server context.
vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => ({
    inputValidator: () => ({
      handler: (fn: unknown) => fn,
    }),
  }),
}));

// Mock the Supabase client used by requireAuthenticatedCaller.
const mockGetClaims = vi.fn();
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    auth: { getClaims: (token: string) => mockGetClaims(token) },
  }),
}));

import { runAnalyze, type AnalyzeInput } from "./analyze.functions";
import { NORTHLINE_CANONICAL } from "./canonical";

const baseInput: AnalyzeInput = {
  caseName: "Test Case",
  reviewId: "LO-TEST-001",
  vendorName: "Acme Co",
  invoiceAmount: "$1,000",
  status: "Awaiting review",
  invoiceText: "Invoice #123 for services rendered, total $1000",
  vendorMasterData: "Acme Co, verified vendor",
  governancePolicyModel: "Standard policy: invoices under $5000 auto-approve",
  costCenter: "CC-100",
  routingHeuristics: "default",
  uploadedFileMetadata: null,
  useDemoFallback: false,
};

const ORIGINAL_ENV = { ...process.env };

describe("runAnalyze — auth-gated AI path", () => {
  beforeEach(() => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_PUBLISHABLE_KEY = "test-anon-key";
    process.env.LOVABLE_API_KEY = "test-lovable-key";
    delete process.env.GEMINI_API_KEY;
    mockGetRequest.mockReset();
    mockGetClaims.mockReset();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.restoreAllMocks();
  });

  it("returns deterministic fallback when useDemoFallback=true, never calling auth or AI", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("should-not-be-called", { status: 500 }),
    );

    const result = await runAnalyze({ ...baseInput, useDemoFallback: true });

    expect(result.source).toBe("fallback");
    expect(result.result.reviewId).toBe(NORTHLINE_CANONICAL.reviewId);
    expect(mockGetRequest).not.toHaveBeenCalled();
    expect(mockGetClaims).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns deterministic fallback for unauthenticated callers (no Authorization header)", async () => {
    mockGetRequest.mockReturnValue({ headers: new Headers() });
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("nope", { status: 500 }));

    const result = await runAnalyze(baseInput);

    expect(result.source).toBe("fallback");
    expect(result.note).toMatch(/Sign in/i);
    expect(mockGetClaims).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns deterministic fallback when bearer token is invalid", async () => {
    mockGetRequest.mockReturnValue({
      headers: new Headers({ authorization: "Bearer bogus-token" }),
    });
    mockGetClaims.mockResolvedValue({ data: null, error: new Error("invalid jwt") });
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("nope", { status: 500 }));

    const result = await runAnalyze(baseInput);

    expect(result.source).toBe("fallback");
    expect(result.note).toMatch(/Sign in/i);
    expect(mockGetClaims).toHaveBeenCalledWith("bogus-token");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("invokes the live AI gateway for an authenticated caller and returns its result", async () => {
    mockGetRequest.mockReturnValue({
      headers: new Headers({ authorization: "Bearer valid-token" }),
    });
    mockGetClaims.mockResolvedValue({
      data: { claims: { sub: "user-123" } },
      error: null,
    });

    // Build a minimal valid canonical payload to satisfy isCanonical().
    const liveReviewId = "LO-LIVE-999";
    const livePayload = {
      ...NORTHLINE_CANONICAL,
      reviewId: liveReviewId,
    };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: JSON.stringify(livePayload) } }],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );

    const result = await runAnalyze(baseInput);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(String(url)).toContain("ai.gateway.lovable.dev");
    expect((init as RequestInit).headers).toMatchObject({
      Authorization: "Bearer test-lovable-key",
    });
    expect(result.source).toBe("live");
    expect(result.result.reviewId).toBe(liveReviewId);
    // Safety seal is always applied.
    expect(result.result.simulatedPaymentInstruction.status).toBe("SIMULATED_ONLY");
    expect(result.result.simulatedPaymentInstruction.warning).toBe(
      "No real payment has been executed.",
    );
  });

  it("falls back gracefully when the live gateway errors, even for authenticated callers", async () => {
    mockGetRequest.mockReturnValue({
      headers: new Headers({ authorization: "Bearer valid-token" }),
    });
    mockGetClaims.mockResolvedValue({
      data: { claims: { sub: "user-123" } },
      error: null,
    });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("upstream down", { status: 502 }),
    );

    const result = await runAnalyze(baseInput);

    expect(result.source).toBe("fallback");
    expect(result.note).toMatch(/Live analysis unavailable/i);
    expect(result.result.reviewId).toBe(NORTHLINE_CANONICAL.reviewId);
  });

  it("returns deterministic fallback when no inputs are provided, without calling auth or AI", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("nope", { status: 500 }),
    );

    const result = await runAnalyze({
      ...baseInput,
      invoiceText: "",
      vendorMasterData: "",
      governancePolicyModel: "",
    });

    expect(result.source).toBe("fallback");
    expect(result.note).toMatch(/No inputs provided/i);
    expect(mockGetRequest).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
