import { DailyInsight } from "./types";
import { filterByRange, PeriodRange } from "./metrics";

export const FATIGUE_FREQUENCY_THRESHOLD = 3.0;
export const FATIGUE_CTR_DECLINE_THRESHOLD = 0.2; // 20%以上の低下で警告

export interface CreativeFatigueStatus {
  adCreativeId: string;
  currentFrequency: number;
  previousCtr: number;
  recentCtr: number;
  ctrDeclineRate: number; // 正の値 = 低下(悪化)
  isFatigued: boolean;
  hasEnoughData: boolean;
}

function ctrOf(rows: DailyInsight[]): number {
  const impressions = rows.reduce((s, r) => s + r.impressions, 0);
  const clicks = rows.reduce((s, r) => s + r.clicks, 0);
  return impressions > 0 ? clicks / impressions : 0;
}

/**
 * 選択期間内のクリエイティブごとの疲弊状況を判定する。
 * 期間を前半/後半に分けてCTRの低下率を見るため、最低2日分のデータが必要。
 */
export function getCreativeFatigueStatuses(
  rows: DailyInsight[],
  range: PeriodRange
): CreativeFatigueStatus[] {
  const filtered = filterByRange(rows, range.start, range.end).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const byCreative = new Map<string, DailyInsight[]>();
  for (const r of filtered) {
    const arr = byCreative.get(r.adCreativeId) ?? [];
    arr.push(r);
    byCreative.set(r.adCreativeId, arr);
  }

  const statuses: CreativeFatigueStatus[] = [];

  for (const [adCreativeId, creativeRows] of byCreative) {
    const midpoint = Math.floor(creativeRows.length / 2);
    const hasEnoughData = midpoint >= 1;

    if (!hasEnoughData) {
      statuses.push({
        adCreativeId,
        currentFrequency: creativeRows[creativeRows.length - 1]?.frequency ?? 0,
        previousCtr: 0,
        recentCtr: 0,
        ctrDeclineRate: 0,
        isFatigued: false,
        hasEnoughData: false,
      });
      continue;
    }

    const previousHalf = creativeRows.slice(0, midpoint);
    const recentHalf = creativeRows.slice(midpoint);

    const previousCtr = ctrOf(previousHalf);
    const recentCtr = ctrOf(recentHalf);
    const ctrDeclineRate = previousCtr > 0 ? (previousCtr - recentCtr) / previousCtr : 0;
    const currentFrequency = creativeRows[creativeRows.length - 1].frequency;

    const isFatigued =
      currentFrequency >= FATIGUE_FREQUENCY_THRESHOLD &&
      ctrDeclineRate >= FATIGUE_CTR_DECLINE_THRESHOLD;

    statuses.push({
      adCreativeId,
      currentFrequency,
      previousCtr,
      recentCtr,
      ctrDeclineRate,
      isFatigued,
      hasEnoughData: true,
    });
  }

  // 要差し替えのものを上に表示
  return statuses.sort((a, b) => Number(b.isFatigued) - Number(a.isFatigued));
}