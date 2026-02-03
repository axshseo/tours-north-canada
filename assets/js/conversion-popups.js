// Tours North Conversion Popups Engine
// Triggers limited time offer popup after 40 seconds on tour pages

(function() {
    'use strict';

    // Only run on tour pages
    if (!window.location.pathname.includes('/tours/')) {
        return;
    }

    let popupShown = false;
    let timerStarted = false;

    // Start timer when user arrives on page
    function startTimer() {
        if (timerStarted) return;
        timerStarted = true;

        setTimeout(function() {
            if (!popupShown) {
                showLimitedTimeOffer();
            }
        }, 40000); // 40 seconds
    }

    // Show the limited time offer popup
    function showLimitedTimeOffer() {
        if (popupShown) return;
        popupShown = true;

        // Create popup overlay
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
        overlay.id = 'limited-offer-popup';

        // Create popup content
        overlay.innerHTML = `
            <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full relative overflow-hidden">
                <!-- Header with Canadian flag colors -->
                <div class="bg-gradient-to-r from-red-600 via-white to-red-600 p-1">
                    <div class="bg-white rounded-t-2xl p-6">
                        <!-- Close button -->
                        <button onclick="this.closest('#limited-offer-popup').remove()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>

                        <!-- Maple Leaf Icon -->
                        <div class="flex justify-center mb-4">
                            <div class="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                                <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2l2.09 6.26L21 9.27l-5.91 3.04.79 6.91L12 15.77l-5.88 4.45.79-6.91L3 9.27l6.91-.01L12 2z"/>
                                </svg>
                            </div>
                        </div>

                        <!-- Offer Content -->
                        <div class="text-center">
                            <h3 class="text-2xl font-bold text-[#064e3b] mb-2 font-syne">Limited Time Offer!</h3>
                            <p class="text-gray-600 mb-4">Book now and save 10% on your Canadian adventure</p>

                            <div class="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                                <div class="text-3xl font-bold text-[#b91c1c] mb-1">10% OFF</div>
                                <div class="text-sm text-gray-600">Use code: NORTH10</div>
                            </div>

                            <div class="space-y-3">
                                <button onclick="applyDiscount()" class="w-full bg-[#b91c1c] hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200">
                                    Apply Discount & Book Now
                                </button>
                                <button onclick="this.closest('#limited-offer-popup').remove()" class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200">
                                    Maybe Later
                                </button>
                            </div>

                            <!-- Countdown Timer -->
                            <div class="mt-4 text-sm text-gray-500">
                                Offer expires in: <span id="countdown" class="font-semibold text-[#b91c1c]">05:00</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add overlay to page
        document.body.appendChild(overlay);

        // Start countdown timer
        startCountdown();

        // Track popup impression
        if (typeof gtag !== 'undefined') {
            gtag('event', 'popup_impression', {
                'event_category': 'conversion',
                'event_label': 'limited_time_offer'
            });
        }
    }

    // Apply discount function
    window.applyDiscount = function() {
        // Scroll to booking section or redirect to checkout
        const bookingSection = document.querySelector('.bg-accent, [class*="book"], button[class*="accent"]');
        if (bookingSection) {
            bookingSection.scrollIntoView({ behavior: 'smooth' });
        }

        // Track discount application
        if (typeof gtag !== 'undefined') {
            gtag('event', 'apply_discount', {
                'event_category': 'conversion',
                'event_label': 'north10_code'
            });
        }

        // Remove popup
        document.getElementById('limited-offer-popup').remove();
    };

    // Countdown timer
    function startCountdown() {
        let timeLeft = 300; // 5 minutes
        const countdownElement = document.getElementById('countdown');

        const timer = setInterval(function() {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            countdownElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            if (timeLeft <= 0) {
                clearInterval(timer);
                document.getElementById('limited-offer-popup').remove();
            }
            timeLeft--;
        }, 1000);
    }

    // Event listeners
    document.addEventListener('DOMContentLoaded', function() {
        // Start timer on page load
        startTimer();
    });

    // Restart timer on user activity (optional - prevents popup if user is active)
    let activityTimer;
    function resetActivityTimer() {
        clearTimeout(activityTimer);
        activityTimer = setTimeout(function() {
            // User has been inactive, timer will proceed
        }, 10000); // Reset after 10 seconds of inactivity
    }

    // Listen for user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(function(event) {
        document.addEventListener(event, resetActivityTimer, true);
    });

})();
