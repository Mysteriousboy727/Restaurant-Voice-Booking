// Main server file
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const bookingRoutes = require('./routes/bookings');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/bookings', bookingRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({
    message: '🎉 Restaurant Booking API is running!',
    endpoints: {
      bookings: '/api/bookings',
      weather: '/api/bookings/weather/:date'
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});