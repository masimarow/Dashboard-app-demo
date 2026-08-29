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

interface KpiTrendChartProps {
  title: string;
  data: KpiTrendPoint[];
  metricKey: keyof Omit<KpiTrendPoint, "date">;
  valueFormatter?: (v: number) => string;
}

export function KpiTrendChart({
  title,
  data,
  metricKey,
  valueFormatter = (v) => v.toLocaleString(),
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
              tickFormatter={(d: string) => d.slice(5)} // MM-DD
              fontSize={12}
            />
            <YAxis
              fontSize={12}
              tickFormatter={(v: number) => valueFormatter(v)}
              width={60}
            />
            <Tooltip
              formatter={(v: number) => valueFormatter(v)}
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