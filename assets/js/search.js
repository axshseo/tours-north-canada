// Tours North Data-Driven Search Engine
// Fetches tour data from tours.json and provides real-time search suggestions

(function() {
    'use strict';

    let toursData = [];
    let searchTimeout;
    let currentModal = null;

    // Load tours data from JSON file
    async function loadToursData() {
        try {
            const response = await fetch('assets/data/tours.json');
            if (!response.ok) {
                throw new Error('Failed to load tours data');
            }
            toursData = await response.json();
            console.log('Loaded', toursData.length, 'tours from data file');
        } catch (error) {
            console.error('Error loading tours data:', error);
            // Fallback to empty array if data fails to load
            toursData = [];
        }
    }

    // Initialize search functionality
    async function initSearch() {
        // Load data first
        await loadToursData();

        const searchInput = document.querySelector('input[placeholder*="Destination"], input[placeholder*="Search"]');
        if (!searchInput) return;

        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.trim();
            clearTimeout(searchTimeout);

            if (query.length < 2) {
                hideSearchModal();
                return;
            }

            searchTimeout = setTimeout(() => {
                performSearch(query);
            }, 300);
        });

        // Hide modal when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.search-modal') && !e.target.closest('input')) {
                hideSearchModal();
            }
        });
    }

    // Perform fuzzy search across all tours
    function performSearch(query) {
        if (!toursData.length) {
            hideSearchModal();
            return;
        }

        const results = toursData.filter(tour => {
            const name = tour.name.toLowerCase();
            const city = tour.city.toLowerCase();
            const searchQuery = query.toLowerCase();

            // Exact match gets highest priority
            if (name.includes(searchQuery) || city.includes(searchQuery)) return true;

            // Fuzzy match - check if all words in query are in the name or city
            const queryWords = searchQuery.split(' ');
            return queryWords.every(word => name.includes(word) || city.includes(word));
        }).slice(0, 6); // Limit to 6 results

        if (results.length > 0) {
            showSearchModal(results, query);
        } else {
            hideSearchModal();
        }
    }

    // Show floating search results modal
    function showSearchModal(results, query) {
        hideSearchModal(); // Remove existing modal

        const searchInput = document.querySelector('input[placeholder*="Destination"], input[placeholder*="Search"]');
        if (!searchInput) return;

        const inputRect = searchInput.getBoundingClientRect();

        const modal = document.createElement('div');
        modal.className = 'search-modal fixed z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden';
        modal.style.top = (inputRect.bottom + 8) + 'px';
        modal.style.left = inputRect.left + 'px';
        modal.style.width = inputRect.width + 'px';
        modal.style.maxHeight = '400px';

        let modalContent = `
            <div class="p-4 border-b border-gray-100">
                <div class="flex items-center justify-between">
                    <span class="text-sm font-semibold text-[#064e3b]">Search Results for "${query}"</span>
                    <span class="text-xs text-gray-500">${results.length} found</span>
                </div>
            </div>
            <div class="max-h-80 overflow-y-auto">
        `;

        results.forEach(result => {
            const isTrending = result.inventory_count < 5;
            const trendingBadge = isTrending ? '<span class="ml-2 px-2 py-1 bg-[#b91c1c] text-white text-xs font-bold rounded-full">Trending</span>' : '';

            modalContent += `
                <a href="${result.affiliate_link}" target="_blank" class="flex items-center p-4 hover:bg-gray-50 border-b border-gray-50 transition-colors group">
                    <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=80&h=60" alt="${result.name}" class="w-16 h-12 object-cover rounded-lg mr-4">
                    <div class="flex-1">
                        <div class="flex items-center">
                            <h4 class="font-semibold text-[#064e3b] group-hover:text-[#b91c1c] transition-colors">${result.name}</h4>
                            ${trendingBadge}
                        </div>
                        <p class="text-sm text-gray-600">From $${result.price.toFixed(2)} CAD • ${result.city}</p>
                        <div class="flex items-center mt-1">
                            <div class="flex text-yellow-400">
                                ${'★'.repeat(Math.floor(result.rating))}${'☆'.repeat(5 - Math.floor(result.rating))}
                            </div>
                            <span class="text-xs text-gray-500 ml-1">(${result.rating})</span>
                        </div>
                    </div>
                    <svg class="w-5 h-5 text-gray-400 group-hover:text-[#b91c1c] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                </a>
            `;
        });

        modalContent += `
            </div>
            <div class="p-3 bg-gray-50 text-center">
                <a href="#" class="text-sm text-[#b91c1c] hover:underline">View all tours</a>
            </div>
        `;

        modal.innerHTML = modalContent;
        document.body.appendChild(modal);
        currentModal = modal;

        // Track search interaction
        if (typeof gtag !== 'undefined') {
            gtag('event', 'search', {
                'event_category': 'engagement',
                'event_label': query,
                'custom_parameter_1': results.length
            });
        }
    }

    // Hide search modal
    function hideSearchModal() {
        if (currentModal) {
            currentModal.remove();
            currentModal = null;
        }
    }

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', initSearch);

    // Export for potential external use
    window.ToursNorthSearch = {
        search: performSearch,
        attractions: torontoAttractions
    };

})();
