# TODO: Fix Loading Spinner in Most Popular Adventures Section

## Tasks
- [x] Update index.html: Change container class from 'bestsellers-container' to 'popular-tours-container'
- [x] Update assets/data/tours.json: Add a 4th tour with inventory_status: 'Low' to trigger urgency badge
- [x] Update assets/js/main.js: Change querySelector to '.popular-tours-container' and modify urgency badge logic to check inventory_status === 'Low' and display 'Selling Fast' badge
- [x] Test the changes: Ensure spinner is replaced with 4 tour cards, one with 'Selling Fast' badge
