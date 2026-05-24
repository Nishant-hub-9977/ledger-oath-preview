// Client-safe schema + types shared between the serverFn wrapper and the
// server-only implementation. No server-only imports allowed here.
import { z } from "zod";
import type { CanonicalReview } from "./canonical";

export const analyzeInputSchema = z.object({
  caseName: z.string().max(500).optional().default(""),
  reviewId: z.string().max(120).optional().default(""),
  vendorName: z.string().max(500).optional().default(""),
  invoiceAmount: z.string().max(120).optional().default(""),
  status: z.string().max(500).optional().default(""),
  invoiceText: z.string().max(20000).optional().default(""),
  vendorMasterData: z.string().max(20000).optional().default(""),
  governancePolicyModel: z.string().max(20000).optional().default(""),
  costCenter: z.string().max(500).optional().default(""),
  routingHeuristics: z.string().max(500).optional().default(""),
  uploadedFileMetadata: z
    .object({
      name: z.string().max(500),
      size: z.number().nonnegative().max(50_000_000),
      type: z.string().max(120),
    })
    .nullable()
    .optional(),
  useDemoFallback: z.boolean().optional().default(false),
});

export type AnalyzeInput = z.infer<typeof analyzeInputSchema>;

export type AnalyzeResult = {
  result: CanonicalReview;
  source: "live" | "fallback";
  note?: string;
};
