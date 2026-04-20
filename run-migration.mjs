/**
 * Tours North · Supabase Migration Runner v4 (Direct Pooler IPv4)
 * Uses the Supavisor transaction pooler on port 6543.
 * This script bypasses IPv6 issues by targeting the pooler infrastructure directly.
 */

import pg from 'pg';
const { Client } = pg;

const PROJECT_REF   = 'uxjjptuhnquobjohunqs';
const DB_PASSWORD   = process.env.SUPABASE_DB_PASSWORD;
const REGIONS       = ['ca-central-1', 'us-east-1', 'us-west-1'];

async function attemptMigration(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  const user = `postgres.${PROJECT_REF}`;
  
  console.log(`\n  🔌 Attempting connection to ${region} pooler...`);
  console.log(`     Host: ${host} | User: ${user}`);

  const client = new Client({
    host,
    port:     6543,
    database: 'postgres',
    user,
    password: DB_PASSWORD,
    ssl:      { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
  });

  try {
    await client.connect();
    console.log(`  ✅ Connected to ${region} pooler!`);
    
    const steps = [
      {
        label: 'Step 1: Add L1-L9 columns',
        sql: `
          ALTER TABLE experiences ADD COLUMN IF NOT EXISTS intent       TEXT;
          ALTER TABLE experiences ADD COLUMN IF NOT EXISTS vibe         TEXT;
          ALTER TABLE experiences ADD COLUMN IF NOT EXISTS rating       DECIMAL(3, 1) DEFAULT 4.5;
          ALTER TABLE experiences ADD COLUMN IF NOT EXISTS slug         TEXT UNIQUE;
          ALTER TABLE experiences ADD COLUMN IF NOT EXISTS personas     TEXT[] DEFAULT '{}';
          ALTER TABLE experiences ADD COLUMN IF NOT EXISTS seasonality  TEXT DEFAULT 'All-year';
          ALTER TABLE experiences ADD COLUMN IF NOT EXISTS weather_dep  TEXT DEFAULT 'Low';
          ALTER TABLE experiences ADD COLUMN IF NOT EXISTS time_commit  TEXT DEFAULT '2-4h';
          ALTER TABLE experiences ADD COLUMN IF NOT EXISTS accessibility TEXT[] DEFAULT ARRAY['Wheelchair-friendly'];
          ALTER TABLE experiences ADD COLUMN IF NOT EXISTS price_tier   TEXT DEFAULT '$$';
          ALTER TABLE experiences ADD COLUMN IF NOT EXISTS is_bundle_parent  BOOLEAN DEFAULT false;
          ALTER TABLE experiences ADD COLUMN IF NOT EXISTS eligible_bundles  TEXT[] DEFAULT '{}';
          ALTER TABLE experiences ADD COLUMN IF NOT EXISTS cross_sell_ids    TEXT[] DEFAULT '{}';
          ALTER TABLE experiences ADD COLUMN IF NOT EXISTS search_vector tsvector;
        `
      },
      {
        label: 'Step 2: Create & seed cities table',
        sql: `
          CREATE TABLE IF NOT EXISTS cities (
              id TEXT PRIMARY KEY, name TEXT NOT NULL, province_id TEXT,
              lat DECIMAL(9, 6), lng DECIMAL(9, 6), hub_url TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
          );
          INSERT INTO cities (id, name, province_id, hub_url) VALUES
              ('toronto','Toronto','on','/destinations/toronto'),
              ('vancouver','Vancouver','bc','/destinations/vancouver'),
              ('banff','Banff','ab','/destinations/banff'),
              ('montreal','Montréal','qc','/destinations/montreal'),
              ('quebec-city','Québec City','qc','/destinations/quebec-city'),
              ('ottawa','Ottawa','on','/destinations/ottawa'),
              ('calgary','Calgary','ab','/destinations/calgary'),
              ('edmonton','Edmonton','ab','/destinations/edmonton'),
              ('whistler','Whistler','bc','/destinations/whistler'),
              ('victoria','Victoria','bc','/destinations/victoria'),
              ('halifax','Halifax','ns','/destinations/halifax'),
              ('jasper','Jasper','ab','/destinations/jasper'),
              ('niagara-falls','Niagara Falls','on','/destinations/niagara-falls'),
              ('kelowna','Kelowna','bc','/destinations/kelowna'),
              ('tofino','Tofino','bc','/destinations/tofino'),
              ('lake-louise','Lake Louise','ab','/destinations/lake-louise'),
              ('mont-tremblant','Mont-Tremblant','qc','/destinations/mont-tremblant'),
              ('lunenburg','Lunenburg','ns','/destinations/lunenburg'),
              ('muskoka','Muskoka','on','/destinations/muskoka'),
              ('whitehorse','Whitehorse','yt','/destinations/whitehorse'),
              ('yellowknife','Yellowknife','nt','/destinations/yellowknife'),
              ('iqaluit','Iqaluit','nu','/destinations/iqaluit'),
              ('charlottetown','Charlottetown','pe','/destinations/charlottetown'),
              ('churchhill','Churchill','mb','/destinations/churchill'),
              ('st-johns', $$St. John's$$, 'nl', '/destinations/st-johns')
          ON CONFLICT (id) DO NOTHING;
        `
      },
      {
        label: 'Step 3: Backfill slugs & intent',
        sql: `
          UPDATE experiences
          SET slug = LOWER(REGEXP_REPLACE(city_id || '-' || title, '[^a-zA-Z0-9]+', '-', 'g'))
          WHERE slug IS NULL;

          UPDATE experiences e
          SET intent = CASE c.name
              WHEN 'Attractions'  THEN 'See & Do'
              WHEN 'Food Tours'   THEN 'Taste & Savour'
              WHEN 'Adventure'    THEN 'Play & Thrill'
              WHEN 'Cultural'     THEN 'Learn & Discover'
              WHEN 'Nature'       THEN 'Escape & Reset'
              WHEN 'Cruises'      THEN 'Move Around'
              WHEN 'History'      THEN 'Learn & Discover'
              ELSE 'See & Do'
          END
          FROM categories c
          WHERE e.category_id = c.id AND e.intent IS NULL;
        `
      },
      {
        label: 'Step 4: Create vw_master_inventory',
        sql: `
          CREATE OR REPLACE VIEW vw_master_inventory AS
          SELECT
              e.id, e.slug, e.title AS name, e.description, e.price, e.image_url, e.published,
              CASE WHEN e.published THEN 'Active' ELSE 'Inactive' END AS inventory_status,
              e.intent, c.name AS category, sc.name AS sub_category, t.name AS primary_type,
              e.highlights AS sub_types, COALESCE(e.vibe, 'Only-in-Canada') AS vibe,
              e.personas, e.seasonality, e.weather_dep AS weather_dependency,
              e.time_commit AS time_commitment, e.accessibility, e.price_tier,
              e.is_bundle_parent, e.eligible_bundles, e.cross_sell_ids,
              e.city_id, INITCAP(REPLACE(e.city_id, '-', ' ')) AS city_name,
              e.rating, e.included_items,
              'canada/' || e.city_id || '/' ||
                  LOWER(REGEXP_REPLACE(COALESCE(c.name, 'tours'), '[^a-zA-Z0-9]+', '-', 'g'))
                  || '/' || COALESCE(e.slug, e.id::TEXT) AS canonical_path
          FROM experiences e
          LEFT JOIN categories c ON e.category_id = c.id
          LEFT JOIN sub_categories sc ON e.sub_category_id = sc.id
          LEFT JOIN types t ON e.type_id = t.id;
        `
      },
      {
        label: 'Step 5: FTS Index & Triggers',
        sql: `
          DROP INDEX IF EXISTS idx_experiences_search_gin;
          CREATE INDEX idx_experiences_search_gin ON experiences USING GIN(search_vector);
          
          CREATE OR REPLACE FUNCTION update_search_vector() RETURNS TRIGGER AS $$
          BEGIN
              NEW.search_vector :=
                  SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.title, '')), 'A') ||
                  SETWEIGHT(TO_TSVECTOR('english', COALESCE((SELECT name FROM categories WHERE id = NEW.category_id), '')), 'B') ||
                  SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.description, '')), 'C');
              RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;
          
          DROP TRIGGER IF EXISTS trg_update_search_vector ON experiences;
          CREATE TRIGGER trg_update_search_vector
              BEFORE INSERT OR UPDATE ON experiences
              FOR EACH ROW EXECUTE FUNCTION update_search_vector();
        `
      }
    ];

    for (const step of steps) {
      process.stdout.write(`    ⏳ ${step.label} ...`);
      await client.query(step.sql);
      console.log(' ✅');
    }

    console.log('\n  🚀  Migration Successful! Verifying data...');
    const verify = await client.query('SELECT COUNT(*) FROM vw_master_inventory WHERE inventory_status = \'Active\'');
    console.log(`      ✅ Found ${verify.rows[0].count} active experiences in the new view.`);

    await client.end();
    return true;
  } catch (err) {
    console.log(`  ❌ Failed for ${region}: ${err.message.slice(0, 200)}`);
    try { await client.end(); } catch {}
    return false;
  }
}

async function run() {
  console.log('\n🚀  Tours North · Supabase Final Migration Runner');
  console.log('─'.repeat(60));

  if (!DB_PASSWORD) {
    console.error('❌  SUPABASE_DB_PASSWORD environment variable is not set.');
    process.exit(1);
  }

  for (const region of REGIONS) {
    if (await attemptMigration(region)) {
      console.log('\n🎉  All tasks complete. vw_master_inventory is live!');
      process.exit(0);
    }
  }

  console.error('\n❌  All connection attempts failed. Architectural blocker persists.');
  process.exit(1);
}

run();
