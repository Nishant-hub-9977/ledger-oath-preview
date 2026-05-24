import { createServerFn } from "@tanstack/react-start";
import {
  analyzeInputSchema,
  type AnalyzeInput,
  type AnalyzeResult,
} from "./analyze.shared";

export type { AnalyzeInput, AnalyzeResult };

export const analyzePaymentReview = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => analyzeInputSchema.parse(input))
  .handler(async ({ data }): Promise<AnalyzeResult> => {
    const { runAnalyze } = await import("./analyze.server");
    return runAnalyze(data);
  });
