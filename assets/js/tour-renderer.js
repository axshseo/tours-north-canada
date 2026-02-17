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
            
            // Check if we are on a specific tour page to do a relational join
            const isTourPage = window.location.pathname.includes('/tours/');
            let query = window.DBEngine.client.from('experiences').select(`
                *,
                experience_collections(name),
                experience_context_tags(name, icon_class)
            `);

            const { data, error } = await query;
            
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
        return this.tours.find(t => t.url && t.url.endsWith(filename)) || this.tours[0]; // Fallback to first for template testing
    },

    /**
     * Traverses the 9-layer structure to find values for data-field attributes.
     */
    getValueByPath(obj, path) {
        // First try the literal path
        let val = path.split('.').reduce((prev, curr) => prev ? prev[curr] : null, obj);
        
        // If not found, try common fallbacks for the new L1-L9 schema
        if (val === null || val === undefined) {
            const mappings = {
                'name': 'content.name',
                'title': 'content.name',
                'price': 'content.price',
                'image': 'content.image',
                'image_url': 'content.image',
                'rating': 'content.rating',
                'intent': 'l1_intent',
                'category': 'l2_category',
                'sub_category': 'l3_sub_category',
                'persona': 'l7_persona',
                'usp': 'content.usp',
                'description': 'content.description'
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
                if (el.tagName === 'IMG') {
                    el.src = value;
                } else if (el.tagName === 'META') {
                    el.setAttribute('content', value);
                } else if (el.classList.contains('persona-tags')) {
                    this.renderPersonaTags(el, value);
                } else if (el.classList.contains('collection-badge')) {
                    this.renderCollectionBadge(el);
                } else if (el.classList.contains('context-icons')) {
                    this.renderContextIcons(el);
                } else if (el.classList.contains('family-safety-check')) {
                    this.renderFamilySafety(el);
                } else {
                    el.innerText = value;
                }
            }
        });

        // SEO Injection
        this.updateSEO();
    },

    renderCollectionBadge(container) {
        const collections = this.currentTour.collections;
        if (!collections || collections.length === 0) return;
        
        container.innerHTML = `
            <span class="px-4 py-2 bg-accent text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-lg shadow-xl">
                ${collections[0]}
            </span>
        `;
    },

    renderContextIcons(container) {
        const tags = this.currentTour.context_tags;
        if (!tags || tags.length === 0) return;

        container.innerHTML = tags.map(tag => `
            <div class="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-slate-600">
                <i class="${tag.icon_class || 'fa-solid fa-tag'} text-[10px]"></i>
                <span class="text-[9px] font-bold uppercase tracking-widest">${tag.name}</span>
            </div>
        `).join('');
    },

    renderFamilySafety(container) {
        const personas = this.currentTour.l7_persona || [];
        if (personas.includes('Families')) {
            container.innerHTML = `
                <div class="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800">
                    <i class="fa-solid fa-circle-check text-xl"></i>
                    <div>
                        <p class="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Family-Approved</p>
                        <p class="text-xs font-semibold">Verified safety protocols and stroller friendly.</p>
                    </div>
                </div>
            `;
            container.style.display = 'block';
        } else {
            container.style.display = 'none';
        }
    },

    renderPersonaTags(container, personas) {
        if (!Array.isArray(personas)) return;
        container.innerHTML = personas.map(p => 
            `<span class="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">${p}</span>`
        ).join('');
    },

    updateSEO() {
        const name = this.currentTour.content?.name || this.currentTour.name;
        const collections = this.currentTour.collections || [];
        const tags = this.currentTour.context_tags?.map(t => t.name) || [];
        const price = this.currentTour.content?.price || this.currentTour.revenue?.base_price;
        
        if (name) document.title = `${name} - Tours North`;

        // Update Meta Description
        const description = this.currentTour.content?.description || this.currentTour.description || this.currentTour.content?.usp;
        if (description) {
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.name = 'description';
                document.head.appendChild(metaDesc);
            }
            metaDesc.setAttribute('content', description.substring(0, 160));
        }

        // SEO Keywords Automation
        const keywords = [...collections, ...tags, this.currentTour.l2_category].filter(Boolean);
        
        const schema = {
            "@context": "https://schema.org",
            "@type": "TravelTour",
            "name": name,
            "keywords": keywords.join(', '),
            "offers": {
                "@type": "Offer",
                "price": price,
                "priceCurrency": "CAD"
            }
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(schema);
        document.head.appendChild(script);
    }
};

TaxonomicHydrator.init();
