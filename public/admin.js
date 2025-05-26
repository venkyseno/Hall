// Admin credentials
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

// Make adminLogin globally available
function adminLogin(event) {
  event.preventDefault();
  const username = document.getElementById("admin-username").value;
  const password = document.getElementById("admin-password").value;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    localStorage.setItem("adminLoggedIn", "true");
    window.location.href = "admin-console.html";
  } else {
    alert("Invalid username or password!");
  }
}

// Make adminLogout globally available
function adminLogout() {
  localStorage.removeItem("adminLoggedIn");
  window.location.href = "index.html";
}

// Protect admin-console.html
if (window.location.pathname.endsWith("admin-console.html") && localStorage.getItem("adminLoggedIn") !== "true") {
  window.location.href = "admin.html";
}

// Global variables
let allBookings = [];
let filteredBookings = [];
let customers = [];
let hall1Bookings = [];
let hall2Bookings = [];

// Initialize admin panel
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Admin panel loading...');
  
  if (window.location.pathname.endsWith('admin-console.html')) {
    await loadDashboardData();
    await loadCustomers();
    setupEventListeners();
    setDefaultDates();
    initializeAdminConsole();
  }
});

// Load dashboard data
async function loadDashboardData() {
  try {
    const response = await fetch('/api/bookings');
    if (response.ok) {
      allBookings = await response.json();
      filteredBookings = [...allBookings];
      
      // Filter bookings by hall for calendars
      hall1Bookings = allBookings.filter(booking => booking.hall === 'Maha Lingeshwara');
      hall2Bookings = allBookings.filter(booking => booking.hall === 'Maha Nandeshwara');
      
      updateDashboardStats();
      renderUpcomingBookings(allBookings);
      renderAllBookingsTable(allBookings);
      
      console.log(`Loaded ${allBookings.length} bookings`);
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showNotification('Error loading data', 'error');
  }
}

// Load customers for tally dropdown
async function loadCustomers() {
  try {
    const uniqueCustomers = [...new Map(allBookings.map(booking => 
      [booking.name, { name: booking.name, mobile: booking.mobile }]
    )).values()];
    
    customers = uniqueCustomers.sort((a, b) => a.name.localeCompare(b.name));
    
    const customerSelect = document.getElementById('customerSelect');
    if (customerSelect) {
      customerSelect.innerHTML = '<option value="">All Customers</option>';
      
      customers.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.name;
        option.textContent = `${customer.name} (${customer.mobile})`;
        customerSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Error loading customers:', error);
  }
}

// Update dashboard statistics
function updateDashboardStats() {
  const totalBookings = allBookings.length;
  const totalRevenue = allBookings
    .filter(b => b.status === 'booked')
    .reduce((sum, b) => sum + (b.advance || 0), 0);
  
  const today = new Date().toISOString().split('T')[0];
  const todayBookings = allBookings.filter(b => b.date === today).length;
  
  // Update elements if they exist
  const totalBookingsEl = document.getElementById('totalBookings');
  const totalRevenueEl = document.getElementById('totalRevenue');
  const todayBookingsEl = document.getElementById('todayBookings');
  const upcomingBookingsEl = document.getElementById('upcomingBookings');
  
  if (totalBookingsEl) totalBookingsEl.textContent = totalBookings;
  if (totalRevenueEl) totalRevenueEl.textContent = `₹${totalRevenue.toLocaleString()}`;
  if (todayBookingsEl) todayBookingsEl.textContent = todayBookings;
  
  // Calculate upcoming bookings (non-cancelled)
  const upcomingBookings = allBookings.filter(booking => 
    booking.date >= today && booking.status !== 'cancelled'
  ).length;
  if (upcomingBookingsEl) upcomingBookingsEl.textContent = upcomingBookings;
}

// Render upcoming bookings (exclude cancelled)
function renderUpcomingBookings(bookings) {
  const today = new Date().toISOString().split('T')[0];
  
  const upcomingBookings = bookings
    .filter(booking => booking.date >= today && booking.status !== 'cancelled')
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  
  const list = document.getElementById('upcomingBookingsList');
  const countEl = document.getElementById('upcomingCount');
  
  if (countEl) {
    countEl.textContent = upcomingBookings.length;
  }
  
  if (!list) return;
  
  list.innerHTML = '';
  
  if (upcomingBookings.length === 0) {
    list.innerHTML = '<li style="color: #666; font-style: italic; text-align: center; padding: 20px;">No upcoming bookings found.</li>';
    return;
  }
  
  upcomingBookings.forEach(booking => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="upcoming-date">
        ${formatDate(booking.date)}
      </div>
      <div class="upcoming-details">
        <div class="upcoming-customer">${booking.name}</div>
        <div class="upcoming-hall">${booking.hall}</div>
        <div class="upcoming-mobile">📱 ${booking.mobile}</div>
        <div class="upcoming-advance">💰 ₹${(booking.advance || 0).toLocaleString('en-IN')}</div>
      </div>
    `;
    list.appendChild(li);
  });
}

// Render all bookings table
function renderAllBookingsTable(bookings) {
  const tableContainer = document.querySelector('.table-container');
  const existingTable = document.getElementById('allBookingsTable');
  
  if (existingTable) {
    // If we have the new table structure, use renderBookingsTable
    renderBookingsTable();
    return;
  }
  
  // Otherwise use the original table structure
  const table = document.getElementById('allBookingsTable') || 
               document.querySelector('table'); // Fallback to any table
  
  if (!table) {
    console.error('Could not find bookings table');
    return;
  }

  if (bookings.length === 0) {
    table.innerHTML = `
      <tr>
        <th>Hall</th>
        <th>Customer Name</th>
        <th>Mobile</th>
        <th>Date</th>
        <th>Advance</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
      <tr>
        <td colspan="7" style="text-align: center; color: #666;">No bookings found</td>
      </tr>
    `;
    return;
  }

  const sortedBookings = bookings.sort((a, b) => new Date(b.date) - new Date(a.date));

  table.innerHTML = `
    <tr>
      <th>Hall</th>
      <th>Customer Name</th>
      <th>Mobile</th>
      <th>Date</th>
      <th>Advance</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>
    ${sortedBookings.map(booking => {
      const hall = booking.hall || 'Unknown Hall';
      const name = booking.name || 'Unknown Customer';
      const mobile = booking.mobile || 'N/A';
      const date = booking.date || 'Unknown Date';
      const advance = booking.advance || 0;
      const status = booking.status || 'booked';
      const bookingId = booking.id || 0;
      
      return `
        <tr>
          <td>${hall}</td>
          <td>${name}</td>
          <td>${mobile}</td>
          <td>${date}</td>
          <td>₹${advance}</td>
          <td><span class="status-badge ${status}">${status.toUpperCase()}</span></td>
          <td>
            <div style="display: flex; gap: 5px; flex-wrap: wrap;">
              ${status !== 'cancelled' 
                ? `
                  <button onclick="editBooking(${bookingId}, '${name}', '${mobile}', ${advance}, '${hall}', '${date}')" 
                     class="edit-btn-small">Edit</button>
                  <button onclick="cancelBooking(${bookingId}, '${date}', '${hall}', '${name}')" 
                     class="cancel-btn-small">Cancel</button>
                  `
                : '<span style="color: #f57c00;">Cancelled</span>'
              }
              <button onclick="deleteBooking(${bookingId}, '${date}', '${hall}', '${name}')" 
                 class="delete-btn-small">Delete</button>
            </div>
          </td>
        </tr>
      `;
    }).join('')}
  `;
}

// New table rendering for the enhanced admin console
function renderBookingsTable() {
  const tbody = document.querySelector('#allBookingsTable tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  filteredBookings.forEach((booking, index) => {
    const row = document.createElement('tr');
    const createdDate = new Date(booking.createdAt || booking.date).toLocaleDateString();
    
    row.innerHTML = `
      <td>${booking.id || index + 1}</td>
      <td><strong>${booking.hall}</strong></td>
      <td>${booking.name}</td>
      <td>${booking.mobile}</td>
      <td>${formatDate(booking.date)}</td>
      <td>₹${(booking.advance || 0).toLocaleString()}</td>
      <td><span class="status-badge status-${booking.status}">${booking.status}</span></td>
      <td>${createdDate}</td>
      <td>
        <div class="action-btns">
          <button class="btn-edit" onclick="editBooking(
            ${booking.id || index},
            '${booking.name.replace(/'/g, "\\'")}',
            '${booking.mobile ? booking.mobile.replace(/'/g, "\\'") : ''}',
            ${booking.advance || 0},
            '${booking.hall.replace(/'/g, "\\'")}',
            '${booking.date}'
          )">Edit</button>
          <button class="btn-delete" onclick="deleteBooking(${booking.id || index})">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Setup calendars for both halls
