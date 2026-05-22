/**
 * Tours North · Taxonomic Hydrator v5.0
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches ONE tour (by slug from URL) and injects all 9-layer metadata
 * into the page via [data-field] attributes.
 *
 * Breaking changes from v4:
 *  - No longer fetches ALL experiences. Uses getTourBySlug() (STREAM C).
 *  - No longer silently falls back to tours[0]. Shows an error state.
 *  - Uses slug-engine.js for Schema.org, canonical URL, AEO body attrs.
 *  - Removes the btoa() fake hash. Uses FNV-1a from slug-engine.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { getTourBySlug } from './tours-north-api.js';
import { injectCanonicalTag, injectDataLayers, injectSchemaOrg, fnv32a, generateSlug } from './slug-engine.js';

const TaxonomicHydrator = {

    async init() {
        // Wait for Supabase singleton before any fetch
        await window.ToursNorth.ready;

        const slug = this._extractSlugFromUrl();
        console.log(`[Hydrator] Attempting to match slug: "${slug}"`);

        this.currentTour = await getTourBySlug(slug);

        if (this.currentTour) {
            console.log(`[Hydrator] ✅ Match found: ${this.currentTour.id || this.currentTour.slug}`);
            this.hydrate();
            this.processContextualLogic();
            this.processSmartBundling();
        } else {
            console.error('[Hydrator] ❌ No tour matched slug:', slug);
            this._renderErrorState();
        }
    },

    /**
     * Derives an identifiable slug from the current page URL.
     * Tries: (1) explicit ?slug= param, (2) full path segment matching,
     * (3) filename-only match for legacy HTML file naming.
     */
    _extractSlugFromUrl() {
        const params   = new URLSearchParams(window.location.search);
        const paramSlug = params.get('slug');
        if (paramSlug) return paramSlug;

        // Strip /index.html, .html extension, trailing slash
        const cleanPath = window.location.pathname
            .replace(/\/index\.html?$/, '')
            .replace(/\.html?$/, '')
            .replace(/\/$/, '');

        // Try full canonical path first (canada/ontario/toronto/...)
        if (cleanPath.includes('/tours/')) {
            return cleanPath.split('/tours/')[1] || cleanPath;
        }

        // Fallback: just the filename segment
        return cleanPath.split('/').pop();
    },

    /**
     * Traverses the 9-layer structure to resolve [data-field] attribute values.
     * Supports dot-notation paths AND named aliases for all L1-L9 fields.
     */
    _getValueByPath(obj, path) {
        // Alias map: HTML data-field → JS property path
        const ALIASES = {
            'name':          'content.name',
            'title':         'content.name',
            'price':         'content.price',
            'image':         'content.image',
            'image_url':     'content.image',
            'rating':        'content.rating',
            'description':   'content.description',
            'usp':           'content.usp',
            'city':          'content.city',
            'intent':        'l1_intent',
            'category':      'l2_category',
            'sub_category':  'l3_sub_category',
            'type':          'l4_functional.primary_type',
            'vibe':          'l5_marketing_vibe',
            'persona':       'l7_persona',
            'seasonality':   'l8_contextual.seasonality',
            'weather':       'l8_contextual.weather_dependency',
            'duration':      'l8_contextual.time_commitment',
            'price_tier':    'l8_contextual.price_tier',
            'slug':          'slug',
            'canonical':     'canonical_path'
        };

        const resolved = ALIASES[path] || path;
        return resolved.split('.').reduce((acc, key) => (acc != null ? acc[key] : null), obj);
    },

    hydrate() {
        // 1. Inject meta tags and structured data
        injectCanonicalTag(this.currentTour);
        injectDataLayers(this.currentTour);
        injectSchemaOrg(this.currentTour);

        // 2. Update page title and meta description
        this._updatePageMeta();

        // 3. Hydrate all [data-field] elements
        const targets = document.querySelectorAll('[data-field]');
        targets.forEach(el => {
            const field = el.getAttribute('data-field');
            const value = this._getValueByPath(this.currentTour, field);

            if (value == null) return; // Leave placeholder text, don't blank the element

            if (el.tagName === 'IMG') {
                el.src = value;
                el.alt = (this.currentTour.content?.name || '');
            } else if (el.tagName === 'META') {
                el.setAttribute('content', String(value));
            } else if (el.tagName === 'A' && el.hasAttribute('href')) {
                el.href = value;
            } else if (el.classList.contains('persona-tags')) {
                this._renderPersonaTags(el, value);
            } else if (el.classList.contains('collection-badge')) {
                this._renderCollectionBadge(el);
            } else if (el.classList.contains('context-icons')) {
                this._renderContextIcons(el);
            } else if (el.classList.contains('family-safety-check')) {
                this._renderFamilySafety(el);
            } else if (el.classList.contains('hash-display')) {
                el.textContent = fnv32a(this.currentTour.id || this.currentTour.slug || 'unknown');
            } else {
                el.textContent = Array.isArray(value) ? value.join(', ') : String(value);
            }
        });
    },

    _updatePageMeta() {
        const name = this.currentTour.content?.name || this.currentTour.name || '';
        const desc = this.currentTour.content?.description || this.currentTour.description || '';
        const city = this.currentTour.content?.city || this.currentTour.city || 'Canada';

        if (name) document.title = `${name} | Tours North — ${city}`;

        // Meta description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.name = 'description';
            document.head.appendChild(metaDesc);
        }
        if (desc) metaDesc.setAttribute('content', desc.substring(0, 160));

        // Open Graph
        this._setOGTag('og:title',       name);
        this._setOGTag('og:description', desc.substring(0, 160));
        this._setOGTag('og:image',       this.currentTour.content?.image || this.currentTour.image || '');
        this._setOGTag('og:type',        'website');
        this._setOGTag('og:locale',      'en_CA');
    },

    _setOGTag(property, content) {
        if (!content) return;
        let tag = document.querySelector(`meta[property="${property}"]`);
        if (!tag) {
            tag = document.createElement('meta');
            tag.setAttribute('property', property);
            document.head.appendChild(tag);
        }
        tag.setAttribute('content', content);
    },

    processContextualLogic() {
        const ctx = this.currentTour.l8_contextual || {};

        // Show/hide weather-sensitive notice
        const weatherEl = document.querySelector('[data-weather-gate]');
        if (weatherEl) {
            const isWeatherSensitive = ctx.weather_dependency === 'High';
            weatherEl.style.display = isWeatherSensitive ? 'block' : 'none';
        }

        // Seasonal availability badge
        const seasonBadge = document.querySelector('[data-season-badge]');
        if (seasonBadge && ctx.seasonality) {
            const isAllYear = ctx.seasonality.toLowerCase().includes('all');
            seasonBadge.textContent = isAllYear ? '🗓 Available Year-Round' : `🗓 Season: ${ctx.seasonality}`;
            seasonBadge.className += isAllYear ? ' badge-green' : ' badge-amber';
        }
    },

    processSmartBundling() {
        const bundle = this.currentTour.l9_bundle_logic || {};
        const crossSellContainer = document.querySelector('[data-cross-sell]');

        if (!crossSellContainer || !bundle.cross_sell_ids?.length) return;

        // Render cross-sell IDs as placeholder cards (hydrated async)
        bundle.cross_sell_ids.slice(0, 3).forEach(async (id) => {
            const { getTourBySlug } = await import('./tours-north-api.js');
            const related = await getTourBySlug(id);
            if (!related) return;

            const card = document.createElement('a');
            card.href = `/${generateSlug(related)}.html`;
            card.className = 'cross-sell-card flex items-center gap-3 p-3 bg-slate-50 rounded-2xl hover:bg-primary hover:text-white transition group';
            card.innerHTML = `
                <img src="${related.content?.image || related.image || ''}" 
                     alt="${related.content?.name || related.name}" 
                     class="w-14 h-14 rounded-xl object-cover flex-shrink-0">
                <div>
                    <p class="text-xs font-black uppercase leading-tight group-hover:text-white">${related.content?.name || related.name}</p>
                    <p class="text-[10px] text-slate-400 group-hover:text-white/70">From $${related.content?.price || related.price} CAD</p>
                </div>`;
            crossSellContainer.appendChild(card);
        });
    },

    _renderPersonaTags(container, personas) {
        if (!Array.isArray(personas)) return;
        container.innerHTML = personas.map(p =>
            `<span class="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/10">${p}</span>`
        ).join('');
    },

    _renderCollectionBadge(container) {
        const collections = this.currentTour.collections || [this.currentTour.l6_sub_collection].filter(Boolean);
        if (!collections.length) return;
        container.innerHTML = `
            <span class="px-4 py-2 bg-accent text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-lg shadow-xl">
                ${collections[0]}
            </span>`;
    },

    _renderContextIcons(container) {
        const tags = this.currentTour.context_tags || [];
        if (!tags.length) return;
        container.innerHTML = tags.map(tag => `
            <div class="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-slate-600">
                <i class="${tag.icon_class || 'fa-solid fa-tag'} text-[10px]"></i>
                <span class="text-[9px] font-bold uppercase tracking-widest">${tag.name}</span>
            </div>`).join('');
    },

    _renderFamilySafety(container) {
        const personas = this.currentTour.l7_persona || [];
        if (personas.some(p => p.toLowerCase().includes('famil'))) {
            container.style.display = 'block';
            container.innerHTML = `
                <div class="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800">
                    <i class="fa-solid fa-circle-check text-xl"></i>
                    <div>
                        <p class="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Family-Approved</p>
                        <p class="text-xs font-semibold">Verified safety protocols. Stroller-friendly.</p>
                    </div>
                </div>`;
        } else {
            container.style.display = 'none';
        }
    },

    _renderErrorState() {
        const main = document.querySelector('main') || document.body;
        const errorBanner = document.createElement('div');
        errorBanner.className = 'fixed top-0 left-0 w-full bg-amber-500 text-white text-center text-xs font-black py-2 z-[9999] uppercase tracking-widest';
        errorBanner.textContent = '⚠ Tour data not found — check slug mapping or inventory sync';
        document.body.prepend(errorBanner);
        console.error('[Hydrator] Slug not matched. Ensure vw_master_inventory has been created and supabase_fix.sql has been run.');
    }
};

// Boot after DOM is ready, after Supabase is initialized
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => TaxonomicHydrator.init());
} else {
    TaxonomicHydrator.init();
}
