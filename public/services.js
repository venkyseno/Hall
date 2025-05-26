// Example global bookings array (replace with your real data source)
const allBookings = [
    // Example: { serviceId: "1", date: "2025-05-24" }
    // You should populate this from your backend or global JS variable
];

// Map serviceId to service name if needed, or use serviceId directly if that's how you store it
function getBookedDatesForService(serviceId) {
    // If your bookings use serviceId, filter by serviceId
    return allBookings
        .filter(b => b.serviceId === serviceId && b.date)
        .map(b => b.date);
}

// Service booking button handler
document.querySelectorAll('.book-now').forEach(button => {
    button.addEventListener('click', function() {
        const serviceId = this.dataset.serviceId;
        openBookingModal(serviceId);
    });
});

// Modal opener function (shared with other components)
function openBookingModal(serviceId) {
    const modal = document.getElementById('booking-modal');
    modal.style.display = 'block';

    // Get booked dates for this service (fetch from backend or global JS variable)
    // Example: let bookedDates = ['2025-05-24', '2025-05-28', ...];
    let bookedDates = getBookedDatesForService(serviceId); // Implement this function

    const bookingCalendar = new FullCalendar.Calendar(
        document.getElementById('booking-calendar'), {
            initialView: 'dayGridMonth',
            selectable: true,
            selectAllow: function(selectInfo) {
                // Block selection if the date is booked
                return !bookedDates.includes(selectInfo.startStr);
            },
            select: function(info) {
                document.getElementById('booking-date').value = info.startStr;
                document.getElementById('booking-service').value = serviceId;
            },
            events: bookedDates.map(date => ({
                start: date,
                end: date,
                display: 'background',
                color: '#f8d7da'
            }))
        }
    );
    bookingCalendar.render();
}

// After booking is confirmed (e.g., after alert('Booking confirmed! Check your SMS.');)
allBookings.push({
    service: document.getElementById('booking-service').value,
    date: document.getElementById('booking-date').value
});