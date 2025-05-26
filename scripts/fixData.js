const db = require('./db');

console.log('Fixing null status values in database...');

// Update any null status values to 'booked'
db.run('UPDATE bookings SET status = ? WHERE status IS NULL OR status = ""', ['booked'], function(err) {
  if (err) {
    console.error('Error updating status:', err);
  } else {
    console.log(`Updated ${this.changes} booking(s) with null status`);
  }
  
  // Show all bookings with their status
  db.all('SELECT id, hall, name, date, status FROM bookings', (err, rows) => {
    if (err) {
      console.error('Error fetching bookings:', err);
    } else {
      console.log('\nAll bookings:');
      rows.forEach(row => {
        console.log(`ID: ${row.id}, Hall: ${row.hall}, Name: ${row.name}, Date: ${row.date}, Status: ${row.status || 'NULL'}`);
      });
    }
    
    db.close();
    console.log('\nData fix complete!');
  });
});