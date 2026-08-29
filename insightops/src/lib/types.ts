export interface DailyInsight {
  date: string; // YYYY-MM-DD
  adCreativeId: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  conversionValue: number;
  frequency: number;
}

export interface KpiSummary {
  spend: number;
  cpa: number;
  roas: number;
  ctr: number;
  cvr: number;
}

export interface KpiTrendPoint {
  date: string;
  spend: number;
  cpa: number;
  roas: number;
  ctr: number;
  cvr: number;
}