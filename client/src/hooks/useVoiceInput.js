import { useState, useCallback, useEffect } from 'react';

const useVoiceInput = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
          setIsListening(true);
          setTranscript(''); // Clear transcript on start
      };
      recognitionInstance.onend = () => setIsListening(false);
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      recognitionInstance.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
      };

      setRecognition(recognitionInstance);
    } else {
        console.warn("Web Speech API not supported in this browser.");
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognition) {
        try {
            recognition.start();
        } catch (e) {
            console.error("Error starting recognition:", e);
        }
    } else {
        alert("Speech recognition is not supported in this browser.");
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition) {
        recognition.stop();
    }
  }, [recognition]);

  const resetTranscript = useCallback(() => {
      setTranscript('');
  }, []);

  return { isListening, transcript, startListening, stopListening, resetTranscript };
};

export default useVoiceInput;
