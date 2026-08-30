import { DailyInsight } from "./types";
import { generateMockDailyInsights } from "./mock-data";
import { pool } from "./db";

export type DataSourceMode = "mock" | "live";

export function getDataSourceMode(): DataSourceMode {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";
  return isDemoMode ? "mock" : "live";
}

async function fetchFromDb(): Promise<DailyInsight[]> {
  const { rows } = await pool.query<{
    date: string | Date; // pgはDATE型をDateオブジェクトとして返すため両対応
    ad_creative_id: string;
    spend: string;
    impressions: string;
    clicks: string;
    conversions: string;
    conversion_value: string;
    frequency: string;
  }>(
    `SELECT date, ad_creative_id, spend, impressions, clicks, conversions, conversion_value, frequency
     FROM daily_insights
     ORDER BY date ASC`
  );

  return rows.map((r) => ({
    date: toDateString(r.date),
    adCreativeId: r.ad_creative_id,
    spend: Number(r.spend),
    impressions: Number(r.impressions),
    clicks: Number(r.clicks),
    conversions: Number(r.conversions),
    conversionValue: Number(r.conversion_value),
    frequency: Number(r.frequency),
  }));
}

/**
 * pgがDATE型をDateオブジェクトとして返すため、YYYY-MM-DD文字列に正規化する。
 * タイムゾーンの影響を避けるため、UTC基準で切り出す(DATE型はタイムゾーン情報を持たない)。
 */
function toDateString(value: string | Date): string {
  if (typeof value === "string") return value;
  return value.toISOString().slice(0, 10);
}

export async function fetchDailyInsights(): Promise<DailyInsight[]> {
  const mode = getDataSourceMode();

  if (mode === "mock") {
    return generateMockDailyInsights(120, 5);
  }

  try {
    const rows = await fetchFromDb();
    if (rows.length === 0) {
      console.warn("daily_insights table is empty, falling back to mock data");
      return generateMockDailyInsights(120, 5);
    }
    return rows;
  } catch (err) {
    console.error("Failed to fetch from DB, falling back to mock data:", err);
    return generateMockDailyInsights(120, 5);
  }
}