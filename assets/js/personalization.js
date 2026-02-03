// Tours North Personalization Script
// Tracks user behavior and shows personalized recommendations

(function() {
    'use strict';

    // Configuration
    const STORAGE_KEY = 'toursNorth_recentlyViewed';
    const MAX_RECENT_ITEMS = 2;
    const SIDEBAR_DELAY = 3000; // Show sidebar after 3 seconds

    // Track recently viewed tours
    let recentlyViewed = [];

    // Load data from localStorage
    function loadRecentlyViewed() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            recentlyViewed = stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading recently viewed tours:', error);
            recentlyViewed = [];
        }
    }

    // Save data to localStorage
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
        if (recentlyViewed.length > MAX_RECENT_ITEMS) {
            recentlyViewed = recentlyViewed.slice(0, MAX_RECENT_ITEMS);
        }

        saveRecentlyViewed();
    }

    // Detect current tour page and track it
    function trackCurrentTour() {
        // Check if we're on a tour page
        const isTourPage = window.location.pathname.includes('/tours/') ||
                          document.querySelector('.tour-title, .tour-name, h1');

        if (isTourPage) {
            const tourTitle = document.querySelector('h1, .tour-title, .tour-name')?.innerText?.trim();
            const tourPrice = document.querySelector('.tour-price, .price, [class*="price"]')?.innerText?.trim();
            const tourImage = document.querySelector('img')?.src ||
                             'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=80&h=60';

            if (tourTitle) {
                const tourData = {
                    id: window.location.pathname.split('/').pop().replace('.html', ''),
                    name: tourTitle,
                    price: tourPrice || 'From $99 CAD',
                    url: window.location.pathname,
                    image: tourImage,
                    timestamp: Date.now()
                };

                addToRecentlyViewed(tourData);
            }
        }
    }

    // Create the floating sidebar widget
    function createSidebarWidget() {
        // Don't show if no recent tours
        if (recentlyViewed.length === 0) return;

        // Remove existing sidebar
        const existingSidebar = document.querySelector('.personalization-sidebar');
        if (existingSidebar) {
            existingSidebar.remove();
        }

        const sidebar = document.createElement('div');
        sidebar.className = 'personalization-sidebar fixed right-4 top-1/2 transform -translate-y-1/2 z-40 bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-4 w-72 transition-all duration-300 hover:shadow-3xl';

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
                <a href="${tour.url}" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/30 transition-colors group border border-white/30">
                    <img src="${tour.image}" alt="${tour.name}" class="w-14 h-14 object-cover rounded-lg flex-shrink-0">
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold text-[#064e3b] group-hover:text-[#b91c1c] truncate">${tour.name}</p>
                        <p class="text-xs text-gray-600">${tour.price}</p>
                        <p class="text-xs text-[#b91c1c] font-medium mt-1">Complete Booking →</p>
                    </div>
                </a>
            `;
        });

        sidebarContent += `
            </div>
            <div class="mt-4 pt-3 border-t border-white/30">
                <a href="index.html" class="text-xs text-[#064e3b] hover:text-[#b91c1c] font-medium">View all tours →</a>
            </div>
        `;

        sidebar.innerHTML = sidebarContent;
        document.body.appendChild(sidebar);

        // Auto-hide after 15 seconds
        setTimeout(() => {
            if (sidebar.parentElement) {
                sidebar.style.opacity = '0';
                setTimeout(() => sidebar.remove(), 300);
            }
        }, 15000);
    }

    // Track city/destination visits
    function trackCityVisits() {
        const isDestinationPage = window.location.pathname.includes('/destinations/');

        if (isDestinationPage) {
            const cityName = document.querySelector('h1, .city-title, .destination-title')?.innerText?.trim();

            if (cityName) {
                // Store visited cities for future personalization
                const visitedCities = JSON.parse(localStorage.getItem('toursNorth_visitedCities') || '[]');
                if (!visitedCities.includes(cityName)) {
                    visitedCities.push(cityName);
                    localStorage.setItem('toursNorth_visitedCities', JSON.stringify(visitedCities));
                }
            }
        }
    }

    // Get personalized recommendations based on visited cities
    function getPersonalizedRecommendations() {
        const visitedCities = JSON.parse(localStorage.getItem('toursNorth_visitedCities') || '[]');

        // Simple recommendation logic - in a real app, this would be more sophisticated
        const recommendations = {
            'Toronto': ['toronto-art-gallery-ago', 'toronto-hockey-hall-of-fame'],
            'Vancouver': ['whistler-ski-lesson'],
            'Banff': ['jasper-wildlife-tour'],
            'Montreal': ['quebec-city-exploration'],
            'Halifax': ['nova-scotia-lighthouse-tour']
        };

        const userRecommendations = [];
        visitedCities.forEach(city => {
            if (recommendations[city]) {
                userRecommendations.push(...recommendations[city]);
            }
        });

        return userRecommendations.slice(0, 2); // Return up to 2 recommendations
    }

    // Initialize personalization
    function init() {
        loadRecentlyViewed();
        trackCurrentTour();
        trackCityVisits();

        // Show sidebar after delay
        setTimeout(() => {
            createSidebarWidget();
        }, SIDEBAR_DELAY);
    }

    // Export for external use
    window.ToursNorthPersonalization = {
        addTour: addToRecentlyViewed,
        getRecent: () => recentlyViewed,
        getRecommendations: getPersonalizedRecommendations,
        clear: () => {
            recentlyViewed = [];
            saveRecentlyViewed();
        }
    };

    // AI Support Concierge UI Component
    function createAIConcierge() {
        // Create chat bubble
        const chatBubble = document.createElement('div');
        chatBubble.className = 'ai-concierge-bubble fixed bottom-6 right-6 z-50';
        chatBubble.innerHTML = `
            <button onclick="openAIConcierge()" class="bg-[#064e3b] hover:bg-[#053a2e] text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 group">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                <div class="absolute -top-1 -right-1 w-3 h-3 bg-[#b91c1c] rounded-full animate-pulse"></div>
            </button>
        `;
        document.body.appendChild(chatBubble);
    }

    // Open AI Concierge chat window
    window.openAIConcierge = function() {
        // Remove existing chat window
        const existingChat = document.querySelector('.ai-concierge-chat');
        if (existingChat) {
            existingChat.remove();
            return;
        }

        const chatWindow = document.createElement('div');
        chatWindow.className = 'ai-concierge-chat fixed bottom-24 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 w-80 h-96 transition-all duration-300';
        chatWindow.innerHTML = `
            <div class="flex flex-col h-full">
                <!-- Header -->
                <div class="bg-[#064e3b] text-white p-4 rounded-t-2xl flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423L16.5 15.75l.394 1.183a2.25 2.25 0 001.423 1.423L19.5 18.75l-1.183.394a2.25 2.25 0 00-1.423 1.423z"></path>
                            </svg>
                        </div>
                        <div>
                            <h3 class="font-semibold font-syne">Tours North AI</h3>
                            <p class="text-xs opacity-75">How can I help you today?</p>
                        </div>
                    </div>
                    <button onclick="closeAIConcierge()" class="text-white/70 hover:text-white">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <!-- Messages -->
                <div class="flex-1 p-4 overflow-y-auto bg-gray-50">
                    <div class="space-y-4">
                        <!-- AI Welcome Message -->
                        <div class="flex items-start space-x-3">
                            <div class="w-8 h-8 bg-[#064e3b] rounded-full flex items-center justify-center flex-shrink-0">
                                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"></path>
                                </svg>
                            </div>
                            <div class="bg-white rounded-lg p-3 shadow-sm max-w-xs">
                                <p class="text-sm text-gray-800">Hi! I'm your AI travel assistant. How can I help you plan your Canadian adventure?</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Smart Suggestions -->
                <div class="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
                    <p class="text-xs text-gray-600 mb-3">Quick help:</p>
                    <div class="grid grid-cols-1 gap-2">
                        <button onclick="askAIQuestion('booking')" class="text-left p-3 text-xs bg-gray-50 hover:bg-[#064e3b] hover:text-white rounded-lg transition-colors border border-gray-200">
                            📋 Check My Booking
                        </button>
                        <button onclick="askAIQuestion('packing')" class="text-left p-3 text-xs bg-gray-50 hover:bg-[#064e3b] hover:text-white rounded-lg transition-colors border border-gray-200">
                            🧳 Winter Packing List
                        </button>
                        <button onclick="askAIQuestion('visa')" class="text-left p-3 text-xs bg-gray-50 hover:bg-[#064e3b] hover:text-white rounded-lg transition-colors border border-gray-200">
                            🛂 Visa Help
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(chatWindow);
    };

    // Close AI Concierge chat window
    window.closeAIConcierge = function() {
        const chatWindow = document.querySelector('.ai-concierge-chat');
        if (chatWindow) {
            chatWindow.remove();
        }
    };

    // Handle AI question clicks
    window.askAIQuestion = function(questionType) {
        const responses = {
            booking: "I'd be happy to help you check your booking! Please provide your booking reference number (TN2026-XXXXX) or the email address used for booking, and I'll look up your details.",
            packing: "For winter travel in Canada, pack thermal base layers, waterproof outerwear, insulated boots, gloves, hat, and sunglasses. Don't forget hand/foot warmers! Check our complete winter packing guide: https://toursnorth.ca/guides/winter-packing-guide",
            visa: "Most visitors can travel to Canada visa-free for up to 6 months. Requirements vary by nationality. Check our comprehensive visa guide for your specific situation: https://toursnorth.ca/guides/canada-travel-visa-guide"
        };

        const messagesContainer = document.querySelector('.ai-concierge-chat .space-y-4');

        // Add user message
        const userMessage = document.createElement('div');
        userMessage.className = 'flex items-end justify-end space-x-3';
        userMessage.innerHTML = `
            <div class="bg-[#064e3b] text-white rounded-lg p-3 shadow-sm max-w-xs">
                <p class="text-sm">${questionType === 'booking' ? 'Check My Booking' :
                                   questionType === 'packing' ? 'Winter Packing List' :
                                   'Visa Help'}</p>
            </div>
        `;
        messagesContainer.appendChild(userMessage);

        // Add AI response after delay
        setTimeout(() => {
            const aiMessage = document.createElement('div');
            aiMessage.className = 'flex items-start space-x-3';
            aiMessage.innerHTML = `
                <div class="w-8 h-8 bg-[#064e3b] rounded-full flex items-center justify-center flex-shrink-0">
                    <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"></path>
                    </svg>
                </div>
                <div class="bg-white rounded-lg p-3 shadow-sm max-w-xs">
                    <p class="text-sm text-gray-800">${responses[questionType]}</p>
                </div>
            `;
            messagesContainer.appendChild(aiMessage);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 1000);
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Initialize AI Concierge
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createAIConcierge);
    } else {
        createAIConcierge();
    }

})();
