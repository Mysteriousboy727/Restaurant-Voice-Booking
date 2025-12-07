import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Calendar, Users, Clock, User } from 'lucide-react';
import axios from 'axios';

const VoiceBookingAgent = ({ onBookingComplete }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('Ready');
  const [bookingData, setBookingData] = useState({
    name: '',
    guests: '',
    date: '',
    time: ''
  });
  const [conversationStage, setConversationStage] = useState('initial');
  const [messages, setMessages] = useState([]);
  
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
      default:
        break;
    }
  };

  // Extract name from speech
  const extractName = (input) => {
    const lowerInput = input.toLowerCase();
    
    // Pattern: "my name is X" or "I'm X" or "this is X" or just "X"
    let name = '';
    
    if (lowerInput.includes('my name is')) {
      name = input.split(/my name is/i)[1]?.trim();
    } else if (lowerInput.includes("i'm") || lowerInput.includes("i am")) {
      name = input.split(/i'm|i am/i)[1]?.trim();
    } else if (lowerInput.includes('this is')) {
      name = input.split(/this is/i)[1]?.trim();
    } else {
      // Assume the entire input is the name
      name = input.trim();
    }

    if (name) {
      // Capitalize first letter of each word
      name = name.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
      
      setBookingData(prev => ({ ...prev, name }));
      setConversationStage('asking_guests');
      speak(`Great ${name}! How many guests will be joining you?`);
    } else {
      // If name extraction failed, ask again and restart recognition
      if (conversationStage === 'asking_name') {
        speak("I didn't catch your name. Could you please tell me your name again?");
        if (recognitionRef.current) {
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
      const updatedBookingData = { ...bookingData, time };
      setBookingData(updatedBookingData);
      setConversationStage('complete');
      setStatus('Booking Complete! ✓');
      
      // Stop listening after booking is complete
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Error stopping recognition:', e);
        }
      }
      
      // Save booking to backend with updated data
      await saveBooking(updatedBookingData);
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

  // Save booking to backend
  const saveBooking = async (data = bookingData) => {
    try {
      const bookingPayload = {
        customerName: data.name,
        numberOfGuests: parseInt(data.guests),
        bookingDate: data.date,
        bookingTime: data.time,
        cuisinePreference: 'Other',
        specialRequests: '',
        seatingPreference: 'any'
      };

      const response = await axios.post('http://localhost:5000/api/bookings', bookingPayload);
      
      speak(`Perfect! Your booking is confirmed for ${data.name}, ${data.guests} guests, on ${data.date} at ${data.time}. Your booking ID is ${response.data.booking.bookingId}. Thank you!`);
      
      if (onBookingComplete) {
        onBookingComplete();
      }
    } catch (error) {
      console.error('Error saving booking:', error);
      speak("I've saved your booking details, but there was an issue connecting to the server. Your booking details are still available.");
    }
  };

  // Start booking process
  const startBooking = async () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    setConversationStage('asking_name');
    setBookingData({ name: '', guests: '', date: '', time: '' });
    setMessages([]);
    setTranscript('');
    setStatus('Starting...');
    
    try {
      // Wait a bit for the speak function to finish before starting recognition
      speak("Hello! I'm your voice booking assistant. What's your name?");
      
      // Start recognition after a short delay to ensure microphone permission is requested
      setTimeout(() => {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (error) {
            console.error('Error starting recognition:', error);
            if (error.message.includes('already started')) {
              // Recognition is already running, that's fine
            } else {
              setStatus('Error starting microphone. Please check permissions.');
              alert('Please allow microphone access to use voice booking.');
            }
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
    setBookingData({ name: '', guests: '', date: '', time: '' });
    setMessages([]);
    setTranscript('');
    setStatus('Ready');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            🍽️ Restaurant Voice Booking
          </h1>
          <p className="text-xl text-white/90">Book your table using voice commands</p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Voice Agent Panel */}
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Mic className="text-indigo-600" size={32} />
              <h2 className="text-3xl font-bold text-indigo-600">Voice Booking Agent</h2>
            </div>

            {/* Status */}
            <div className="flex items-center justify-center gap-3 mb-6">
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
                  {conversationStage === 'complete' ? 'New Booking' : 'Start Booking'}
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
            <div className="bg-gray-50 rounded-xl p-4 h-64 overflow-y-auto mb-6">
              {messages.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Click "Start Booking" to begin...</p>
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

            {/* Booking Progress */}
            <div className="bg-indigo-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-indigo-600 mb-4">Booking Progress:</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="text-indigo-600" size={20} />
                  <span className="font-medium text-gray-700">Name:</span>
                  <span className="text-gray-900">{bookingData.name || '—'}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Users className="text-indigo-600" size={20} />
                  <span className="font-medium text-gray-700">Guests:</span>
                  <span className="text-gray-900">{bookingData.guests || '—'}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="text-indigo-600" size={20} />
                  <span className="font-medium text-gray-700">Date:</span>
                  <span className="text-gray-900">{bookingData.date || '—'}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="text-indigo-600" size={20} />
                  <span className="font-medium text-gray-700">Time:</span>
                  <span className="text-gray-900">{bookingData.time || '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bookings List Panel */}
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="text-purple-600" size={32} />
              <h2 className="text-3xl font-bold text-purple-600">All Bookings</h2>
            </div>

            {conversationStage === 'complete' && bookingData.name ? (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-700 font-bold">CONFIRMED</span>
                </div>
                
                <div className="space-y-2">
                  <p className="text-lg"><span className="font-semibold">Guest:</span> {bookingData.name}</p>
                  <p className="text-lg"><span className="font-semibold">Party Size:</span> {bookingData.guests} people</p>
                  <p className="text-lg"><span className="font-semibold">Date:</span> {bookingData.date}</p>
                  <p className="text-lg"><span className="font-semibold">Time:</span> {bookingData.time}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">No bookings yet. Create your first booking!</p>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
          <h3 className="text-xl font-bold mb-3">💡 How to use:</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>Click "Start Booking" and allow microphone access</li>
            <li>Say your name when prompted (e.g., "My name is John" or just "John")</li>
            <li>Tell the number of guests (e.g., "4 guests" or "four")</li>
            <li>Say the date (e.g., "tomorrow" or "December 5th")</li>
            <li>Say the time (e.g., "7 PM" or "7:30 PM")</li>
            <li>Your booking will be confirmed!</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default VoiceBookingAgent;
