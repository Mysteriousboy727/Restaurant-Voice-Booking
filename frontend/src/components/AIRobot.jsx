import { useState, useEffect } from 'react';
import { MessageCircle, Volume2, VolumeX, Minimize2, Maximize2 } from 'lucide-react';

const AIRobot = ({ onBookingComplete }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "👋 Hi! I'm your restaurant booking assistant. I can help you find the perfect restaurant and make a booking. Just tell me what you're looking for!",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognitionInstance = new webkitSpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setIsListening(true);
      };

      recognitionInstance.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        setInputText(speechResult);
        handleSendMessage(speechResult);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  // Text-to-Speech function
  const speak = (text) => {
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.1;
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (recognition && !isListening) {
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const handleSendMessage = (text) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: text,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate bot response
    setTimeout(() => {
      let botResponse = '';
      const lowerText = text.toLowerCase();

      if (lowerText.includes('north indian') || lowerText.includes('mughlai')) {
        botResponse = "Great choice! 🍽️ Taj Express has excellent Mughlai cuisine and is highly rated. Would you like me to help you book a table there?";
      } else if (lowerText.includes('seafood')) {
        botResponse = "Perfect! 🦞 Coastal Vibes is our top seafood restaurant with amazing ocean views. How many guests will be joining you?";
      } else if (lowerText.includes('italian') || lowerText.includes('pasta')) {
        botResponse = "Wonderful! 🍝 Pasta Paradiso serves authentic Italian cuisine. What date and time would you prefer?";
      } else if (lowerText.includes('asian') || lowerText.includes('chinese')) {
        botResponse = "Excellent! 🥢 Dragon Palace offers delicious Asian cuisine. Would you like me to check availability for your preferred date?";
      } else if (lowerText.includes('location') || lowerText.includes('downtown') || lowerText.includes('mg road')) {
        botResponse = "I found several great restaurants in that area! 📍 Would you like to hear about specific cuisine types or price ranges?";
      } else if (lowerText.includes('expensive') || lowerText.includes('luxury') || lowerText.includes('high end')) {
        botResponse = "You're looking for a premium experience! ✨ I recommend The Grand Palace or Taj Express - both are highly rated. Shall I show you their details?";
      } else if (lowerText.includes('budget') || lowerText.includes('affordable') || lowerText.includes('cheap')) {
        botResponse = "Looking for budget-friendly options? 💰 Dragon Palace and Spice Garden offer great value. Which cuisine interests you?";
      } else {
        botResponse = "Thanks for that information! 😊 Can you tell me more about your preferences - like cuisine type, location, or number of guests?";
      }

      const botMessage = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      speak(botResponse);
    }, 500);
  };

  const handleSendClick = () => {
    handleSendMessage(inputText);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 w-96 max-h-96 bg-white rounded-2xl shadow-2xl flex flex-col border-2 border-indigo-200 z-40 transition-all duration-300 ${isMinimized ? 'h-16' : 'h-screen md:h-96'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-3 rounded-t-2xl flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center animate-pulse">
              <span className="text-lg">🤖</span>
            </div>
            <div className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h3 className="font-bold">Booking Assistant</h3>
            <p className="text-xs opacity-90">Online & Ready to Help</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
          >
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
          >
            ✕
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-3 bg-gray-50 rounded-b-2xl flex-shrink-0">
            {/* Voice Status */}
            {(isListening || isSpeaking) && (
              <div className="mb-2 px-3 py-2 bg-blue-50 rounded-lg text-sm text-blue-700 flex items-center gap-2">
                <span className="animate-pulse">🎤</span>
                {isListening && 'Listening...'}
                {isSpeaking && 'Speaking...'}
              </div>
            )}

            {/* Input Field */}
            <div className="flex gap-2 items-end">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendClick()}
                placeholder="Type or press mic..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />

              {/* Microphone Button */}
              {!isListening ? (
                <button
                  onClick={startListening}
                  className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  title="Click to speak"
                >
                  <Volume2 size={18} />
                </button>
              ) : (
                <button
                  onClick={stopListening}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition animate-pulse"
                  title="Click to stop"
                >
                  <VolumeX size={18} />
                </button>
              )}

              {/* Send Button */}
              <button
                onClick={handleSendClick}
                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                ➤
              </button>
            </div>

            {/* Quick Actions */}
            <div className="mt-2 flex flex-wrap gap-1">
              <button
                onClick={() => handleSendMessage('I want Italian food')}
                className="text-xs bg-white border border-indigo-300 text-indigo-600 px-2 py-1 rounded-full hover:bg-indigo-50 transition"
              >
                🍝 Italian
              </button>
              <button
                onClick={() => handleSendMessage('Show me seafood restaurants')}
                className="text-xs bg-white border border-indigo-300 text-indigo-600 px-2 py-1 rounded-full hover:bg-indigo-50 transition"
              >
                🦞 Seafood
              </button>
              <button
                onClick={() => handleSendMessage('Budget friendly')}
                className="text-xs bg-white border border-indigo-300 text-indigo-600 px-2 py-1 rounded-full hover:bg-indigo-50 transition"
              >
                💰 Budget
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AIRobot;
