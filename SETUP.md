# Restaurant Voice Booking - Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas account)
- npm or yarn

## Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```
MONGODB_URI=mongodb://localhost:27017/restaurant-booking
PORT=5000
WEATHER_API_KEY=your_openweathermap_api_key_here
```

**Note:** 
- For local MongoDB, use: `mongodb://localhost:27017/restaurant-booking`
- For MongoDB Atlas, use your connection string from the Atlas dashboard
- Weather API key is optional. Get one from https://openweathermap.org/api (free tier available)

added images

4. Start the backend server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

## Running Both Servers

### Option 1: Run in separate terminals

**Terminal 1 (Backend):**
```bash
cd backend
npm start
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### Option 2: Use npm scripts (if configured in root package.json)

From the root directory:
```bash
npm run dev
```

## Usage

1. Open your browser and navigate to the frontend URL (usually `http://localhost:5173`)
2. Click "Start Booking" button
3. Allow microphone access when prompted
4. Follow the voice prompts:
   - Say your name
   - Say the number of guests
   - Say the date (today, tomorrow, or specific date)
   - Say the time (e.g., "7 PM")
5. Your booking will be saved to the database and displayed in the bookings list

## Troubleshooting

### Backend Issues
- **MongoDB Connection Error**: Make sure MongoDB is running locally or your Atlas connection string is correct
- **Port Already in Use**: Change the PORT in `.env` file
- **Weather API Error**: This is optional - the app will work without it, just without weather suggestions

### Frontend Issues
- **Speech Recognition Not Working**: Use Chrome or Edge browser (best support for Web Speech API)
- **Cannot Connect to Backend**: Make sure backend is running on port 5000
- **Tailwind Styles Not Loading**: Make sure you've run `npm install` in the frontend directory

## Browser Compatibility

- **Chrome/Edge**: Full support for speech recognition
- **Firefox**: Limited support
- **Safari**: Limited support

For best experience, use Chrome or Edge.

