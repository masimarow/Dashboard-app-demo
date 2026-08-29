import { generateMockDailyInsights } from "@/lib/mock-data";
import { getKpiComparison, getDailyTrend } from "@/lib/metrics";
import { KpiCard } from "@/components/kpi-card";
import { KpiTrendChart } from "@/components/kpi-trend-chart";

function pctChange(current: number, previous: number) {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

const yen = (v: number) => `¥${Math.round(v).toLocaleString()}`;
const pct = (v: number) => `${(v * 100).toFixed(2)}%`;
const x = (v: number) => `${v.toFixed(2)}x`;

export default function DashboardPage() {
  // 本来はモック/実データをここで切り替える(F-08)。今はモック固定。
  const rows = generateMockDailyInsights(90, 5);

  const { current, previous } = getKpiComparison(rows, 30);
  const trend = getDailyTrend(rows, 30);

  const kpis = [
    { label: "消化金額", value: yen(current.spend), delta: pctChange(current.spend, previous.spend) },
    { label: "CPA", value: yen(current.cpa), delta: pctChange(previous.cpa, current.cpa) }, // CPAは下がる方が改善なので符号反転
    { label: "ROAS", value: x(current.roas), delta: pctChange(current.roas, previous.roas) },
    { label: "CTR", value: pct(current.ctr), delta: pctChange(current.ctr, previous.ctr) },
    { label: "CVR", value: pct(current.cvr), delta: pctChange(current.cvr, previous.cvr) },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">InsightOps ダッシュボード</h1>
        <p className="text-sm text-muted-foreground">
          直近30日間の実績(前30日間比) ・ モックデータ表示中
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} label={k.label} value={k.value} deltaPercent={k.delta} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KpiTrendChart title="消化金額の推移" data={trend} metricKey="spend" valueFormatter={yen} />
        <KpiTrendChart title="CPAの推移" data={trend} metricKey="cpa" valueFormatter={yen} />
        <KpiTrendChart title="ROASの推移" data={trend} metricKey="roas" valueFormatter={x} />
        <KpiTrendChart title="CTR/CVRの推移" data={trend} metricKey="ctr" valueFormatter={pct} />
      </div>
    </div>
  );
}