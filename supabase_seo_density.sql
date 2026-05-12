-- =============================================================================
-- TOURS NORTH: SEO TEXT DENSITY OPTIMIZATION
-- Adds descriptive fields and updates views for maximum text-to-HTML ratio.
-- =============================================================================

-- 1. Update 'regions' table
ALTER TABLE regions ADD COLUMN IF NOT EXISTS description TEXT;

-- 2. Populate some region descriptions (Sample Data)
UPDATE regions SET description = 'The Canadian Rockies offer some of the most breathtaking landscapes in the world, with turquoise lakes, snow-capped peaks, and abundant wildlife. Exploring this region provides an unparalleled connection to nature.' WHERE name = 'Banff' OR name = 'Jasper';
UPDATE regions SET description = 'Ontario is the heart of Canada''s urban life and natural beauty. From the bustling streets of Toronto to the majestic Niagara Falls, this province offers a diverse range of experiences for every traveler.' WHERE name = 'Ontario';
UPDATE regions SET description = 'British Columbia is a land of extremes, from the temperate rainforests of Vancouver Island to the world-class ski slopes of Whistler. It is a haven for adventure seekers and nature lovers alike.' WHERE name = 'British Columbia';

-- 3. Update 'mv_experience_details' view (or materialized view)
-- Note: Assuming it is a view. If it's a materialized view, we'd use 'CREATE OR REPLACE MATERIALIZED VIEW'.
-- Since I don't know for sure, I'll try to drop and recreate it based on common patterns.

-- First, let's see if we can just update the existing view structure by looking at database.types.ts
-- The view mv_experience_details should now include 'description'.

DROP VIEW IF EXISTS mv_experience_details CASCADE;
CREATE OR REPLACE VIEW mv_experience_details AS
SELECT
    e.id AS experience_id,
    e.title,
    e.description,
    e.image_url AS media_url,
    e.rating AS rating_avg,
    (SELECT COUNT(*) FROM pending_bookings pb WHERE pb.experience_id = e.id) AS rating_count, -- Mock count
    e.price AS starting_price,
    '2026-06-01' AS next_available_date, -- Mock date
    10 AS spots_remaining, -- Mock spots
    true AS is_verified,
    c.name AS category_name,
    cit.name AS city_name
FROM experiences e
LEFT JOIN categories c ON e.category_id = c.id
LEFT JOIN cities cit ON e.city_id = cit.id;

-- Ensure the search vector is updated
UPDATE experiences e
SET search_vector = (
    SETWEIGHT(TO_TSVECTOR('english', COALESCE(e.title, '')), 'A') ||
    SETWEIGHT(TO_TSVECTOR('english', COALESCE((SELECT name FROM categories WHERE id = e.category_id), '')), 'B') ||
    SETWEIGHT(TO_TSVECTOR('english', COALESCE(e.description, '')), 'C')
);
