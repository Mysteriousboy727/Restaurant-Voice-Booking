import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Calendar, Users, Clock, User, MapPin } from 'lucide-react';
import axios from 'axios';

const VoiceBookingAgent = ({ restaurant, onBookingComplete, onPaymentRedirect }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('Ready');
  const [bookingData, setBookingData] = useState({
    name: '',
    guests: '',
    date: '',
    time: '',
    departureTime: ''
  });
  const [conversationStage, setConversationStage] = useState('initial');
  const [messages, setMessages] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [showPaymentRedirect, setShowPaymentRedirect] = useState(false);
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setStatus('Speech recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setStatus('Listening...');
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript);
        processVoiceInput(finalTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setStatus('Error: ' + event.error);
      setIsListening(false);
      
      // Restart recognition if it's not a fatal error and we're still in conversation
      if (event.error !== 'no-speech' && event.error !== 'aborted' && conversationStage !== 'complete' && conversationStage !== 'initial') {
        setTimeout(() => {
          if (recognitionRef.current && conversationStage !== 'complete' && conversationStage !== 'initial') {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.error('Error restarting recognition:', e);
            }
          }
        }, 1000);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      
      // Auto-restart recognition if we're still in conversation (not complete or initial)
      if (conversationStage !== 'complete' && conversationStage !== 'initial' && recognitionRef.current) {
        setTimeout(() => {
          if (recognitionRef.current && conversationStage !== 'complete' && conversationStage !== 'initial') {
            try {
              recognitionRef.current.start();
            } catch (e) {
              // Recognition might already be starting, ignore the error
              console.log('Recognition restart:', e.message);
            }
          }
        }, 100);
      } else {
        setStatus('Ready');
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [conversationStage]);

  // Text-to-Speech function
  const speak = (text) => {
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    synthRef.current.speak(utterance);
    
    addMessage('bot', text);
  };

  // Add message to conversation
  const addMessage = (sender, text) => {
    setMessages(prev => [...prev, { sender, text, timestamp: Date.now() }]);
  };

  // Process voice input based on conversation stage
  const processVoiceInput = (input) => {
    const lowerInput = input.toLowerCase();
    addMessage('user', input);

    switch (conversationStage) {
      case 'initial':
      case 'asking_name':
        extractName(input);
        break;
      case 'asking_guests':
        extractGuests(input);
        break;
      case 'asking_date':
        extractDate(input);
        break;
      case 'asking_time':
        extractTime(input);
        break;
      case 'asking_departure_time':
        extractDepartureTime(input);
        break;
      default:
        break;
    }
  };

  // Extract name from speech
  const extractName = (input) => {
    let name = '';
    
    if (input.toLowerCase().includes('my name is')) {
      name = input.split(/my name is/i)[1]?.trim();
    } else if (input.toLowerCase().includes("i'm") || input.toLowerCase().includes("i am")) {
      name = input.split(/i'm|i am/i)[1]?.trim();
    } else {
      name = input.trim();
    }

    if (name && name.length > 1) {
      name = name.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
      
      setBookingData(prev => ({ ...prev, name }));
      setConversationStage('asking_guests');
      speak(`Great ${name}! How many guests will be dining at ${restaurant.name}?`);
      
      setTimeout(() => {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.log('Recognition restart:', e.message);
          }
        }
      }, 1000);
    } else {
      speak("I didn't catch your name. Could you please repeat it?");
      setTimeout(() => {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.log('Error restarting recognition:', e);
          }
        }
      }, 500);
    }
  };

  // Extract number of guests
  const extractGuests = (input) => {
    const numbers = input.match(/\d+/);
    const wordNumbers = {
      'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5',
      'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10'
    };

    let guests = '';
    
    if (numbers) {
      guests = numbers[0];
    } else {
      for (const [word, num] of Object.entries(wordNumbers)) {
        if (input.toLowerCase().includes(word)) {
          guests = num;
          break;
        }
      }
    }

    if (guests) {
      setBookingData(prev => ({ ...prev, guests }));
      setConversationStage('asking_date');
      speak(`Perfect! ${guests} guests. What date would you like to book? You can say today, tomorrow, or a specific date.`);
    } else {
      speak("I didn't catch that. How many guests?");
      // Restart recognition to continue listening
      if (recognitionRef.current && conversationStage === 'asking_guests') {
        setTimeout(() => {
          if (recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.log('Error restarting recognition:', e);
            }
          }
        }, 500);
      }
    }
  };

  // Extract date from speech
  const extractDate = (input) => {
    const lowerInput = input.toLowerCase();
    let date = '';

    const today = new Date();
    
    if (lowerInput.includes('today')) {
      date = today.toISOString().split('T')[0];
    } else if (lowerInput.includes('tomorrow')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      date = tomorrow.toISOString().split('T')[0];
    } else {
      // Try to extract date patterns like "december 5th" or "5th december"
      const dateMatch = input.match(/(\d{1,2})(st|nd|rd|th)?\s*(january|february|march|april|may|june|july|august|september|october|november|december)/i);
      
      if (dateMatch) {
        const day = dateMatch[1];
        const month = dateMatch[3];
        const monthNum = new Date(`${month} 1, ${today.getFullYear()}`).getMonth() + 1;
        const year = today.getFullYear();
        date = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
    }

    if (date) {
      setBookingData(prev => ({ ...prev, date }));
      setConversationStage('asking_time');
      speak(`Great! What time would you like to dine? For example, you can say 7 PM or 7:30 PM.`);
    } else {
      speak("I didn't understand the date. Please say today, tomorrow, or a specific date like December 5th.");
      // Restart recognition to continue listening
      if (recognitionRef.current && conversationStage === 'asking_date') {
        setTimeout(() => {
          if (recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.log('Error restarting recognition:', e);
            }
          }
        }, 500);
      }
    }
  };

  // Extract time from speech
  const extractTime = async (input) => {
    const lowerInput = input.toLowerCase();
    let time = '';

    // Pattern: "7 pm", "7:30 pm", "seven thirty"
    const timeMatch = input.match(/(\d{1,2}):?(\d{2})?\s*(am|pm|a\.m\.|p\.m\.)?/i);
    
    if (timeMatch) {
      let hour = parseInt(timeMatch[1]);
      const minute = timeMatch[2] || '00';
      const period = timeMatch[3]?.toLowerCase().replace('.', '');

      if (period === 'pm' && hour < 12) hour += 12;
      if (period === 'am' && hour === 12) hour = 0;

      time = `${String(hour).padStart(2, '0')}:${minute}`;
    } else {
      // Try word-based time parsing
      const wordTimes = {
        'seven': '19:00', 'eight': '20:00', 'nine': '21:00',
        'six': '18:00', 'five': '17:00'
      };
      
      for (const [word, timeValue] of Object.entries(wordTimes)) {
        if (lowerInput.includes(word)) {
          time = timeValue;
          break;
        }
      }
    }

    if (time) {
      setBookingData(prev => ({ ...prev, time }));
      setConversationStage('asking_departure_time');
      speak(`Great! What time will you be leaving after dinner? For example, 10 PM or 10:30 PM.`);
      
      setTimeout(() => {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.log('Error restarting recognition:', e);
          }
        }
      }, 1000);
    } else {
      speak("I didn't catch the time. Please say a time like 7 PM or 7:30 PM.");
      // Restart recognition to continue listening
      if (recognitionRef.current && conversationStage === 'asking_time') {
        setTimeout(() => {
          if (recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.log('Error restarting recognition:', e);
            }
          }
        }, 500);
      }
    }
  };

  // Extract departure time from speech
  const extractDepartureTime = (input) => {
    const lowerInput = input.toLowerCase();
    let time = '';

    const timeMatch = input.match(/(\d{1,2}):?(\d{2})?\s*(am|pm|a\.m\.|p\.m\.)?/i);
    
    if (timeMatch) {
      let hour = parseInt(timeMatch[1]);
      const minute = timeMatch[2] || '00';
      const period = timeMatch[3]?.toLowerCase().replace('.', '');

      if (period === 'pm' && hour < 12) hour += 12;
      if (period === 'am' && hour === 12) hour = 0;

      time = `${String(hour).padStart(2, '0')}:${minute}`;
    }

    if (time) {
      const updatedBookingData = { ...bookingData, departureTime: time };
      setBookingData(updatedBookingData);
      
      // Calculate total cost
      const guests = parseInt(updatedBookingData.guests);
      const costPerPerson = restaurant.pricePerPerson;
      const subtotal = guests * costPerPerson;
      const discount = (subtotal * restaurant.discount) / 100;
      const tax = ((subtotal - discount) * 0.1); // 10% tax
      const total = subtotal - discount + tax;
      
      setTotalCost(total);
      setConversationStage('complete');
      setStatus('Booking Complete! ✓');
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Error stopping recognition:', e);
        }
      }
      
      speak(`Perfect! Your booking details are ready. ${guests} guests at ${restaurant.name} from ${updatedBookingData.time} to ${time}. Total cost is ₹${Math.round(total)}. Proceeding to payment...`);
      
      setTimeout(() => {
        setShowPaymentRedirect(true);
        if (onPaymentRedirect) {
          onPaymentRedirect(updatedBookingData, total);
        }
      }, 2000);
    } else {
      speak("Please say a time like 10 PM or 10:30 PM.");
      setTimeout(() => {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.log('Error restarting recognition:', e);
          }
        }
      }, 500);
    }
  };

  // Save booking to backend
  const saveBooking = async (data = bookingData) => {
    try {
      const bookingPayload = {
        customerName: data.name,
        numberOfGuests: parseInt(data.guests),
        bookingDate: data.date,
        bookingTime: data.time,
        cuisinePreference: restaurant.cuisine,
        specialRequests: `Booked at ${restaurant.name}`,
        seatingPreference: 'any'
      };

      const response = await axios.post('http://localhost:5000/api/bookings', bookingPayload);
      
      speak(`Excellent! Your booking is confirmed for ${data.name}, ${data.guests} guests, on ${data.date} at ${data.time} at ${restaurant.name}. Your booking ID is ${response.data.booking.bookingId}. Thank you!`);
      
      if (onBookingComplete) {
        onBookingComplete();
      }
    } catch (error) {
      console.error('Error saving booking:', error);
      speak("Booking saved locally. There was a connection issue, but your details are secure.");
    }
  };

  // Start booking process
  const startBooking = async () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    setConversationStage('asking_name');
    setBookingData({ name: '', guests: '', date: '', time: '', departureTime: '' });
    setMessages([]);
    setTranscript('');
    setStatus('Starting...');
    
    try {
      speak(`Welcome to ${restaurant.name}! Let's complete your booking. What's your name?`);
      
      setTimeout(() => {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (error) {
            console.error('Error starting recognition:', error);
            alert('Please allow microphone access.');
          }
        }
      }, 500);
    } catch (error) {
      console.error('Error in startBooking:', error);
      setStatus('Error: ' + error.message);
    }
  };

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setStatus('Ready');
  };

  // Reset booking
  const resetBooking = () => {
    stopListening();
    setConversationStage('initial');
    setBookingData({ name: '', guests: '', date: '', time: '', departureTime: '' });
    setMessages([]);
    setTranscript('');
    setStatus('Ready');
    setShowPaymentRedirect(false);
    setTotalCost(0);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-indigo-200">
      <div className="flex items-center gap-3 mb-6">
        <MapPin className="text-indigo-600" size={28} />
        <div>
          <h2 className="text-2xl font-bold text-indigo-600">Book at {restaurant.name}</h2>
          <p className="text-gray-600">{restaurant.location} • {restaurant.cuisine}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Voice Agent Panel */}
        <div>
          {/* Status */}
          <div className="flex items-center justify-center gap-3 mb-6 p-4 bg-gray-50 rounded-xl">
            <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`} />
            <span className="text-lg font-medium text-gray-700">{status}</span>
          </div>

          {/* Control Button */}
          <div className="flex gap-4 justify-center mb-6">
            {conversationStage === 'initial' || conversationStage === 'complete' ? (
              <button
                onClick={conversationStage === 'complete' ? resetBooking : startBooking}
                className="px-8 py-4 bg-indigo-600 text-white rounded-full font-semibold text-lg hover:bg-indigo-700 transition-colors shadow-lg"
              >
                {conversationStage === 'complete' ? 'New Booking' : 'Start Voice Booking'}
              </button>
            ) : (
              <button
                onClick={stopListening}
                className="px-8 py-4 bg-red-500 text-white rounded-full font-semibold text-lg hover:bg-red-600 transition-colors shadow-lg flex items-center gap-2"
              >
                <MicOff size={20} />
                Stop
              </button>
            )}
          </div>

          {/* Conversation Messages */}
          <div className="bg-gray-50 rounded-xl p-4 h-56 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Click "Start Voice Booking" to begin...</p>
            ) : (
              <div className="space-y-3">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === 'bot' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                      msg.sender === 'bot' 
                        ? 'bg-indigo-100 text-indigo-900' 
                        : 'bg-purple-500 text-white'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Booking Details */}
        <div className="bg-indigo-50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-indigo-600 mb-4">Booking Details:</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <User className="text-indigo-600" size={20} />
              <div>
                <span className="text-sm text-gray-600">Name</span>
                <p className="font-semibold text-gray-900">{bookingData.name || '—'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <Users className="text-indigo-600" size={20} />
              <div>
                <span className="text-sm text-gray-600">Guests</span>
                <p className="font-semibold text-gray-900">{bookingData.guests || '—'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <Calendar className="text-indigo-600" size={20} />
              <div>
                <span className="text-sm text-gray-600">Date</span>
                <p className="font-semibold text-gray-900">{bookingData.date || '—'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <Clock className="text-indigo-600" size={20} />
              <div>
                <span className="text-sm text-gray-600">Time</span>
                <p className="font-semibold text-gray-900">{bookingData.time || '—'}</p>
              </div>
            </div>
            
            {bookingData.departureTime && (
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <Clock className="text-indigo-600" size={20} />
                <div>
                  <span className="text-sm text-gray-600">Departure</span>
                  <p className="font-semibold text-gray-900">{bookingData.departureTime}</p>
                </div>
              </div>
            )}
          </div>

          {conversationStage === 'complete' && bookingData.name && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-green-100 border-2 border-green-500 rounded-lg">
                <p className="text-green-800 font-bold text-center">✓ Booking Confirmed!</p>
              </div>
              
              {totalCost > 0 && (
                <div className="p-4 bg-purple-100 border-2 border-purple-500 rounded-lg">
                  <p className="text-gray-700 text-sm mb-2">Total Amount Due:</p>
                  <p className="text-3xl font-bold text-purple-600">₹{Math.round(totalCost)}</p>
                </div>
              )}

              {showPaymentRedirect && (
                <button
                  onClick={() => onSelectRestaurant(null)}
                  className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-bold rounded-lg hover:shadow-lg transition"
                >
                  → Proceed to Payment
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceBookingAgent;
