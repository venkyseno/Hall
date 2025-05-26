module.exports = {
  PORT: process.env.PORT || 3001,
  DB_PATH: process.env.DB_PATH || './hall_booking.db',
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',
  HALLS: [
    { name: 'Maha Lingeshwara', capacity: 100 },
    { name: 'Maha Nandeshwara', capacity: 150 }
  ]
};