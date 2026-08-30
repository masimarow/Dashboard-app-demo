import { DataSourceMode } from "@/lib/data-source";
import { Badge } from "@/components/ui/badge";

interface DemoModeBadgeProps {
  mode: DataSourceMode;
}

export function DemoModeBadge({ mode }: DemoModeBadgeProps) {
  if (mode === "live") {
    return (
      <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
        ● 実データ接続中
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">
      ● デモモード(モックデータ表示中)
    </Badge>
  );
}