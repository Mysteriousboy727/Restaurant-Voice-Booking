import VoiceBookingAgent from './components/VoiceBookingAgent'
import BookingList from './components/BookingList'
import HotelListing from './components/HotelListing'
import AIRobot from './components/AIRobot'
import PaymentPage from './components/PaymentPage'
import { useState, useEffect } from 'react'

function App() {
  const [bookings, setBookings] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showRobot, setShowRobot] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [totalCost, setTotalCost] = useState(0);
  const [showPayment, setShowPayment] = useState(false);

  const handleBookingComplete = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleSelectRestaurant = (restaurant) => {
    if (restaurant === null) {
      // Go back to home
      setShowPayment(false);
      setSelectedRestaurant(null);
      setBookingData(null);
      return;
    }
    setSelectedRestaurant(restaurant);
  };

  const handlePaymentRedirect = (data, cost) => {
    setBookingData(data);
    setTotalCost(cost);
    setShowPayment(true);
  };

  if (showPayment && bookingData && selectedRestaurant) {
    return (
      <PaymentPage
        bookingData={bookingData}
        restaurant={selectedRestaurant}
        totalCost={totalCost}
        onBack={() => {
          setShowPayment(false);
          setSelectedRestaurant(null);
          setBookingData(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-indigo-600">🍽️ Restaurant Booking</h1>
          </div>
          <button
            onClick={() => setShowRobot(!showRobot)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition"
          >
            {showRobot ? 'Hide AI' : 'Show AI'}
          </button>
        </div>
      </header>

      {/* AI Robot Assistant */}
      {showRobot && <AIRobot onBookingComplete={handleBookingComplete} />}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hotel Listing */}
        {!selectedRestaurant ? (
          <section className="mb-12">
            <HotelListing onSelectRestaurant={handleSelectRestaurant} />
          </section>
        ) : (
          <>
            {/* Voice Booking Agent */}
            <section className="mb-12">
              <VoiceBookingAgent 
                restaurant={selectedRestaurant}
                onBookingComplete={handleBookingComplete}
                onPaymentRedirect={handlePaymentRedirect}
              />
            </section>

            {/* Back Button */}
            <section className="mb-12">
              <button
                onClick={() => handleSelectRestaurant(null)}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
              >
                ← Back to Restaurants
              </button>
            </section>
          </>
        )}

        {/* Bookings List */}
        {!selectedRestaurant && (
          <section>
            <BookingList key={refreshKey} />
          </section>
        )}
      </main>
    </div>
  )
}

export default App
