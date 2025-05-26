const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors());

// Helper function to check if booking exists
const checkBookingExists = (id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM bookings WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Helper function to handle database errors
const handleDBError = (res, err, operation) => {
  console.error(`${operation} error:`, err);
  res.status(500).json({ error: `Database error during ${operation}` });
};

// Get all bookings
app.get('/api/bookings', (req, res) => {
  db.all('SELECT * FROM bookings ORDER BY date DESC', (err, rows) => {
    if (err) return handleDBError(res, err, 'fetch all bookings');
    console.log(`Fetched ${rows.length} bookings`);
    res.json(rows);
  });
});

// Get bookings for a specific hall
app.get('/api/bookings/:hall', (req, res) => {
  const hall = decodeURIComponent(req.params.hall);
  db.all('SELECT * FROM bookings WHERE hall = ? ORDER BY date DESC', [hall], (err, rows) => {
    if (err) return handleDBError(res, err, 'fetch hall bookings');
    console.log(`Fetched ${rows.length} bookings for ${hall}`);
    res.json(rows);
  });
});

// Add a new booking
app.post('/api/bookings', (req, res) => {
  const { hall, name, mobile, date, advance, status = 'booked' } = req.body;
  
  // Validation
  if (!hall || !name || !mobile || !date || !advance) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  db.run(
    'INSERT INTO bookings (hall, name, mobile, date, advance, status) VALUES (?, ?, ?, ?, ?, ?)',
    [hall, name, mobile, date, advance, status],
    function (err) {
      if (err) return handleDBError(res, err, 'create booking');
      
      // Add transaction record
      db.run(
        'INSERT INTO transactions (booking_id, hall, name, mobile, date, advance, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [this.lastID, hall, name, mobile, date, advance, status]
      );
      
      res.json({ id: this.lastID, message: 'Booking created successfully' });
    }
  );
});

// Update booking
app.put('/api/bookings/:id', async (req, res) => {
  const bookingId = req.params.id;
  const updates = req.body;
  
  try {
    const booking = await checkBookingExists(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    const fields = [];
    const values = [];
    
    Object.entries(updates).forEach(([key, value]) => {
      if (['status', 'name', 'mobile', 'advance'].includes(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    values.push(bookingId);
    
    db.run(`UPDATE bookings SET ${fields.join(', ')} WHERE id = ?`, values, function (err) {
      if (err) return handleDBError(res, err, 'update booking');
      
      // Update transaction record
      db.run(`UPDATE transactions SET ${fields.join(', ')} WHERE booking_id = ?`, values);
      
      res.json({ message: 'Booking updated successfully', changes: this.changes });
    });
    
  } catch (err) {
    handleDBError(res, err, 'update booking');
  }
});

// Delete booking
app.delete('/api/bookings/:id', async (req, res) => {
  const bookingId = req.params.id;
  
  try {
    const booking = await checkBookingExists(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    db.run('DELETE FROM bookings WHERE id = ?', [bookingId], function (err) {
      if (err) return handleDBError(res, err, 'delete booking');
      
      // Delete transaction record
      db.run('DELETE FROM transactions WHERE booking_id = ?', [bookingId]);
      
      res.json({ message: 'Booking deleted successfully', changes: this.changes });
    });
    
  } catch (err) {
    handleDBError(res, err, 'delete booking');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
