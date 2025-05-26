let today = new Date();
let dateStr = today.toLocaleDateString();
let billNo = Math.floor(1000 + Math.random() * 9000); // Random 4-digit bill no
let phone = "9876543210"; // Change as needed

resultHtml = `
  <div class="bill-memo-header">
    <div class="memo-title">BILL / CASH MEMO</div>
    <div class="company-name">${banquetHall.name}</div>
    <div class="address">${banquetHall.address}</div>
    <div class="bill-meta">
      <span>Phone: ${phone}</span>
      <span>Bill No: ${billNo}</span>
      <span>Date: ${dateStr}</span>
    </div>
  </div>
  <div class="bill-memo-section">
    <strong>Service:</strong> ${serviceName}<br>
    <strong>Customer:</strong> ${name}<br>
    <strong>Number:</strong> ${number}
  </div>
  <table class="bill-memo-table">
    <tr>
      <th>Sl.No.</th>
      <th>Particulars</th>
      <th>Rate</th>
      <th>Amount (₹)</th>
    </tr>
    ${
      type === "1"
        ? `
      <tr><td>1</td><td>Advance</td><td>-</td><td>${(parseFloat(document.getElementById('advance').value) || 0).toFixed(2)}</td></tr>
      <tr><td>2</td><td>Remaining</td><td>-</td><td>${(parseFloat(document.getElementById('remaining').value) || 0).toFixed(2)}</td></tr>
      <tr><td>3</td><td>Lights Cost</td><td>-</td><td>${(parseFloat(document.getElementById('lights1').value) || 0).toFixed(2)}</td></tr>
      `
        : `
      <tr><td>1</td><td>Hall Price</td><td>-</td><td>${(parseFloat(document.getElementById('hallPrice').value) || 0).toFixed(2)}</td></tr>
      <tr><td>2</td><td>Decoration (20%)</td><td>-</td><td>${((parseFloat(document.getElementById('decoration').value) || 0) * 0.2).toFixed(2)}</td></tr>
      <tr><td>3</td><td>Lights Cost</td><td>-</td><td>${(parseFloat(document.getElementById('lights2').value) || 0).toFixed(2)}</td></tr>
      `
    }
  </table>
`;

if (type === "1") {
  const advance = parseFloat(document.getElementById('advance').value) || 0;
  const remaining = parseFloat(document.getElementById('remaining').value) || 0;
  const lights = parseFloat(document.getElementById('lights1').value) || 0;
  const total = advance + remaining + lights;
  resultHtml += `<div class="bill-memo-total">TOTAL AMOUNT: ₹${total.toFixed(2)}</div>`;
} else {
  const hall = parseFloat(document.getElementById('hallPrice').value) || 0;
  const deco = parseFloat(document.getElementById('decoration').value) || 0;
  const lights = parseFloat(document.getElementById('lights2').value) || 0;
  const deco20 = deco * 0.2;
  const total = hall + deco20 + lights;
  resultHtml += `<div class="bill-memo-total">GRAND TOTAL: ₹${total.toFixed(2)}</div>`;
}

resultHtml += `
  <div style="margin-bottom:32px;font-size:0.98em;">Terms and Conditions Apply</div>
  <div class="bill-memo-sign">
    <div class="bill-memo-sign-box">
      <div class="sign-line"></div>
      <div class="sign-label">Authorized Signatory</div>
    </div>
  </div>
`;