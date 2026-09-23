import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

/**
 * MicButton — Voice input using Web Speech API.
 * Falls back gracefully if SpeechRecognition is unavailable.
 *
 * @param {function} onTranscript - Called with final transcript text
 * @param {string} lang - BCP-47 language code (default 'en-IN')
 * @param {string} placeholder - Tooltip text
 * @param {string} size - 'sm' | 'md' | 'lg' (default 'md')
 */
const MicButton = ({
  onTranscript,
  lang = 'en-IN',
  placeholder = 'Speak now…',
  size = 'md',
  className = '',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }
      setInterimText(interim);
      if (final) {
        onTranscript?.(final.trim());
        setInterimText('');
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
      setInterimText('');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [lang, onTranscript]);

  const toggleListening = () => {
    if (!isSupported) {
      alert('Voice input is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Failed to start speech recognition:', err);
      }
    }
  };

  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };
  const iconSizeMap = { sm: 14, md: 18, lg: 22 };

  if (!isSupported) {
    return (
      <button
        disabled
        title="Voice input not supported in this browser"
        className={`${sizeMap[size]} rounded-full bg-gray-100 text-gray-400 flex items-center justify-center cursor-not-allowed ${className}`}
      >
        <MicOff size={iconSizeMap[size]} />
      </button>
    );
  }

  return (
    <div className="relative inline-flex flex-col items-center">
      <button
        onClick={toggleListening}
        title={isListening ? 'Stop listening' : placeholder}
        className={`
          ${sizeMap[size]} rounded-full flex items-center justify-center
          transition-all duration-200 shadow-sm
          ${isListening
            ? 'bg-red-500 text-white animate-pulse shadow-red-200 shadow-lg'
            : 'bg-blue-50 text-primary hover:bg-blue-100 hover:shadow-md border border-blue-200'
          }
          ${className}
        `}
      >
        {isListening ? <Loader2 size={iconSizeMap[size]} className="animate-spin" /> : <Mic size={iconSizeMap[size]} />}
      </button>
      {/* Interim transcript tooltip */}
      {isListening && interimText && (
        <div className="absolute top-full mt-2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap max-w-[200px] truncate z-50">
          {interimText}
        </div>
      )}
    </div>
  );
};

export default MicButton;
