import { useState } from 'react';
import { ArrowLeft, CheckCircle, Loader, CreditCard, Lock, DollarSign } from 'lucide-react';

const PaymentPage = ({ bookingData, restaurant, totalCost, onBack }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
    }, 2500);
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center">
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle size={60} className="text-white" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-green-600 mb-4">Payment Successful! 🎉</h1>
          <p className="text-xl text-gray-600 mb-8">Your reservation is confirmed</p>

          {/* Receipt */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-8 text-left">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Booking Receipt</h2>

            <div className="space-y-4 mb-6 border-b-2 border-gray-200 pb-6">
              <div className="flex justify-between">
                <span className="text-gray-600 font-semibold">Restaurant:</span>
                <span className="text-gray-900 font-bold">{restaurant.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-semibold">Guest Name:</span>
                <span className="text-gray-900 font-bold">{bookingData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-semibold">Number of Guests:</span>
                <span className="text-gray-900 font-bold">{bookingData.guests} people</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-semibold">Date:</span>
                <span className="text-gray-900 font-bold">{bookingData.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-semibold">Time:</span>
                <span className="text-gray-900 font-bold">{bookingData.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-semibold">Expected Departure:</span>
                <span className="text-gray-900 font-bold">{bookingData.departureTime}</span>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-3 mb-6 pb-6 border-b-2 border-gray-200">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({bookingData.guests} × ₹{restaurant.pricePerPerson}):</span>
                <span className="text-gray-900">₹{(parseInt(bookingData.guests) * restaurant.pricePerPerson).toLocaleString()}</span>
              </div>
              {restaurant.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({restaurant.discount}%):</span>
                  <span>-₹{Math.round((parseInt(bookingData.guests) * restaurant.pricePerPerson * restaurant.discount) / 100).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (10%):</span>
                <span className="text-gray-900">₹{Math.round((totalCost - (parseInt(bookingData.guests) * restaurant.pricePerPerson * (1 - restaurant.discount/100)))).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <span className="text-2xl font-bold text-gray-800">Total Paid:</span>
              <span className="text-4xl font-bold text-green-600">₹{Math.round(totalCost).toLocaleString()}</span>
            </div>
          </div>

          {/* Confirmation Details */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-2">Booking ID</p>
              <p className="text-lg font-bold text-blue-600">RES-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-2">Transaction ID</p>
              <p className="text-lg font-bold text-purple-600">TXN-{Date.now()}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition">
              📧 Send Confirmation Email
            </button>
            <button
              onClick={onBack}
              className="w-full border-2 border-green-500 text-green-600 py-4 rounded-xl font-bold text-lg hover:bg-green-50 transition"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-white hover:text-gray-200 transition"
        >
          <ArrowLeft size={24} />
          <span className="font-semibold">Back</span>
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>

            <div className="space-y-4 mb-8 pb-8 border-b-2 border-gray-200">
              <div className="flex items-start gap-4">
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{restaurant.name}</h3>
                  <p className="text-sm text-gray-600">{restaurant.location} • {restaurant.cuisine}</p>
                  <p className="text-sm text-gray-600 mt-1">⭐ {restaurant.rating}</p>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="space-y-3 mb-8 pb-8 border-b-2 border-gray-200">
              <div className="flex justify-between">
                <span className="text-gray-600">Guest:</span>
                <span className="font-semibold text-gray-900">{bookingData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Guests:</span>
                <span className="font-semibold text-gray-900">{bookingData.guests} people</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-semibold text-gray-900">{new Date(bookingData.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-semibold text-gray-900">{bookingData.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-semibold text-gray-900">~{Math.round((parseInt(bookingData.departureTime.split(':')[0]) - parseInt(bookingData.time.split(':')[0])) % 12 || 12)} hours</span>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 mb-8">
              <div className="flex justify-between">
                <span className="text-gray-600">Per Person Rate:</span>
                <span className="font-semibold">₹{restaurant.pricePerPerson}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({bookingData.guests} guests):</span>
                <span className="font-semibold">₹{(parseInt(bookingData.guests) * restaurant.pricePerPerson).toLocaleString()}</span>
              </div>
              {restaurant.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({restaurant.discount}%):</span>
                  <span>-₹{Math.round((parseInt(bookingData.guests) * restaurant.pricePerPerson * restaurant.discount) / 100).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (10%):</span>
                <span className="font-semibold">₹{Math.round((totalCost - (parseInt(bookingData.guests) * restaurant.pricePerPerson * (1 - restaurant.discount/100)))).toLocaleString()}</span>
              </div>
            </div>

            {/* Total */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800">Total Amount:</span>
                <span className="text-3xl font-bold text-purple-600">₹{Math.round(totalCost).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment Method</h2>

            {/* Payment Method Selection */}
            <div className="space-y-3 mb-8">
              {['card', 'upi', 'wallet', 'netbanking'].map(method => (
                <label key={method} className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition"
                  style={{ borderColor: paymentMethod === method ? '#7c3aed' : '#e5e7eb' }}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={() => setPaymentMethod(method)}
                    className="w-4 h-4"
                  />
                  <span className="text-lg font-semibold text-gray-800 capitalize">
                    {method === 'card' && '💳 Credit/Debit Card'}
                    {method === 'upi' && '📱 UPI'}
                    {method === 'wallet' && '👛 Digital Wallet'}
                    {method === 'netbanking' && '🏦 Net Banking'}
                  </span>
                </label>
              ))}
            </div>

            {/* Card Form */}
            {paymentMethod === 'card' && (
              <form onSubmit={handlePayment} className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cardholder Name</label>
                  <input
                    type="text"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 font-mono"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Date</label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      maxLength="5"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">CVV</label>
                    <input
                      type="password"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      maxLength="3"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                </div>

                {/* Security Badge */}
                <div className="flex items-center gap-2 text-sm text-gray-600 p-3 bg-blue-50 rounded-lg">
                  <Lock size={16} className="text-blue-600" />
                  <span>Your card information is safe and encrypted</span>
                </div>

                {/* Pay Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader size={20} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <DollarSign size={20} />
                      Pay ₹{Math.round(totalCost).toLocaleString()}
                    </>
                  )}
                </button>
              </form>
            )}

            {paymentMethod !== 'card' && (
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <DollarSign size={20} />
                    Pay ₹{Math.round(totalCost).toLocaleString()}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
