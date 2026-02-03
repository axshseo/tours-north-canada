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

// AI Support Concierge UI Component
(function() {
    'use strict';

    // Create the chat bubble
    function createChatBubble() {
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
                            <h3 class="font-semibold font-syne">Tours North AI Concierge</h3>
                            <p class="text-xs opacity-75">Ask me anything about Canada travel</p>
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
                                <p class="text-sm text-gray-800">Hi! I'm your AI travel concierge. How can I help you plan your Canadian adventure?</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Suggested Questions -->
                <div class="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
                    <p class="text-xs text-gray-600 mb-3">Quick questions:</p>
                    <div class="grid grid-cols-1 gap-2">
                        <button onclick="askQuestion('visa')" class="text-left p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                            Do I need a visa?
                        </button>
                        <button onclick="askQuestion('lights')" class="text-left p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                            Best time for Northern Lights?
                        </button>
                        <button onclick="askQuestion('currency')" class="text-left p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                            Currency exchange tips?
                        </button>
                        <button onclick="askQuestion('packing')" class="text-left p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                            What to pack for winter?
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

    // Handle suggested questions
    window.askQuestion = function(questionType) {
        const responses = {
            visa: "For most visitors, you can travel to Canada visa-free for up to 6 months. Check our visa guide for your specific situation: https://toursnorth.ca/guides/canada-travel-visa-guide.html",
            lights: "The best time for Northern Lights is September to April, with peak viewing from October to March. Our Yukon Aurora Expedition runs year-round!",
            currency: "Canada uses CAD. Most places accept cards, but carry some cash for small purchases. Exchange rates are usually good at major airports.",
            packing: "For winter tours: thermal layers, waterproof boots, insulated jacket, gloves, hat, and sunglasses. We provide some gear, but bring your own basics."
        };

        const messagesContainer = document.querySelector('.ai-concierge-chat .space-y-4');

        // Add user message
        const userMessage = document.createElement('div');
        userMessage.className = 'flex items-end justify-end space-x-3';
        userMessage.innerHTML = `
            <div class="bg-[#064e3b] text-white rounded-lg p-3 shadow-sm max-w-xs">
                <p class="text-sm">${questionType === 'visa' ? 'Do I need a visa?' :
                                   questionType === 'lights' ? 'Best time for Northern Lights?' :
                                   questionType === 'currency' ? 'Currency exchange tips?' :
                                   'What to pack for winter?'}</p>
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

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', () => {
        createChatBubble();
    });

})();
