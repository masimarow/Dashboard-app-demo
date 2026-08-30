"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { KpiTrendPoint } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type FormatType = "yen" | "percent" | "multiplier";

interface KpiTrendChartProps {
  title: string;
  data: KpiTrendPoint[];
  metricKey: keyof Omit<KpiTrendPoint, "date">;
  format?: FormatType;
}

// 関数はpropsで受け取らず、コンポーネント内部で定義する
function formatValue(v: number, format: FormatType): string {
  switch (format) {
    case "yen":
      return `¥${Math.round(v).toLocaleString()}`;
    case "percent":
      return `${(v * 100).toFixed(2)}%`;
    case "multiplier":
      return `${v.toFixed(2)}x`;
    default:
      return v.toLocaleString();
  }
}

export function KpiTrendChart({
  title,
  data,
  metricKey,
  format = "yen",
}: KpiTrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tickFormatter={(d: string) => d.slice(5)}
              fontSize={12}
            />
            <YAxis
              fontSize={12}
              tickFormatter={(v: number) => formatValue(v, format)}
              width={60}
            />
            <Tooltip
              formatter={(v: number) => formatValue(v, format)}
              labelFormatter={(d: string) => d}
            />
            <Line
              type="monotone"
              dataKey={metricKey}
              stroke="#6633cc"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}