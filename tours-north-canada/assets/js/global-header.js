/**
 * Global Header 3.0 - The 9-Layer Concierge
 * Powered by Tours North Taxonomy Engine
 */

const ConciergeHeader = {
    async init() {
        this.tours = await this.fetchInventory();
        this.render();
        console.log('[Concierge] Navigation engine initialized.');
    },

    async fetchInventory() {
        // Use DBEngine if available
        if (window.DBEngine && window.DBEngine.client) {
            const { data, error } = await window.DBEngine.client
                .from('vw_experiences_by_persona')
                .select('*');
            if (!error && data) return window.DBEngine.mapToTaxonomy(data);
        }
        const res = await fetch('/assets/data/tours.json');
        return await res.json();
    },

    async getUniqueCities() {
        if (window.DBEngine && window.DBEngine.getUniqueCities) {
            return await window.DBEngine.getUniqueCities();
        }
        return [...new Set(this.tours.map(t => t.city))].sort();
    },

    async getNavData() {
        const cities = await this.getUniqueCities();
        const activeIntents = [...new Set(this.tours.map(t => t.l1_intent || t.intent))].filter(Boolean);
        const activePersonas = [...new Set(this.tours.flatMap(t => t.l7_persona || t.personalization?.personas || []))].filter(Boolean);
        
        return {
            cities,
            intents: activeIntents.sort(),
            personas: activePersonas.sort()
        };
    },

    async render() {
        let headerEl = document.getElementById('global-header');
        if (!headerEl) {
            headerEl = document.createElement('div');
            headerEl.id = 'global-header';
            document.body.prepend(headerEl);
        }

        const navData = await this.getNavData();

        const navHTML = `
            <div x-data="{ 
                megaMenu: null, 
                mobileOpen: false, 
                currentPersona: null,
                searchQuery: '',
                intents: ${JSON.stringify(navData.intents)},
                personas: ${JSON.stringify(navData.personas)},
                cities: ${JSON.stringify(navData.cities)},
                tours: ${JSON.stringify(this.tours)},
                selectedLang: localStorage.getItem('tn_lang') || 'EN',
                selectedCurrency: localStorage.getItem('tn_currency') || 'CAD',
                init() {
                    console.log('[Concierge] Alpine initialized with live inventory.');
                },
                setLang(lang) {
                    this.selectedLang = lang;
                    localStorage.setItem('tn_lang', lang);
                },
                setCurrency(curr) {
                    this.selectedCurrency = curr;
                    localStorage.setItem('tn_currency', curr);
                }
            }" class="relative z-[100] w-full bg-white font-inter">
                
                <!-- 1. Utility concierge bar -->
                <div class="bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] py-2.5">
                    <div class="max-w-7xl mx-auto px-6 flex justify-between items-center">
                        <div class="flex items-center gap-6">
                            <span class="flex items-center gap-2">
                                <span class="w-1.5 h-1.5 bg-[#a3e635] rounded-full animate-pulse"></span>
                                Live availability in <span x-text="cities.length"></span> Cities
                            </span>
                            <span class="hidden md:inline text-white/40">|</span>
                            <span class="hidden md:inline">24/7 Adventure Support</span>
                        </div>
                        <div class="flex items-center gap-4">
                            <button @click="setLang(selectedLang === 'EN' ? 'FR' : 'EN')" class="hover:text-[#a3e635] transition" x-text="selectedLang"></button>
                            <span class="text-white/40">|</span>
                            <button @click="setCurrency(selectedCurrency === 'CAD' ? 'USD' : 'CAD')" class="hover:text-[#a3e635] transition" x-text="selectedCurrency"></button>
                        </div>
                    </div>
                </div>

                <!-- 2. Main Discovery Header -->
                <header class="border-b border-slate-100 bg-white/95 backdrop-blur-md sticky top-0">
                    <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                        <!-- Branding -->
                        <a href="/" class="flex items-center gap-3 group">
                            <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg group-hover:bg-accent transition-colors">
                                <i class="fa-solid fa-moose text-lg"></i>
                            </div>
                            <span class="text-2xl font-black font-syne tracking-tighter text-slate-900">TOURS<span class="text-primary italic">NORTH.</span></span>
                        </a>

                        <!-- Intent-Driven Nav (Layer 1) -->
                        <nav class="hidden lg:flex items-center gap-2">
                            <template x-for="intent in intents" :key="intent">
                                <button @mouseenter="megaMenu = intent"
                                    class="px-4 py-2 rounded-full text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-all flex items-center gap-2"
                                    :class="megaMenu === intent ? 'bg-slate-100 text-primary' : ''">
                                    <span x-text="intent"></span>
                                    <i class="fa-solid fa-chevron-down text-[8px] opacity-40"></i>
                                </button>
                            </template>
                        </nav>

                        <!-- Persona-Based 'Concierge' CTA (Layer 7) -->
                        <div class="hidden lg:flex items-center gap-4">
                            <div class="h-8 w-px bg-slate-100 mx-2"></div>
                            <button @mouseenter="megaMenu = 'concierge'" 
                                class="bg-accent text-white px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-slate-900 shadow-xl shadow-accent/20 transition-all transform hover:-translate-y-0.5">
                                Concierge Service
                            </button>
                            <!-- Destinations -->
                            <div class="relative">
                                <button @mouseenter="megaMenu = 'destinations'" class="flex items-center gap-1 hover:text-primary transition font-bold">
                                    Destinations
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                                </button>
                                <div x-show="megaMenu === 'destinations'" @mouseleave="megaMenu = null" 
                                     x-transition:enter="transition ease-out duration-200"
                                     x-transition:enter-start="opacity-0 translate-y-2"
                                     x-transition:enter-end="opacity-100 translate-y-0"
                                     class="absolute top-full right-0 w-[600px] bg-white shadow-2xl rounded-xl border border-gray-100 p-8 grid grid-cols-3 gap-8 mt-4">
                                    <template x-for="cityName in cities" :key="cityName">
                                        <div>
                                            <a :href="'/destinations/' + cityName.toLowerCase().replace(/ /g, '-') + '.html'" 
                                               class="block group px-3 py-2 rounded-lg hover:bg-red-50 transition">
                                                <span class="block font-black text-xs uppercase tracking-widest text-gray-400 group-hover:text-primary transition" x-text="cityName"></span>
                                                <span class="block text-[10px] text-gray-500 mt-1">Explore Hub &rarr;</span>
                                            </a>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>

                        <!-- Mobile Toggle -->
                        <button @click="mobileOpen = !mobileOpen" class="lg:hidden text-2xl text-slate-900">
                           <i x-show="!mobileOpen" class="fa-solid fa-bars"></i>
                           <i x-show="mobileOpen" class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </header>

                <!-- 3. Dynamic Mega Menus -->
                <div x-show="megaMenu" 
                     x-transition:enter="transition ease-out duration-200"
                     x-transition:enter-start="opacity-0 -translate-y-2"
                     x-transition:enter-end="opacity-100 translate-y-0"
                     @mouseleave="megaMenu = null"
                     class="absolute top-full left-0 w-full bg-white shadow-2xl border-t border-slate-100 py-12 px-6 overflow-hidden">
                    <div class="max-w-7xl mx-auto">
                        
                        <!-- Persona Concierge Mode (Layer 7) -->
                        <div x-show="megaMenu === 'concierge'" class="grid grid-cols-1 md:grid-cols-4 gap-12">
                            <div class="col-span-1 border-r border-slate-50 pr-8">
                                <h3 class="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Whom are we planning for?</h3>
                                <div class="space-y-2">
                                    <template x-for="p in personas" :key="p">
                                        <button @mouseenter="currentPersona = p"
                                            class="w-full text-left px-5 py-3 rounded-2xl font-bold transition-all flex items-center justify-between group"
                                            :class="currentPersona === p ? 'bg-primary text-white shadow-lg' : 'hover:bg-slate-50 text-slate-600'">
                                            <span x-text="p"></span>
                                            <i class="fa-solid fa-arrow-right text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"></i>
                                        </button>
                                    </template>
                                </div>
                            </div>

                            <div class="col-span-3">
                                <div x-show="!currentPersona" class="h-full flex flex-col items-center justify-center text-center py-20 opacity-40">
                                    <i class="fa-solid fa-wand-magic-sparkles text-5xl mb-4 text-slate-300"></i>
                                    <p class="font-bold text-slate-500">Pick a persona to see our curated recommendations.</p>
                                </div>
                                <div x-show="currentPersona" class="animate-fade-in">
                                    <div class="flex justify-between items-center mb-8">
                                        <h4 class="text-2xl font-black font-syne text-primary">Handpicked for <span class="italic underline decoration-accent" x-text="currentPersona"></span></h4>
                                        <a href="/concierge/" class="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-accent transition">View All Matches →</a>
                                    </div>
                                    <div class="grid grid-cols-3 gap-6">
                                        <template x-for="tour in tours.filter(t => (t.l7_persona || t.personalization?.personas || []).includes(currentPersona)).slice(0, 3)">
                                            <a :href="'/' + (tour.url || tour.id + '.html')" class="group block bg-slate-50 rounded-[2rem] p-4 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all border border-transparent hover:border-slate-100">
                                                <img :src="tour.content?.image || tour.image" class="w-full h-40 object-cover rounded-[1.5rem] mb-4">
                                                <h5 class="font-bold text-slate-900 group-hover:text-primary transition" x-text="tour.content?.name || tour.name"></h5>
                                                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1" x-text="tour.city || tour.l8_contextual?.city || 'Canada'"></p>
                                            </a>
                                        </template>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Standard Intent Menus (Layer 1) -->
                        <template x-for="intent in intents" :key="intent">
                            <div x-show="megaMenu === intent" class="grid grid-cols-4 gap-8">
                                <div class="col-span-1">
                                    <h3 class="text-3xl font-black font-syne text-primary mb-4" x-text="intent"></h3>
                                    <p class="text-sm text-slate-500 leading-relaxed mb-6">Expertly curated experiences focusing on the <span class="italic font-bold" x-text="intent"></span> intent.</p>
                                    <button class="bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-full hover:bg-primary hover:text-white transition">Explore Category</button>
                                </div>
                                <div class="col-span-3 grid grid-cols-3 gap-6">
                                     <template x-for="tour in tours.filter(t => (t.l1_intent || t.intent) === intent).slice(0, 3)">
                                        <a :href="'/' + (tour.url || tour.id + '.html')" class="group flex gap-4 p-4 hover:bg-slate-50 rounded-3xl transition">
                                            <div class="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
                                                <img :src="tour.content?.image || tour.image" class="w-full h-full object-cover group-hover:scale-110 transition-duration-500">
                                            </div>
                                            <div>
                                                <h5 class="font-bold text-slate-800 group-hover:text-primary" x-text="tour.content?.name || tour.name"></h5>
                                                <p class="text-xs text-slate-400 mt-1" x-text="tour.city || 'Canada'"></p>
                                                <p class="text-accent font-black text-sm mt-1" x-text="'$' + (tour.content?.price || tour.revenue?.base_price || tour.price)"></p>
                                            </div>
                                        </a>
                                    </template>
                                </div>
                            </div>
                        </template>

                    </div>
                </div>

                <!-- 4. Mobile Menu -->
                <div x-show="mobileOpen" class="lg:hidden bg-white border-t border-slate-100 p-6">
                    <div class="space-y-4">
                        <template x-for="intent in intents" :key="intent">
                            <a :href="'/intent/' + intent.toLowerCase()" class="block text-lg font-bold text-slate-900" x-text="intent"></a>
                        </template>
                    </div>
                </div>
            </div>
        `;

        headerEl.innerHTML = navHTML;
    }
};

ConciergeHeader.init();
