import { fetchDailyInsights, getDataSourceMode } from "@/lib/data-source";
import { DashboardClient } from "@/components/dashboard-client";
import { DemoModeBadge } from "@/components/demo-mode-badge";

export default async function DashboardPage() {
  const rows = await fetchDailyInsights();
  const mode = getDataSourceMode();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">InsightOps ダッシュボード</h1>
          <p className="text-sm text-muted-foreground">
            広告運用KPIモニタリング
          </p>
        </div>
        <DemoModeBadge mode={mode} />
      </div>
      <DashboardClient rows={rows} />
    </div>
  );
}