CREATE TABLE IF NOT EXISTS ad_accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'JPY',
  timezone TEXT NOT NULL DEFAULT 'Asia/Tokyo',
  is_mock BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES ad_accounts(id),
  name TEXT NOT NULL,
  objective TEXT,
  status TEXT
);

CREATE TABLE IF NOT EXISTS ad_sets (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id),
  name TEXT NOT NULL,
  targeting JSONB,
  bid_strategy TEXT
);

CREATE TABLE IF NOT EXISTS ad_creatives (
  id TEXT PRIMARY KEY,
  ad_set_id TEXT NOT NULL REFERENCES ad_sets(id),
  name TEXT NOT NULL,
  format_type TEXT,
  image_url TEXT,
  body_text TEXT
);

CREATE TABLE IF NOT EXISTS daily_insights (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  ad_creative_id TEXT NOT NULL REFERENCES ad_creatives(id),
  spend NUMERIC NOT NULL DEFAULT 0,
  impressions BIGINT NOT NULL DEFAULT 0,
  clicks BIGINT NOT NULL DEFAULT 0,
  conversions BIGINT NOT NULL DEFAULT 0,
  conversion_value NUMERIC NOT NULL DEFAULT 0,
  frequency NUMERIC NOT NULL DEFAULT 0,
  UNIQUE (date, ad_creative_id)
);

CREATE INDEX IF NOT EXISTS idx_daily_insights_date ON daily_insights(date);

CREATE TABLE IF NOT EXISTS ai_insights_cache (
  id BIGSERIAL PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES ad_accounts(id),
  date_range TEXT NOT NULL,
  input_metrics_hash TEXT NOT NULL,
  analysis_result_md TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (account_id, input_metrics_hash)
);