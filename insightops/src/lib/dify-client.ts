import { KpiSummary } from "./types";
import { CreativeFatigueStatus } from "./creative-fatigue";
import { hashDifyInputs } from "./hash";

interface DifyWorkflowRunResponse {
  data: {
    status: "succeeded" | "failed" | "running" | "stopped";
    outputs: {
      text?: string;
    };
    error?: string;
  };
}

export interface DifyAnalysisInput {
  periodLabel: string;
  kpiCurrent: KpiSummary;
  kpiPrevious: KpiSummary;
  fatiguedCreatives: CreativeFatigueStatus[];
}

function buildDeltaSummary(current: KpiSummary, previous: KpiSummary): string {
  const pct = (curr: number, prev: number) =>
    prev > 0 ? (((curr - prev) / prev) * 100).toFixed(1) : "0.0";

  return [
    `消化金額 ${pct(current.spend, previous.spend)}%`,
    `CPA ${pct(current.cpa, previous.cpa)}%`,
    `ROAS ${pct(current.roas, previous.roas)}%`,
    `CTR ${((current.ctr - previous.ctr) * 100).toFixed(2)}pt`,
    `CVR ${((current.cvr - previous.cvr) * 100).toFixed(2)}pt`,
  ].join("、");
}

function buildDifyInputs(input: DifyAnalysisInput): Record<string, string> {
  const fatiguedOnly = input.fatiguedCreatives.filter((c) => c.isFatigued);

  return {
    period_label: input.periodLabel,
    kpi_current: JSON.stringify(input.kpiCurrent),
    kpi_previous: JSON.stringify(input.kpiPrevious),
    kpi_delta_summary: buildDeltaSummary(input.kpiCurrent, input.kpiPrevious),
    fatigued_creatives: JSON.stringify(
      fatiguedOnly.map((c) => ({
        adCreativeId: c.adCreativeId,
        currentFrequency: c.currentFrequency,
        ctrDeclineRate: c.ctrDeclineRate,
        previousCtr: c.previousCtr,
        recentCtr: c.recentCtr,
      }))
    ),
  };
}

/**
 * Dify Workflow APIを呼び出し、生成されたMarkdown考察を取得する。
 * 呼び出し元(server action等)でキャッシュ確認済みであることを前提とする。
 */
export async function runDifyAnalysis(
  input: DifyAnalysisInput
): Promise<{ markdown: string; inputHash: string }> {
  const apiKey = process.env.DIFY_API_KEY;
  const baseUrl = process.env.DIFY_API_BASE_URL;

  if (!apiKey || !baseUrl) {
    throw new Error("DIFY_API_KEY or DIFY_API_BASE_URL is not configured");
  }

  const inputs = buildDifyInputs(input);
  const inputHash = hashDifyInputs(inputs);

  const res = await fetch(`${baseUrl}/workflows/run`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs,
      response_mode: "blocking",
      user: "insightops-bff",
    }),
    // Difyのワークフロー実行は数秒〜十数秒かかることがあるため長めに設定
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    throw new Error(`Dify API error: ${res.status} ${res.statusText}`);
  }

  const data: DifyWorkflowRunResponse = await res.json();

  if (data.data.status !== "succeeded") {
    throw new Error(`Dify workflow did not succeed: ${data.data.status} ${data.data.error ?? ""}`);
  }

  const markdown = data.data.outputs.text;
  if (!markdown) {
    throw new Error("Dify response did not contain outputs.text");
  }

  return { markdown, inputHash };
}