function setupCalendar(monthId, yearId, bodyId, prevBtnId, nextBtnId, bookingsArr, hallName) {
  const calendarMonth = document.getElementById(monthId);
  const calendarYear = document.getElementById(yearId);
  const calendarBody = document.getElementById(bodyId);
  const prevBtn = document.getElementById(prevBtnId);
  const nextBtn = document.getElementById(nextBtnId);

  if (!calendarMonth || !calendarYear || !calendarBody) {
    console.log(`Calendar elements not found for ${hallName}`);
    return;
  }

  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();

  function populateYearMonthSelectors() {
    if (calendarMonth.children.length === 0) {
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = month;
        calendarMonth.appendChild(option);
      });
    }

    if (calendarYear.children.length === 0) {
      for (let year = 2024; year <= 2030; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        calendarYear.appendChild(option);
      }
    }

    calendarMonth.value = currentMonth;
    calendarYear.value = currentYear;
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
          cell.innerHTML = '';
        } else {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
          
          const activeBooking = bookingsArr.find(b => {
            const status = b.status || 'booked';
            return b.date === dateStr && status !== 'cancelled';
          });
          
          if (activeBooking) {
            const customerName = activeBooking.name || 'Unknown';
            cell.innerHTML = `${date} <span style="color:green;">✔️</span><br><small style="font-size:10px;">${customerName}</small>`;
            cell.style.cssText = 'background-color: #e8f5e8; color: #2e7d32; cursor: pointer; padding: 8px; text-align: center; border: 1px solid #ddd;';
            cell.title = `Click to edit booking for ${customerName}`;
            
            cell.addEventListener('click', () => {
              editBooking(
                activeBooking.id || 0, 
                activeBooking.name || '', 
                activeBooking.mobile || '', 
                activeBooking.advance || 0, 
                activeBooking.hall || hallName, 
                activeBooking.date || dateStr
              );
            });
            cell.classList.add('booked');
          } else {
            cell.innerHTML = date;
            cell.style.cssText = 'background-color: #f5f5f5; color: #333; cursor: default; padding: 8px; text-align: center; border: 1px solid #ddd;';
          }
          date++;
        }
        row.appendChild(cell);
      }
      calendarBody.appendChild(row);
      if (date > daysInMonth) break;
    }
  }

  populateYearMonthSelectors();
  renderCalendar(currentMonth, currentYear);

  // Event listeners
  calendarMonth?.addEventListener('change', () => {
    currentMonth = parseInt(calendarMonth.value);
    renderCalendar(currentMonth, currentYear);
  });

  calendarYear?.addEventListener('change', () => {
    currentYear = parseInt(calendarYear.value);
    renderCalendar(currentMonth, currentYear);
  });

  prevBtn?.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    calendarMonth.value = currentMonth;
    calendarYear.value = currentYear;
    renderCalendar(currentMonth, currentYear);
  });

  nextBtn?.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    calendarMonth.value = currentMonth;
    calendarYear.value = currentYear;
    renderCalendar(currentMonth, currentYear);
  });
}

