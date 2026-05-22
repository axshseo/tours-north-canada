/**
 * Tours North · Slug Engine v1.0
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates canonical CEXS™ slugs and security hashes for all tour pages.
 *
 * Slug format: canada/{province}/{city}/{l2_category}/{tour-name}
 * Hash: FNV-1a 32-bit (consistent, collision-resistant, browser-native)
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** City → Province lookup table for slug generation */
const CITY_PROVINCE_MAP = {
    'toronto':         'ontario',
    'ottawa':          'ontario',
    'niagara-falls':   'ontario',
    'muskoka':         'ontario',
    'thousand-islands':'ontario',
    'prince-edward-county': 'ontario',
    'vancouver':       'british-columbia',
    'whistler':        'british-columbia',
    'victoria':        'british-columbia',
    'kelowna':         'british-columbia',
    'tofino':          'british-columbia',
    'banff':           'alberta',
    'calgary':         'alberta',
    'edmonton':        'alberta',
    'jasper':          'alberta',
    'lake-louise':     'alberta',
    'canmore':         'alberta',
    'drumheller':      'alberta',
    'montreal':        'quebec',
    'quebec-city':     'quebec',
    'mont-tremblant':  'quebec',
    'gaspe':           'quebec',
    'halifax':         'nova-scotia',
    'lunenburg':       'nova-scotia',
    'winnipeg':        'manitoba',
    'churchill':       'manitoba',
    'saskatoon':       'saskatchewan',
    'regina':          'saskatchewan',
    'st-johns':        'newfoundland-labrador',
    'charlottetown':   'prince-edward-island',
    'whitehorse':      'yukon',
    'yellowknife':     'northwest-territories',
    'iqaluit':         'nunavut'
};

/**
 * Sanitize a string to URL-safe slug segment
 * @param {string} str
 * @returns {string}
 */
function toSlugSegment(str) {
    return (str || '')
        .toLowerCase()
        .normalize('NFD')                          // Decompose accented chars
        .replace(/[\u0300-\u036f]/g, '')           // Strip accent marks
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');                  // Trim leading/trailing hyphens
}

/**
 * FNV-1a 32-bit hash — deterministic, collision-resistant tour fingerprint
 * Replaces the btoa() fake hash from tour-renderer.js
 * @param {string} str
 * @returns {string} 8-char uppercase hex
 */
export function fnv32a(str) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash.toString(16).toUpperCase().padStart(8, '0');
}

/**
 * Generate a canonical CEXS™ slug for a tour
 * @param {Object} tour - Full L1-L9 tour object from tours.json or vw_master_inventory
 * @returns {string} e.g. 'canada/ontario/toronto/attractions/cn-tower-edgewalk'
 */
export function generateSlug(tour) {
    // 1. If already computed in the data, trust it
    if (tour.slug && tour.slug.startsWith('canada/')) return tour.slug;
    if (tour.canonical_path && tour.canonical_path.startsWith('canada/')) return tour.canonical_path;

    // 2. Derive city segment
    const cityRaw = (tour.city || tour.content?.city || tour.l8_contextual?.city || 'canada');
    const citySlug = toSlugSegment(cityRaw);

    // 3. Derive province segment
    const provinceSlug = CITY_PROVINCE_MAP[citySlug] || 'canada';

    // 4. Derive category segment from L2
    const catSlug = toSlugSegment(tour.l2_category || tour.category || 'tours');

    // 5. Derive tour name segment
    const nameRaw = tour.content?.name || tour.name || tour.id || '';
    const nameSlug = toSlugSegment(nameRaw);

    return `canada/${provinceSlug}/${citySlug}/${catSlug}/${nameSlug}`;
}

/**
 * Generate the canonical full URL for a tour
 * @param {Object} tour
 * @param {string} [baseUrl='https://toursnorth.ca']
 * @returns {string}
 */
export function generateCanonicalUrl(tour, baseUrl = 'https://toursnorth.ca') {
    return `${baseUrl}/${generateSlug(tour)}`;
}

