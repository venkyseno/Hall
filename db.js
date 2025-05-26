// db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'hall_booking.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables if they don't exist
db.serialize(() => {
  // Create bookings table with all required columns (IF NOT EXISTS)
  db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hall TEXT NOT NULL,
      name TEXT NOT NULL,
      mobile TEXT,
      date TEXT NOT NULL,
      advance REAL DEFAULT 0,
      status TEXT DEFAULT 'booked',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating bookings table:', err);
    } else {
      console.log('Bookings table ready!');
    }
  });
  
  // Create transactions table (IF NOT EXISTS)
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER,
      hall TEXT NOT NULL,
      name TEXT NOT NULL,
      mobile TEXT,
      date TEXT NOT NULL,
      advance REAL DEFAULT 0,
      status TEXT DEFAULT 'booked',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings (id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating transactions table:', err);
    } else {
      console.log('Transactions table ready!');
    }
  });
});

module.exports = db;
