import React, { useState, useEffect, useMemo } from 'react';
import { GameScreen } from './components/GameScreen';
import { LetterGameScreen } from './components/LetterGameScreen';
import { LautabschnitteScreen } from './components/LautabschnitteScreen';
import { TierSpielScreen } from './components/TierSpielScreen';
import { StrandSpielScreen } from './components/StrandSpielScreen';
import { SuccessScreen } from './components/SuccessScreen';
import { CongratulationsScreen } from './components/CongratulationsScreen';
import { ParentDashboard } from './components/ParentDashboard';
import { getAvailableLessons, Lesson, shuffleArray } from './utils/lessonLoader';
import { GameView, GameMode, UserProgress, WordLevel } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<GameView>('start');
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [gameMode, setGameMode] = useState<GameMode>('words');

  // Lesson State
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string>('');

  // Session progress tracking
  const [sessionProgress, setSessionProgress] = useState(0);
  const [firstTimeCorrect, setFirstTimeCorrect] = useState(0);

  // Mock user progress
  const [progress, setProgress] = useState<UserProgress>({
    wordsLearned: 124,
    badges: 8,
    streak: 5,
    completedLevels: [],
  });

  useEffect(() => {
    const loadedLessons = getAvailableLessons();
    setLessons(loadedLessons);
    if (loadedLessons.length > 0) {
        setActiveLessonId(loadedLessons[0].id);
    }
  }, []);

  // Store all available levels and current session levels
  const [sessionLevels, setSessionLevels] = useState<WordLevel[]>([]);

  const allAvailableLevels: WordLevel[] = useMemo(() => {
    const lesson = lessons.find(l => l.id === activeLessonId);
    return lesson ? lesson.levels : [];
  }, [lessons, activeLessonId]);

  const activeLevels = sessionLevels.length > 0 ? sessionLevels : allAvailableLevels.slice(0, 12);

  const handleLevelComplete = (wasFirstTry: boolean) => {
    // Save progress
    if (gameMode === 'words' && activeLevels.length === 0) return;

    if (gameMode === 'words') {
      const levelId = activeLevels[currentLevelIndex].id;
      if (!progress.completedLevels.includes(levelId)) {
          setProgress(prev => ({
              ...prev,
              wordsLearned: prev.wordsLearned + 1,
              completedLevels: [...prev.completedLevels, levelId]
          }));
      }
    }

    // Update session progress
    setSessionProgress(prev => prev + 1);
    if (wasFirstTry) {
      setFirstTimeCorrect(prev => prev + 1);
    }

    // Show reward animation on SuccessScreen for every solved word (including the 12th)
    setView('success');
  };

  const handleLetterLevelComplete = (wasFirstTry: boolean) => {
    // Update session progress
    const newProgress = sessionProgress + 1;
    setSessionProgress(newProgress);
    if (wasFirstTry) {
      setFirstTimeCorrect(prev => prev + 1);
    }

    // Check if we've completed 12 levels
    if (newProgress >= 12) {
      setView('congratulations');
    }
    // For letters, we stay in letterGame - the component regenerates a new round
  };

  const handleLauteLevelComplete = (wasFirstTry: boolean) => {
    const newProgress = sessionProgress + 1;
    setSessionProgress(newProgress);
    if (wasFirstTry) {
      setFirstTimeCorrect(prev => prev + 1);
    }
    if (newProgress >= 12) {
      setView('congratulations');
    } else {
      setCurrentLevelIndex(prev => (prev + 1) % Math.max(activeLevels.length, 1));
      // view stays 'lauteGame' - key remount zeigt das naechste Level
    }
  };

  const nextLevel = () => {
    if (activeLevels.length === 0) return;
    if (sessionProgress >= 12) {
      setView('congratulations');
      return;
    }
    const nextIdx = (currentLevelIndex + 1) % activeLevels.length;
    setCurrentLevelIndex(nextIdx);
    setView('game');
  };

  const resetSession = () => {
    setSessionProgress(0);
    setFirstTimeCorrect(0);
    setCurrentLevelIndex(0);
    setSessionLevels([]);
    setView('start');
  };

  const startWordGame = () => {
    // Randomize and select 12 levels each time we start playing
    if (allAvailableLevels.length > 0) {
      const shuffled = shuffleArray(allAvailableLevels);
      const selected = shuffled.slice(0, 12);
      setSessionLevels(selected);
      setSessionProgress(0);
      setFirstTimeCorrect(0);
      setCurrentLevelIndex(0);
      setGameMode('words');
      setView('game');
    }
  };

  const startLetterGame = () => {
    setSessionProgress(0);
    setFirstTimeCorrect(0);
    setGameMode('letters');
    setView('letterGame');
  };

  const startLauteGame = () => {
    if (allAvailableLevels.length > 0) {
      const shuffled = shuffleArray(allAvailableLevels);
      const selected = shuffled.slice(0, 12);
      setSessionLevels(selected);
      setSessionProgress(0);
      setFirstTimeCorrect(0);
      setCurrentLevelIndex(0);
      setGameMode('laute');
      setView('lauteGame');
    }
  };

  const renderView = () => {
    switch (view) {
      case 'start':
        return (
            <div className="flex flex-col items-center justify-center min-h-[var(--vh)] bg-white p-6 text-center">
                <div className="w-full max-w-2xl mb-8">
                    <img src="/Titelbild.png" alt="Alle Kinder lernen Lesen" className="w-full h-auto" />
                </div>
                <p className="text-stone-500 mb-8 text-lg">Lerne spielend lesen!</p>

                <button
                    onClick={() => setView('modeSelect')}
                    className="w-full max-w-sm py-4 bg-primary text-white text-xl font-bold rounded-2xl shadow-xl hover:bg-orange-600 transition-all mb-4"
                >
                    Spielen
                </button>
                <button
                    onClick={() => setView('parents')}
                    className="text-stone-400 font-semibold hover:text-stone-600"
                >
                    Für Eltern
                </button>
            </div>
        );
      case 'modeSelect':
        return (
            <div className="flex flex-col items-center justify-center min-h-[var(--vh)] bg-white p-6 text-center">
                <button
                    onClick={() => setView('start')}
                    className="absolute top-4 left-4 p-2 rounded-full hover:bg-stone-200 text-stone-600 transition-colors"
                >
                    <span className="material-symbols-outlined text-3xl">arrow_back</span>
                </button>

                <h1 className="text-3xl font-bold text-stone-700 mb-8">Was möchtest du lernen?</h1>

                {/* Game Mode Buttons */}
                <div className="w-full max-w-sm space-y-4">
                    <button
                        onClick={startLetterGame}
                        className="w-full py-6 bg-blue-500 text-white text-2xl font-bold rounded-2xl shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3"
                    >
                        <span className="material-symbols-outlined text-4xl">abc</span>
                        Buchstaben lernen
                    </button>

                    <button
                        onClick={startWordGame}
                        disabled={activeLevels.length === 0}
                        className={`w-full py-6 text-white text-2xl font-bold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 ${
                            activeLevels.length === 0
                                ? 'bg-stone-300 cursor-not-allowed'
                                : 'bg-green-500 hover:bg-green-600'
                        }`}
                    >
                        <span className="material-symbols-outlined text-4xl">menu_book</span>
                        Wörter lernen
                    </button>

                    <button
                        onClick={startLauteGame}
                        disabled={activeLevels.length === 0}
                        className={`w-full py-6 text-white text-2xl font-bold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 ${
                            activeLevels.length === 0
                                ? 'bg-stone-300 cursor-not-allowed'
                                : 'bg-purple-500 hover:bg-purple-600'
                        }`}
                    >
                        <span className="material-symbols-outlined text-4xl">hearing</span>
                        Laute zusammensetzen
                    </button>

                    <button
                        onClick={() => setView('tierSpiel')}
                        className="w-full py-6 bg-rose-500 text-white text-2xl font-bold rounded-2xl shadow-xl hover:bg-rose-600 transition-all flex items-center justify-center gap-3"
                    >
                        <span className="material-symbols-outlined text-4xl">pets</span>
                        Tiere finden
                    </button>

                    <button
                        onClick={() => setView('strandSpiel')}
                        className="w-full py-6 bg-sky-500 text-white text-2xl font-bold rounded-2xl shadow-xl hover:bg-sky-600 transition-all flex items-center justify-center gap-3"
                    >
                        <span className="material-symbols-outlined text-4xl">beach_access</span>
                        Am Strand
                    </button>
                </div>

                {/* Lesson Selector for Words */}
                {lessons.length > 1 && (
                    <div className="mt-8 w-full max-w-sm">
                        <label className="block text-left text-sm font-bold text-stone-400 mb-1 ml-1">Lektion für Wörter:</label>
                        <select
                            value={activeLessonId}
                            onChange={(e) => setActiveLessonId(e.target.value)}
                            className="w-full p-3 rounded-xl border-2 border-stone-200 bg-white font-bold text-stone-600 focus:border-primary focus:outline-none"
                        >
                            {lessons.map(l => (
                                <option key={l.id} value={l.id}>{l.name} ({l.levels.length} Wörter)</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
        );
      case 'game':
        return (
          <GameScreen
            level={activeLevels[currentLevelIndex]}
            onComplete={handleLevelComplete}
            onExit={() => setView('start')}
            sessionProgress={sessionProgress}
            totalLevels={12}
          />
        );
      case 'letterGame':
        return (
          <LetterGameScreen
            key={sessionProgress} // Force re-mount for new letter
            onComplete={handleLetterLevelComplete}
            onExit={() => setView('start')}
            sessionProgress={sessionProgress}
            totalLevels={12}
          />
        );
      case 'lauteGame':
        return (
          <LautabschnitteScreen
            key={`${sessionProgress}-${currentLevelIndex}`} // Force re-mount pro Level
            level={activeLevels[currentLevelIndex]}
            onComplete={handleLauteLevelComplete}
            onExit={() => setView('start')}
            sessionProgress={sessionProgress}
            totalLevels={12}
          />
        );
      case 'tierSpiel':
        return (
          <TierSpielScreen onExit={() => setView('start')} />
        );
      case 'strandSpiel':
        return (
          <StrandSpielScreen onExit={() => setView('start')} />
        );
      case 'success':
        return (
          <SuccessScreen
            level={activeLevels[currentLevelIndex]}
            onNext={nextLevel}
          />
        );
      case 'congratulations':
        return (
          <CongratulationsScreen
            firstTimeCorrect={firstTimeCorrect}
            totalLevels={12}
            onHome={resetSession}
          />
        );
      case 'parents':
        return (
          <ParentDashboard
            progress={progress}
            onHome={() => setView('start')}
          />
        );
      default:
        return <div>Error</div>;
    }
  };

  return (
    <div className="w-full min-h-[var(--vh)] font-sans bg-background text-stone-800">
      {renderView()}
    </div>
  );
};

export default App;
