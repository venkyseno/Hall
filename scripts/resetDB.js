const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../hall_booking.db');

console.log('🔄 Resetting database...');

// Delete existing database file
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('🗑️  Old database deleted!');
}

// Create new database
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Create bookings table
  db.run(`
    CREATE TABLE bookings (
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
      console.error('❌ Error creating bookings table:', err);
    } else {
      console.log('✅ Bookings table created!');
    }
  });
  
  // Create transactions table
  db.run(`
    CREATE TABLE transactions (
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
      console.error('❌ Error creating transactions table:', err);
    } else {
      console.log('✅ Transactions table created!');
    }
    
    // Show final schema
    db.all("PRAGMA table_info(bookings)", (err, columns) => {
      if (err) {
        console.error('❌ Error checking table:', err);
      } else {
        console.log('\n📋 Bookings table schema:');
        columns.forEach(col => {
          console.log(`   - ${col.name}: ${col.type} ${col.notnull ? '(NOT NULL)' : '(nullable)'}`);
        });
      }
      
      db.close();
      console.log('\n🎉 Database reset complete! You can now start your server.');
    });
  });
});