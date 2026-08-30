import { runDifyAnalysis, DifyAnalysisInput } from "./dify-client";
import { hashDifyInputs } from "./hash";
import { KpiSummary } from "./types";

interface CacheEntry {
  markdown: string;
  generatedAt: string;
}

// TODO: Step 7でai_insights_cacheテーブルへの永続化に置き換える
const memoryCache = new Map<string, CacheEntry>();

export interface AiInsightResult {
  markdown: string;
  generatedAt: string;
  fromCache: boolean;
  error?: string;
}

export async function getAiInsight(
  input: DifyAnalysisInput,
  forceRegenerate = false
): Promise<AiInsightResult> {
  const inputs = {
    period_label: input.periodLabel,
    kpi_current: JSON.stringify(input.kpiCurrent),
    kpi_previous: JSON.stringify(input.kpiPrevious),
  };
  const hash = hashDifyInputs(inputs);

  if (!forceRegenerate) {
    const cached = memoryCache.get(hash);
    if (cached) {
      return { ...cached, fromCache: true };
    }
  }

  try {
    const { markdown } = await runDifyAnalysis(input);
    const generatedAt = new Date().toISOString();
    memoryCache.set(hash, { markdown, generatedAt });
    return { markdown, generatedAt, fromCache: false };
  } catch (err) {
    // Difyエラー時: 直近キャッシュがあればそれを返す(注記付き)、無ければエラー状態を返す
    const staleCache = memoryCache.get(hash);
    if (staleCache) {
      return { ...staleCache, fromCache: true, error: "最新の考察生成に失敗したため、前回の結果を表示しています" };
    }
    return {
      markdown: "",
      generatedAt: "",
      fromCache: false,
      error: err instanceof Error ? err.message : "考察の生成に失敗しました",
    };
  }
}