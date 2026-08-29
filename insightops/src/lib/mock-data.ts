import { DailyInsight } from "./types";

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

/**
 * 過去days日分×creativeCount本のダミーdaily_insightsを生成する。
 * n8n/DBが無くても要件書のスキーマ構造を踏襲したデータで画面を作れる。
 */
export function generateMockDailyInsights(
  days = 60,
  creativeCount = 5
): DailyInsight[] {
  const rows: DailyInsight[] = [];
  const today = new Date();

  for (let d = days - 1; d >= 0; d--) {
    const date = new Date(today);
    date.setDate(today.getDate() - d);

    for (let c = 1; c <= creativeCount; c++) {
      const impressions = Math.floor(randomBetween(3000, 20000));
      const ctrBase = randomBetween(0.008, 0.03);
      const clicks = Math.floor(impressions * ctrBase);
      const cvrBase = randomBetween(0.02, 0.08);
      const conversions = Math.floor(clicks * cvrBase);
      const spend = randomBetween(5000, 40000);
      const conversionValue = conversions * randomBetween(3000, 12000);

      rows.push({
        date: formatDate(date),
        adCreativeId: `creative_${c}`,
        spend: Math.round(spend),
        impressions,
        clicks,
        conversions,
        conversionValue: Math.round(conversionValue),
        frequency: Number(randomBetween(1.0, 4.5).toFixed(2)),
      });
    }
  }

  return rows;
}