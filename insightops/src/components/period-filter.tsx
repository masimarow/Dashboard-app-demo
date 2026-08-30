"use client";

import { PeriodPreset, Granularity } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface PeriodFilterProps {
  preset: PeriodPreset;
  granularity: Granularity;
  customStart: string;
  customEnd: string;
  onPresetChange: (p: PeriodPreset) => void;
  onGranularityChange: (g: Granularity) => void;
  onCustomChange: (start: string, end: string) => void;
}

const presets: { value: PeriodPreset; label: string }[] = [
  { value: "7d", label: "直近7日" },
  { value: "30d", label: "直近30日" },
  { value: "thisMonth", label: "今月" },
  { value: "custom", label: "カスタム" },
];

export function PeriodFilter({
  preset,
  granularity,
  customStart,
  customEnd,
  onPresetChange,
  onGranularityChange,
  onCustomChange,
}: PeriodFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex gap-1">
        {presets.map((p) => (
          <Button
            key={p.value}
            size="sm"
            variant={preset === p.value ? "default" : "outline"}
            onClick={() => onPresetChange(p.value)}
          >
            {p.label}
          </Button>
        ))}
      </div>

      {preset === "custom" && (
        <div className="flex items-center gap-2 text-sm">
          <input
            type="date"
            value={customStart}
            onChange={(e) => onCustomChange(e.target.value, customEnd)}
            className="border rounded px-2 py-1 text-sm"
          />
          <span>〜</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => onCustomChange(customStart, e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />
        </div>
      )}

      <div className="flex gap-1 ml-auto">
        <Button
          size="sm"
          variant={granularity === "daily" ? "default" : "outline"}
          onClick={() => onGranularityChange("daily")}
        >
          日次
        </Button>
        <Button
          size="sm"
          variant={granularity === "weekly" ? "default" : "outline"}
          onClick={() => onGranularityChange("weekly")}
        >
          週次
        </Button>
      </div>
    </div>
  );
}