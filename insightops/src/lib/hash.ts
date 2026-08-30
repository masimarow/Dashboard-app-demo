import { createHash } from "crypto";

/**
 * Difyへの入力データからキャッシュキー用のハッシュを生成する。
 * 同じ期間・同じデータであれば同一ハッシュになり、Difyの再呼び出しを避けられる。
 */
export function hashDifyInputs(inputs: Record<string, string>): string {
  const sortedKeys = Object.keys(inputs).sort();
  const canonical = sortedKeys.map((k) => `${k}=${inputs[k]}`).join("&");
  return createHash("sha256").update(canonical).digest("hex");
}