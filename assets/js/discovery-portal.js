/**
 * Tours North · Discovery Portal Logic
 * ─────────────────────────────────────────────────────────────────────────────
 * Powers the City Hub "Discovery Wave" UI.
 * Integrates with ToursNorth (Supabase) via the tours-north-api.js methods.
 * ─────────────────────────────────────────────────────────────────────────────
 */

document.addEventListener('alpine:init', () => {
    // We import the API methods here if we were in a module, 
    // but to avoid race conditions, we'll assume the API is available 
    // or use dynamic imports in the init() function.

    Alpine.data('discoveryPortal', () => ({
        loading: true,
        dataSource: 'Checking...',
        provinces: [],
        cityHubs: [],
        categories: ['Attractions', 'Food tours', 'Adventure', 'Culture', 'Outdoor', 'History'],
        tours: [],

        async init() {
            const city = document.querySelector('meta[name="city"]')?.getAttribute('content') || 'Toronto';
            
            // Wait for Supabase handshake
            if (window.ToursNorth) {
                await window.ToursNorth.ready;
            } else {
                console.warn('[Discovery] ToursNorth not found. Waiting 500ms...');
                await new Promise(r => setTimeout(r, 500));
            }

            console.log(`[Discovery] 🌊 Portal active for ${city}. Initializing 9-Layer data flow...`);

            try {
                // Dynamically import API to maintain module benefits without the race condition
                const { 
                    getCityInventory, 
                    getProvinces, 
                    getCityHubs 
                } = await import('/assets/js/tours-north-api.js');

                const [p, h, t] = await Promise.all([
                    getProvinces(13),
                    getCityHubs(12),
                    getCityInventory(city)
                ]);

                this.provinces = p;
                this.cityHubs  = h;
                this.tours     = t;

                if (this.tours.length > 0) {
                    this.dataSource = 'Supabase';
                    console.log(`[Discovery] ✅ SQL active — ${this.tours.length} tours found.`);
                } else {
                    console.warn('[Discovery] ⚠️ SQL returned 0 items. Triggering JSON fallback.');
                    await this._fallback(city);
                }
            } catch (err) {
                console.error('[Discovery] ❌ Handshake Failure:', err);
                await this._fallback(city);
            } finally {
                this.loading = false;
            }
        },

        async _fallback(city) {
            try {
                const res = await fetch('/assets/data/tours.json');
                const all = await res.json();
                const filtered = all.filter(t => 
                    (t.city || t.content?.city || '').toLowerCase() === city.toLowerCase()
                );
                this.tours = filtered.map(t => this._normalize(t));
                this.dataSource = 'Local JSON';
            } catch (e) {
                console.error('[Discovery] 🚨 Absolute failure. Using emergency cards.');
                this.tours = this._emergencyCards();
                this.dataSource = 'Emergency';
            }
        },

        _normalize(t) {
            return {
                id:        t.id,
                title:     t.content?.name  || t.title     || t.name     || 'Untitled Tour',
                price:     t.content?.price  || t.price     || 0,
                rating:    t.content?.rating || t.rating    || 5.0,
                image_url: t.content?.image  || t.image_url || t.image    || '',
                persona:   (t.l7_persona?.[0]) || 'Traveler',
                category:  t.l2_category    || t.category  || 'Experience'
            };
        },

        _emergencyCards() {
            return [
                { id: 'E1', title: 'Manual Verification Required', price: 0, rating: 5.0, image_url: '', persona: 'Architect', category: 'System' }
            ];
        },

        getHash(id) {
            if (!id) return '00000000';
            let hash = 0x811c9dc5;
            for (let i = 0; i < id.length; i++) {
                hash ^= id.charCodeAt(i);
                hash = Math.imul(hash, 0x01000193) >>> 0;
            }
            return hash.toString(16).toUpperCase().padStart(8, '0');
        }
    }));
});
