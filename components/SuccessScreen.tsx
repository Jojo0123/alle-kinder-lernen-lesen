import React, { useEffect, useRef, useState } from 'react';
import { WordLevel } from '../types';
import { resolveCanonicalWord } from '../data/laute';
import { speak } from '../utils/tts';

interface SuccessScreenProps {
  level: WordLevel;
  onNext: () => void;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({ level, onNext }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasVideo, setHasVideo] = useState(true);

  const canonicalWord = resolveCanonicalWord(level.word);

  const playSound = () => {
    if (level.sound) {
      if (!audioRef.current) {
        audioRef.current = new Audio(level.sound);
      } else {
        audioRef.current.src = level.sound;
      }
      let fallbackCalled = false;
      const fallback = () => {
        if (fallbackCalled) return;
        fallbackCalled = true;
        speak(canonicalWord);
      };
      audioRef.current.onerror = fallback;
      audioRef.current.play().catch((e) => {
        if (e?.name !== 'AbortError') fallback();
      });
    } else {
      speak(canonicalWord);
    }
  };
  
  useEffect(() => {
    // Auto play the word sound and reward video on mount
    setHasVideo(true);
    playSound();
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [level]);

  return (
    <div className="relative flex flex-col h-full min-h-[var(--vh)] w-full bg-background overflow-hidden items-center justify-center">
      
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <span className="material-symbols-outlined absolute top-[15%] left-[10%] text-yellow-400 text-4xl animate-pulse">star</span>
        <span className="material-symbols-outlined absolute top-[20%] right-[15%] text-purple-400 text-3xl animate-bounce">star</span>
        <span className="material-symbols-outlined absolute bottom-[25%] left-[5%] text-blue-400 text-5xl rotate-12">star</span>
        <span className="material-symbols-outlined absolute bottom-[30%] right-[10%] text-green-400 text-4xl -rotate-12">star</span>
      </div>

      {/* Main Content */}
      <div className="z-10 flex flex-col items-center w-full max-w-md px-6">
        
        {/* Image Card - animierte Wortkarte (Video mit Standbild-Fallback) */}
        <div className="w-full aspect-square bg-white p-3 rounded-2xl shadow-xl transform rotate-1 mb-8">
            <div className="w-full h-full rounded-xl overflow-hidden">
                {hasVideo ? (
                    <video
                        ref={videoRef}
                        src={`/WordAnimationen/${canonicalWord}.mp4`}
                        autoPlay
                        muted
                        playsInline
                        loop
                        onError={() => setHasVideo(false)}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <img src={level.image} alt={canonicalWord} className="w-full h-full object-cover" />
                )}
            </div>
        </div>

        {/* Word and Sound */}
        <div className="flex items-center gap-4 mb-12">
            <h1 className="text-5xl font-black tracking-widest text-stone-800 uppercase">
                {canonicalWord}
            </h1>
            <button 
                onClick={playSound}
                className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            >
                <span className="material-symbols-outlined text-3xl">volume_up</span>
            </button>
        </div>

        {/* Next Button */}
        <button 
            onClick={onNext}
            className="w-full py-4 bg-primary text-white text-2xl font-bold rounded-2xl shadow-xl flex items-center justify-center gap-3 hover:bg-orange-600 transition-colors active:scale-95"
        >
            <span>Weiter</span>
            <span className="material-symbols-outlined text-3xl">arrow_forward</span>
        </button>

      </div>
    </div>
  );
};
