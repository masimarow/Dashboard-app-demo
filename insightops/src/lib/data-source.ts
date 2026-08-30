import { DailyInsight } from "./types";
import { generateMockDailyInsights } from "./mock-data";

export type DataSourceMode = "mock" | "live";

/**
 * 環境変数からデータソースモードを判定する。
 * NEXT_PUBLIC_DEMO_MODE=false かつ Meta API連携が実装されたら "live" 分岐を追加する。
 * 現時点ではlive分岐は未実装のため、常にmockにフォールバックする。
 */
export function getDataSourceMode(): DataSourceMode {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";
  return isDemoMode ? "mock" : "live";
}

export async function fetchDailyInsights(): Promise<DailyInsight[]> {
  const mode = getDataSourceMode();

  if (mode === "mock") {
    return generateMockDailyInsights(120, 5);
  }

  // TODO: Step 7でPostgreSQL/Supabaseからの取得に置き換える
  // 現状は未実装なのでモックにフォールバックしておく(本番で落ちないように)
  console.warn("live data source is not implemented yet, falling back to mock");
  return generateMockDailyInsights(120, 5);
}