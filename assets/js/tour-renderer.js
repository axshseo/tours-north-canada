/**
 * Tour Renderer 4.0 - The Taxonomic Hydrator
 * Traverses the 9-Layer Data Schema to hydrate complex products.
 */

const TaxonomicHydrator = {
    async init() {
        this.tours = await this.fetchInventory();
        this.currentTour = this.identifyCurrentTour();
        
        if (this.currentTour) {
            console.log(`[Hydrator] Match found: ${this.currentTour.id}`);
            this.hydrate();
            this.processContextualLogic();
            this.processSmartBundling();
        } else {
            console.warn('[Hydrator] No tour matched current URL.');
        }
    },

    async fetchInventory() {
        // Prefer live DB if available and initialized
        if (window.DBEngine && window.DBEngine.client) {
            console.log('[Hydrator] Fetching inventory from live Supabase...');
            // In a real scenario, we might just fetch the specific tour
            // For now, we'll maintain the current logic of fetching "inventory"
            const { data, error } = await window.DBEngine.client
                .from('vw_experiences_by_persona')
                .select('*');
            
            if (!error && data) {
                return window.DBEngine.mapToTaxonomy(data);
            }
            console.warn('[Hydrator] Supabase fetch failed or returned no data, falling back to JSON.');
        }

        const res = await fetch('/assets/data/tours.json');
        return await res.json();
    },

    identifyCurrentTour() {
        // Path-based identification (e.g., /tours/toronto-cn-tower.html)
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        return this.tours.find(t => t.url && t.url.endsWith(filename));
    },

    /**
     * Traverses the 9-layer structure to find values for data-field attributes.
     * Supports dot notation like data-field="personalization.context.time_commitment"
     * Also handles the transition to l1_... l9_ prefixes and content block.
     */
    getValueByPath(obj, path) {
        // First try the literal path
        let val = path.split('.').reduce((prev, curr) => prev ? prev[curr] : null, obj);
        
        // If not found, try common fallbacks for the new L1-L9 schema
        if (val === null || val === undefined) {
            const mappings = {
                'name': 'content.name',
                'title': 'name',
                'price': 'content.price',
                'image': 'content.image',
                'image_url': 'image',
                'rating': 'content.rating',
                'intent': 'l1_intent',
                'category': 'l2_category',
                'sub_category': 'l3_sub_category',
                'revenue.base_price': 'content.price',
                'personalization.context.time_commitment': 'l8_contextual.time_commitment',
                'personalization.context.seasonality': 'l8_contextual.seasonality',
                'personalization.context.accessibility': 'l8_contextual.accessibility',
                'personalization.personas': 'l7_persona'
            };
            
            if (mappings[path]) {
                val = mappings[path].split('.').reduce((prev, curr) => prev ? prev[curr] : null, obj);
            }
        }
        return val;
    },

    hydrate() {
        const targets = document.querySelectorAll('[data-field]');
        targets.forEach(el => {
            const field = el.getAttribute('data-field');
            let value = this.getValueByPath(this.currentTour, field);

            if (value !== null && value !== undefined) {
                // Specialized rendering logic
                if (el.tagName === 'IMG') {
                    el.src = value;
                } else if (el.tagName === 'META') {
                    el.setAttribute('content', value);
                } else if (el.classList.contains('persona-tags')) {
                    this.renderPersonaTags(el, value);
                } else if (el.classList.contains('accessibility-list')) {
                    this.renderList(el, value);
                } else {
                    el.innerText = value;
                }
            }
        });

        // SEO Injection
        this.updateSEO();
    },

    renderPersonaTags(container, personas) {
        if (!Array.isArray(personas)) return;
        container.innerHTML = personas.map(p => 
            `<span class="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">${p}</span>`
        ).join('');
    },

    renderList(container, items) {
        if (!Array.isArray(items)) return;
        container.innerHTML = items.map(i => 
            `<li class="flex items-center gap-2 text-slate-500 text-sm"><i class="fa-solid fa-check text-accent text-[10px]"></i> ${i}</li>`
        ).join('');
    },

    /**
     * Contextual Logic (Layer 8)
     * Handles weather dependency, accessibility alerts, etc.
     */
    processContextualLogic() {
        const context = this.currentTour.l8_contextual || this.currentTour.personalization?.context;
        if (!context) return;

        // Weather Alert
        const weatherEl = document.getElementById('contextual-weather-alert');
        if (weatherEl) {
            const isHighVulnerability = context.weather_dependency === 'High';
            weatherEl.style.display = isHighVulnerability ? 'flex' : 'none';
            weatherEl.innerHTML = `
                <div class="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-4 text-amber-800">
                    <i class="fa-solid fa-cloud-sun-rain text-xl"></i>
                    <div>
                        <p class="text-xs font-black uppercase tracking-widest mb-1">Weather Context</p>
                        <p class="text-sm font-medium">This experience is sensitive to weather conditions. We offer a 100% dry-day guarantee.</p>
                    </div>
                </div>
            `;
        }
    },

    /**
     * Smart Bundling (Layer 9)
     * Renders 'Complete the Set' upsell component
     */
    processSmartBundling() {
        const bundles = this.currentTour.l9_bundle_logic?.eligible_bundles || this.currentTour.revenue?.bundle_eligible;
        if (!bundles || bundles.length === 0) return;

        const bundleContainer = document.getElementById('smart-bundle-upsell');
        if (!bundleContainer) return;

        // Find matches in the same bundle
        const matches = this.tours.filter(t => 
            t.id !== this.currentTour.id && 
            (
                (t.l9_bundle_logic?.eligible_bundles?.some(b => bundles.includes(b))) ||
                (t.revenue?.bundle_eligible?.some(b => bundles.includes(b)))
            )
        ).slice(0, 2);

        if (matches.length > 0) {
            bundleContainer.innerHTML = `
                <div class="mt-12 p-8 bg-slate-50 rounded-[3rem] border border-slate-100">
                    <h4 class="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 text-center">Complete the Set</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        ${matches.map(tour => `
                            <a href="/${tour.url || (tour.id + '.html')}" class="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm hover:shadow-xl transition group">
                                <img src="${tour.content?.image || tour.image}" class="w-16 h-16 object-cover rounded-xl">
                                <div>
                                    <p class="text-[10px] font-black uppercase text-accent tracking-widest">${tour.city || 'Adventure'}</p>
                                    <h5 class="font-bold text-slate-900 group-hover:text-primary transition">${tour.content?.name || tour.name}</h5>
                                    <p class="text-sm font-black text-primary">$${tour.content?.price || tour.revenue?.base_price || tour.price}</p>
                                </div>
                            </a>
                        `).join('')}
                    </div>
                    <div class="mt-8 text-center">
                        <p class="text-xs font-bold text-slate-500 mb-4">Add either of these to save 15% on the entire bundle.</p>
                        <button class="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-8 py-3 rounded-full hover:bg-accent transition shadow-lg">Activate Bundle Discount</button>
                    </div>
                </div>
            `;
        }
    },

    updateSEO() {
        const name = this.currentTour.content?.name || this.currentTour.name;
        const vibe = this.currentTour.l5_marketing_vibe || this.currentTour.marketing?.vibe;
        const price = this.currentTour.content?.price || this.currentTour.revenue?.base_price || this.currentTour.price;
        const types = this.currentTour.l4_functional?.sub_types || this.currentTour.functional?.sub_types;

        if (name) document.title = `${name} - Tours North`;
        
        // JSON-LD Schema
        const schema = {
            "@context": "https://schema.org",
            "@type": "TravelTour",
            "name": name,
            "description": vibe || "",
            "offers": {
                "@type": "Offer",
                "price": price,
                "priceCurrency": "CAD"
            },
            "tourType": types?.join(', ')
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(schema);
        document.head.appendChild(script);
    }
};

TaxonomicHydrator.init();