/**
 * Inject canonical <link> tag into <head> for the current tour
 * @param {Object} tour
 */
export function injectCanonicalTag(tour) {
    const url = generateCanonicalUrl(tour);
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
    }
    canonical.href = url;
}

/**
 * Inject CEXS™ data-layer attributes onto <body> for AEO
 * Enables structured data targeting by AI search engines
 * @param {Object} tour
 */
export function injectDataLayers(tour) {
    const body = document.body;
    body.setAttribute('data-cexs-l1',  tour.l1_intent        || '');
    body.setAttribute('data-cexs-l2',  tour.l2_category      || '');
    body.setAttribute('data-cexs-l3',  tour.l3_sub_category  || '');
    body.setAttribute('data-cexs-l4',  tour.l4_functional?.primary_type || '');
    body.setAttribute('data-cexs-l5',  tour.l5_marketing_vibe || '');
    body.setAttribute('data-cexs-l6',  tour.l6_sub_collection || '');
    body.setAttribute('data-cexs-l7',  (tour.l7_persona || []).join(','));
    body.setAttribute('data-cexs-l8-season', tour.l8_contextual?.seasonality || '');
    body.setAttribute('data-cexs-l9-bundle', tour.l9_bundle_logic?.is_bundle_parent ? 'true' : 'false');
    body.setAttribute('data-cexs-hash', fnv32a(tour.id || tour.slug || 'unknown'));
    body.setAttribute('data-cexs-city', tour.city || tour.content?.city || '');
}

/**
 * Inject complete Schema.org structured data for a tour
 * Replaces the invalid "TravelTour" type from the old tour-renderer.js
 * @param {Object} tour
 */
export function injectSchemaOrg(tour) {
    const name    = tour.content?.name || tour.name;
    const price   = tour.content?.price || tour.price || tour.revenue?.base_price;
    const image   = tour.content?.image || tour.image || tour.image_url;
    const city    = tour.content?.city || tour.city || tour.l8_contextual?.city;
    const desc    = tour.content?.description || tour.description;
    const rating  = tour.content?.rating || tour.rating;
    const type    = tour.l4_functional?.primary_type;

    // Pick the most accurate Schema.org type based on L4 functional type
    const schemaType = (type === 'Indoor' || type === 'Land')
        ? 'TouristAttraction'
        : 'Event';

    const schema = {
        '@context':    'https://schema.org',
        '@type':        schemaType,
        'name':         name,
        'description':  desc,
        'image':        image,
        'url':          generateCanonicalUrl(tour),
        'touristType':  tour.l7_persona || [],
        'availableLanguage': 'English',
        'isAccessibleForFree': false,
        'offers': {
            '@type':         'Offer',
            'price':          price,
            'priceCurrency': 'CAD',
            'availability':  'https://schema.org/InStock',
            'url':            generateCanonicalUrl(tour)
        },
        'aggregateRating': rating ? {
            '@type':       'AggregateRating',
            'ratingValue':  rating,
            'bestRating':   5,
            'worstRating':  1,
            'ratingCount':  42   // Placeholder — replace with real reviews count
        } : undefined,
        'location': {
            '@type':           'Place',
            'name':             city,
            'addressCountry':  'CA'
        },
        'keywords': [
            tour.l1_intent,
            tour.l2_category,
            tour.l3_sub_category,
            city,
            'Canada travel',
            'Canadian experiences'
        ].filter(Boolean).join(', ')
    };

    // Remove undefined keys
    Object.keys(schema).forEach(k => schema[k] === undefined && delete schema[k]);

    let existingScript = document.querySelector('script[type="application/ld+json"]');
    if (!existingScript) {
        existingScript = document.createElement('script');
        existingScript.type = 'application/ld+json';
        document.head.appendChild(existingScript);
    }
    existingScript.textContent = JSON.stringify(schema, null, 2);
}

// Expose globally for Alpine.js templates
window.ToursNorthSEO = { generateSlug, generateCanonicalUrl, fnv32a, injectDataLayers, injectSchemaOrg, injectCanonicalTag };
