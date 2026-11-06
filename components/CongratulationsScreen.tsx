import React from 'react';

interface CongratulationsScreenProps {
  firstTimeCorrect: number;
  totalLevels: number;
  onHome: () => void;
}

export const CongratulationsScreen: React.FC<CongratulationsScreenProps> = ({
  firstTimeCorrect,
  totalLevels,
  onHome
}) => {
  const percentage = Math.round((firstTimeCorrect / totalLevels) * 100);

  return (
    <div className="relative flex flex-col h-full w-full bg-gradient-to-b from-yellow-100 to-orange-100 overflow-hidden items-center justify-center p-6">

      {/* Confetti/Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <span className="material-symbols-outlined absolute top-[10%] left-[5%] text-yellow-400 text-6xl animate-bounce">star</span>
        <span className="material-symbols-outlined absolute top-[15%] right-[10%] text-purple-400 text-5xl animate-pulse">star</span>
        <span className="material-symbols-outlined absolute top-[25%] left-[15%] text-blue-400 text-4xl rotate-12 animate-bounce">star</span>
        <span className="material-symbols-outlined absolute bottom-[20%] left-[8%] text-green-400 text-6xl -rotate-12 animate-pulse">star</span>
        <span className="material-symbols-outlined absolute bottom-[25%] right-[12%] text-red-400 text-5xl animate-bounce">star</span>
        <span className="material-symbols-outlined absolute top-[40%] right-[5%] text-pink-400 text-4xl animate-pulse">star</span>
      </div>

      {/* Main Content */}
      <div className="z-10 flex flex-col items-center w-full max-w-md">

        {/* Trophy Icon */}
        <div className="w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center mb-6 shadow-2xl animate-bounce">
          <span className="text-8xl">🏆</span>
        </div>

        {/* Title */}
        <h1 className="text-5xl font-black text-primary mb-4 text-center">
          Geschafft!
        </h1>

        <p className="text-2xl font-bold text-stone-700 mb-8 text-center">
          Du hast alle {totalLevels} Karten gemeistert!
        </p>

        {/* Stats Card */}
        <div className="w-full bg-white rounded-3xl shadow-xl p-8 mb-8">
          <div className="text-center mb-4">
            <p className="text-stone-500 text-lg mb-2">Beim ersten Mal richtig:</p>
            <div className="text-6xl font-black text-primary mb-2">
              {firstTimeCorrect}/{totalLevels}
            </div>
            <div className="text-3xl font-bold text-stone-600">
              {percentage}%
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-stone-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary to-yellow-400 h-full rounded-full transition-all duration-1000"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Motivational Message */}
        <div className="mb-8 text-center">
          {percentage === 100 && (
            <p className="text-2xl font-bold text-primary">
              🌟 Perfekt! Du bist ein Super-Leser! 🌟
            </p>
          )}
          {percentage >= 75 && percentage < 100 && (
            <p className="text-2xl font-bold text-primary">
              ✨ Toll gemacht! Du bist super! ✨
            </p>
          )}
          {percentage >= 50 && percentage < 75 && (
            <p className="text-2xl font-bold text-primary">
              👍 Gut gemacht! Weiter so! 👍
            </p>
          )}
          {percentage < 50 && (
            <p className="text-2xl font-bold text-primary">
              💪 Das wird noch besser! 💪
            </p>
          )}
        </div>

        {/* Home Button */}
        <button
          onClick={onHome}
          className="w-full py-4 bg-primary text-white text-2xl font-bold rounded-2xl shadow-xl flex items-center justify-center gap-3 hover:bg-orange-600 transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-3xl">home</span>
          <span>Zurück zum Start</span>
        </button>

      </div>
    </div>
  );
};
