import { generateMockDailyInsights } from "@/lib/mock-data";
import { DashboardClient } from "@/components/dashboard-client";

export default function DashboardPage() {
  // カスタム期間で過去に遡っても表示できるよう、少し長めに生成しておく
  const rows = generateMockDailyInsights(120, 5);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">InsightOps ダッシュボード</h1>
        <p className="text-sm text-muted-foreground">モックデータ表示中</p>
      </div>
      <DashboardClient rows={rows} />
    </div>
  );
}