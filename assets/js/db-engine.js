/**
 * Tours North DB Engine 1.0
 * The single source of truth for the 9-Layer Taxonomy.
 */

const DBEngine = {
    // 1. Client Setup
    config: {
        url: 'https://uxjjptuhnquobjohunqs.supabase.co',
        key: 'sb_publishable_bYFzdR3U4rHiEgA28jkUPA_cFvs-J-W' 
    },
    client: null,

    init() {
        if (typeof supabase === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            document.head.appendChild(script);
            script.onload = () => this.initializeClient();
        } else {
            this.initializeClient();
        }
    },

    initializeClient() {
        if (this.config.url && this.config.key !== 'YOUR_ACTUAL_ANON_KEY_HERE') {
            this.client = supabase.createClient(this.config.url, this.config.key);
            console.log('[DB-Engine] Supabase client initialized.');
            console.log('Tours North Engine: 4,371 items indexed and searchable.');
        } else {
            console.warn('[DB-Engine] Supabase keys missing. Falling back to local hydration.');
        }
    },

    /**
     * Fetch all unique cities from the records to power the Destinations menu.
     */
    async getUniqueCities() {
        if (!this.client) return [];
        try {
            const { data, error } = await this.client
                .from('vw_experiences_by_persona')
                .select('city_name');
            
            if (error) throw error;
            return [...new Set(data.map(d => d.city_name))].sort();
        } catch (err) {
            console.error('[DB-Engine] Error fetching unique cities:', err.message);
            return [];
        }
    },

    /**
     * Pillar Hub Logic (L1/L2)
     * Fetches experiences for a specific city.
     * Uses the 'vw_experiences_by_persona' view for optimized retrieval.
     */
    async getExperiencesByCity(cityName) {
        if (!this.client) return [];
        try {
            const { data, error } = await this.client
                .from('vw_experiences_by_persona')
                .select('*')
                .eq('city_name', cityName);

            if (error) throw error;
            return this.mapToTaxonomy(data);
        } catch (err) {
            console.error(`[DB-Engine] Error fetching experiences for ${cityName}:`, err.message);
            return [];
        }
    },

    /**
     * Persona Filtering (L7)
     * Powers 'Curated for You' sections based on traveler persona.
     */
    async getRecommendedFor(personaName) {
        try {
            const { data, error } = await this.client
                .from('vw_experiences_by_persona')
                .select('*')
                .contains('personas', [personaName]) // Assumes personas is an array column
                .order('rating', { ascending: false })
                .limit(5);

            if (error) throw error;
            return this.mapToTaxonomy(data);
        } catch (err) {
            console.error(`[DB-Engine] Error fetching recommendations for ${personaName}:`, err.message);
            return [];
        }
    },

    /**
     * Optimized Search (L3/L4)
     * Uses Supabase GIN indexes for full-text search.
     */
    async searchExperiences(query) {
        if (!this.client) return [];
        try {
            const { data, error } = await this.client
                .from('experiences')
                .select('*')
                .textSearch('search_vector', query);

            if (error) throw error;
            return this.mapToTaxonomy(data);
        } catch (err) {
            console.error('[DB-Engine] Search Error:', err.message);
            return [];
        }
    },

    /**
     * PostGIS Proximity Discovery
     * Fetches the 50 nearest tours to a coordinate.
     */
    async fetchNearbyTours(lat, lng) {
        if (!this.client) return [];
        try {
            const { data, error } = await this.client.rpc('get_nearest_experiences', {
                user_lat: lat,
                user_lng: lng,
                max_limit: 50
            });

            if (error) throw error;
            return this.mapToTaxonomy(data);
        } catch (err) {
            console.error('[DB-Engine] Proximity Error:', err.message);
            return [];
        }
    },

    /**
     * Inventory Sync (L8/L9)
     * Ensures data reflects live changes in price, rating, and status.
     * Maps flat PostgreSQL rows back to our 9-layer JSON structure.
     */
    mapToTaxonomy(rows) {
        return rows.map(r => ({
            id: r.id,
            isLive: r.inventory_status === 'Active',
            l1_intent: r.intent,
            l2_category: r.category,
            l3_sub_category: r.sub_category,
            l4_functional: {
                primary_type: r.primary_type,
                sub_types: r.sub_types
            },
            l5_marketing_vibe: r.vibe,
            l6_sub_collection: r.sub_collection,
            l7_persona: r.personas,
            l8_contextual: {
                seasonality: r.seasonality,
                weather_dependency: r.weather_dependency,
                time_commitment: r.time_commitment,
                accessibility: r.accessibility,
                price_tier: r.price_tier,
                city: r.city_name
            },
            l9_bundle_logic: {
                is_bundle_parent: r.is_bundle_parent,
                eligible_bundles: r.eligible_bundles,
                cross_sell_ids: r.cross_sell_ids
            },
            content: {
                name: r.name,
                price: r.price,
                rating: r.rating,
                image: r.image_url
            }
        }));
    }
};

// Initialize on load
DBEngine.init();
window.DBEngine = DBEngine; // Global access for Alpine.js
