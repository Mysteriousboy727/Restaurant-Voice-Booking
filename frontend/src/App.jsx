import VoiceBookingAgent from './components/VoiceBookingAgent'
import BookingList from './components/BookingList'
import { useState, useEffect } from 'react'

function App() {
  const [bookings, setBookings] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleBookingComplete = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div>
      <VoiceBookingAgent onBookingComplete={handleBookingComplete} />
      <div className="max-w-6xl mx-auto px-8 pb-8">
        <BookingList key={refreshKey} />
      </div>
    </div>
  )
}

export default App