// Initialize admin console
async function initializeAdminConsole() {
  console.log('Initializing admin console...');
  
  try {
    // Setup calendars for both halls (only active bookings)
    if (document.getElementById('calendarBody1')) {
      setupCalendar('monthSelect1', 'yearSelect1', 'calendarBody1', 'prevMonth1', 'nextMonth1', hall1Bookings, 'Maha Lingeshwara');
    }
    if (document.getElementById('calendarBody2')) {
      setupCalendar('monthSelect2', 'yearSelect2', 'calendarBody2', 'prevMonth2', 'nextMonth2', hall2Bookings, 'Maha Nandeshwara');
    }
    
    console.log('Admin console initialization complete!');
  } catch (error) {
    console.error('Error initializing admin console:', error);
  }
}

// Cancel booking function
async function cancelBooking(bookingId, bookingDate, hallName, customerName) {
  const confirmCancel = confirm(`Cancel booking for ${customerName} on ${bookingDate} at ${hallName}?`);
  if (!confirmCancel) return;

  try {
    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' })
    });

    if (res.ok) {
      alert('Booking cancelled successfully!');
      await loadDashboardData();
      await initializeAdminConsole();
    } else {
      const errorText = await res.text();
      alert(`Failed to cancel booking: ${errorText}`);
    }
  } catch (error) {
    console.error('Error cancelling booking:', error);
    alert(`Error cancelling booking: ${error.message}`);
  }
}

// Delete booking permanently
async function deleteBooking(bookingId, bookingDate, hallName, customerName) {
  const confirmDelete = confirm(`Permanently delete booking for ${customerName} on ${bookingDate} at ${hallName}?\n\nThis action cannot be undone!`);
  if (!confirmDelete) return;

  try {
    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: 'DELETE'
    });

    if (res.ok) {
      alert('Booking deleted successfully!');
      await loadDashboardData();
      await initializeAdminConsole();
    } else {
      const errorText = await res.text();
      alert(`Failed to delete booking: ${errorText}`);
    }
  } catch (error) {
    console.error('Error deleting booking:', error);
    alert(`Error deleting booking: ${error.message}`);
  }
}

// Edit booking function (creates modal)
async function editBooking(bookingId, currentName, currentMobile, currentAdvance, hallName, bookingDate) {
  // Remove any existing modal before creating a new one
  const oldModal = document.getElementById('editModal');
  if (oldModal) oldModal.remove();

  const modalHTML = `
    <div id="editModal" style="
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
      background: rgba(0,0,0,0.8); z-index: 3000; display: flex; 
      justify-content: center; align-items: center;
    ">
      <div style="
        background: white; padding: 30px; border-radius: 12px; 
        width: 400px; box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      ">
        <h3 style="margin: 0 0 20px 0; color: #2c3e50;">Edit Booking Details</h3>
        <p style="margin-bottom: 20px; color: #666;">
          <strong>Hall:</strong> ${hallName}<br>
          <strong>Date:</strong> ${bookingDate}
        </p>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Customer Name:</label>
          <input type="text" id="editName" value="${currentName ? String(currentName).replace(/"/g, '&quot;') : ''}" autocomplete="off" style="
            width: 100%; padding: 10px; border: 1px solid #ddd; 
            border-radius: 6px; box-sizing: border-box;
          ">
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Mobile Number:</label>
          <input type="tel" id="editMobile" value="${currentMobile ? String(currentMobile).replace(/"/g, '&quot;') : ''}" autocomplete="off" style="
            width: 100%; padding: 10px; border: 1px solid #ddd; 
            border-radius: 6px; box-sizing: border-box;
          ">
        </div>
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Advance Amount (₹):</label>
          <input type="number" id="editAdvance" value="${currentAdvance || 0}" min="0" style="
            width: 100%; padding: 10px; border: 1px solid #ddd; 
            border-radius: 6px; box-sizing: border-box;
          ">
        </div>
        <div style="display: flex; gap: 10px; justify-content: center;">
          <button type="button" onclick="closeEditModal()" style="
            background: #6c757d; color: white; border: none; 
            padding: 10px 20px; border-radius: 6px; cursor: pointer;
          ">Cancel</button>
          <button type="button" onclick="saveBookingChanges(${bookingId})" style="
            background: #2c3e50; color: white; border: none; 
            padding: 10px 20px; border-radius: 6px; cursor: pointer;
          ">Save Changes</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Close edit modal
function closeEditModal() {
  const modal = document.getElementById('editModal');
  if (modal) modal.remove();
}

// Save booking changes
async function saveBookingChanges(bookingId) {
  const name = document.getElementById('editName').value.trim();
  const mobile = document.getElementById('editMobile').value.trim();
  const advance = document.getElementById('editAdvance').value;

  if (!name) {
    alert('Customer name is required!');
    return;
  }

  try {
    const res = await fetch(`http://localhost:3001/api/bookings/${bookingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name, 
        mobile, 
        advance: parseFloat(advance) || 0 
      })
    });

    if (res.ok) {
      alert('Booking updated successfully!');
      closeEditModal();
      await loadDashboardData();
      await initializeAdminConsole();
    } else {
      const errorText = await res.text();
      alert(`Failed to update booking: ${errorText}`);
    }
  } catch (error) {
    console.error('Error updating booking:', error);
    alert(`Error updating booking: ${error.message}`);
  }
}

