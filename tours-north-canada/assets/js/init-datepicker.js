// Initialize Flatpickr Date Range Picker
document.addEventListener('DOMContentLoaded', function() {
    flatpickr("#dateRangePicker", {
        mode: "range",
        minDate: "today",
        dateFormat: "M j",
        conjunction: " → ",
        inline: false,
        showMonths: 2
    });
});
