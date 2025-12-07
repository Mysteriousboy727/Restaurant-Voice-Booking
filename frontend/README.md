# 🍽️ Restaurant Voice Booking System

A voice-enabled AI agent for booking restaurant tables with real-time weather integration.

## Features

- 🎤 Voice-to-text booking system
- 🗣️ Text-to-speech responses
- 🌤️ Real-time weather-based seating suggestions
- 📊 Booking management dashboard
- 💾 MongoDB database integration

## Tech Stack

**Frontend:**
- React + Vite
- Web Speech API
- Axios

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- OpenWeatherMap API

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- OpenWeatherMap API key

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd restaurant-voice-booking
```

2. **Setup Backend**
```bash
cd backend
npm install

# Create .env file
PORT=5000
MONGODB_URI=mongodb://localhost:27017/restaurant-booking
WEATHER_API_KEY=your_openweathermap_api_key
```

3. **Setup Frontend**
```bash
cd ../frontend
npm install
```

4. **Get API Keys**
- Weather API: Sign up at https://openweathermap.org/api
- Add your API key to backend/.env

### Running the Application

**Start Backend** (Terminal 1):
```bash
cd backend
node server.js
```

**Start Frontend** (Terminal 2):
```bash
cd frontend
npm run dev
```

Open http://localhost:5173 in **Chrome** (required for Web Speech API)

## Usage

1. Click "Start Booking"
2. Allow microphone access
3. Follow voice prompts:
   - Provide your name
   - Number of guests
   - Booking date (e.g., "tomorrow" or "15th December")
   - Preferred time (e.g., "7 PM")
   - Cuisine preference
   - Seating preference (indoor/outdoor)
   - Special requests

4. System confirms booking with weather-based suggestions

## API Endpoints
```
POST   /api/bookings          Create booking
GET    /api/bookings          Get all bookings
GET    /api/bookings/:id      Get specific booking
DELETE /api/bookings/:id      Cancel booking
GET    /api/bookings/weather/:date  Get weather forecast
```

## Project Structure
```
restaurant-voice-booking/
├── backend/
│   ├── models/
│   │   └── Booking.js
│   ├── routes/
│   │   └── bookings.js
│   ├── config/
│   │   └── db.js
│   ├── .env
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── VoiceAgent.jsx
│   │   │   └── BookingList.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## Key Features Implemented

✅ Voice input/output using Web Speech API
✅ RESTful API with Express
✅ MongoDB database schema
✅ Real-time weather integration
✅ Weather-based seating suggestions
✅ Booking management system
✅ Responsive UI

## Browser Compatibility

- **Chrome/Edge**: Full support ✅
- **Firefox/Safari**: Limited speech API support ⚠️

## Future Enhancements

- Multi-language support (Hindi + English)
- SMS/Email confirmations
- Calendar integration
- Admin dashboard with analytics
- OpenAI GPT integration for smarter conversations

## Author

Soumya Ranjan Nayak

## License

MIT
```

---

### **8. .gitignore** (Root folder)
```
# Dependencies
node_modules/
package-lock.json
npm-debug.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
dist/
build/
.vite/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Database
*.sqlite
*.db

# Testing
coverage/
.nyc_output/
