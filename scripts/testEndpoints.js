const testEndpoints = async () => {
  console.log('Testing server endpoints...');
  
  try {
    // Test GET all bookings
    console.log('\n1. Testing GET /api/bookings');
    const getAllRes = await fetch('http://localhost:3001/api/bookings');
    console.log('Status:', getAllRes.status);
    if (getAllRes.ok) {
      const bookings = await getAllRes.json();
      console.log('Bookings count:', bookings.length);
      
      if (bookings.length > 0) {
        const testBookingId = bookings[0].id;
        console.log('Using booking ID for tests:', testBookingId);
        
        // Test PUT (update)
        console.log('\n2. Testing PUT /api/bookings/' + testBookingId);
        const putRes = await fetch(`http://localhost:3001/api/bookings/${testBookingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ advance: 1000 })
        });
        console.log('PUT Status:', putRes.status);
        
        // Test DELETE (but don't actually delete)
        console.log('\n3. Testing DELETE endpoint availability');
        const deleteRes = await fetch(`http://localhost:3001/api/bookings/999999`, {
          method: 'DELETE'
        });
        console.log('DELETE Status:', deleteRes.status);
        if (deleteRes.status === 404) {
          console.log('✅ DELETE endpoint exists (404 = booking not found, which is correct)');
        } else if (deleteRes.status === 405) {
          console.log('❌ DELETE endpoint does not exist (405 = method not allowed)');
        }
      }
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
};

testEndpoints();