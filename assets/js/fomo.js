// Tours North Sales Pulse Notification Engine
// Creates FOMO (Fear Of Missing Out) notifications every 30 seconds

(function() {
    'use strict';

    // Array of recent booking notifications
    const recentBookings = [
        'Sarah from Toronto just booked Niagara Falls Boat Tour',
        'Mike from Vancouver just booked Banff Gondola Ride',
        'Emma from Montreal just booked Yukon Aurora Expedition',
        'David from Calgary just booked Whistler Ski Lesson',
        'Lisa from Halifax just booked Jasper Wildlife Tour',
        'James from Ottawa just booked Toronto CN Tower EdgeWalk',
        'Anna from Winnipeg just booked Banff Hot Springs',
        'Robert from Quebec City just booked Niagara Falls Helicopter Tour',
        'Sophie from Victoria just booked Vancouver Whale Watching',
        'Chris from Edmonton just booked Yukon Dog Sledding',
        'Maria from Regina just booked Toronto Art Gallery Tour',
        'Tom from Saskatoon just booked Banff Lake Louise',
        'Jennifer from Fredericton just booked Halifax Harbour Cruise',
        'Mark from Charlottetown just booked Prince Edward Island Tour',
        'Karen from Yellowknife just booked Northwest Territories Adventure',
        'Paul from Whitehorse just booked Yukon Gold Rush Tour',
        'Rachel from Iqaluit just booked Nunavut Northern Lights',
        'Steve from St. John\'s just booked Newfoundland Iceberg Tour',
        'Amanda from Thunder Bay just booked Ontario Wilderness Trek',
        'Brian from Sudbury just booked Ontario Mining Heritage Tour'
    ];

    let notificationInterval;
    let currentToast = null;

    // Initialize FOMO notifications
    function initFOMO() {
        // Start showing notifications after 30 seconds, then every 30 seconds
        setTimeout(() => {
            showRandomBooking();
            notificationInterval = setInterval(showRandomBooking, 30000);
        }, 30000);
    }

    // Show a random booking notification
    function showRandomBooking() {
        // Don't show if user is actively typing or if another toast is visible
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA' || currentToast) {
            return;
        }

        const randomBooking = recentBookings[Math.floor(Math.random() * recentBookings.length)];
        showToast(randomBooking);
    }

    // Create and show the toast notification
    function showToast(message) {
        // Remove existing toast if any
        if (currentToast) {
            currentToast.remove();
        }

        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'fomo-toast fixed bottom-4 left-4 z-50 max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform translate-x-[-100%] transition-all duration-500 ease-out';
        toast.innerHTML = `
            <div class="p-4">
                <div class="flex items-start space-x-3">
                    <!-- Avatar -->
                    <div class="flex-shrink-0">
                        <div class="w-10 h-10 bg-gradient-to-br from-[#064e3b] to-[#b91c1c] rounded-full flex items-center justify-center">
                            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
                            </svg>
                        </div>
                    </div>

                    <!-- Content -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center space-x-2 mb-1">
                            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span class="text-xs font-semibold text-[#064e3b] uppercase tracking-wide">Recent Booking</span>
                        </div>
                        <p class="text-sm text-gray-700 leading-relaxed">${message}</p>
                        <p class="text-xs text-gray-500 mt-1">Just now</p>
                    </div>

                    <!-- Close button -->
                    <button onclick="this.closest('.fomo-toast').remove()" class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <!-- CTA Button -->
                <div class="mt-3">
                    <button onclick="bookNow()" class="w-full bg-[#b91c1c] hover:bg-red-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105">
                        Book Now Before It's Gone!
                    </button>
                </div>
            </div>
        `;

        // Add to page
        document.body.appendChild(toast);
        currentToast = toast;

        // Animate in
        setTimeout(() => {
            toast.classList.remove('translate-x-[-100%]');
        }, 100);

        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.add('translate-x-[-100%]');
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.remove();
                        currentToast = null;
                    }
                }, 500);
            }
        }, 8000);

        // Track notification impression
        if (typeof gtag !== 'undefined') {
            gtag('event', 'fomo_notification_shown', {
                'event_category': 'conversion',
                'event_label': message
            });
        }
    }

    // Book now function (scroll to booking section)
    window.bookNow = function() {
        const bookingSection = document.querySelector('.bg-accent, [class*="book"], button[class*="accent"], .hero-search');
        if (bookingSection) {
            bookingSection.scrollIntoView({ behavior: 'smooth' });
        }

        // Track click
        if (typeof gtag !== 'undefined') {
            gtag('event', 'fomo_notification_click', {
                'event_category': 'conversion',
                'event_label': 'book_now_button'
            });
        }

        // Remove toast
        if (currentToast) {
            currentToast.remove();
            currentToast = null;
        }
    };

    // Pause notifications when user is active
    let userActivityTimeout;
    function handleUserActivity() {
        clearTimeout(userActivityTimeout);
        userActivityTimeout = setTimeout(() => {
            // User has been inactive, notifications can resume
        }, 5000); // Pause for 5 seconds after activity
    }

    // Listen for user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, handleUserActivity, true);
    });

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', initFOMO);

    // Export for potential external control
    window.ToursNorthFOMO = {
        showNotification: showRandomBooking,
        pause: () => clearInterval(notificationInterval),
        resume: () => {
            notificationInterval = setInterval(showRandomBooking, 30000);
        }
    };

})();
