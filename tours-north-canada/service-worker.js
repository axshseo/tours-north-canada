/**
 * Tours North · Service Worker v2.0
 * ─────────────────────────────────────────────────────────────────────────────
 * Strategies:
 *  - Core shell (HTML, CSS, local JS): Cache-First
 *  - Tour data (JSON / Supabase API):  Network-First, fallback to cache
 *  - Images:                           Stale-While-Revalidate
 *  - External CDN (Tailwind, Alpine):  Network-Only (can't be cached reliably)
 *
 * v2 changes:
 *  - Removed un-cacheable external CDN URLs (TD-07 fix)
 *  - Added stale-while-revalidate for /assets/data/tours.json
 *  - Bumped cache version → 'tours-north-v2'
 *  - Added offline fallback page (/offline.html)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const CACHE_VERSION  = 'tours-north-v2';
const STATIC_CACHE   = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE  = `${CACHE_VERSION}-dynamic`;
const IMAGE_CACHE    = `${CACHE_VERSION}-images`;

// Core shell: files that must load for the app to function at all
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/offline.html',
    '/manifest.json',
    '/assets/js/supabase-config.js',
    '/assets/js/tours-north-api.js',
    '/assets/js/tour-renderer.js',
    '/assets/js/search.js',
    '/assets/js/slug-engine.js',
    '/assets/js/main.js',
    '/assets/data/tours.json',
    '/destinations/toronto.html',
    '/destinations/vancouver.html',
    '/destinations/banff.html'
];

// ─── INSTALL: Pre-cache static shell ─────────────────────────────────────────

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            console.log('[SW] Pre-caching static shell...');
            // Use individual adds to prevent one failure from blocking all
            return Promise.allSettled(
                STATIC_ASSETS.map(url => cache.add(url).catch(err =>
                    console.warn(`[SW] Could not cache ${url}:`, err.message)
                ))
            );
        }).then(() => self.skipWaiting())
    );
});

// ─── ACTIVATE: Clean up old caches ───────────────────────────────────────────

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter(key => ![STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE].includes(key))
                    .map(key => {
                        console.log('[SW] Deleting stale cache:', key);
                        return caches.delete(key);
                    })
            )
        ).then(() => self.clients.claim())
    );
});

// ─── FETCH: Strategy router ───────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET and cross-origin requests (Supabase API, CDN)
    if (request.method !== 'GET') return;
    if (url.origin !== self.location.origin) return;

    // Route by asset type
    if (_isStaticAsset(url)) {
        event.respondWith(_cacheFirst(request, STATIC_CACHE));
    } else if (_isTourData(url)) {
        event.respondWith(_networkFirst(request, DYNAMIC_CACHE));
    } else if (_isImage(url)) {
        event.respondWith(_staleWhileRevalidate(request, IMAGE_CACHE));
    } else {
        event.respondWith(_networkFirst(request, DYNAMIC_CACHE));
    }
});

// ─── Strategies ───────────────────────────────────────────────────────────────

async function _cacheFirst(request, cacheName) {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        return caches.match('/offline.html');
    }
}

async function _networkFirst(request, cacheName) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        const cached = await caches.match(request);
        return cached || caches.match('/offline.html');
    }
}

async function _staleWhileRevalidate(request, cacheName) {
    const cache  = await caches.open(cacheName);
    const cached = await cache.match(request);

    const fetchPromise = fetch(request).then(response => {
        if (response.ok) cache.put(request, response.clone());
        return response;
    }).catch(() => null);

    return cached || fetchPromise;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function _isStaticAsset(url) {
    return url.pathname.match(/\.(js|css|html|json|woff2?)$/i) &&
           !url.pathname.includes('/assets/data/');  // data is dynamic
}

function _isTourData(url) {
    return url.pathname.startsWith('/assets/data/');
}

function _isImage(url) {
    return url.pathname.match(/\.(png|jpg|jpeg|webp|svg|gif|avif)$/i);
}
