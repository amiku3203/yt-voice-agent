import { useState, useCallback } from 'react';

const useAudioPlayer = () => {
    const [isPlaying, setIsPlaying] = useState(false);

    const playAudio = useCallback((audioSource) => {
        if (!audioSource) return;
        
        const audio = new Audio(audioSource);
        
        audio.onplay = () => setIsPlaying(true);
        audio.onended = () => setIsPlaying(false);
        audio.onerror = (e) => {
            console.error("Audio playback error", e);
            setIsPlaying(false);
        };
        
        audio.play().catch(e => console.error("Play failed", e));
    }, []);

    return { isPlaying, playAudio };
};

export default useAudioPlayer;
