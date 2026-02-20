import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Loader2, Volume2 } from 'lucide-react';
import useVoiceInput from '../hooks/useVoiceInput';
import useAudioPlayer from '../hooks/useAudioPlayer';

const ChatInterface = () => {
  const { isListening, transcript, startListening, stopListening, resetTranscript } = useVoiceInput();
  const { isPlaying, playAudio } = useAudioPlayer();
  const [isLoading, setIsLoading] = useState(false);
  const [currentState, setCurrentState] = useState('idle'); // idle, listening, processing, speaking

  useEffect(() => {
    if (isListening) setCurrentState('listening');
    else if (isLoading) setCurrentState('processing');
    else if (isPlaying) setCurrentState('speaking');
    else setCurrentState('idle');
  }, [isListening, isLoading, isPlaying]);

  useEffect(() => {
    if (transcript && !isListening) {
      handleSendMessage(transcript);
      resetTranscript();
    }
  }, [transcript, isListening, resetTranscript]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      
      if (data.audio) {
          playAudio(data.audio);
      }

    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please check the backend console.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white font-sans items-center justify-center relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${currentState === 'speaking' ? 'opacity-30' : 'opacity-10'}`}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500 rounded-full blur-[100px] opacity-20 animate-pulse-slow"></div>
        {currentState === 'listening' && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500 rounded-full blur-[120px] opacity-20 animate-pulse"></div>}
      </div>

      {/* Main Visual Orb */}
      <div className="relative z-10 flex flex-col items-center gap-12">
        
        <div className="relative">
          {/* Outer Glow */}
          <div className={`
            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl transition-all duration-500
            ${currentState === 'idle' ? 'w-48 h-48 bg-blue-500/20' : ''}
            ${currentState === 'listening' ? 'w-64 h-64 bg-red-500/30 animate-pulse' : ''}
            ${currentState === 'processing' ? 'w-56 h-56 bg-purple-500/30 animate-pulse' : ''}
            ${currentState === 'speaking' ? 'w-72 h-72 bg-emerald-500/30 animate-pulse' : ''}
          `}></div>

          {/* Core Orb */}
          <div 
            onClick={currentState === 'idle' ? startListening : currentState === 'listening' ? stopListening : null}
            className={`
            w-32 h-32 rounded-full border-4 flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.5)]
            transition-all duration-500 cursor-pointer backdrop-blur-sm
            ${currentState === 'idle' ? 'border-blue-400/50 bg-blue-900/20 hover:scale-105 hover:border-blue-400' : ''}
            ${currentState === 'listening' ? 'border-red-400/80 bg-red-900/30 scale-110' : ''}
            ${currentState === 'processing' ? 'border-purple-400/80 bg-purple-900/30 animate-spin border-t-purple-400' : ''}
            ${currentState === 'speaking' ? 'border-emerald-400/80 bg-emerald-900/30 scale-110 shadow-[0_0_100px_rgba(16,185,129,0.4)]' : ''}
          `}>
             {currentState === 'idle' && <Mic className="w-10 h-10 text-blue-300" />}
             {currentState === 'listening' && <div className="w-12 h-12 rounded bg-red-500 animate-ping opacity-75"></div>}
             {currentState === 'processing' && <Loader2 className="w-10 h-10 text-purple-300 animate-spin" />}
             {currentState === 'speaking' && <Volume2 className="w-12 h-12 text-emerald-300 animate-pulse" />}
          </div>
        </div>

        {/* Status Text */}
        <div className="text-center space-y-2 h-16">
          <h2 className="text-2xl font-light tracking-widest uppercase text-white/80">
            {currentState === 'idle' && 'Tap to Speak'}
            {currentState === 'listening' && 'Listening...'}
            {currentState === 'processing' && 'Thinking...'}
            {currentState === 'speaking' && 'Speaking...'}
          </h2>
         
          {isListening && transcript && (
             <p className="text-sm text-gray-400 animate-pulse max-w-md truncate px-4">{transcript}</p>
          )}
        </div>

      </div>

      {/* Footer / Controls */}
      <div className="absolute bottom-8 flex gap-4">
         {/* Hidden controls if needed */}
      </div>

    </div>
  );
};

export default ChatInterface;
