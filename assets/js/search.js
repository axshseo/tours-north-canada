// Tours North Fuzzy Search Engine
// Provides real-time search suggestions for Toronto attractions

(function() {
    'use strict';

    // Array of 30 Toronto attractions with search data
    const torontoAttractions = [
        { name: 'Art Gallery of Ontario (AGO)', price: '$45', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=300&h=200', url: 'tours/toronto-art-gallery-ago.html' },
        { name: 'Hockey Hall of Fame', price: '$35', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=300&h=200', url: 'tours/toronto-hockey-hall-of-fame.html' },
        { name: 'Casa Loma Castle', price: '$30', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=300&h=200', url: 'tours/toronto-casa-loma-castle.html' },
        { name: 'CN Tower EdgeWalk', price: '$195', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=300&h=200', url: 'tours/toronto-cn-tower-edgewalk.html' },
        { name: 'Ripley\'s Aquarium', price: '$40', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=300&h=200', url: 'tours/toronto-ripleys-aquarium.html' },
        { name: 'Royal Ontario Museum (ROM)', price: '$25', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=300&h=200', url: 'tours/toronto-rom-museum.html' },
        { name: 'City Hall Sign', price: '$15', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=300&h=200', url: 'tours/toronto-sign-city-hall.html' },
        { name: 'Toronto Islands Ferry', price: '$8', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=300&h=200', url: '#' },
        { name: 'Distillery District Walking Tour', price: '$20', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=300&h=200', url: '#' },
        { name: 'High Park Nature Walk', price: '$0', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=300&h=200', url: '#' },
        { name: 'Kensington Market Food Tour', price: '$50', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=300&h=200', url: '#' },
        { name: 'St. Lawrence Market', price: '$0', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=300&h=200', url: '#' },
        { name: 'Graffiti Alley Street Art', price: '$0', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=300&h=200', url: '#' },
        { name: 'Toronto Islands Bike Rental', price: '$12', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=300&h=200', url: '#' },
        { name: 'Leslieville Neighborhood Tour', price: '$25', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=300&h=200', url: '#' },
        { name: 'Trinity Bellwoods Park', price: '$0', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=300&h=200', url: '#' },
        { name: 'Queen Street West Shopping', price: '$0', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=300&h=200', url: '#' },
        { name: 'The Beaches Boardwalk', price: '$0', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=300&h=200', url: '#' },
        { name: 'Evergreen Brick Works', price: '$15', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=300&h=200', url: '#' },
        { name: 'Bluffers Park & Quarry', price: '$0', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=300&h=200', url: '#' },
        { name: 'Toronto Islands Centreville', price: '$0', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=300&h=200', url: '#' },
        { name: 'The Junction Neighborhood', price: '$0', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=300&h=200', url: '#' },
        { name: 'Roncesvalles Village', price: '$0', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=300&h=200', url: '#' },
        { name: 'Cabbagetown Historic District', price: '$0', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=300&h=200', url: '#' },
        { name: 'The Danforth (Greektown)', price: '$0', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=300&h=200', url: '#' },
        { name: 'Yorkville Fashion District', price: '$0', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=300&h=200', url: '#' },
        { name: 'Financial District Architecture', price: '$0', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=300&h=200', url: '#' },
        { name: 'Harbourfront Centre', price: '$0', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=300&h=200', url: '#' },
        { name: 'Don Valley Trails', price: '$0', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=300&h=200', url: '#' },
        { name: 'Tommy Thompson Park', price: '$0', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=300&h=200', url: '#' }
    ];

    let searchTimeout;
    let currentModal = null;

    // Initialize search functionality
    function initSearch() {
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

    // Perform fuzzy search
    function performSearch(query) {
        const results = torontoAttractions.filter(attraction => {
            const name = attraction.name.toLowerCase();
            const searchQuery = query.toLowerCase();

            // Exact match gets highest priority
            if (name.includes(searchQuery)) return true;

            // Fuzzy match - check if all words in query are in the name
            const queryWords = searchQuery.split(' ');
            return queryWords.every(word => name.includes(word));
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
            modalContent += `
                <a href="${result.url}" class="flex items-center p-4 hover:bg-gray-50 border-b border-gray-50 transition-colors group">
                    <img src="${result.image}" alt="${result.name}" class="w-16 h-12 object-cover rounded-lg mr-4">
                    <div class="flex-1">
                        <h4 class="font-semibold text-[#064e3b] group-hover:text-[#b91c1c] transition-colors">${result.name}</h4>
                        <p class="text-sm text-gray-600">From ${result.price} CAD</p>
                    </div>
                    <svg class="w-5 h-5 text-gray-400 group-hover:text-[#b91c1c] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </a>
            `;
        });

        modalContent += `
            </div>
            <div class="p-3 bg-gray-50 text-center">
                <a href="#" class="text-sm text-[#b91c1c] hover:underline">View all Toronto tours</a>
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
