// Tours North - Viator-Style Predictive Search
// Smart categorization with locations, tour types, and direct matches

(function() {
    'use strict';

    let toursData = [];

    // Load tours data from JSON file
    async function loadToursData() {
        try {
            const response = await fetch('assets/data/tours.json');
            if (!response.ok) throw new Error('Failed to load tours data');
            toursData = await response.json();
            console.log('Loaded', toursData.length, 'tours for predictive search');
        } catch (error) {
            console.error('Error loading tours data:', error);
            toursData = [];
        }
    }

    // Extract unique cities from tours data
    function getUniqueCities() {
        const cities = [...new Set(toursData.map(tour => tour.city))];
        return cities.map(city => ({
            name: `${city}, Canada`,
            city: city,
            type: 'location'
        }));
    }

    // Extract tour types from tours data
    function getTourTypes(query) {
        const categories = [...new Set(toursData.map(tour => tour.category))];
        return categories.map(category => ({
            name: `${query} ${category} Tours`,
            category: category,
            type: 'tour_type'
        }));
    }

    // Perform smart categorized search
    window.performPredictiveSearch = function(query) {
        if (!query || query.length < 2) {
            return {
                locations: [],
                tourTypes: [],
                directMatches: [],
                hasResults: false
            };
        }

        const searchQuery = query.toLowerCase();
        
        // 1. Location matches
        const locations = getUniqueCities()
            .filter(loc => loc.city.toLowerCase().includes(searchQuery))
            .slice(0, 3);

        // 2. Direct tour matches (top 3)
        const directMatches = toursData
            .filter(tour => {
                const name = tour.name.toLowerCase();
                const city = tour.city.toLowerCase();
                return name.includes(searchQuery) || city.includes(searchQuery);
            })
            .slice(0, 3);

        // 3. Tour Types (if query seems like a city name)
        let tourTypes = [];
        const matchedCity = locations.find(loc => 
            loc.city.toLowerCase() === searchQuery
        );
        if (matchedCity) {
            tourTypes = getTourTypes(matchedCity.city).slice(0, 2);
        }

        return {
            locations,
            tourTypes,
            directMatches,
            hasResults: locations.length > 0 || directMatches.length > 0 || tourTypes.length > 0,
            query
        };
    };

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', loadToursData);
})();
