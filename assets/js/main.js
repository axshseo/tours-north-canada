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