// Setup event listeners
function setupEventListeners() {
  // Search functionality
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', filterBookings);
  }
  
  // Filter controls
  const hallFilter = document.getElementById('hallFilter');
  const statusFilter = document.getElementById('statusFilter');
  const dateFilter = document.getElementById('dateFilter');
  
  if (hallFilter) hallFilter.addEventListener('change', filterBookings);
  if (statusFilter) statusFilter.addEventListener('change', filterBookings);
  if (dateFilter) dateFilter.addEventListener('change', filterBookings);
  
  // Customer selection in tally
  const customerSelect = document.getElementById('customerSelect');
  if (customerSelect) {
    customerSelect.addEventListener('change', function() {
      const selectedCustomer = customers.find(c => c.name === this.value);
      if (selectedCustomer) {
        console.log('Selected customer:', selectedCustomer);
      }
    });
  }
}

// Set default dates for tally
function setDefaultDates() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const tallyFromDate = document.getElementById('tallyFromDate');
  const tallyToDate = document.getElementById('tallyToDate');
  
  if (tallyFromDate) tallyFromDate.value = firstDay.toISOString().split('T')[0];
  if (tallyToDate) tallyToDate.value = today.toISOString().split('T')[0];
}

// Filter bookings
function filterBookings() {
  const searchInput = document.getElementById('searchInput');
  const hallFilter = document.getElementById('hallFilter');
  const statusFilter = document.getElementById('statusFilter');
  const dateFilter = document.getElementById('dateFilter');
  
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
  const hallFilterValue = hallFilter ? hallFilter.value : 'all';
  const statusFilterValue = statusFilter ? statusFilter.value : 'all';
  const dateFilterValue = dateFilter ? dateFilter.value : '';
  
  filteredBookings = allBookings.filter(booking => {
    const matchesSearch = !searchTerm || 
      booking.name.toLowerCase().includes(searchTerm) ||
      booking.mobile.includes(searchTerm) ||
      booking.hall.toLowerCase().includes(searchTerm);
    
    const matchesHall = hallFilterValue === 'all' || booking.hall === hallFilterValue;
    const matchesStatus = statusFilterValue === 'all' || booking.status === statusFilterValue;
    const matchesDate = !dateFilterValue || booking.date === dateFilterValue;
    
    return matchesSearch && matchesHall && matchesStatus && matchesDate;
  });
  
  renderBookingsTable();
}

// Tally Modal Functions
function openTallyModal() {
  const tallyModal = document.getElementById('tallyModal');
  if (tallyModal) {
    tallyModal.classList.add('show');
    const tallyResults = document.getElementById('tallyResults');
    if (tallyResults) tallyResults.style.display = 'none';
  }
}

function closeTallyModal() {
  const tallyModal = document.getElementById('tallyModal');
  if (tallyModal) {
    tallyModal.classList.remove('show');
  }
}

function calculateTally() {
  const tallyHall = document.getElementById('tallyHall');
  const tallyFromDate = document.getElementById('tallyFromDate');
  const tallyToDate = document.getElementById('tallyToDate');
  const customerSelect = document.getElementById('customerSelect');
  
  if (!tallyFromDate || !tallyToDate) {
    showNotification('Please select both from and to dates', 'error');
    return;
  }
  
  const hall = tallyHall ? tallyHall.value : 'all';
  const fromDate = tallyFromDate.value;
  const toDate = tallyToDate.value;
  const customer = customerSelect ? customerSelect.value : '';
  
  if (!fromDate || !toDate) {
    showNotification('Please select both from and to dates', 'error');
    return;
  }
  
  let tallyData = allBookings.filter(booking => {
    const bookingDate = booking.date;
    const matchesHall = hall === 'all' || booking.hall === hall;
    const matchesCustomer = !customer || booking.name === customer;
    const matchesDateRange = bookingDate >= fromDate && bookingDate <= toDate;
    const isBooked = booking.status === 'booked';
    
    return matchesHall && matchesCustomer && matchesDateRange && isBooked;
  });
  
  displayTallyResults(tallyData);
}

