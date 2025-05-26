// Sample data
const customers = [
  { 
    id: 1, 
    name: "Rahul Sharma", 
    mobile: "9876543210", 
    event: "Wedding", 
    date: "2023-12-15", 
    hall: "Wedding Hall", 
    basePrice: 50000 
  },
  { 
    id: 2, 
    name: "Priya Patel", 
    mobile: "8765432109", 
    event: "Corporate", 
    date: "2023-12-18", 
    hall: "Conference Hall", 
    basePrice: 30000 
  },
  { 
    id: 3, 
    name: "Amit Singh", 
    mobile: "7654321098", 
    event: "Wedding", 
    date: "2023-12-20", 
    hall: "Wedding Hall", 
    basePrice: 50000 
  },
  { 
    id: 4, 
    name: "Neha Gupta", 
    mobile: "6543210987", 
    event: "Birthday", 
    date: "2023-12-22", 
    hall: "Conference Hall", 
    basePrice: 20000 
  },
  { 
    id: 5, 
    name: "Vikram Joshi", 
    mobile: "5432109876", 
    event: "Wedding", 
    date: "2023-12-25", 
    hall: "Wedding Hall", 
    basePrice: 50000 
  }
];

// Initialize form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeCustomerDropdown();
  setupEventListeners();
});

// Populate customer dropdown
function initializeCustomerDropdown() {
  const customerSelect = document.getElementById('customerSelect');
  
  // Clear existing options except the first one
  while (customerSelect.options.length > 1) {
    customerSelect.remove(1);
  }
  
  // Add customer options
  customers.forEach(customer => {
    const option = document.createElement('option');
    option.value = customer.id;
    option.textContent = `${customer.name} (${customer.mobile}) - ${customer.event}`;
    customerSelect.appendChild(option);
  });
}

// Set up all event listeners
function setupEventListeners() {
  const customerSelect = document.getElementById('customerSelect');
  
  // Customer selection handler
  customerSelect.addEventListener('change', handleCustomerSelection);
  
  // Input change handlers
  document.getElementById('decoration').addEventListener('input', calculateTotal);
  document.getElementById('catering').addEventListener('input', calculateTotal);
  
  // Print bill handler
  document.getElementById('printBill').addEventListener('click', printBill);
}

// Handle customer selection
function handleCustomerSelection() {
  const customerId = this.value;
  const customer = customers.find(c => c.id == customerId);
  const detailsEl = document.getElementById('customerDetails');
  
  if (customer) {
    detailsEl.innerHTML = `
      <div class="customer-card">
        <h4>${customer.event} Event</h4>
        <p><strong>Date:</strong> ${customer.date}</p>
        <p><strong>Hall:</strong> ${customer.hall}</p>
        <p><strong>Base Price:</strong> ₹${customer.basePrice.toLocaleString()}</p>
      </div>
    `;
    calculateTotal();
  } else {
    detailsEl.innerHTML = '';
    document.getElementById('totalAmount').textContent = '₹0';
  }
}

// Calculate total amount
function calculateTotal() {
  const customerId = document.getElementById('customerSelect').value;
  const customer = customers.find(c => c.id == customerId);
  
  if (!customer) return;
  
  const decoration = parseInt(document.getElementById('decoration').value) || 0;
  const catering = parseInt(document.getElementById('catering').value) || 0;
  const total = customer.basePrice + decoration + catering;
  
  document.getElementById('totalAmount').textContent = `₹${total.toLocaleString()}`;
}

// Print bill function
function printBill() {
  const customerId = document.getElementById('customerSelect').value;
  const customer = customers.find(c => c.id == customerId);
  
  if (!customer) {
    alert('Please select a customer first');
    return;
  }
  
  const decoration = parseInt(document.getElementById('decoration').value) || 0;
  const catering = parseInt(document.getElementById('catering').value) || 0;
  const total = customer.basePrice + decoration + catering;
  
  // Create print window
  const printWindow = window.open('', '_blank');
  
  // Generate print content
  const printContent = generatePrintContent(customer, decoration, catering, total);
  
  // Write content to print window
  printWindow.document.open();
  printWindow.document.write(printContent);
  printWindow.document.close();
}

// Generate HTML content for printing
function generatePrintContent(customer, decoration, catering, total) {
  return `<!DOCTYPE html>
<html>
<head>
  <title>Invoice - ${customer.name}</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      padding: 30px; 
      line-height: 1.6;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #b8860b;
      padding-bottom: 20px;
    }
    h1 { 
      color: #b8860b; 
      margin: 0;
    }
    h2 {
      margin: 5px 0;
      color: #555;
    }
    .invoice-info {
      margin: 20px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 12px 15px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f5f5f5;
    }
    .total-row {
      font-weight: bold;
      font-size: 1.1em;
    }
    .signature {
      margin-top: 50px;
      float: right;
      text-align: center;
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      font-size: 0.9em;
      color: #777;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Royal Banquet</h1>
    <h2>Invoice</h2>
  </div>
  
  <div class="invoice-info">
    <p><strong>Customer:</strong> ${customer.name}</p>
    <p><strong>Mobile:</strong> ${customer.mobile}</p>
    <p><strong>Event Date:</strong> ${customer.date}</p>
    <p><strong>Event Type:</strong> ${customer.event}</p>
  </div>
  
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Amount (₹)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${customer.hall} Booking</td>
        <td>${customer.basePrice.toLocaleString()}</td>
      </tr>
      <tr>
        <td>Decoration Charges</td>
        <td>${decoration.toLocaleString()}</td>
      </tr>
      <tr>
        <td>Catering Charges</td>
        <td>${catering.toLocaleString()}</td>
      </tr>
      <tr class="total-row">
        <td>Total Amount</td>
        <td>₹${total.toLocaleString()}</td>
      </tr>
    </tbody>
  </table>
  
  <div class="signature">
    <p>Authorized Signature</p>
    <p>_________________________</p>
  </div>
  
  <div class="footer">
    <p>Thank you for choosing Royal Banquet</p>
    <p>Contact: info@royalbanquet.com | Phone: +91-9000000000</p>
  </div>
  
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
        window.close();
      }, 200);
    };
  </script>
</body>
</html>`;
}