/**
 * Tours North API v2.0 — CEXS™ 9-Layer Data Adapter
 * ─────────────────────────────────────────────────────────────────────────────
 * All queries run against vw_master_inventory (after supabase_fix.sql is applied).
 * Falls back to local /assets/data/tours.json on any failure.
 *
 * DEPENDENCY: window.ToursNorth must be initialized (supabase-config.js).
 * Use: await window.ToursNorth.ready before calling any function here.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { supabase } from './supabase-config.js';

/** Internal: Safe query wrapper with JSON fallback */
async function safeQuery(queryFn, fallbackFilter = null) {
    try {
        const result = await queryFn(supabase);
        if (result.error) throw result.error;
        return window.ToursNorth.mapToTaxonomy(result.data || []);
    } catch (err) {
        console.warn('[API] Supabase query failed, attempting JSON fallback:', err.message);
        return _jsonFallback(fallbackFilter);
    }
}

/** Internal: Local JSON fallback */
let _jsonCache = null;
async function _jsonFallback(filterFn = null) {
    if (!_jsonCache) {
        try {
            const res = await fetch('/assets/data/tours.json');
            _jsonCache = await res.json();
        } catch (e) {
            console.error('[API] JSON fallback also failed:', e.message);
            return [];
        }
    }
    return filterFn ? _jsonCache.filter(filterFn) : _jsonCache;
}

// ─────────────────────────────────────────────────────────────────────────────
// STREAM A: CITY INVENTORY (L1-L9 City Hub)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches complete 9-layer inventory for a city hub page.
 * @param {string} cityId - e.g. 'Toronto' (case-insensitive match on city_id)
 */
