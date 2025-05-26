document.addEventListener('DOMContentLoaded', () => {
  // Add click handlers to booked dates
  document.querySelectorAll('.day.booked').forEach(day => {
    day.addEventListener('click', () => {
      const date = day.textContent.padStart(2, '0');
      const hall = day.closest('.calendar-box').querySelector('h3').textContent;
      showBookingDetails(`2025-05-${date}`, hall);
    });
  });
  
  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        date: document.getElementById('booking-date').value,
        service: document.getElementById('booking-service').value
      };

      fetch('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      .then(async response => {
        if (!response.ok) {
          const err = await response.json();
            throw new Error(err.error || 'Booking failed.');
        }
        return response.json();
      })
      .then(data => {
        return fetch('http://localhost:3000/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `Hello ${formData.name}, your booking for ${formData.service} on ${formData.date} is confirmed!`
          })
        });
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => { throw new Error(err.error || 'Notification failed.'); });
        }
        return response.json();
      })
      .then(() => alert('Booking confirmed! Check your SMS.'))
      .catch(error => alert(error.message));
    });
  }

  const closeBtn = document.getElementById('closeModal');
  if (closeBtn) {
    closeBtn.onclick = () => {
      document.getElementById('bookingModal').style.display = 'none';
    };
  }

  document.querySelectorAll('.service-card .book-now').forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      selectedServiceIdx = idx;
      selectedDate = null;
      document.getElementById('modalServiceName').textContent = services[idx].name + " - Select Date";
      document.getElementById('userDetailsForm').style.display = 'none';
      document.getElementById('calendarOkBtn').style.display = 'none';
      // renderCalendar(new Date().getMonth(), new Date().getFullYear()); // if you have a calendar
      document.getElementById('bookingModal').style.display = 'flex';
    });
  });

  // Move these lines here, after DOM is loaded:
  const calendarContainer = document.getElementById('calendarContainer');
  if (calendarContainer) {
    const calendarBody = calendarContainer.querySelector('tbody');
    if (calendarBody) {
      calendarBody.innerHTML = '';
    }
  }

  populateMonthYearSelectors();
});

function showBookingDetails(date, hall) {
  // Sample data - replace with your actual data
  const bookings = {
    '2025-05-15': { event: "Wedding", name: "Rahul Sharma", mobile: "9876543210" },
    '2025-05-18': { event: "Conference", name: "Priya Patel", mobile: "8765432109" },
    '2025-05-20': { event: "Wedding", name: "Amit Singh", mobile: "7654321098" },
    '2025-05-22': { event: "Meeting", name: "Neha Gupta", mobile: "6543210987" },
    '2025-05-25': { event: "Wedding", name: "Vikram Joshi", mobile: "5432109876" }
  };
  
  const booking = bookings[date];
  const detailsContainer = document.getElementById('bookingDetails');
  
  if (booking) {
    detailsContainer.innerHTML = `
      <div class="booking-card">
        <h4>${booking.event} Booking</h4>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Customer:</strong> ${booking.name}</p>
        <p><strong>Contact:</strong> ${booking.mobile}</p>
        <p><strong>Hall:</strong> ${hall}</p>
      </div>
    `;
  } else {
    detailsContainer.innerHTML = '<p>No booking details found for selected date</p>';
  }
}

function populateMonthYearSelectors() {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const calendarMonth = document.getElementById('calendarMonth');
  const calendarYear = document.getElementById('calendarYear');
  if (calendarMonth && calendarYear) {
    calendarMonth.innerHTML = '';
    calendarYear.innerHTML = '';
    for (let m = 0; m < 12; m++) {
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = monthNames[m];
      calendarMonth.appendChild(opt);
    }
    const thisYear = new Date().getFullYear();
    for (let y = thisYear - 1; y <= thisYear + 2; y++) {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      calendarYear.appendChild(opt);
    }
  }
}

document.querySelectorAll('.service-card .book-now').forEach((btn, idx) => {
  btn.addEventListener('click', () => {
    selectedServiceIdx = idx;
    selectedDate = null;
    document.getElementById('modalServiceName').textContent = services[idx].name + " - Select Date";
    document.getElementById('userDetailsForm').style.display = 'none';
    document.getElementById('calendarOkBtn').style.display = 'none';
    // renderCalendar(new Date().getMonth(), new Date().getFullYear()); // if you have a calendar
    document.getElementById('bookingModal').style.display = 'flex';
  });
});

console.log(
  document.getElementById('bookingModal'),
  document.getElementById('modalServiceName'),
  document.getElementById('userDetailsForm'),
  document.getElementById('calendarOkBtn')
);