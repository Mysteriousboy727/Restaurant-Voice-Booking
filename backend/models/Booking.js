const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true,
    default: () => `BK${Date.now()}`
  },
  customerName: {
    type: String,
    required: true
  },
  numberOfGuests: {
    type: Number,
    required: true,
    min: 1
  },
  bookingDate: {
    type: Date,
    required: true
  },
  bookingTime: {
    type: String,
    required: true
  },
  cuisinePreference: {
    type: String,
    enum: ['Italian', 'Chinese', 'Indian', 'Mexican', 'Japanese', 'American', 'Other'],
    default: 'Other'
  },
  specialRequests: {
    type: String,
    default: ''
  },
  weatherInfo: {
    condition: String,
    temperature: Number,
    description: String
  },
  seatingPreference: {
    type: String,
    enum: ['indoor', 'outdoor', 'any'],
    default: 'any'
  },
  status: {
    type: String,
    enum: ['confirmed', 'pending', 'cancelled'],
    default: 'confirmed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', bookingSchema);