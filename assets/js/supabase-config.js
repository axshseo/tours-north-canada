/**
 * Tours North · Central Data Brain v2.0
 * ─────────────────────────────────────────────────────────────────────────────
 * Single Source of Truth for Supabase initialization.
 *
 * USAGE (in any script or Alpine.js component):
 *   await window.ToursNorth.ready;
 *   const client = window.ToursNorth.client;
 *
 * This replaces both the old supabase-config.js ESM export AND db-engine.js.
 * There is now exactly ONE Supabase client for the entire platform.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://uxjjptuhnquobjohunqs.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_bYFzdR3U4rHiEgA28jkUPA_cFvs-J-W';

// ─────────────────────────────────────────────────────────────────────────────
// Bootstrap: Initialize once, expose globally
// ─────────────────────────────────────────────────────────────────────────────

let _resolveReady;
const _readyPromise = new Promise((resolve) => { _resolveReady = resolve; });

const _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false }
});

// Verify connectivity (non-blocking — fails gracefully)
_client
    .from('experiences')
    .select('id', { count: 'exact', head: true })
    .then(({ count, error }) => {
        if (error) {
            console.warn('[ToursNorth] Supabase connectivity check failed:', error.message);
            console.warn('[ToursNorth] Falling back to local JSON inventory.');
        } else {
            console.log(`[ToursNorth] ✅ Data Engine Connected — ${count ?? '?'} experiences indexed.`);
        }
        // Mark as ready regardless — callers handle their own fallback logic
        _resolveReady(_client);
    });

// ─────────────────────────────────────────────────────────────────────────────
// Global singleton — the ONLY Supabase client on the platform
// ─────────────────────────────────────────────────────────────────────────────

window.ToursNorth = {
    /** Resolves to the Supabase client once the connectivity check is complete */
    ready: _readyPromise,

    /** The initialized Supabase client */
    client: _client,

    /** CEXS™ 9-Layer taxonomy mapper  */
    mapToTaxonomy(rows) {
        if (!Array.isArray(rows)) return [];
        return rows.map(r => ({
            id:               r.id,
            slug:             r.slug,
            isLive:           r.inventory_status === 'Active',

            // L1–L3
            l1_intent:        r.intent,
            l2_category:      r.category,
            l3_sub_category:  r.sub_category,

            // L4
            l4_functional: {
                primary_type: r.primary_type,
                sub_types:    r.sub_types || []
            },

            // L5–L6
            l5_marketing_vibe: r.vibe,
            l6_sub_collection: r.sub_collection || null,

            // L7
            l7_persona: r.personas || [],

            // L8
            l8_contextual: {
                seasonality:         r.seasonality,
                weather_dependency:  r.weather_dependency,
                time_commitment:     r.time_commitment,
                accessibility:       r.accessibility || [],
                price_tier:          r.price_tier,
                city:                r.city_name
            },

            // L9
            l9_bundle_logic: {
                is_bundle_parent: r.is_bundle_parent || false,
                eligible_bundles: r.eligible_bundles || [],
                cross_sell_ids:   r.cross_sell_ids || []
            },

            // Content
            content: {
                name:        r.name,
                city:        r.city_name,
                price:       r.price,
                rating:      r.rating,
                image:       r.image_url,
                description: r.description
            },

            // SEO
            canonical_path: r.canonical_path,

            // Shorthand aliases (for search.js and tour cards)
            name:     r.name,
            city:     r.city_name,
            category: r.category,
            price:    r.price,
            rating:   r.rating,
            image:    r.image_url
        }));
    },

    /** FNV-1a 32-bit hash — secure tour ID fingerprint (replaces btoa hack) */
    fnv32a(str) {
        let hash = 0x811c9dc5;
        for (let i = 0; i < str.length; i++) {
            hash ^= str.charCodeAt(i);
            hash = (hash * 0x01000193) >>> 0;
        }
        return hash.toString(16).toUpperCase().padStart(8, '0');
    },

    /** Canonical slug: canada/{province}/{city}/{l2_category}/{tour-name} */
    generateSlug(tour) {
        if (tour.slug) return tour.slug;
        if (tour.canonical_path) return tour.canonical_path;
        const city = (tour.city || tour.content?.city || 'canada').toLowerCase().replace(/\s+/g, '-');
        const cat = (tour.l2_category || tour.category || 'tours').toLowerCase().replace(/\s+/g, '-');
        const name = (tour.content?.name || tour.name || tour.id).toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return `canada/${city}/${cat}/${name}`;
    }
};

// ESM export for tours-north-api.js compatibility
export const supabase = _client;
export default window.ToursNorth;
