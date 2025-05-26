document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: '/api/bookings', // Real-time bookings endpoint
        dateClick: function(info) {
            if (info.view.type === 'dayGridMonth') {
                calendar.changeView('timeGridDay', info.dateStr);
            }
        }
    });
    calendar.render();
});