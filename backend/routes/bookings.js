const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const axios = require('axios');

// Get weather forecast
async function getWeatherForDate(date, location = 'Bangalore') {
  try {
    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey || apiKey === 'your_openweathermap_api_key_here') {
      return {
        condition: 'unknown',
        temperature: 0,
        description: 'Weather data unavailable (API key not configured)'
      };
    }
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric`
    );

    const targetDate = new Date(date).toDateString();
    const forecast = response.data.list.find(item => {
      const forecastDate = new Date(item.dt * 1000).toDateString();
      return forecastDate === targetDate;
    }) || response.data.list[0];

    return {
      condition: forecast.weather[0].main.toLowerCase(),
      temperature: Math.round(forecast.main.temp),
      description: forecast.weather[0].description
    };
  } catch (error) {
    console.error('Weather API Error:', error.message);
    return {
      condition: 'unknown',
      temperature: 0,
      description: 'Weather data unavailable'
    };
  }
}

// Generate weather suggestion
function getWeatherSuggestion(weatherInfo) {
  const { condition, temperature, description } = weatherInfo;
  
  if (condition === 'clear' || condition === 'sunny') {
    return `Perfect weather for outdoor dining! It'll be ${temperature}°C with ${description}.`;
  } else if (condition === 'rain' || condition === 'drizzle') {
    return `Looks like rain (${description}). I'd recommend our cozy indoor area.`;
  } else if (condition === 'clouds') {
    return `Cloudy weather expected (${temperature}°C). Both indoor and outdoor seating would be comfortable.`;
  } else {
    return `The weather will be ${description} at ${temperature}°C. What's your seating preference?`;
  }
}

// POST /api/bookings
router.post('/', async (req, res) => {
  try {
    const {
      customerName,
      numberOfGuests,
      bookingDate,
      bookingTime,
      cuisinePreference,
      specialRequests,
      seatingPreference
    } = req.body;

    const weatherInfo = await getWeatherForDate(bookingDate);
    const weatherSuggestion = getWeatherSuggestion(weatherInfo);

    const booking = new Booking({
      customerName,
      numberOfGuests,
      bookingDate,
      bookingTime,
      cuisinePreference,
      specialRequests,
      weatherInfo,
      seatingPreference: seatingPreference || 'any',
      status: 'confirmed'
    });

    await booking.save();

    res.status(201).json({
      success: true,
      booking,
      weatherSuggestion
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/bookings/:id
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    res.json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE /api/bookings/:id
router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/bookings/weather/:date
router.get('/weather/:date', async (req, res) => {
  try {
    const weatherInfo = await getWeatherForDate(req.params.date);
    const suggestion = getWeatherSuggestion(weatherInfo);
    
    res.json({
      success: true,
      weatherInfo,
      suggestion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;