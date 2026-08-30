import { Pool } from "pg";
import { generateMockDailyInsights } from "../src/lib/mock-data";

const CREATIVE_COUNT = 5;

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  await pool.query(
    `INSERT INTO ad_accounts (id, name, currency, timezone, is_mock)
     VALUES ('acc_demo', 'デモアカウント', 'JPY', 'Asia/Tokyo', true)
     ON CONFLICT (id) DO NOTHING`
  );

  await pool.query(
    `INSERT INTO campaigns (id, account_id, name, objective, status)
     VALUES ('camp_demo', 'acc_demo', 'デモキャンペーン', 'CONVERSIONS', 'ACTIVE')
     ON CONFLICT (id) DO NOTHING`
  );

  await pool.query(
    `INSERT INTO ad_sets (id, campaign_id, name, bid_strategy)
     VALUES ('adset_demo', 'camp_demo', 'デモ広告セット', 'LOWEST_COST')
     ON CONFLICT (id) DO NOTHING`
  );

  for (let c = 1; c <= CREATIVE_COUNT; c++) {
    await pool.query(
      `INSERT INTO ad_creatives (id, ad_set_id, name, format_type)
       VALUES ($1, 'adset_demo', $2, 'IMAGE')
       ON CONFLICT (id) DO NOTHING`,
      [`creative_${c}`, `デモクリエイティブ${c}`]
    );
  }

  const rows = generateMockDailyInsights(120, CREATIVE_COUNT);

  console.log(`Inserting ${rows.length} daily_insights rows...`);

  for (const r of rows) {
    await pool.query(
      `INSERT INTO daily_insights
        (date, ad_creative_id, spend, impressions, clicks, conversions, conversion_value, frequency)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (date, ad_creative_id) DO UPDATE SET
         spend = EXCLUDED.spend,
         impressions = EXCLUDED.impressions,
         clicks = EXCLUDED.clicks,
         conversions = EXCLUDED.conversions,
         conversion_value = EXCLUDED.conversion_value,
         frequency = EXCLUDED.frequency`,
      [r.date, r.adCreativeId, r.spend, r.impressions, r.clicks, r.conversions, r.conversionValue, r.frequency]
    );
  }

  console.log("Seed complete.");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});