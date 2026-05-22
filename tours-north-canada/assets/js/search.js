/**
 * Tours North · Search Engine v2.0
 * ─────────────────────────────────────────────────────────────────────────────
 * Hybrid search: instant local typeahead + Supabase GIN-weighted FTS.
 *
 * Architecture:
 *  1. LOCAL FILTER  — instant on keystroke (< 2ms, from JSON cache)
 *  2. SUPABASE FTS  — full results with GIN weight ranking (async, debounced)
 *  3. COMBINED      — local results shown immediately, replaced by FTS results on arrival
 *
 * GIN Weight Map (from supabase_fix.sql):
 *  A (1.0) = title
 *  B (0.4) = category, sub_category
 *  C (0.2) = description
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { searchExperiences } from './tours-north-api.js';

(function () {
    'use strict';

    // ─── State ───────────────────────────────────────────────────────────────
    let _localData   = [];
    let _debounceTimer = null;
    const DEBOUNCE_MS  = 280;

    // ─── Initialization ───────────────────────────────────────────────────────

    async function init() {
        await _loadLocalData();
        _bindSearchInputs();
        console.log(`[Search] ✅ Engine ready — ${_localData.length} local tours indexed.`);
    }

    async function _loadLocalData() {
        try {
            const res = await fetch('/assets/data/tours.json');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            _localData = await res.json();
        } catch (err) {
            console.warn('[Search] Local JSON load failed:', err.message);
            _localData = [];
        }
    }

    // ─── Field Normalization ──────────────────────────────────────────────────
    // Handles both old flat schema and new L1-L9 schema

    function _normalize(tour) {
        return {
            id:       tour.id,
            name:     tour.content?.name || tour.name || '',
            city:     tour.content?.city || tour.city || tour.l8_contextual?.city || '',
            category: tour.l2_category   || tour.category || '',
            url:      tour.url           || tour.slug     || '#',
            price:    tour.content?.price || tour.price   || 0,
            rating:   tour.content?.rating || tour.rating || 0,
            image:    tour.content?.image || tour.image   || '',
            intent:   tour.l1_intent     || tour.intent   || ''
        };
    }

    // ─── Local Typeahead Filter ───────────────────────────────────────────────

    function _localFilter(query) {
        const q = query.toLowerCase().trim();
        if (q.length < 2) return { locations: [], tourTypes: [], directMatches: [], hasResults: false };

        const normalized = _localData.map(_normalize);

        // 1. Location matches
        const seen = new Set();
        const locations = normalized
            .filter(t => {
                const city = t.city.toLowerCase();
                return city.includes(q) && !seen.has(city) && seen.add(city);
            })
            .slice(0, 4)
            .map(t => ({
                type: 'location',
                name: `${t.city}, Canada`,
                city: t.city,
                url:  `/destinations/${t.city.toLowerCase().replace(/\s+/g, '-')}`
            }));

        // 2. Direct tour name / intent matches (weighted: name > city > category)
        const directMatches = normalized
            .map(t => {
                let score = 0;
                if (t.name.toLowerCase().includes(q))     score += 3;
                if (t.intent.toLowerCase().includes(q))   score += 2;
                if (t.city.toLowerCase().includes(q))     score += 2;
                if (t.category.toLowerCase().includes(q)) score += 1;
                return { ...t, _score: score };
            })
            .filter(t => t._score > 0)
            .sort((a, b) => b._score - a._score)
            .slice(0, 5);

        // 3. Tour type suggestions (if exact city matched)
        const exactCity = locations.find(l => l.city.toLowerCase() === q);
        const catSeen = new Set();
        const tourTypes = exactCity
            ? normalized
                .filter(t => t.city.toLowerCase() === exactCity.city.toLowerCase() && !catSeen.has(t.category) && catSeen.add(t.category))
                .slice(0, 3)
                .map(t => ({
                    type: 'tour_type',
                    name: `${t.category} Tours in ${exactCity.city}`,
                    category: t.category,
                    url: `/destinations/${exactCity.city.toLowerCase().replace(/\s+/g, '-')}?category=${encodeURIComponent(t.category)}`
                }))
            : [];

        return {
            locations,
            tourTypes,
            directMatches,
            hasResults: locations.length > 0 || directMatches.length > 0,
            query
        };
    }

    // ─── Supabase FTS (debounced) ─────────────────────────────────────────────

    async function _ftSearch(query, onResults) {
        clearTimeout(_debounceTimer);
        _debounceTimer = setTimeout(async () => {
            try {
                await window.ToursNorth.ready;
                const results = await searchExperiences(query);
                if (results.length > 0) {
                    onResults(results.map(_normalize));
                }
            } catch (err) {
                console.warn('[Search] FTS request failed:', err.message);
            }
        }, DEBOUNCE_MS);
    }

    // ─── Public API ───────────────────────────────────────────────────────────

    /**
     * Primary search function — called by Alpine.js or any search UI
     * Returns local results immediately; updates via callback on FTS completion.
     *
     * @param {string} query
     * @param {Function} [onFTSUpdate] - Called with full FTS results when ready
     * @returns {Object} Immediate local results
     */
    window.performPredictiveSearch = function (query, onFTSUpdate = null) {
        const immediate = _localFilter(query);

        if (query.length >= 3 && onFTSUpdate) {
            _ftSearch(query, onFTSUpdate);
        }

        return immediate;
    };

    /**
     * Bind all [data-search-input] elements to the predictive search
     * Renders results into the nearest [data-search-results] container
     */
    function _bindSearchInputs() {
        document.querySelectorAll('[data-search-input]').forEach(input => {
            const container = input.closest('[data-search-wrapper]')
                ?.querySelector('[data-search-results]');
            if (!container) return;

            input.addEventListener('input', () => {
                const q = input.value.trim();
                if (q.length < 2) { container.innerHTML = ''; container.hidden = true; return; }

                const results = window.performPredictiveSearch(q, (ftsResults) => {
                    _renderResults(container, {
                        locations:     [],
                        tourTypes:     [],
                        directMatches: ftsResults,
                        hasResults:    ftsResults.length > 0,
                        query: q,
                        isFTS: true
                    });
                });

                _renderResults(container, results);
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') { container.innerHTML = ''; container.hidden = true; }
            });

            // Close on outside click
            document.addEventListener('click', (e) => {
                if (!input.contains(e.target) && !container.contains(e.target)) {
                    container.hidden = true;
                }
            });
        });
    }

    function _renderResults(container, { locations, tourTypes, directMatches, hasResults, query, isFTS = false }) {
        if (!hasResults) { container.innerHTML = ''; container.hidden = true; return; }

        let html = `<div class="search-results-inner p-2">`;

        if (isFTS) {
            html += `<p class="text-[9px] text-slate-400 font-black uppercase tracking-widest px-3 py-1 mb-1">Full Results</p>`;
        }

        if (locations.length) {
            html += `<p class="text-[9px] text-slate-400 font-black uppercase tracking-widest px-3 py-1">Destinations</p>`;
            html += locations.map(l => `
                <a href="${l.url}" class="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition group">
                    <i class="fa-solid fa-location-dot text-accent text-xs w-4"></i>
                    <span class="text-sm font-semibold text-slate-800 group-hover:text-primary">${l.name}</span>
                </a>`).join('');
        }

        if (tourTypes.length) {
            html += `<p class="text-[9px] text-slate-400 font-black uppercase tracking-widest px-3 py-1 mt-2">Explore Category</p>`;
            html += tourTypes.map(t => `
                <a href="${t.url}" class="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition group">
                    <i class="fa-solid fa-compass text-primary text-xs w-4"></i>
                    <span class="text-sm font-semibold text-slate-800 group-hover:text-primary">${t.name}</span>
                </a>`).join('');
        }

        if (directMatches.length) {
            html += `<p class="text-[9px] text-slate-400 font-black uppercase tracking-widest px-3 py-1 mt-2">Tours</p>`;
            html += directMatches.map(t => `
                <a href="${t.url}" class="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition group">
                    <img src="${t.image}" alt="${t.name}" class="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-slate-100">
                    <div class="min-w-0">
                        <p class="text-sm font-bold text-slate-800 group-hover:text-primary truncate">${t.name}</p>
                        <p class="text-[10px] text-slate-400">${t.city} · ${t.category} · From $${t.price} CAD</p>
                    </div>
                </a>`).join('');
        }

        html += `</div>`;
        container.innerHTML = html;
        container.hidden = false;
    }

    // ─── Boot ─────────────────────────────────────────────────────────────────

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
