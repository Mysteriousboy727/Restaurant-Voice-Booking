import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Users, Clock, X } from 'lucide-react';

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/bookings');
      setBookings(response.data.bookings || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setLoading(false);
    }
  };

  const cancelBooking = async (id) => {
    if (window.confirm('Cancel this booking?')) {
      try {
        await axios.delete(`http://localhost:5000/api/bookings/${id}`);
        fetchBookings();
      } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Error cancelling booking. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-2xl p-8 mt-8">
        <p className="text-center text-gray-500">Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 mt-8">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="text-purple-600" size={32} />
        <h2 className="text-3xl font-bold text-purple-600">All Bookings</h2>
      </div>
      
      {bookings.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No bookings yet. Create your first booking!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map(booking => (
            <div 
              key={booking._id} 
              className={`border-2 rounded-2xl p-6 ${
                booking.status === 'cancelled' 
                  ? 'border-red-300 bg-red-50' 
                  : booking.status === 'confirmed'
                  ? 'border-green-300 bg-green-50'
                  : 'border-yellow-300 bg-yellow-50'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">{booking.customerName}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  booking.status === 'cancelled'
                    ? 'bg-red-200 text-red-800'
                    : booking.status === 'confirmed'
                    ? 'bg-green-200 text-green-800'
                    : 'bg-yellow-200 text-yellow-800'
                }`}>
                  {booking.status}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">🆔 {booking.bookingId}</p>
                <div className="flex items-center gap-2">
                  <Users className="text-indigo-600" size={16} />
                  <span className="text-gray-700">{booking.numberOfGuests} guests</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="text-indigo-600" size={16} />
                  <span className="text-gray-700">
                    {new Date(booking.bookingDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="text-indigo-600" size={16} />
                  <span className="text-gray-700">{booking.bookingTime}</span>
                </div>
                {booking.cuisinePreference && (
                  <p className="text-gray-700">🍽️ {booking.cuisinePreference}</p>
                )}
                {booking.seatingPreference && (
                  <p className="text-gray-700">🪑 {booking.seatingPreference} seating</p>
                )}
                {booking.weatherInfo && (
                  <p className="text-gray-700">
                    🌤️ {booking.weatherInfo.description}, {booking.weatherInfo.temperature}°C
                  </p>
                )}
                {booking.specialRequests && (
                  <p className="text-gray-700">📝 {booking.specialRequests}</p>
                )}
              </div>
              
              {booking.status !== 'cancelled' && (
                <button 
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                  onClick={() => cancelBooking(booking._id)}
                >
                  <X size={18} />
                  Cancel Booking
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingList;