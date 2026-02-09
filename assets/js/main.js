// Google Analytics 4 (GA4) Tracking Code for Tours North
// Replace G-XXXXXXXXXX with your actual GA4 Measurement ID

(function() {
    // Load GA4
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
})();

// Tours North Conversion Tracking Engine
document.addEventListener('DOMContentLoaded', () => {
    // Track clicks on all "Book Now" buttons and accent-colored elements
    const bookingButtons = document.querySelectorAll('button:contains("Book"), .bg-accent, [class*="book"], button[class*="accent"]');

    bookingButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Extract tour name from closest card or button text
            const card = e.target.closest('.card, .rounded-2xl, .shadow-lg');
            const tourName = card?.querySelector('h3')?.innerText ||
                           e.target.innerText ||
                           e.target.closest('button')?.innerText ||
                           "Unknown Tour";

            // Send conversion event to GA4
            if (typeof gtag !== 'undefined') {
                gtag('event', 'conversion', {
                    'send_to': 'G-XXXXXXXXXX',
                    'value': 1.0,
                    'currency': 'CAD',
                    'custom_parameter_1': tourName
                });
            }

            // Fallback console logging for debugging
            console.log(`Conversion Event: User clicked Book Now for ${tourName}`);
        });
    });
});

// Dynamic Recently Viewed Sidebar Component
(function() {
    'use strict';

    let recentlyViewed = [];
    const STORAGE_KEY = 'toursNorth_recentlyViewed';
    const MAX_ITEMS = 3;

    // Load recently viewed tours from localStorage
    function loadRecentlyViewed() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            recentlyViewed = stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading recently viewed tours:', error);
            recentlyViewed = [];
        }
    }

    // Save recently viewed tours to localStorage
    function saveRecentlyViewed() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(recentlyViewed));
        } catch (error) {
            console.error('Error saving recently viewed tours:', error);
        }
    }

    // Add a tour to recently viewed
    function addToRecentlyViewed(tourData) {
        // Remove if already exists
        recentlyViewed = recentlyViewed.filter(tour => tour.id !== tourData.id);

        // Add to beginning
        recentlyViewed.unshift(tourData);

        // Keep only max items
        if (recentlyViewed.length > MAX_ITEMS) {
            recentlyViewed = recentlyViewed.slice(0, MAX_ITEMS);
        }

        saveRecentlyViewed();
        updateSidebar();
    }

    // Track tour views on tour pages
    function trackTourViews() {
        // Check if we're on a tour page (has tour-specific elements)
        const tourTitle = document.querySelector('h1, .tour-title');
        const tourPrice = document.querySelector('.tour-price, [class*="price"]');

        if (tourTitle && tourPrice) {
            const tourData = {
                id: window.location.pathname.split('/').pop().replace('.html', ''),
                name: tourTitle.innerText.trim(),
                price: tourPrice.innerText.trim(),
                url: window.location.pathname,
                image: document.querySelector('img')?.src || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=80&h=60',
                timestamp: Date.now()
            };

            addToRecentlyViewed(tourData);
        }
    }

    // Create and show the sidebar
    function createSidebar() {
        // Remove existing sidebar
        const existingSidebar = document.querySelector('.recently-viewed-sidebar');
        if (existingSidebar) {
            existingSidebar.remove();
        }

        if (recentlyViewed.length === 0) return;

        const sidebar = document.createElement('div');
        sidebar.className = 'recently-viewed-sidebar fixed left-4 top-1/2 transform -translate-y-1/2 z-40 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 w-64 transition-all duration-300 hover:shadow-3xl';

        let sidebarContent = `
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-bold text-[#064e3b] font-syne">Recently Viewed</h3>
                <button onclick="this.parentElement.parentElement.remove()" class="text-gray-400 hover:text-gray-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <div class="space-y-3">
        `;

        recentlyViewed.forEach(tour => {
            sidebarContent += `
                <a href="${tour.url}" class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group">
                    <img src="${tour.image}" alt="${tour.name}" class="w-12 h-12 object-cover rounded-lg">
                    <div class="flex-1 min-w-0">
                        <p class="text-xs font-semibold text-[#064e3b] group-hover:text-[#b91c1c] truncate">${tour.name}</p>
                        <p class="text-xs text-gray-600">${tour.price}</p>
                    </div>
                </a>
            `;
        });

        sidebarContent += `
            </div>
            <div class="mt-4 pt-3 border-t border-gray-200">
                <a href="index.html" class="text-xs text-[#b91c1c] hover:underline">View all tours →</a>
            </div>
        `;

        sidebar.innerHTML = sidebarContent;
        document.body.appendChild(sidebar);

        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (sidebar.parentElement) {
                sidebar.style.opacity = '0';
                setTimeout(() => sidebar.remove(), 300);
            }
        }, 10000);
    }

    // Update sidebar display
    function updateSidebar() {
        createSidebar();
    }

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', () => {
        loadRecentlyViewed();
        trackTourViews();

        // Show sidebar after a short delay
        setTimeout(() => {
            createSidebar();
        }, 2000);
    });

    // Export for potential external use
    window.ToursNorthRecentlyViewed = {
        add: addToRecentlyViewed,
        get: () => recentlyViewed,
        clear: () => {
            recentlyViewed = [];
            saveRecentlyViewed();
            updateSidebar();
        }
    };

})();

