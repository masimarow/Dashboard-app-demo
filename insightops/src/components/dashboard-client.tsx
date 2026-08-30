"use client";

import { useMemo, useState } from "react";
import { DailyInsight, PeriodPreset, Granularity } from "@/lib/types";
import { resolvePeriodRange, getKpiComparison, getTrend } from "@/lib/metrics";
import { formatDate } from "@/lib/mock-data";
import { KpiCard } from "./kpi-card";
import { KpiTrendChart } from "./kpi-trend-chart";
import { PeriodFilter } from "./period-filter";
import { getCreativeFatigueStatuses } from "@/lib/creative-fatigue";
import { CreativeFatigueTable } from "./creative-fatigue-table";
import { buildPeriodLabel } from "@/lib/metrics";
import { AiInsightPanel } from "./ai-insight-panel";
import { DifyAnalysisInput } from "@/lib/dify-client";


function pctChange(current: number, previous: number) {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

const yen = (v: number) => `¥${Math.round(v).toLocaleString()}`;
const pct = (v: number) => `${(v * 100).toFixed(2)}%`;
const x = (v: number) => `${v.toFixed(2)}x`;

interface DashboardClientProps {
  rows: DailyInsight[];
}

export function DashboardClient({ rows }: DashboardClientProps) {
  const [preset, setPreset] = useState<PeriodPreset>("30d");
  const [granularity, setGranularity] = useState<Granularity>("daily");
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return formatDate(d);
  });
  const [customEnd, setCustomEnd] = useState(() => formatDate(new Date()));

  const range = useMemo(
    () => resolvePeriodRange(preset, customStart, customEnd),
    [preset, customStart, customEnd]
  );

  const { current, previous } = useMemo(() => getKpiComparison(rows, range), [rows, range]);
  const trend = useMemo(() => getTrend(rows, range, granularity), [rows, range, granularity]);

  const kpis = [
    { label: "消化金額", value: yen(current.spend), delta: pctChange(current.spend, previous.spend) },
    { label: "CPA", value: yen(current.cpa), delta: pctChange(previous.cpa, current.cpa) },
    { label: "ROAS", value: x(current.roas), delta: pctChange(current.roas, previous.roas) },
    { label: "CTR", value: pct(current.ctr), delta: pctChange(current.ctr, previous.ctr) },
    { label: "CVR", value: pct(current.cvr), delta: pctChange(current.cvr, previous.cvr) },
  ];
  const fatigueStatuses = useMemo(
    () => getCreativeFatigueStatuses(rows, range),
    [rows, range]
  );
  const buildDifyInput = (): DifyAnalysisInput => ({
    periodLabel: buildPeriodLabel(preset, range),
    kpiCurrent: current,
    kpiPrevious: previous,
    fatiguedCreatives: fatigueStatuses,
  });

  return (
    <div className="space-y-6">
      <PeriodFilter
        preset={preset}
        granularity={granularity}
        customStart={customStart}
        customEnd={customEnd}
        onPresetChange={setPreset}
        onGranularityChange={setGranularity}
        onCustomChange={(s, e) => {
          setCustomStart(s);
          setCustomEnd(e);
        }}
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} label={k.label} value={k.value} deltaPercent={k.delta} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KpiTrendChart title="消化金額の推移" data={trend} metricKey="spend" format="yen" />
        <KpiTrendChart title="CPAの推移" data={trend} metricKey="cpa" format="yen" />
        <KpiTrendChart title="ROASの推移" data={trend} metricKey="roas" format="multiplier" />
        <KpiTrendChart title="CTR/CVRの推移" data={trend} metricKey="ctr" format="percent" />
      </div>
      <CreativeFatigueTable statuses={fatigueStatuses} />
      <AiInsightPanel buildInput={buildDifyInput} />
    </div>
  );
}