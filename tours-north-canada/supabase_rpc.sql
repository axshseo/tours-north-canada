-- POSTGIS PROXIMITY QUERY FOR TOURS NORTH
-- Run this in the Supabase SQL Editor to enable Map Discovery

CREATE OR REPLACE FUNCTION get_nearest_experiences(user_lat float, user_lng float, max_limit int)
RETURNS SETOF experiences AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM experiences
  WHERE published = true
  ORDER BY geog <-> ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
  LIMIT max_limit;
END;
$$ LANGUAGE plpgsql STABLE;
