"use client";

import { useState, useTransition } from "react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generateAiInsight } from "@/app/dashboard/actions";
import { DifyAnalysisInput } from "@/lib/dify-client";
import { AiInsightResult } from "@/lib/ai-insights";

interface AiInsightPanelProps {
  buildInput: () => DifyAnalysisInput;
}

export function AiInsightPanel({ buildInput }: AiInsightPanelProps) {
  const [result, setResult] = useState<AiInsightResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleGenerate = (forceRegenerate: boolean) => {
    startTransition(async () => {
      const input = buildInput();
      const res = await generateAiInsight(input, forceRegenerate);
      setResult(res);
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">AI考察</CardTitle>
        <div className="flex gap-2">
          {result && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleGenerate(true)}
              disabled={isPending}
            >
              再生成
            </Button>
          )}
          {!result && (
            <Button size="sm" onClick={() => handleGenerate(false)} disabled={isPending}>
              {isPending ? "生成中..." : "AI考察を生成"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isPending && (
          <p className="text-sm text-muted-foreground">Difyで考察を生成しています...</p>
        )}

        {!isPending && !result && (
          <p className="text-sm text-muted-foreground">
            「AI考察を生成」を押すと、現在の期間・KPIをもとにDifyが分析コメントを作成します。
          </p>
        )}

        {!isPending && result?.error && !result.markdown && (
          <p className="text-sm text-red-600">{result.error}</p>
        )}

        {!isPending && result?.markdown && (
          <div>
            {result.error && (
              <p className="text-xs text-amber-600 mb-2">⚠ {result.error}</p>
            )}
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{result.markdown}</ReactMarkdown>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {result.fromCache ? "キャッシュ表示" : "新規生成"} ・{" "}
              {new Date(result.generatedAt).toLocaleString("ja-JP")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}