// Dynamic Component Loader for Tours North
(function() {
    'use strict';

    // Configuration
    const TOURS_JSON_URL = 'assets/data/tours.json';
    const MAX_BESTSELLERS = 4;

    // Fetch tours data from JSON file
    async function fetchToursData() {
        try {
            const response = await fetch(TOURS_JSON_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const tours = await response.json();
            return tours;
        } catch (error) {
            console.error('Error fetching tours data:', error);
            return null;
        }
    }

    // Sort tours by rating (highest first) and return top N
    function getTopRatedTours(tours, count = MAX_BESTSELLERS) {
        return tours
            .sort((a, b) => b.rating - a.rating)
            .slice(0, count);
    }

    // Generate star rating HTML
    function generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let starsHtml = '';

        // Full stars
        for (let i = 0; i < fullStars; i++) {
            starsHtml += '<svg class="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
        }

        // Half star
        if (hasHalfStar) {
            starsHtml += '<svg class="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" clip-path="polygon(0 0, 50% 0, 50% 100%, 0% 100%)"/></svg>';
        }

        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            starsHtml += '<svg class="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
        }

        return starsHtml;
    }

    // Generate tour card HTML
    function generateTourCard(tour) {
        const isSoldOut = tour.status === 'sold out';
        const buttonText = isSoldOut ? 'Join Waitlist' : 'Book Now';
        const buttonClass = isSoldOut
            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
            : 'bg-[#b91c1c] hover:bg-red-700 text-white';

        // Urgency badge for low inventory
        const urgencyBadge = (tour.inventory < 5 && tour.inventory > 0)
            ? `<span class="bg-[#b91c1c] text-white px-2 py-1 rounded-full text-xs font-bold ml-2">Only ${tour.inventory} spots left!</span>`
            : '';

        // Security shield icon
        const securityIcon = tour.security_level
            ? '<svg class="w-4 h-4 text-[#064e3b] ml-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>'
            : '';

        const cardHtml = `
            <div class="flex-shrink-0 w-80 bg-white rounded-2xl shadow-lg overflow-hidden">
                <img src="${tour.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=300&h=200'}" alt="${tour.name}" class="w-full h-48 object-cover">
                <div class="p-6">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center">
                            <h3 class="text-xl font-bold text-[#064e3b]">${tour.name}</h3>
                            ${securityIcon}
                        </div>
                        <span class="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">Verified</span>
                    </div>
                    <div class="flex items-center mb-2">
                        ${generateStarRating(tour.rating)}
                        <span class="text-sm text-gray-600 ml-2">(${tour.rating})</span>
                    </div>
                    <div class="text-sm text-gray-600 mb-4">
                        <span class="font-semibold">${tour.city}</span> • ${tour.inventory} spots available
                        ${urgencyBadge}
                    </div>
                    <div class="flex items-center justify-between">
                        <p class="text-[#b91c1c] font-bold">From $${tour.price} CAD</p>
                        <button onclick="${isSoldOut ? 'alert(\'Added to waitlist!\')' : `window.open('${tour.url}', '_blank')`} "
                                class="px-4 py-2 rounded-full font-bold transition-colors ${buttonClass}">
                            ${buttonText}
                        </button>
                    </div>
                </div>
            </div>
        `;

        return cardHtml;
    }

    // Populate the bestsellers section
    function populateBestsellersSection(tours) {
        const container = document.querySelector('.bestsellers-container');
        if (!container) {
            console.error('Bestsellers container not found');
            return;
        }

        const topTours = getTopRatedTours(tours);
        const cardsHtml = topTours.map(tour => generateTourCard(tour)).join('');

        container.innerHTML = cardsHtml;
    }

    // Show error message
    function showErrorMessage() {
        const container = document.querySelector('.bestsellers-container');
        if (container) {
            container.innerHTML = `
                <div class="flex items-center justify-center w-full py-12">
                    <div class="text-center">
                        <svg class="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                        </svg>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">Unable to Load Tours</h3>
                        <p class="text-gray-600">Please refresh the page to try again.</p>
                    </div>
                </div>
            `;
        }
    }

    // Initialize dynamic component loader
    async function initDynamicLoader() {
        try {
            await includeHTML();
            const toursData = await fetchToursData();
            if (toursData && Array.isArray(toursData)) {
                populateBestsellersSection(toursData);
            } else {
                showErrorMessage();
            }
        } catch (error) {
            console.error('Failed to initialize dynamic loader:', error);
            showErrorMessage();
        }
    }

    // W3 Include HTML Function (Adapted for modern usage)
    async function includeHTML() {
        const elements = document.querySelectorAll('[w3-include-html]');
        for (let i = 0; i < elements.length; i++) {
            const elmnt = elements[i];
            const file = elmnt.getAttribute("w3-include-html");
            if (file) {
                try {
                    const response = await fetch(file);
                    if (response.ok) {
                        const content = await response.text();
                        elmnt.innerHTML = content;
                    } else {
                        elmnt.innerHTML = "Page not found.";
                    }
                } catch (e) {
                    console.error("Error including HTML file:", file, e);
                    elmnt.innerHTML = "Error loading content.";
                }
                elmnt.removeAttribute("w3-include-html");
            }
        }
    }

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', () => {
        initDynamicLoader();
    });

})();
