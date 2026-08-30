import { DailyInsight, KpiSummary, KpiTrendPoint, PeriodPreset, Granularity } from "./types";

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

export function filterByRange(rows: DailyInsight[], start: Date, end: Date) {
  return rows.filter((r) => {
    const d = new Date(r.date);
    return d >= start && d <= end;
  });
}

export interface PeriodRange {
  start: Date;
  end: Date;
  previousStart: Date;
  previousEnd: Date;
}

/**
 * プリセット/カスタム指定から当期間・前期間(同じ長さの直前区間)のDateレンジを算出する。
 */
export function resolvePeriodRange(
  preset: PeriodPreset,
  customStart?: string,
  customEnd?: string
): PeriodRange {
  const now = new Date();
  let start: Date;
  let end: Date = now;

  if (preset === "7d") {
    start = new Date(now);
    start.setDate(now.getDate() - 7);
  } else if (preset === "30d") {
    start = new Date(now);
    start.setDate(now.getDate() - 30);
  } else if (preset === "thisMonth") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    // custom
    start = customStart ? new Date(customStart) : new Date(now.setDate(now.getDate() - 30));
    end = customEnd ? new Date(customEnd) : now;
  }

  const periodMs = end.getTime() - start.getTime();
  const previousEnd = new Date(start.getTime() - 1); // 当期間の開始日と重複しないよう1ms前
  const previousStart = new Date(start.getTime() - periodMs);

  return { start, end, previousStart, previousEnd };
}

export function getKpiComparison(rows: DailyInsight[], range: PeriodRange) {
  const current = toSummary(filterByRange(rows, range.start, range.end));
  const previous = toSummary(filterByRange(rows, range.previousStart, range.previousEnd));
  return { current, previous };
}

function getWeekKey(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 月曜始まり
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().slice(0, 10);
}

/**
 * 指定レンジ・粒度でのKPI推移を返す。weeklyの場合は月曜始まりで合算する。
 */
export function getTrend(
  rows: DailyInsight[],
  range: PeriodRange,
  granularity: Granularity
): KpiTrendPoint[] {
  const filtered = filterByRange(rows, range.start, range.end);

  const bucketed = new Map<string, DailyInsight[]>();
  for (const r of filtered) {
    const key = granularity === "weekly" ? getWeekKey(r.date) : r.date;
    const arr = bucketed.get(key) ?? [];
    arr.push(r);
    bucketed.set(key, arr);
  }

  return Array.from(bucketed.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, dayRows]) => ({ date, ...toSummary(dayRows) }));
}

export function buildPeriodLabel(preset: PeriodPreset, range: PeriodRange): string {
  const fmt = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, "/");
  const presetLabels: Record<PeriodPreset, string> = {
    "7d": "直近7日",
    "30d": "直近30日",
    thisMonth: "今月",
    custom: "指定期間",
  };
  return `${presetLabels[preset]}(${fmt(range.start)}〜${fmt(range.end)})`;
}