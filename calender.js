document.addEventListener('DOMContentLoaded', function () {
  const modal = document.getElementById('calendarModal');
  const closeModal = document.querySelector('.close');
  const calendarBody = document.getElementById('calendarBody');
  const confirmBookingButton = document.getElementById('confirmBooking');
  const usernameInput = document.getElementById('username');
  const mobileInput = document.getElementById('mobile');
  const monthSelect = document.getElementById('monthSelect');
  const yearSelect = document.getElementById('yearSelect');
  const prevMonthButton = document.getElementById('prevMonth');
  const nextMonthButton = document.getElementById('nextMonth');
  const bookings = [
    { date: '2025-05-15', status: 'booked' },
    { date: '2025-05-20', status: 'booked' }
  ];
  let selectedDate = null;

  function openModal() {
    modal.style.display = 'block';
  }

  function closeModalHandler() {
    modal.style.display = 'none';
    selectedDate = null; // Reset selected date when modal is closed
    clearSelection();
  }

  function clearSelection() {
    const selectedCells = calendarBody.querySelectorAll('.selected');
    selectedCells.forEach(cell => cell.classList.remove('selected'));
  }

  function populateYearMonthSelectors() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    // Populate year selector
    yearSelect.innerHTML = ''; // Clear existing options
    for (let year = currentYear - 10; year <= currentYear + 10; year++) {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    }
    yearSelect.value = currentYear;

    // Populate month selector
    monthSelect.innerHTML = ''; // Clear existing options
    for (let month = 0; month < 12; month++) {
      const option = document.createElement('option');
      option.value = month;
      option.textContent = new Date(0, month).toLocaleString('default', { month: 'long' });
      monthSelect.appendChild(option);
    }
    monthSelect.value = currentMonth;

    console.log('Month and Year selectors populated successfully.');
  }

  function renderCalendar(month, year) {
    calendarBody.innerHTML = '';
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let date = 1;

    for (let i = 0; i < 6; i++) {
      const row = document.createElement('tr');
      for (let j = 0; j < 7; j++) {
        const cell = document.createElement('td');
        if (i === 0 && j < firstDay) {
          cell.innerHTML = '';
        } else if (date > daysInMonth) {
          break;
        } else {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
          const booking = bookings.find(b => b.date === dateStr);
          if (booking && booking.status === 'booked') {
            cell.classList.add('booked');
            cell.textContent = date;
          } else {
            cell.classList.add('available');
            cell.textContent = date;
            cell.addEventListener('click', () => {
              clearSelection();
              cell.classList.add('selected');
              selectedDate = dateStr;
            });
          }
          date++;
        }
        row.appendChild(cell);
      }
      calendarBody.appendChild(row);
    }
  }

  prevMonthButton.addEventListener('click', () => {
    let month = parseInt(monthSelect.value);
    let year = parseInt(yearSelect.value);
    if (month === 0) {
      month = 11;
      year--;
    } else {
      month--;
    }
    monthSelect.value = month;
    yearSelect.value = year;
    renderCalendar(month, year);
  });

  nextMonthButton.addEventListener('click', () => {
    let month = parseInt(monthSelect.value);
    let year = parseInt(yearSelect.value);
    if (month === 11) {
      month = 0;
      year++;
    } else {
      month++;
    }
    monthSelect.value = month;
    yearSelect.value = year;
    renderCalendar(month, year);
  });

  confirmBookingButton.addEventListener('click', (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const mobile = mobileInput.value.trim();

    if (!username) {
      alert('Please enter your username.');
      return;
    }
    if (!/^\d{10}$/.test(mobile)) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!selectedDate) {
      alert('Please select a date before confirming your booking.');
      return;
    }

    alert(`Booking confirmed for ${selectedDate} by ${username} (Mobile: ${mobile})`);
    modal.style.display = 'none';
  });

  closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  populateYearMonthSelectors();
  renderCalendar(new Date().getMonth(), new Date().getFullYear());

  monthSelect.addEventListener('change', () => {
    renderCalendar(parseInt(monthSelect.value), parseInt(yearSelect.value));
  });

  yearSelect.addEventListener('change', () => {
    renderCalendar(parseInt(monthSelect.value), parseInt(yearSelect.value));
  });
});