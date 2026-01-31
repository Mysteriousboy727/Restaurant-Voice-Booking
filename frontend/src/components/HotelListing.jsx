import { useState, useEffect } from 'react';
import { Star, MapPin, Clock, TrendingUp, Heart, Award } from 'lucide-react';

const HotelListing = ({ onSelectRestaurant }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLocation, setSearchLocation] = useState('');
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const mockRestaurants = [
    {
      id: 1,
      name: 'The Grand Palace',
      location: 'Downtown',
      rating: 4.8,
      reviews: 342,
      cuisine: 'Multi-cuisine',
      priceRange: '₹₹₹₹',
      pricePerPerson: 2500,
      image: 'https://images.unsplash.com/photo-1517457373614-b7152f800fd1?w=500&h=400&fit=crop',
      cuisine_type: ['Indian', 'Continental'],
      capacity: 200,
      hours: '11AM - 11PM',
      badge: 'Luxury',
      discount: 15
    },
    {
      id: 2,
      name: 'Spice Garden',
      location: 'MG Road',
      rating: 4.6,
      reviews: 285,
      cuisine: 'Indian',
      priceRange: '₹₹₹',
      pricePerPerson: 1500,
      image: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=500&h=400&fit=crop',
      cuisine_type: ['North Indian', 'South Indian'],
      capacity: 150,
      hours: '12PM - 10:30PM',
      badge: 'Popular',
      discount: 10
    },
    {
      id: 3,
      name: 'Coastal Vibes',
      location: 'Beach Road',
      rating: 4.7,
      reviews: 298,
      cuisine: 'Seafood',
      priceRange: '₹₹₹₹',
      pricePerPerson: 2200,
      image: 'https://images.unsplash.com/photo-1414142473383-b89ede17f108?w=500&h=400&fit=crop',
      cuisine_type: ['Seafood', 'Asian'],
      capacity: 120,
      hours: '5PM - 12AM',
      badge: 'Premium',
      discount: 20
    },
    {
      id: 4,
      name: 'Pasta Paradiso',
      location: 'Bandra',
      rating: 4.5,
      reviews: 215,
      cuisine: 'Italian',
      priceRange: '₹₹₹',
      pricePerPerson: 1800,
      image: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500&h=400&fit=crop',
      cuisine_type: ['Italian', 'Continental'],
      capacity: 100,
      hours: '12PM - 11PM',
      badge: 'Recommended',
      discount: 8
    },
    {
      id: 5,
      name: 'Dragon Palace',
      location: 'Causeway',
      rating: 4.4,
      reviews: 189,
      cuisine: 'Asian',
      priceRange: '₹₹',
      pricePerPerson: 1200,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=400&fit=crop',
      cuisine_type: ['Chinese', 'Asian'],
      capacity: 180,
      hours: '11:30AM - 11PM',
      badge: 'Budget-Friendly',
      discount: 5
    },
    {
      id: 6,
      name: 'Taj Express',
      location: 'Fort',
      rating: 4.9,
      reviews: 412,
      cuisine: 'Mughlai',
      priceRange: '₹₹₹',
      pricePerPerson: 1900,
      image: 'https://images.unsplash.com/photo-1504674900967-a2fb86811e84?w=500&h=400&fit=crop',
      cuisine_type: ['Mughlai', 'Biryani'],
      capacity: 250,
      hours: '12PM - 11:30PM',
      badge: 'Top-Rated',
      discount: 12
    }
  ];

  useEffect(() => {
    setRestaurants(mockRestaurants);
    setFilteredRestaurants(mockRestaurants);
    setLoading(false);
  }, []);

  const handleSearch = (location) => {
    setSearchLocation(location);
    if (location.trim() === '') {
      setFilteredRestaurants(restaurants);
    } else {
      const filtered = restaurants.filter(r =>
        r.location.toLowerCase().includes(location.toLowerCase()) ||
        r.name.toLowerCase().includes(location.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(location.toLowerCase())
      );
      setFilteredRestaurants(filtered);
    }
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const getBadgeColor = (badge) => {
    const colors = {
      'Luxury': 'from-yellow-400 to-yellow-600',
      'Premium': 'from-purple-400 to-purple-600',
      'Popular': 'from-pink-400 to-pink-600',
      'Top-Rated': 'from-red-400 to-red-600',
      'Recommended': 'from-blue-400 to-blue-600',
      'Budget-Friendly': 'from-green-400 to-green-600'
    };
    return colors[badge] || 'from-gray-400 to-gray-600';
  };

  return (
    <div className="w-full">
      {/* Luxurious Search Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 rounded-3xl p-12 mb-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Award className="text-yellow-400" size={32} />
            <h2 className="text-5xl font-bold bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-100 bg-clip-text text-transparent">
              Discover Premium Dining
            </h2>
          </div>
          <p className="text-lg text-gray-200 mb-8 max-w-2xl">Experience luxury dining at the finest restaurants in the city</p>
          
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-3 text-gray-300">📍 Location or Restaurant</label>
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by location, name, or cuisine..."
                className="w-full px-4 py-4 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white/95 backdrop-blur font-semibold"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-3 text-gray-300">👥 Guests</label>
              <select className="w-full px-4 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white/95 backdrop-blur font-semibold">
                <option>1 Guest</option>
                <option>2 Guests</option>
                <option>3-4 Guests</option>
                <option>5-6 Guests</option>
                <option>7+ Guests</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-3 text-gray-300">📅 Date</label>
              <input
                type="date"
                className="w-full px-4 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white/95 backdrop-blur font-semibold"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-3 text-gray-300">🕐 Time</label>
              <input
                type="time"
                className="w-full px-4 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white/95 backdrop-blur font-semibold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      {!loading && (
        <div className="mb-8 flex items-center gap-2">
          <TrendingUp className="text-purple-600" size={24} />
          <p className="text-gray-700 font-bold text-lg">
            Found <span className="text-purple-600 text-2xl">{filteredRestaurants.length}</span> Premium Restaurants
          </p>
        </div>
      )}

      {/* Restaurant Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Loading premium restaurants...</p>
        </div>
      ) : filteredRestaurants.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl">
          <p className="text-gray-500 text-lg">No restaurants found. Try a different search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRestaurants.map(restaurant => (
            <div
              key={restaurant.id}
              onClick={() => onSelectRestaurant(restaurant)}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2"
            >
              {/* Image Container */}
              <div className="relative h-56 overflow-hidden bg-gray-200">
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Badge */}
                <div className={`absolute top-4 left-4 bg-gradient-to-r ${getBadgeColor(restaurant.badge)} text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg`}>
                  {restaurant.badge}
                </div>

                {/* Discount Badge */}
                {restaurant.discount > 0 && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-2 rounded-lg font-bold shadow-lg">
                    -{restaurant.discount}%
                  </div>
                )}

                {/* Favorite Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(restaurant.id);
                  }}
                  className="absolute bottom-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition"
                >
                  <Heart
                    size={20}
                    className={favorites.includes(restaurant.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                  />
                </button>

                {/* Rating Badge */}
                <div className="absolute bottom-4 left-4 bg-white rounded-full px-3 py-2 flex items-center gap-1 shadow-lg">
                  <Star className="text-yellow-400 fill-yellow-400" size={16} />
                  <span className="font-bold text-gray-800">{restaurant.rating}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{restaurant.name}</h3>
                
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <MapPin size={16} className="text-purple-600" />
                  <span className="text-sm">{restaurant.location}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <Clock size={16} className="text-purple-600" />
                  <span className="text-sm">{restaurant.hours}</span>
                </div>

                {/* Cuisine Tags */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2 font-semibold">{restaurant.cuisine}</p>
                  <div className="flex flex-wrap gap-2">
                    {restaurant.cuisine_type.map((type, idx) => (
                      <span key={idx} className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price Section */}
                <div className="border-t-2 border-gray-100 pt-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">COST PER PERSON</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-purple-600">₹{restaurant.pricePerPerson}</span>
                        {restaurant.discount > 0 && (
                          <span className="text-sm text-gray-500 line-through">₹{Math.round(restaurant.pricePerPerson / (1 - restaurant.discount/100))}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 font-semibold">CAPACITY</p>
                      <p className="text-lg font-bold text-gray-800">👥 {restaurant.capacity}</p>
                    </div>
                  </div>
                </div>

                {/* Reviews & Stats */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-gray-600"><span className="font-bold">{restaurant.reviews}</span> reviews</span>
                  </div>
                  <span className="text-xs text-gray-500">{restaurant.priceRange}</span>
                </div>

                {/* Book Button */}
                <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                  Reserve Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HotelListing;
