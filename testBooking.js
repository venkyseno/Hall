fetch('http://localhost:3001/api/bookings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    hall: 'Maha Lingeshwara',
    name: 'Test User',
    date: '2025-06-15',
    status: 'booked'
  })
})
.then(res => res.json())
.then(console.log)
.catch(console.error);