import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const AudioPlayer = ({ text, autoPlay = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (autoPlay && text) {
      handlePlay();
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [autoPlay, text]);

  const handlePlay = () => {
    if (!('speechSynthesis' in window)) return;
    
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  return (
    <button
      onClick={handlePlay}
      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
        isPlaying
          ? 'bg-amber-100 text-amber-700 animate-pulse shadow-sm'
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      }`}
      title={isPlaying ? "Stop audio" : "Listen to text"}
    >
      {isPlaying ? <VolumeX size={14} /> : <Volume2 size={14} />}
    </button>
  );
};

export default AudioPlayer;