function displayTallyResults(data) {
  const totalBookings = data.length;
  const totalAdvance = data.reduce((sum, booking) => sum + (booking.advance || 0), 0);
  const avgAdvance = totalBookings > 0 ? totalAdvance / totalBookings : 0;
  
  const tallyTotalBookings = document.getElementById('tallyTotalBookings');
  const tallyTotalAdvance = document.getElementById('tallyTotalAdvance');
  const tallyAvgAdvance = document.getElementById('tallyAvgAdvance');
  
  if (tallyTotalBookings) tallyTotalBookings.textContent = totalBookings;
  if (tallyTotalAdvance) tallyTotalAdvance.textContent = `₹${totalAdvance.toLocaleString()}`;
  if (tallyAvgAdvance) tallyAvgAdvance.textContent = `₹${Math.round(avgAdvance).toLocaleString()}`;
  
  const tbody = document.getElementById('tallyTableBody');
  if (tbody) {
    tbody.innerHTML = '';
    
    data.forEach(booking => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${booking.name}</td>
        <td>${booking.mobile}</td>
        <td>${booking.hall}</td>
        <td>${formatDate(booking.date)}</td>
        <td>₹${(booking.advance || 0).toLocaleString()}</td>
      `;
      tbody.appendChild(row);
    });
  }
  
  const tallyResults = document.getElementById('tallyResults');
  if (tallyResults) tallyResults.style.display = 'block';
  
  window.currentTallyData = data; // Store for export
}

// Print functions with working implementation
function printTallyReport() {
  const tallyData = window.currentTallyData || [];
  if (tallyData.length === 0) {
    alert('No data to print. Please calculate tally first.');
    return;
  }

  const printWindow = window.open('', '_blank');
  const fromDate = document.getElementById('tallyFromDate').value;
  const toDate = document.getElementById('tallyToDate').value;
  const hall = document.getElementById('tallyHall').value;
  const customer = document.getElementById('customerSelect').value;
  
  const totalAdvance = tallyData.reduce((sum, booking) => sum + (booking.advance || 0), 0);
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Tally Report - ${fromDate} to ${toDate}</title>
      <style>
        body { 
          font-family: 'Arial', sans-serif; 
          margin: 20px; 
          color: #333; 
          line-height: 1.6;
        }
        .header { 
          text-align: center; 
          margin-bottom: 30px; 
          border-bottom: 3px solid #d4a017; 
          padding-bottom: 20px; 
        }
        .header h1 { 
          color: #d4a017; 
          margin: 0; 
          font-size: 2.2rem; 
          font-weight: bold;
        }
        .header p { 
          margin: 8px 0; 
          color: #666; 
          font-size: 16px;
        }
        .filters { 
          background: #f8f9fa; 
          padding: 20px; 
          border-radius: 8px; 
          margin-bottom: 25px;
          border: 1px solid #e9ecef;
        }
        .filters h3 { 
          margin-top: 0; 
          color: #2c3e50; 
          border-bottom: 1px solid #d4a017;
          padding-bottom: 10px;
        }
        .filter-item {
          margin-bottom: 8px;
          display: flex;
          align-items: center;
        }
        .filter-item strong {
          min-width: 120px;
          color: #2c3e50;
        }
        .summary { 
          display: flex; 
          gap: 20px; 
          margin-bottom: 30px; 
        }
        .summary-card { 
          flex: 1; 
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); 
          padding: 20px; 
          border-radius: 10px; 
          text-align: center; 
          border: 2px solid #e9ecef;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .summary-card h4 { 
          margin: 0 0 10px 0; 
          color: #6c757d; 
          font-size: 14px; 
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .summary-card .value { 
          font-size: 1.8rem; 
          font-weight: bold; 
          color: #d4a017; 
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-top: 20px; 
          font-size: 14px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        th, td { 
          padding: 12px 8px; 
          text-align: left; 
          border: 1px solid #ddd; 
        }
        th { 
          background: linear-gradient(135deg, #d4a017 0%, #b8860b 100%); 
          color: white; 
          font-weight: bold; 
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-size: 12px;
        }
        tr:nth-child(even) { 
          background-color: #f9f9f9; 
        }
        tr:hover {
          background-color: #f5f5f5;
        }
        .total-row { 
          font-weight: bold; 
          background: linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%) !important; 
          border-top: 2px solid #28a745;
        }
        .total-row td {
          font-size: 16px;
          color: #155724;
        }
        .footer { 
          margin-top: 40px; 
          text-align: center; 
          color: #666; 
          font-size: 12px; 
          border-top: 1px solid #e9ecef;
          padding-top: 20px;
        }
        .logo {
          margin-bottom: 10px;
          font-size: 2rem;
        }
        @media print {
          body { margin: 15px; }
          .summary { flex-direction: column; }
          .summary-card { margin-bottom: 15px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">🏛️</div>
        <h1>Maha Lingeshwara & Nandeshwara</h1>
        <p><strong>Banquet Halls - Tally Calculation Report</strong></p>
        <p>Generated on: ${new Date().toLocaleDateString('en-IN', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
      </div>
      
      <div class="filters">
        <h3>📊 Report Parameters</h3>
        <div class="filter-item">
          <strong>Period:</strong> 
          <span>${formatDateForPrint(fromDate)} to ${formatDateForPrint(toDate)}</span>
        </div>
        <div class="filter-item">
          <strong>Hall:</strong> 
          <span>${hall === 'all' ? 'All Halls' : hall}</span>
        </div>
        <div class="filter-item">
          <strong>Customer:</strong> 
          <span>${customer || 'All Customers'}</span>
        </div>
        <div class="filter-item">
          <strong>Total Days:</strong> 
          <span>${Math.ceil((new Date(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24)) + 1} days</span>
        </div>
      </div>
      
      <div class="summary">
        <div class="summary-card">
          <h4>Total Bookings</h4>
          <div class="value">${tallyData.length}</div>
        </div>
        <div class="summary-card">
          <h4>Total Advance Collected</h4>
          <div class="value">₹${totalAdvance.toLocaleString('en-IN')}</div>
        </div>
        <div class="summary-card">
          <h4>Average Advance</h4>
          <div class="value">₹${tallyData.length > 0 ? Math.round(totalAdvance / tallyData.length).toLocaleString('en-IN') : '0'}</div>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Sr. No.</th>
            <th>Customer Name</th>
            <th>Mobile Number</th>
            <th>Hall Booked</th>
            <th>Event Date</th>
            <th>Advance Amount</th>
          </tr>
        </thead>
        <tbody>
          ${tallyData.map((booking, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${booking.name}</td>
              <td>${booking.mobile}</td>
              <td>${booking.hall}</td>
              <td>${formatDateForPrint(booking.date)}</td>
              <td>₹${(booking.advance || 0).toLocaleString('en-IN')}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="5" style="text-align: right; font-weight: bold;">
              <strong>GRAND TOTAL:</strong>
            </td>
            <td style="font-weight: bold; font-size: 18px;">
              <strong>₹${totalAdvance.toLocaleString('en-IN')}</strong>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div class="footer">
        <p><strong>This is a computer-generated report from Hall Booking Management System</strong></p>
        <p>© 2025 Maha Lingeshwara & Nandeshwara Banquet Halls. All rights reserved.</p>
        <p>Report generated by: Admin | Time: ${new Date().toLocaleTimeString('en-IN')}</p>
      </div>
    </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
}

function printAllBookings() {
  const printWindow = window.open('', '_blank');
  const totalRevenue = filteredBookings
    .filter(b => b.status === 'booked')
    .reduce((sum, b) => sum + (b.advance || 0), 0);
  
  const bookedCount = filteredBookings.filter(b => b.status === 'booked').length;
  const cancelledCount = filteredBookings.filter(b => b.status === 'cancelled').length;
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Complete Bookings Report</title>
      <style>
        body { 
          font-family: 'Arial', sans-serif; 
          margin: 20px; 
          color: #333; 
          line-height: 1.6;
        }
        .header { 
          text-align: center; 
          margin-bottom: 30px; 
          border-bottom: 3px solid #d4a017; 
          padding-bottom: 20px; 
        }
        .header h1 { 
          color: #d4a017; 
          margin: 0; 
          font-size: 2.2rem; 
          font-weight: bold;
        }
        .header p { 
          margin: 8px 0; 
          color: #666; 
          font-size: 16px;
        }
        .summary { 
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); 
          padding: 20px; 
          border-radius: 10px; 
          margin-bottom: 25px; 
          text-align: center;
          border: 2px solid #e9ecef;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .summary h3 {
          color: #2c3e50;
          margin-top: 0;
          border-bottom: 1px solid #d4a017;
          padding-bottom: 10px;
        }
        .summary-stats {
          display: flex;
          justify-content: space-around;
          flex-wrap: wrap;
          gap: 20px;
        }
        .stat-item {
          text-align: center;
        }
        .stat-item .number {
          font-size: 1.8rem;
          font-weight: bold;
          color: #d4a017;
          display: block;
        }
        .stat-item .label {
          color: #6c757d;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-top: 20px; 
          font-size: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        th, td { 
          padding: 10px 6px; 
          text-align: left; 
          border: 1px solid #ddd; 
        }
        th { 
          background: linear-gradient(135deg, #d4a017 0%, #b8860b 100%); 
          color: white; 
          font-weight: bold; 
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-size: 11px;
        }
        tr:nth-child(even) { 
          background-color: #f9f9f9; 
        }
        .status-booked { 
          background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); 
          color: #155724; 
          padding: 4px 8px; 
          border-radius: 4px; 
          font-size: 10px; 
          font-weight: bold;
          text-transform: uppercase;
        }
        .status-cancelled { 
          background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%); 
          color: #721c24; 
          padding: 4px 8px; 
          border-radius: 4px; 
          font-size: 10px; 
          font-weight: bold;
          text-transform: uppercase;
        }
        .footer { 
          margin-top: 40px; 
          text-align: center; 
          color: #666; 
          font-size: 12px; 
          border-top: 1px solid #e9ecef;
          padding-top: 20px;
        }
        .logo {
          margin-bottom: 10px;
          font-size: 2rem;
        }
        @media print {
          body { margin: 10px; }
          table { font-size: 10px; }
          th, td { padding: 6px 4px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">🏛️</div>
        <h1>Maha Lingeshwara & Nandeshwara</h1>
        <p><strong>Banquet Halls - Complete Bookings Report</strong></p>
        <p>Generated on: ${new Date().toLocaleDateString('en-IN', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
      </div>
      
      <div class="summary">
        <h3>📊 Summary Statistics</h3>
        <div class="summary-stats">
          <div class="stat-item">
            <span class="number">${filteredBookings.length}</span>
            <span class="label">Total Bookings</span>
          </div>
          <div class="stat-item">
            <span class="number">₹${totalRevenue.toLocaleString('en-IN')}</span>
            <span class="label">Total Revenue</span>
          </div>
          <div class="stat-item">
            <span class="number">${bookedCount}</span>
            <span class="label">Active Bookings</span>
          </div>
          <div class="stat-item">
            <span class="number">${cancelledCount}</span>
            <span class="label">Cancelled</span>
          </div>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Hall</th>
            <th>Customer Name</th>
            <th>Mobile</th>
            <th>Event Date</th>
            <th>Advance</th>
            <th>Status</th>
            <th>Booking Date</th>
          </tr>
        </thead>
        <tbody>
          ${filteredBookings.map((booking, index) => `
            <tr>
              <td>${booking.id || index + 1}</td>
              <td><strong>${booking.hall}</strong></td>
              <td>${booking.name}</td>
              <td>${booking.mobile}</td>
              <td>${formatDateForPrint(booking.date)}</td>
              <td>₹${(booking.advance || 0).toLocaleString('en-IN')}</td>
              <td><span class="status-${booking.status}">${booking.status.toUpperCase()}</span></td>
              <td>${new Date(booking.createdAt || booking.date).toLocaleDateString('en-IN')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <p><strong>This is a computer-generated report from Hall Booking Management System</strong></p>
        <p>© 2025 Maha Lingeshwara & Nandeshwara Banquet Halls. All rights reserved.</p>
        <p>Report generated by: Admin | Time: ${new Date().toLocaleTimeString('en-IN')} | Total Records: ${filteredBookings.length}</p>
      </div>
    </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
}

// CSV Export functions with working implementation
function exportTallyCSV() {
  const tallyData = window.currentTallyData || [];
  if (tallyData.length === 0) {
    alert('No data to export. Please calculate tally first.');
    return;
  }

  const fromDate = document.getElementById('tallyFromDate').value;
  const toDate = document.getElementById('tallyToDate').value;
  const hall = document.getElementById('tallyHall').value;
  const customer = document.getElementById('customerSelect').value;
  
  let csv = '\uFEFF'; // UTF-8 BOM for proper Excel encoding
  csv += 'Maha Lingeshwara & Nandeshwara - Tally Calculation Report\n';
  csv += `Generated on: ${new Date().toLocaleDateString('en-IN')}\n`;
  csv += `Period: ${formatDateForPrint(fromDate)} to ${formatDateForPrint(toDate)}\n`;
  csv += `Hall Filter: ${hall === 'all' ? 'All Halls' : hall}\n`;
  csv += `Customer Filter: ${customer || 'All Customers'}\n`;
  csv += `Total Records: ${tallyData.length}\n\n`;
  
  csv += 'Sr. No.,Customer Name,Mobile Number,Hall Booked,Event Date,Advance Amount\n';
  
  tallyData.forEach((booking, index) => {
    csv += `${index + 1},"${booking.name}","${booking.mobile}","${booking.hall}","${formatDateForPrint(booking.date)}","₹${(booking.advance || 0).toLocaleString('en-IN')}"\n`;
  });
  
  const totalAdvance = tallyData.reduce((sum, booking) => sum + (booking.advance || 0), 0);
  csv += `\n,,,,GRAND TOTAL:,"₹${totalAdvance.toLocaleString('en-IN')}"\n`;
  csv += `\nReport Statistics:\n`;
  csv += `Total Bookings,${tallyData.length}\n`;
  csv += `Total Advance,₹${totalAdvance.toLocaleString('en-IN')}\n`;
  csv += `Average Advance,₹${tallyData.length > 0 ? Math.round(totalAdvance / tallyData.length).toLocaleString('en-IN') : '0'}\n`;
  
  downloadCSV(csv, `tally-report-${fromDate}-to-${toDate}.csv`);
}

function exportToCSV() {
  let csv = '\uFEFF'; // UTF-8 BOM for proper Excel encoding
  csv += 'Maha Lingeshwara & Nandeshwara - Complete Bookings Report\n';
  csv += `Generated on: ${new Date().toLocaleDateString('en-IN')}\n`;
  csv += `Total Records: ${filteredBookings.length}\n\n`;
  
  csv += 'ID,Hall,Customer Name,Mobile,Event Date,Advance Amount,Status,Booking Date\n';
  
  filteredBookings.forEach((booking, index) => {
    csv += `${booking.id || index + 1},"${booking.hall}","${booking.name}","${booking.mobile}","${formatDateForPrint(booking.date)}","₹${(booking.advance || 0).toLocaleString('en-IN')}","${booking.status.toUpperCase()}","${new Date(booking.createdAt || booking.date).toLocaleDateString('en-IN')}"\n`;
  });
  
  const totalRevenue = filteredBookings
    .filter(b => b.status === 'booked')
    .reduce((sum, b) => sum + (b.advance || 0), 0);
  
  csv += `\nSummary Statistics:\n`;
  csv += `Total Bookings,${filteredBookings.length}\n`;
  csv += `Active Bookings,${filteredBookings.filter(b => b.status === 'booked').length}\n`;
  csv += `Cancelled Bookings,${filteredBookings.filter(b => b.status === 'cancelled').length}\n`;
  csv += `Total Revenue,₹${totalRevenue.toLocaleString('en-IN')}\n`;
  
  downloadCSV(csv, `all-bookings-${new Date().toISOString().split('T')[0]}.csv`);
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  showNotification(`CSV exported successfully: ${filename}`, 'success');
}

// Helper function for date formatting in prints
function formatDateForPrint(dateString) {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

// Update the renderUpcomingBookings function to show count
function renderUpcomingBookings(bookings) {
  const today = new Date().toISOString().split('T')[0];
  
  const upcomingBookings = bookings
    .filter(booking => booking.date >= today && booking.status !== 'cancelled')
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  
  const list = document.getElementById('upcomingBookingsList');
  const countEl = document.getElementById('upcomingCount');
  
  if (countEl) {
    countEl.textContent = upcomingBookings.length;
  }
  
  if (!list) return;
  
  list.innerHTML = '';
  
  if (upcomingBookings.length === 0) {
    list.innerHTML = '<li style="color: #666; font-style: italic; text-align: center; padding: 20px;">No upcoming bookings found.</li>';
    return;
  }
  
  upcomingBookings.forEach(booking => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="upcoming-date">
        ${formatDate(booking.date)}
      </div>
      <div class="upcoming-details">
        <div class="upcoming-customer">${booking.name}</div>
        <div class="upcoming-hall">${booking.hall}</div>
        <div class="upcoming-mobile">📱 ${booking.mobile}</div>
        <div class="upcoming-advance">💰 ₹${(booking.advance || 0).toLocaleString('en-IN')}</div>
      </div>
    `;
    list.appendChild(li);
  });
}

// Missing utility functions
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short', 
    year: 'numeric'
  });
}

function showNotification(message, type = 'info') {
  // Create a simple notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 5px;
    color: white;
    font-weight: bold;
    z-index: 9999;
    max-width: 300px;
    ${type === 'error' ? 'background: #dc3545;' : 'background: #28a745;'}
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

// Refresh data function
async function refreshData() {
  try {
    showNotification('Refreshing data...', 'info');
    await loadDashboardData();
    await loadCustomers();
    await initializeAdminConsole();
    showNotification('Data refreshed successfully!', 'success');
  } catch (error) {
    console.error('Error refreshing data:', error);
    showNotification('Error refreshing data', 'error');
  }
}

// When customer is selected, fill mobile and advance
document.addEventListener('DOMContentLoaded', () => {
  const customerSelect = document.getElementById('customerSelect');
  if (customerSelect) {
    customerSelect.addEventListener('change', function() {
      const name = this.value;
      const booking = allBookings.find(b => b.name === name && b.status === 'booked');
      document.getElementById('tallyMobile').value = booking ? booking.mobile : '';
      document.getElementById('tallyAdvance').value = booking ? booking.advance : '';
    });
  }
});

function calculateCustomerBill() {
  const advance = parseFloat(document.getElementById('tallyAdvance').value) || 0;
  const lights = parseFloat(document.getElementById('tallyLights').value) || 0;
  const remaining = parseFloat(document.getElementById('tallyRemaining').value) || 0;
  const total = advance + lights + remaining;
  document.getElementById('customerBillResult').textContent = `Total Bill: ₹${total.toLocaleString('en-IN')}`;
  document.getElementById('printCustomerBillBtn').style.display = 'inline-block';
}

function printCustomerBill() {
  const name = document.getElementById('customerSelect').value;
  const mobile = document.getElementById('tallyMobile').value;
  const advance = parseFloat(document.getElementById('tallyAdvance').value) || 0;
  const lights = parseFloat(document.getElementById('tallyLights').value) || 0;
  const remaining = parseFloat(document.getElementById('tallyRemaining').value) || 0;
  const total = advance + lights + remaining;

  // Try to get the hall name from the booking
  const booking = allBookings.find(b => b.name === name && b.mobile === mobile && b.status === 'booked');
  const hall = booking ? booking.hall : '________________';
  const eventDate = booking ? formatDateForPrint(booking.date) : formatDateForPrint(new Date());

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
    <head>
      <title>Customer Bill</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; }
        .header { text-align: center; border-bottom: 2px solid #d4a017; margin-bottom: 20px; }
        .header h1 { color: #d4a017; margin: 0; font-size: 2rem; font-weight: bold; }
        .header h2 { color: #333; margin: 0; font-size: 1.2rem; }
        .header .hall { font-size: 1.1rem; color: #b8860b; margin-top: 8px; }
        .header .date { color: #666; margin-top: 4px; font-size: 1rem; }
        .bill-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .bill-table th, .bill-table td { border: 1px solid #ddd; padding: 10px; }
        .bill-table th { background: #f5f5f5; }
        .total-row { font-weight: bold; }
        .footer { margin-top: 40px; text-align: center; color: #666; font-size: 13px; border-top: 1px solid #e9ecef; padding-top: 20px; }
        .signature { margin-top:40px;text-align:right; }
        .signature-line { margin-bottom: 5px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Maha Lingeshwara & Nandeshwara</h1>
        <h2>Banquet Halls</h2>
        <div class="hall"><strong>Hall:</strong> ${hall}</div>
        <div class="date"><strong>Date:</strong> ${eventDate}</div>
      </div>
      <p><strong>Customer Name:</strong> ${name}</p>
      <p><strong>Mobile:</strong> ${mobile}</p>
      <table class="bill-table">
        <tr><th>Description</th><th>Amount (₹)</th></tr>
        <tr><td>Advance</td><td>${advance.toLocaleString('en-IN')}</td></tr>
        <tr><td>Lights Cost</td><td>${lights.toLocaleString('en-IN')}</td></tr>
        <tr><td>Remaining</td><td>${remaining.toLocaleString('en-IN')}</td></tr>
        <tr class="total-row"><td>Total</td><td>₹${total.toLocaleString('en-IN')}</td></tr>
      </table>
      <div class="signature">
        <div class="signature-line">__________________________</div>
        <div style="font-size:0.95em;">Signature</div>
      </div>
      <div class="footer">
        <p>© 2025 Maha Lingeshwara & Nandeshwara Banquet Halls. All rights reserved.</p>
        <p>This is a computer-generated bill from Hall Booking Management System</p>
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
}