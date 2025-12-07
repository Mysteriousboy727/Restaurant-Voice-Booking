import { useState, useEffect } from 'react';
import axios from 'axios';

const VoiceAgent = ({ onBookingComplete }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [bookingData, setBookingData] = useState({
    customerName: '',
    numberOfGuests: '',
    bookingDate: '',
    bookingTime: '',
    cuisinePreference: '',
    specialRequests: '',
    seatingPreference: 'any'
  });
  const [conversationStep, setConversationStep] = useState(0);
  const [recognition, setRecognition] = useState(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognitionInstance = new webkitSpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        setTranscript(speechResult);
        handleUserInput(speechResult);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    } else {
      alert('Speech recognition not supported in this browser. Please use Chrome.');
    }
  }, []);

  // Text-to-Speech function
  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
    setResponse(text);
  };

  // Start listening
  const startListening = () => {
    if (recognition) {
      setIsListening(true);
      recognition.start();
    }
  };

  // Stop listening
  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  // Handle conversation flow
  const handleUserInput = async (userInput) => {
    const input = userInput.toLowerCase();

    switch (conversationStep) {
      case 0: // Greeting
        speak("Hello! Welcome to our restaurant. May I have your name please?");
        setConversationStep(1);
        break;

      case 1: // Get name
        setBookingData(prev => ({ ...prev, customerName: userInput }));
        speak(`Nice to meet you, ${userInput}! How many guests will be dining with us?`);
        setConversationStep(2);
        break;

      case 2: // Get number of guests
        const guests = parseInt(input.match(/\d+/)?.[0] || input);
        if (guests && guests > 0) {
          setBookingData(prev => ({ ...prev, numberOfGuests: guests }));
          speak(`Great! ${guests} guests. What date would you like to book? Please say the date.`);
          setConversationStep(3);
        } else {
          speak("I didn't catch that. How many guests?");
        }
        break;

      case 3: // Get date
        const dateMatch = extractDate(input);
        if (dateMatch) {
          setBookingData(prev => ({ ...prev, bookingDate: dateMatch }));
          
          // Fetch weather
          try {
            const weatherRes = await axios.get(
              `http://localhost:5000/api/bookings/weather/${dateMatch}`
            );
            speak(weatherRes.data.suggestion + " What time would you prefer?");
          } catch (error) {
            speak("What time would you like to book?");
          }
          setConversationStep(4);
        } else {
          speak("I didn't understand the date. Please say it again.");
        }
        break;

      case 4: // Get time
        const time = extractTime(input);
        if (time) {
          setBookingData(prev => ({ ...prev, bookingTime: time }));
          speak("What type of cuisine would you prefer? Italian, Chinese, Indian, or something else?");
          setConversationStep(5);
        } else {
          speak("I didn't catch the time. Please say it again.");
        }
        break;

      case 5: // Get cuisine
        const cuisine = extractCuisine(input);
        setBookingData(prev => ({ ...prev, cuisinePreference: cuisine }));
        speak(`${cuisine} cuisine, excellent choice! Do you prefer indoor or outdoor seating?`);
        setConversationStep(6);
        break;

      case 6: // Get seating preference
        const seating = input.includes('outdoor') ? 'outdoor' : 
                       input.includes('indoor') ? 'indoor' : 'any';
        setBookingData(prev => ({ ...prev, seatingPreference: seating }));
        speak("Any special requests? Birthday, anniversary, or dietary restrictions?");
        setConversationStep(7);
        break;

      case 7: // Get special requests and confirm
        setBookingData(prev => ({ ...prev, specialRequests: userInput }));
        await confirmBooking({ ...bookingData, specialRequests: userInput });
        break;

      default:
        speak("Let's start over. What's your name?");
        setConversationStep(1);
    }
  };

  // Confirm and save booking
  const confirmBooking = async (data) => {
    try {
      const response = await axios.post('http://localhost:5000/api/bookings', data);
      
      speak(`Perfect! Your booking is confirmed for ${data.numberOfGuests} guests on ${data.bookingDate} at ${data.bookingTime}. Your booking ID is ${response.data.booking.bookingId}. See you soon!`);
      
      // Reset
      setTimeout(() => {
        setConversationStep(0);
        setBookingData({
          customerName: '',
          numberOfGuests: '',
          bookingDate: '',
          bookingTime: '',
          cuisinePreference: '',
          specialRequests: '',
          seatingPreference: 'any'
        });
        onBookingComplete();
      }, 5000);
    } catch (error) {
      speak("Sorry, there was an error making your booking. Please try again.");
      setConversationStep(0);
    }
  };

  // Helper: Extract date from speech
  const extractDate = (input) => {
    const today = new Date();
    
    if (input.includes('today')) {
      return today.toISOString().split('T')[0];
    } else if (input.includes('tomorrow')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }
    
    // Try to parse date
    const datePattern = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/;
    const match = input.match(datePattern);
    if (match) {
      return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
    }
    
    return null;
  };

  // Helper: Extract time from speech
  const extractTime = (input) => {
    const timePattern = /(\d{1,2})\s*(am|pm|o'clock)?/i;
    const match = input.match(timePattern);
    if (match) {
      let hour = parseInt(match[1]);
      const period = match[2]?.toLowerCase();
      
      if (period === 'pm' && hour < 12) hour += 12;
      if (period === 'am' && hour === 12) hour = 0;
      
      return `${hour.toString().padStart(2, '0')}:00`;
    }
    return null;
  };

  // Helper: Extract cuisine
  const extractCuisine = (input) => {
    const cuisines = ['italian', 'chinese', 'indian', 'mexican', 'japanese', 'american'];
    for (const cuisine of cuisines) {
      if (input.includes(cuisine)) {
        return cuisine.charAt(0).toUpperCase() + cuisine.slice(1);
      }
    }
    return 'Other';
  };

  // Start conversation
  const startBooking = () => {
    setConversationStep(0);
    speak("Hello! Welcome to our restaurant. May I have your name please?");
    setConversationStep(1);
  };

  return (
    <div className="voice-agent">
      <h2>🎤 Voice Booking Agent</h2>
      
      <div className="status">
        {isListening ? (
          <div className="listening">🔴 Listening...</div>
        ) : (
          <div className="idle">⚪ Ready</div>
        )}
      </div>

      <div className="controls">
        {conversationStep === 0 ? (
          <button className="btn-start" onClick={startBooking}>
            Start Booking
          </button>
        ) : (
          <>
            <button 
              className="btn-speak" 
              onClick={startListening}
              disabled={isListening}
            >
              🎤 Speak
            </button>
            <button 
              className="btn-stop" 
              onClick={stopListening}
              disabled={!isListening}
            >
              ⏹️ Stop
            </button>
          </>
        )}
      </div>

      {transcript && (
        <div className="transcript">
          <strong>You said:</strong> {transcript}
        </div>
      )}

      {response && (
        <div className="response">
          <strong>Agent:</strong> {response}
        </div>
      )}

      <div className="booking-progress">
        <h3>Booking Progress:</h3>
        <p>Name: {bookingData.customerName || '—'}</p>
        <p>Guests: {bookingData.numberOfGuests || '—'}</p>
        <p>Date: {bookingData.bookingDate || '—'}</p>
        <p>Time: {bookingData.bookingTime || '—'}</p>
        <p>Cuisine: {bookingData.cuisinePreference || '—'}</p>
        <p>Seating: {bookingData.seatingPreference || '—'}</p>
      </div>
    </div>
  );
};

export default VoiceAgent;