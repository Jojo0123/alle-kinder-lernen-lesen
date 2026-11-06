import React, { useState, useEffect, useRef } from 'react';
import { speak } from '../utils/tts';
import { withAudioVersion } from '../data/laute';

interface LetterGameScreenProps {
  onComplete: (wasFirstTry: boolean) => void;
  onExit: () => void;
  sessionProgress: number;
  totalLevels: number;
}

const ALL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Shuffle array helper
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Confetti/Stars particle component
const Celebration: React.FC<{ show: boolean }> = ({ show }) => {
  if (!show) return null;

  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1 + Math.random() * 1,
    size: 10 + Math.random() * 20,
    type: Math.random() > 0.5 ? 'star' : 'circle',
    color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'][Math.floor(Math.random() * 8)]
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute animate-fall"
          style={{
            left: `${p.left}%`,
            top: '-20px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        >
          {p.type === 'star' ? (
            <svg width={p.size} height={p.size} viewBox="0 0 24 24" fill={p.color}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          ) : (
            <div
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                borderRadius: '50%'
              }}
            />
          )}
        </div>
      ))}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg) scale(0); opacity: 0; }
        }
        .animate-fall {
          animation: fall linear forwards;
        }
      `}</style>
    </div>
  );
};

// Big success overlay with letter image (animiertes Buchstabenbild, Standbild-Fallback)
const LetterAnimation: React.FC<{ letter: string; className?: string }> = ({ letter, className = '' }) => {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <img src={`/Buchstabenbilder/${letter}_v2.png`} alt={letter} className={className} />;
  }
  return (
    <video
      src={`/BuchstabenAnimationen/${letter}.mp4`}
      autoPlay
      loop
      muted
      playsInline
      onError={() => setFailed(true)}
      className={className}
    />
  );
};

const SuccessOverlay: React.FC<{ letter: string; show: boolean }> = ({ letter, show }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
      <div className="animate-success-pop">
        <div className="w-56 h-56 bg-white rounded-3xl shadow-2xl flex items-center justify-center ring-8 ring-green-400 overflow-hidden">
          <LetterAnimation letter={letter} className="w-full h-full object-contain p-2" />
        </div>
        <div className="text-center mt-4">
          <span className="text-4xl font-bold text-green-600">Super!</span>
        </div>
      </div>
      <style>{`
        @keyframes success-pop {
          0% { transform: scale(0) rotate(-10deg); opacity: 0; }
          50% { transform: scale(1.2) rotate(5deg); opacity: 1; }
          70% { transform: scale(0.9) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .animate-success-pop {
          animation: success-pop 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export const LetterGameScreen: React.FC<LetterGameScreenProps> = ({
  onComplete,
  onExit,
  sessionProgress,
  totalLevels
}) => {
  const [correctLetter, setCorrectLetter] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Refs to manage audio and prevent double-plays
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const hasPlayedInitialRef = useRef(false);

  // Stop any playing audio
  const stopCurrentAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
  };

  // Play a letter sound (with TTS fallback if audio file is missing)
  const playSound = (letter: string) => {
    stopCurrentAudio();
    const audio = new Audio(`/Laute/${letter}.mp3`);
    currentAudioRef.current = audio;
    let fallbackCalled = false;
    const fallback = () => {
      if (fallbackCalled) return;
      fallbackCalled = true;
      speak(letter.toLowerCase());
    };
    audio.onerror = fallback;
    audio.play().catch(e => {
      if (e?.name !== 'AbortError') fallback();
    });
  };

  // Initialize round ONCE on mount
  useEffect(() => {
    // Pick a random correct letter
    const correct = ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)];

    // Pick 3 other random letters (different from correct)
    const otherLetters = ALL_LETTERS.filter(l => l !== correct);
    const shuffledOthers = shuffleArray(otherLetters);
    const wrongOptions = shuffledOthers.slice(0, 3);

    // Combine and shuffle all 4 options
    const allOptions = shuffleArray([correct, ...wrongOptions]);

    setCorrectLetter(correct);
    setOptions(allOptions);
    setAttempts(0);
    setSelectedLetter(null);
    setIsCorrect(false);
    setShowCelebration(false);
    setIsInitialized(true);

    // Cleanup on unmount
    return () => {
      stopCurrentAudio();
    };
  }, []); // Empty deps - only run once on mount

  // Play initial sound after initialization
  useEffect(() => {
    if (isInitialized && correctLetter && !hasPlayedInitialRef.current) {
      hasPlayedInitialRef.current = true;
      const timer = setTimeout(() => {
        playSound(correctLetter);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isInitialized, correctLetter]);

  // Handle letter selection
  const handleSelect = (letter: string) => {
    if (isCorrect || !isInitialized) return;

    setSelectedLetter(letter);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (letter === correctLetter) {
      setIsCorrect(true);
      setShowCelebration(true);
      playSound(letter);

      // Move to next after celebration — 5.5s: die Buchstaben-Animation
      // (4.5s) wird vollständig abgespielt, bevor es weitergeht
      setTimeout(() => {
        onComplete(newAttempts === 1);
      }, 5500);
    } else {
      // Wrong answer - brief shake, then replay correct
      setTimeout(() => {
        setSelectedLetter(null);
        playSound(correctLetter);
      }, 600);
    }
  };

  // Replay the letter sound
  const replaySound = () => {
    if (correctLetter && !isCorrect) {
      playSound(correctLetter);
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-[var(--vh)]">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto bg-background min-h-[var(--vh)] relative">
      {/* Celebration effects */}
      <Celebration show={showCelebration} />
      <SuccessOverlay letter={correctLetter} show={showCelebration} />

      {/* Top Bar */}
      <div className="flex items-center justify-between p-4">
        <button onClick={onExit} className="p-2 rounded-full hover:bg-stone-200 text-stone-600 transition-colors">
          <span className="material-symbols-outlined text-3xl">close</span>
        </button>
        <span className="text-xl font-bold text-stone-700">Buchstaben</span>
        <button onClick={replaySound} className="p-2 rounded-full hover:bg-stone-200 text-stone-600 transition-colors">
          <span className="material-symbols-outlined text-3xl">volume_up</span>
        </button>
      </div>

      {/* Progress Bar - 12 steps */}
      <div className="flex gap-1 px-6 mb-4">
        {Array.from({ length: totalLevels }).map((_, i) => (
          <div key={i} className={`h-2 flex-1 rounded-full ${i < sessionProgress ? 'bg-primary' : 'bg-stone-200'}`} />
        ))}
      </div>

      {/* Main Content - Big Speaker Icon */}
      <div className="flex-1 px-4 flex flex-col items-center justify-center">
        <button
          onClick={replaySound}
          disabled={isCorrect}
          className={`w-48 h-48 bg-primary rounded-full shadow-xl flex items-center justify-center transition-all ${
            isCorrect ? 'opacity-50' : 'hover:bg-orange-600 active:scale-95 hover:scale-105'
          }`}
        >
          <span className="material-symbols-outlined text-white" style={{ fontSize: '120px' }}>volume_up</span>
        </button>
        <p className="text-stone-500 font-medium mt-6 text-lg">
          {isCorrect ? 'Richtig!' : 'Welcher Buchstabe ist das?'}
        </p>
      </div>

      {/* Letter Options - 2x2 Grid with Images */}
      <div className="px-6 pb-8 grid grid-cols-2 gap-4">
        {options.map((letter, index) => {
          const isSelected = selectedLetter === letter;
          const showCorrect = isCorrect && letter === correctLetter;
          const showWrong = isSelected && !isCorrect;

          let borderClass = '';
          let extraClasses = '';

          if (showCorrect) {
            borderClass = 'ring-4 ring-green-500';
            extraClasses = 'scale-110';
          } else if (showWrong) {
            borderClass = 'ring-4 ring-red-400';
            extraClasses = 'animate-shake';
          } else if (isCorrect) {
            extraClasses = 'opacity-40 scale-90';
          }

          return (
            <button
              key={letter}
              onClick={() => handleSelect(letter)}
              disabled={isCorrect}
              className={`
                bg-white
                h-36 rounded-2xl shadow-lg overflow-hidden
                flex items-center justify-center
                transition-all duration-200
                ${!isCorrect ? 'hover:scale-105 active:scale-95 hover:shadow-xl' : ''}
                ${borderClass}
                ${extraClasses}
              `}
            >
              <img
                src={`/Buchstabenbilder/${letter}_v2.png`}
                alt={letter}
                className="w-full h-full object-contain p-1"
              />
            </button>
          );
        })}
      </div>

      {/* Shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px) rotate(-2deg); }
          40% { transform: translateX(8px) rotate(2deg); }
          60% { transform: translateX(-6px) rotate(-1deg); }
          80% { transform: translateX(6px) rotate(1deg); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
};
