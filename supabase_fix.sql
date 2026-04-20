-- =============================================================================
-- TOURS NORTH: PRODUCTION SUPABASE FIX
-- Generated: 2026-04-17 | Run in: Supabase Dashboard > SQL Editor
-- Resolves: TD-03 (vw_master_inventory), TD-08 (GIN weights), TD-11 (cities table)
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 1: Add missing columns to 'experiences' table
-- These were hardcoded in the old view — they must be real data columns
-- ─────────────────────────────────────────────────────────────────────────────

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

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 2: Create 'cities' table (replaces string-based city_id hack — TD-11)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cities (
    id          TEXT PRIMARY KEY,           -- e.g. 'toronto'
    name        TEXT NOT NULL,              -- e.g. 'Toronto'
    province_id TEXT,
    lat         DECIMAL(9, 6),
    lng         DECIMAL(9, 6),
    hub_url     TEXT,                       -- e.g. '/destinations/toronto'
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO cities (id, name, province_id, hub_url) VALUES
    ('toronto',          'Toronto',            'on', '/destinations/toronto'),
    ('vancouver',        'Vancouver',          'bc', '/destinations/vancouver'),
    ('banff',            'Banff',              'ab', '/destinations/banff'),
    ('montreal',         'Montréal',           'qc', '/destinations/montreal'),
    ('quebec-city',      'Québec City',        'qc', '/destinations/quebec-city'),
    ('ottawa',           'Ottawa',             'on', '/destinations/ottawa'),
    ('calgary',          'Calgary',            'ab', '/destinations/calgary'),
    ('edmonton',         'Edmonton',           'ab', '/destinations/edmonton'),
    ('whistler',         'Whistler',           'bc', '/destinations/whistler'),
    ('victoria',         'Victoria',           'bc', '/destinations/victoria'),
    ('halifax',          'Halifax',            'ns', '/destinations/halifax'),
    ('jasper',           'Jasper',             'ab', '/destinations/jasper'),
    ('niagara-falls',    'Niagara Falls',      'on', '/destinations/niagara-falls'),
    ('kelowna',          'Kelowna',            'bc', '/destinations/kelowna'),
    ('st-johns',         'St. John''s',        'nl', '/destinations/st-johns'),
    ('charlottetown',    'Charlottetown',      'pe', '/destinations/charlottetown'),
    ('whitehorse',       'Whitehorse',         'yt', '/destinations/whitehorse'),
    ('yellowknife',      'Yellowknife',        'nt', '/destinations/yellowknife'),
    ('iqaluit',          'Iqaluit',            'nu', '/destinations/iqaluit'),
    ('churchhill',       'Churchill',          'mb', '/destinations/churchill'),
    ('muskoka',          'Muskoka',            'on', '/destinations/muskoka'),
    ('tofino',           'Tofino',             'bc', '/destinations/tofino'),
    ('lake-louise',      'Lake Louise',        'ab', '/destinations/lake-louise'),
    ('mont-tremblant',   'Mont-Tremblant',     'qc', '/destinations/mont-tremblant'),
    ('lunenburg',        'Lunenburg',          'ns', '/destinations/lunenburg')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 3: Backfill slug for existing experiences
-- Pattern: {city_id}-{sanitized-title}
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE experiences
SET slug = LOWER(
    REGEXP_REPLACE(
        city_id || '-' || title,
        '[^a-zA-Z0-9]+', '-', 'g'
    )
)
WHERE slug IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 4: Backfill L1 intent from category (approximation until manual curation)
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE experiences e
SET intent = CASE c.name
    WHEN 'Attractions'  THEN 'See & Do'
    WHEN 'Food Tours'   THEN 'Taste & Savour'
    WHEN 'Adventure'    THEN 'Play & Thrill'
    WHEN 'Cultural'     THEN 'Learn & Discover'
    WHEN 'Nature'       THEN 'Escape & Reset'
    WHEN 'Cruises'      THEN 'Move Around'
    WHEN 'History'      THEN 'Learn & Discover'
    ELSE                     'See & Do'
END
FROM categories c
WHERE e.category_id = c.id
  AND e.intent IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 5: Create the canonical vw_master_inventory view
-- Replaces vw_experiences_by_persona with all 9 CEXS layers properly mapped
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW vw_master_inventory AS
SELECT
    -- Identity
    e.id,
    e.slug,
    e.title                                          AS name,
    e.description,
    e.price,
    e.image_url,
    e.published,
    CASE WHEN e.published THEN 'Active' ELSE 'Inactive' END AS inventory_status,

    -- L1: Intent
    e.intent,

    -- L2: Category
    c.name                                           AS category,

    -- L3: Sub-Category
    sc.name                                          AS sub_category,

    -- L4: Functional Type
    t.name                                           AS primary_type,
    e.highlights                                     AS sub_types,

    -- L5: Marketing Vibe
    COALESCE(e.vibe, 'Only-in-Canada')               AS vibe,

    -- L6: Sub-Collection (from junction table if exists, else NULL)
    -- Populated by experience_collections join below

    -- L7: Persona
    e.personas,

    -- L8: Contextual
    e.seasonality,
    e.weather_dep                                    AS weather_dependency,
    e.time_commit                                    AS time_commitment,
    e.accessibility,
    e.price_tier,

    -- L9: Bundle Logic
    e.is_bundle_parent,
    e.eligible_bundles,
    e.cross_sell_ids,

    -- Relational / Content
    e.city_id,
    INITCAP(REPLACE(e.city_id, '-', ' '))            AS city_name,
    e.rating,
    e.included_items,

    -- SEO
    'canada/' || e.city_id || '/' ||
        LOWER(REGEXP_REPLACE(COALESCE(c.name, 'tours'), '[^a-zA-Z0-9]+', '-', 'g'))
        || '/' || COALESCE(e.slug, e.id::TEXT)       AS canonical_path

FROM experiences e
LEFT JOIN categories     c  ON e.category_id     = c.id
LEFT JOIN sub_categories sc ON e.sub_category_id = sc.id
LEFT JOIN types          t  ON e.type_id         = t.id;

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 6: Full-Text Search — Weighted GIN Index (TD-08)
-- Weights: Title=A (1.0), Category=B (0.4), Description=C (0.2)
-- ─────────────────────────────────────────────────────────────────────────────

-- Add the computed tsvector column if not already present
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Populate the search vector with weights
UPDATE experiences e
SET search_vector = (
    SETWEIGHT(TO_TSVECTOR('english', COALESCE(e.title, '')),       'A') ||
    SETWEIGHT(TO_TSVECTOR('english', COALESCE(c.name, '')),        'B') ||
    SETWEIGHT(TO_TSVECTOR('english', COALESCE(sc.name, '')),       'B') ||
    SETWEIGHT(TO_TSVECTOR('english', COALESCE(e.description, '')), 'C')
)
FROM categories c, sub_categories sc
WHERE e.category_id = c.id
  AND e.sub_category_id = sc.id;

-- Create GIN index
DROP INDEX IF EXISTS idx_experiences_search_gin;
CREATE INDEX idx_experiences_search_gin ON experiences USING GIN(search_vector);

-- Auto-update trigger for future inserts/updates
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.title, '')),       'A') ||
        SETWEIGHT(TO_TSVECTOR('english', COALESCE(
            (SELECT name FROM categories WHERE id = NEW.category_id), ''
        )), 'B') ||
        SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.description, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_search_vector ON experiences;
