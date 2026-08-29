import { DailyInsight, KpiSummary, KpiTrendPoint } from "./types";

function toSummary(rows: DailyInsight[]): KpiSummary {
  const spend = rows.reduce((sum, r) => sum + r.spend, 0);
  const clicks = rows.reduce((sum, r) => sum + r.clicks, 0);
  const impressions = rows.reduce((sum, r) => sum + r.impressions, 0);
  const conversions = rows.reduce((sum, r) => sum + r.conversions, 0);
  const conversionValue = rows.reduce((sum, r) => sum + r.conversionValue, 0);

  return {
    spend,
    cpa: conversions > 0 ? spend / conversions : 0,
    roas: spend > 0 ? conversionValue / spend : 0,
    ctr: impressions > 0 ? clicks / impressions : 0,
    cvr: clicks > 0 ? conversions / clicks : 0,
  };
}

function filterByRange(rows: DailyInsight[], start: Date, end: Date) {
  return rows.filter((r) => {
    const d = new Date(r.date);
    return d >= start && d < end;
  });
}

/**
 * 直近periodDays日の実績と、その直前periodDays日(前期間)を比較するサマリーを返す。
 */
export function getKpiComparison(rows: DailyInsight[], periodDays = 30) {
  const now = new Date();
  const currentStart = new Date(now);
  currentStart.setDate(now.getDate() - periodDays);

  const previousStart = new Date(currentStart);
  previousStart.setDate(currentStart.getDate() - periodDays);

  const current = toSummary(filterByRange(rows, currentStart, now));
  const previous = toSummary(filterByRange(rows, previousStart, currentStart));

  return { current, previous };
}

/**
 * 日次のKPI推移(グラフ用)。同一日付の複数クリエイティブを合算する。
 */
export function getDailyTrend(rows: DailyInsight[], days = 30): KpiTrendPoint[] {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - days);

  const byDate = new Map<string, DailyInsight[]>();
  for (const r of filterByRange(rows, start, now)) {
    const arr = byDate.get(r.date) ?? [];
    arr.push(r);
    byDate.set(r.date, arr);
  }

  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, dayRows]) => {
      const s = toSummary(dayRows);
      return { date, ...s };
    });
}