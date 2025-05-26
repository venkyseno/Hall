console.log('🎯 Hall Booking System Starting...');

// Global variables (declared only once)
const services = [
  { name: 'Maha Lingeshwara' },
  { name: 'Maha Nandeshwara' }
];

let selectedServiceIdx = 0;
let selectedDate = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let bookedDates = []; // Store booked dates

// --- Database Functions ---
async function fetchBookingsForService(serviceName) {
  try {
    const response = await fetch(`/api/bookings/${encodeURIComponent(serviceName)}`);
    if (response.ok) {
      const bookings = await response.json();
      console.log(`📊 Loaded ${bookings.length} bookings for ${serviceName}`);
      return bookings;
    } else {
      console.warn('⚠️ Failed to fetch bookings:', response.status);
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching bookings:', error);
    return [];
  }
}

async function saveBookingToDatabase(bookingData) {
  try {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Booking saved successfully:', result);
      return result;
    } else {
      const errorText = await response.text();
      console.error('❌ Failed to save booking:', errorText);
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('❌ Network error saving booking:', error);
    throw error;
  }
}

// --- Modal Functions ---
function openCalendarModal(serviceIdx) {
  console.log('Opening modal for service:', serviceIdx);
  selectedServiceIdx = serviceIdx;
  document.getElementById('modalTitle').textContent = `Book ${services[serviceIdx].name}`;
  document.getElementById('calendarModal').style.display = 'block';
  
  // Show the booking form immediately (don't hide it)
  document.getElementById('bookingForm').style.display = 'block';
  
  selectedDate = null;
  
  // Reset to current month/year and render calendar
  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  renderCalendar(currentMonth, currentYear);
}

function closeCalendarModal() {
  console.log('Closing modal');
  document.getElementById('calendarModal').style.display = 'none';
  document.getElementById('bookingForm').style.display = 'none';
  selectedDate = null;
  clearCalendarSelection();
  clearBookingForm();
}

// --- Calendar Functions ---
async function renderCalendar(month, year) {
  console.log('Rendering calendar for:', month + 1, year);
  
  // Update dropdown values
  document.getElementById('monthSelect').value = month;
  document.getElementById('yearSelect').value = year;
  
  // Fetch current bookings for this service
  const bookings = await fetchBookingsForService(services[selectedServiceIdx].name);
  bookedDates = bookings
    .filter(booking => booking.status === 'booked')
    .map(booking => booking.date);
  
  const calendarBody = document.getElementById('calendarBody');
  calendarBody.innerHTML = '';

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let date = 1;
  
  for (let i = 0; i < 6; i++) {
    const row = document.createElement('tr');
    for (let j = 0; j < 7; j++) {
      const cell = document.createElement('td');
      
      if (i === 0 && j < firstDay) {
        cell.innerHTML = '';
      } else if (date > daysInMonth) {
        cell.innerHTML = '';
      } else {
        const cellDate = new Date(year, month, date);
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
        
        const dateDiv = document.createElement('div');
        dateDiv.className = 'calendar-date';
        dateDiv.textContent = date;
        dateDiv.setAttribute('data-date', dateStr);
        
        // Check if date is in the past
        if (cellDate < today) {
          dateDiv.classList.add('past-date');
          dateDiv.title = 'Past date - cannot book';
        }
        // Check if date is already booked
        else if (bookedDates.includes(dateStr)) {
          dateDiv.classList.add('booked');
          dateDiv.title = 'Already booked';
          
          // Add booked indicator
          const bookedIndicator = document.createElement('div');
          bookedIndicator.className = 'booked-indicator';
          bookedIndicator.textContent = 'Booked';
          dateDiv.appendChild(bookedIndicator);
        }
        // Available date
        else {
          dateDiv.classList.add('available');
          dateDiv.title = 'Click to select this date';
          dateDiv.addEventListener('click', () => {
            clearCalendarSelection();
            dateDiv.classList.add('selected');
            selectedDate = dateStr;
            
            // Update the selected date display in the form
            const selectedDateDisplay = document.getElementById('selectedDateDisplay');
            if (selectedDateDisplay) {
              selectedDateDisplay.textContent = `Selected Date: ${formatDateForDisplay(selectedDate)}`;
              selectedDateDisplay.style.display = 'block';
            }
            
            console.log('Date selected:', selectedDate);
          });
        }
        
        cell.appendChild(dateDiv);
        date++;
      }
      row.appendChild(cell);
    }
    calendarBody.appendChild(row);
    if (date > daysInMonth) break;
  }
}

// Helper function to format date for display
function formatDateForDisplay(dateStr) {
  const date = new Date(dateStr);
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('en-US', options);
}

function clearCalendarSelection() {
  document.querySelectorAll('.calendar-date.selected').forEach(el => el.classList.remove('selected'));
}

function changeMonth(delta) {
  currentMonth += delta;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  } else if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar(currentMonth, currentYear);
}