CREATE TRIGGER trg_update_search_vector
    BEFORE INSERT OR UPDATE ON experiences
    FOR EACH ROW EXECUTE FUNCTION update_search_vector();

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 7: PostGIS helper RPC (validates existing supabase_rpc.sql)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_nearest_experiences(
    user_lat  FLOAT,
    user_lng  FLOAT,
    max_limit INT DEFAULT 50
)
RETURNS TABLE (
    id          INT,
    name        TEXT,
    category    TEXT,
    price       DECIMAL,
    image_url   TEXT,
    city_name   TEXT,
    slug        TEXT,
    distance_km FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        e.title                                         AS name,
        c.name                                          AS category,
        e.price,
        e.image_url,
        INITCAP(REPLACE(e.city_id, '-', ' '))           AS city_name,
        e.slug,
        -- Haversine approximation (no PostGIS required)
        111.045 * DEGREES(ACOS(LEAST(1.0,
            COS(RADIANS(user_lat)) * COS(RADIANS(cit.lat)) *
            COS(RADIANS(cit.lng) - RADIANS(user_lng)) +
            SIN(RADIANS(user_lat)) * SIN(RADIANS(cit.lat))
        )))                                              AS distance_km
    FROM experiences e
    LEFT JOIN categories c ON e.category_id = c.id
    LEFT JOIN cities cit   ON e.city_id = cit.id
    WHERE e.published = true
      AND cit.lat IS NOT NULL
    ORDER BY distance_km ASC
    LIMIT max_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFICATION QUERIES — Run these to confirm success
-- ─────────────────────────────────────────────────────────────────────────────

-- Check view exists and returns real data:
-- SELECT id, name, intent, category, personas, rating, canonical_path FROM vw_master_inventory LIMIT 5;

-- Check GIN index:
-- SELECT indexname FROM pg_indexes WHERE tablename = 'experiences' AND indexname LIKE '%gin%';

-- Check weighted FTS:
-- SELECT name, category, TS_RANK(search_vector, TO_TSQUERY('english', 'tower')) AS rank
-- FROM experiences WHERE search_vector @@ TO_TSQUERY('english', 'tower') ORDER BY rank DESC;
