import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KpiCardProps {
  label: string;
  value: string;
  previousValue?: string;
  deltaPercent: number; // 正の値=改善方向かは呼び出し側で符号を調整して渡す
}

export function KpiCard({ label, value, deltaPercent }: KpiCardProps) {
  const isUp = deltaPercent >= 0;
  const deltaColor = isUp ? "text-green-600" : "text-red-600";
  const arrow = isUp ? "▲" : "▼";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className={`text-xs mt-1 ${deltaColor}`}>
          {arrow} {Math.abs(deltaPercent).toFixed(1)}% 前期間比
        </div>
      </CardContent>
    </Card>
  );
}