// --- Booking Functions ---
function clearBookingForm() {
  document.getElementById('customerName').value = '';
  document.getElementById('customerMobile').value = '';
  document.getElementById('advanceAmount').value = '';
}

async function confirmBooking() {
  const name = document.getElementById('customerName').value.trim();
  const mobile = document.getElementById('customerMobile').value.trim();
  const advance = document.getElementById('advanceAmount').value.trim();

  // Validation
  if (!selectedDate) {
    alert('Please select a date from the calendar.');
    return;
  }
  if (!name) {
    alert('Please enter your full name.');
    return;
  }
  if (!mobile || mobile.length < 10) {
    alert('Please enter a valid mobile number (at least 10 digits).');
    return;
  }
  if (!advance || isNaN(advance) || Number(advance) <= 0) {
    alert('Please enter a valid advance amount.');
    return;
  }

  // Prepare booking data
  const bookingData = {
    hall: services[selectedServiceIdx].name,
    name: name,
    mobile: mobile,
    date: selectedDate,
    advance: parseFloat(advance),
    status: 'booked',
    createdAt: new Date().toISOString()
  };

  try {
    // Disable the button to prevent double-clicking
    const confirmBtn = document.getElementById('confirmBookingBtn');
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Saving...';

    // Save to database
    await saveBookingToDatabase(bookingData);
    
    // Success message
    alert(`✅ Booking confirmed successfully!\n\nHall: ${bookingData.hall}\nDate: ${selectedDate}\nName: ${name}\nMobile: ${mobile}\nAdvance: ₹${advance}\n\nThank you for choosing our venue!`);
    
    // Close modal and refresh calendar
    closeCalendarModal();
    
  } catch (error) {
    // Error handling
    alert(`❌ Booking failed: ${error.message}\n\nPlease try again or contact support.`);
    console.error('Booking error:', error);
  } finally {
    // Re-enable the button
    const confirmBtn = document.getElementById('confirmBookingBtn');
    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Confirm Booking';
    }
  }
}

// --- Hero Slider ---
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-section .slide');
  let currentSlide = 0;
  
  console.log('Found hero slides:', slides.length);
  
  if (slides.length > 0) {
    slides[0].classList.add('active');
  }
  
  function nextSlide() {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
  }
  
  if (slides.length > 1) {
    setInterval(nextSlide, 10000);
    console.log('Hero slider started');
  }
}

// --- Initialize Everything ---
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded - initializing...');

  // Initialize hero slider
  initHeroSlider();

  // Book Now buttons
  document.querySelectorAll('.book-now').forEach((btn, idx) => {
    console.log('Adding click listener to button', idx);
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Book Now clicked for service', idx);
      openCalendarModal(idx);
    });
  });

  // Modal close handlers
  document.getElementById('closeModalBtn').onclick = closeCalendarModal;
  window.onclick = function(event) {
    if (event.target === document.getElementById('calendarModal')) {
      closeCalendarModal();
    }
  };

  // Calendar navigation
  document.getElementById('prevMonthBtn').onclick = () => changeMonth(-1);
  document.getElementById('nextMonthBtn').onclick = () => changeMonth(1);

  // Month/year selectors
  document.getElementById('monthSelect').onchange = function() {
    currentMonth = parseInt(this.value);
    renderCalendar(currentMonth, currentYear);
  };
  
  const yearSelect = document.getElementById('yearSelect');
  const thisYear = new Date().getFullYear();
  for (let y = thisYear; y <= thisYear + 2; y++) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
  }
  
  yearSelect.onchange = function() {
    currentYear = parseInt(this.value);
    renderCalendar(currentMonth, currentYear);
  };

  // Booking form buttons
  document.getElementById('cancelBookingBtn').onclick = closeCalendarModal;
  document.getElementById('confirmBookingBtn').onclick = confirmBooking;

  // Smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const headerHeight = 80;
        const targetPosition = target.offsetTop - headerHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  console.log('✅ Initialization complete!');
});