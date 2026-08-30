"use server";

import { getAiInsight, AiInsightResult } from "@/lib/ai-insights";
import { DifyAnalysisInput } from "@/lib/dify-client";

export async function generateAiInsight(
  input: DifyAnalysisInput,
  forceRegenerate: boolean
): Promise<AiInsightResult> {
  return getAiInsight(input, forceRegenerate);
}