export async function getCityInventory(cityId) {
    const normalized = cityId.toLowerCase().replace(/\s+/g, '-');
    return safeQuery(
        (db) => db
            .from('vw_master_inventory')
            .select('*')
            .ilike('city_id', normalized)
            .eq('published', true)
            .order('rating', { ascending: false }),
        (tour) =>
            (tour.city || tour.content?.city || '')
                .toLowerCase()
                .replace(/\s+/g, '-') === normalized
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// STREAM B: REGIONAL HUB (same province, different city)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {string} provinceId  - Province code, e.g. 'on'
 * @param {string} excludedCityId - City to exclude, e.g. 'toronto'
 */
export async function getRegionalTours(provinceId, excludedCityId, limit = 10) {
    return safeQuery(
        (db) => db
            .from('vw_master_inventory')
            .select('*')
            .eq('province_id', provinceId)
            .neq('city_id', excludedCityId)
            .eq('published', true)
            .limit(limit),
        null
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// STREAM C: TOUR BY SLUG (Product page hydration — replaces bulk fetch)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches exactly ONE tour by its canonical slug.
 * Used by tour-renderer.js to avoid fetching all rows on every product page.
 * @param {string} slug - e.g. 'toronto-cn-tower-edgewalk-001' or filename
 */
export async function getTourBySlug(slug) {
    return safeQuery(
        (db) => db
            .from('vw_master_inventory')
            .select('*')
            .or(`slug.eq.${slug},id.eq.${slug}`)
            .eq('published', true)
            .limit(1),
        (tour) => tour.slug === slug || tour.id === slug || tour.url?.includes(slug)
    ).then(results => results[0] || null);
}

// ─────────────────────────────────────────────────────────────────────────────
// STREAM D: INTENT SHELF (L1 filter)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {string} intent  - L1 value e.g. 'See & Do', 'Taste & Savour'
 * @param {string} cityId
 */
export async function getToursByIntent(intent, cityId, limit = 10) {
    const normalizedCity = cityId.toLowerCase().replace(/\s+/g, '-');
    return safeQuery(
        (db) => db
            .from('vw_master_inventory')
            .select('*')
            .ilike('city_id', normalizedCity)
            .eq('intent', intent)
            .eq('published', true)
            .limit(limit),
        (tour) =>
            tour.l1_intent === intent &&
            (tour.city || '').toLowerCase() === normalizedCity.replace(/-/g, ' ')
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// STREAM E: CATEGORY (L2 filter)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {string} cityId
 * @param {string} categoryName - L2 value e.g. 'Attractions'
 */
export async function getToursByCategory(cityId, categoryName, limit = 10) {
    const normalizedCity = cityId.toLowerCase().replace(/\s+/g, '-');
    return safeQuery(
        (db) => db
            .from('vw_master_inventory')
            .select('*')
            .ilike('city_id', normalizedCity)
            .ilike('category', categoryName)
            .eq('published', true)
            .limit(limit),
        (tour) =>
            (tour.category || tour.l2_category || '').toLowerCase() === categoryName.toLowerCase() &&
            (tour.city || '').toLowerCase() === normalizedCity.replace(/-/g, ' ')
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// STREAM F: TOP RATED (for bestsellers / featured sections)
// ─────────────────────────────────────────────────────────────────────────────

export async function getTopRatedTours(cityId, limit = 10) {
    const normalizedCity = cityId.toLowerCase().replace(/\s+/g, '-');
    return safeQuery(
        (db) => db
            .from('vw_master_inventory')
            .select('*')
            .ilike('city_id', normalizedCity)
            .eq('published', true)
            .order('rating', { ascending: false })
            .limit(limit),
        (tour) => (tour.city || '').toLowerCase() === normalizedCity.replace(/-/g, ' ')
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// STREAM G: PERSONA (L7 filter)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {string} persona - e.g. 'Families with Kids', 'Solo Travelers'
 */
export async function getRecommendedFor(persona, cityId = null, limit = 5) {
    const normalizedCity = cityId?.toLowerCase().replace(/\s+/g, '-');
    return safeQuery(
        (db) => {
            let q = db
                .from('vw_master_inventory')
                .select('*')
                .contains('personas', [persona])
                .eq('published', true)
                .order('rating', { ascending: false })
                .limit(limit);
            if (normalizedCity) q = q.ilike('city_id', normalizedCity);
            return q;
        },
        (tour) => (tour.l7_persona || []).includes(persona)
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// STREAM H: PROXIMITY (PostGIS / Haversine RPC)
// ─────────────────────────────────────────────────────────────────────────────

export async function getNearestExperiences(lat, lng, limit = 50) {
    try {
        const { data, error } = await supabase.rpc('get_nearest_experiences', {
            user_lat:  lat,
            user_lng:  lng,
            max_limit: limit
        });
        if (error) throw error;
        return window.ToursNorth.mapToTaxonomy(data);
    } catch (err) {
        console.error('[API] Proximity RPC failed:', err.message);
        return [];
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// STREAM I: FULL-TEXT SEARCH (weighted GIN index — Title=A, Cat=B, Desc=C)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Searches using Supabase FTS with ranking by GIN weight.
 * Falls back to client-side filter if FTS unavailable.
 * @param {string} query - User search input
 */
export async function searchExperiences(query) {
    if (!query || query.trim().length < 2) return [];
    const sanitized = query.trim().replace(/['"]/g, '');
    try {
        const { data, error } = await supabase
            .from('vw_master_inventory')
            .select('*')
            .textSearch('search_vector', sanitized, {
                type:   'websearch',
                config: 'english'
            })
            .eq('published', true)
            .limit(20);
        if (error) throw error;
        return window.ToursNorth.mapToTaxonomy(data);
    } catch (err) {
        console.warn('[API] FTS search failed, falling back to local filter:', err.message);
        const all = await _jsonFallback();
        const q = sanitized.toLowerCase();
        return all.filter(t =>
            (t.name || t.content?.name || '').toLowerCase().includes(q) ||
            (t.city || t.content?.city || '').toLowerCase().includes(q) ||
            (t.category || t.l2_category || '').toLowerCase().includes(q)
        );
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// DISCOVERY: Provinces + City Hubs (for navigation / carousels)
// ─────────────────────────────────────────────────────────────────────────────

export async function getProvinces(limit = 13) {
    try {
        const { data, error } = await supabase.from('provinces').select('*').limit(limit);
        if (error) throw error;
        return data;
    } catch {
        return [
            { id: 'on', name: 'Ontario' },
            { id: 'bc', name: 'British Columbia' },
            { id: 'ab', name: 'Alberta' },
            { id: 'qc', name: 'Québec' },
            { id: 'ns', name: 'Nova Scotia' },
            { id: 'mb', name: 'Manitoba' },
            { id: 'sk', name: 'Saskatchewan' },
            { id: 'nb', name: 'New Brunswick' },
            { id: 'pe', name: 'Prince Edward Island' },
            { id: 'nl', name: 'Newfoundland & Labrador' },
            { id: 'yt', name: 'Yukon' },
            { id: 'nt', name: 'Northwest Territories' },
            { id: 'nu', name: 'Nunavut' }
        ].slice(0, limit);
    }
}

export async function getCityHubs(limit = 12) {
    try {
        // Query the cities table (created in supabase_fix.sql)
        const { data, error } = await supabase
            .from('cities')
            .select('id, name, hub_url')
            .limit(limit);
        if (error) throw error;
        return data;
    } catch {
        // Fallback: derive from JSON
        const all = await _jsonFallback();
        const seen = new Set();
        return all
            .filter(t => { const c = t.city || t.content?.city; return c && !seen.has(c) && seen.add(c); })
            .map(t => {
                const city = t.city || t.content?.city;
                return { id: city.toLowerCase().replace(/\s+/g, '-'), name: city, hub_url: `/destinations/${city.toLowerCase().replace(/\s+/g, '-')}` };
            })
            .slice(0, limit);
    }
}

/**
 * Weather-safe tours (Indoor type — L8 context)
 */
export async function getWeatherSafeTours(cityId, limit = 10) {
    const normalizedCity = cityId.toLowerCase().replace(/\s+/g, '-');
    return safeQuery(
        (db) => db
            .from('vw_master_inventory')
            .select('*')
            .ilike('city_id', normalizedCity)
            .ilike('primary_type', 'Indoor')
            .eq('published', true)
            .limit(limit),
        (tour) => tour.l4_functional?.primary_type === 'Indoor'
    );
}
