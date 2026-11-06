import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WordLevel } from '../types';
import { wortSegmentierung, Lautabschnitt, resolveCanonicalWord } from '../data/laute';
import { tileColors } from '../data/words';
import { speak } from '../utils/tts';

interface ChunkTile {
  id: string;
  text: string;   // Kachel-Beschriftung (Schreibweise im Wort)
  sound: string;  // /Lautabschnitte/<sound>.mp3
  orderIdx: number;
  colorClass: string;
}

interface LautabschnitteScreenProps {
  level: WordLevel;
  onComplete: (wasFirstTry: boolean) => void;
  onExit: () => void;
  sessionProgress: number;
  totalLevels: number;
}

// Findet die Segmentierung fuer ein Wort (case-insensitiv, inkl. "FUSS" -> "Fuß")
const findSegments = (word: string): Lautabschnitt[] | null => {
  const canonical = resolveCanonicalWord(word);
  return wortSegmentierung[canonical] || null;
};

export const LautabschnitteScreen: React.FC<LautabschnitteScreenProps> = ({
  level, onComplete, onExit, sessionProgress, totalLevels,
}) => {
  const [bankTiles, setBankTiles] = useState<ChunkTile[]>([]);
  const [placedTiles, setPlacedTiles] = useState<(ChunkTile | null)[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hasVideo, setHasVideo] = useState(true);
  const [shake, setShake] = useState(false);
  const hasFailedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const canonicalWord = resolveCanonicalWord(level.word);
  const segments = findSegments(level.word);

  // Wort vorlesen (das ganze Wort zuerst hoeren, mit TTS-Fallback)
  const playWord = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); }
    if (!level.sound) {
      speak(canonicalWord);
      return;
    }
    const audio = new Audio(level.sound);
    audioRef.current = audio;
    let fallbackCalled = false;
    const fallback = () => {
      if (fallbackCalled) return;
      fallbackCalled = true;
      speak(canonicalWord);
    };
    audio.onerror = fallback;
    audio.play().catch((e) => {
      if (e?.name !== 'AbortError') fallback();
    });
  }, [level.sound, canonicalWord]);

  // Laut einer Kachel spielen (mit TTS-Fallback falls MP3 fehlt)
  const playChunk = useCallback((sound: string, fallbackText?: string) => {
    if (audioRef.current) { audioRef.current.pause(); }
    const audio = new Audio(`/Lautabschnitte/${sound}.mp3`);
    audioRef.current = audio;
    let fallbackCalled = false;
    const fallback = () => {
      if (fallbackCalled) return;
      fallbackCalled = true;
      speak((fallbackText || sound).toLowerCase());
    };
    audio.onerror = fallback;
    audio.play().catch((e) => {
      if (e?.name !== 'AbortError') fallback();
    });
  }, []);

  // Level initialisieren
  useEffect(() => {
    if (!segments) return;
    const tiles: ChunkTile[] = segments.map((seg, index) => ({
      id: `${seg.text}-${index}-${Math.random()}`,
      text: seg.text,
      sound: seg.sound,
      orderIdx: index,
      colorClass: tileColors[index % tileColors.length],
    }));
    setBankTiles([...tiles].sort(() => Math.random() - 0.5));
    setPlacedTiles(new Array(segments.length).fill(null));
    setIsCorrect(false);
    setHasVideo(true);
    hasFailedRef.current = false;
    // Wort automatisch vorlesen (Browser-Autoplay-Regeln: stiller Fallback)
    const t = setTimeout(playWord, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  // Startet das Belohnungs-Video explizit sobald das Overlay erscheint
  useEffect(() => {
    if (isCorrect && hasVideo && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [isCorrect, hasVideo]);

  const moveToSlot = useCallback((tileId: string) => {
    const tileIndex = bankTiles.findIndex(t => t.id === tileId);
    if (tileIndex === -1) return;
    const tile = bankTiles[tileIndex];
    const emptySlotIndex = placedTiles.findIndex(s => s === null);
    if (emptySlotIndex === -1) return;

    const newBank = [...bankTiles];
    newBank.splice(tileIndex, 1);
    const newPlaced = [...placedTiles];
    newPlaced[emptySlotIndex] = tile;

    setBankTiles(newBank);
    setPlacedTiles(newPlaced);
    playChunk(tile.sound, tile.text);
  }, [bankTiles, placedTiles, playChunk]);

  const returnToBank = useCallback((slotIndex: number) => {
    const tile = placedTiles[slotIndex];
    if (!tile) return;
    const newPlaced = [...placedTiles];
    newPlaced[slotIndex] = null;
    setBankTiles(prev => [...prev, tile]);
    setPlacedTiles(newPlaced);
    playChunk(tile.sound, tile.text);
  }, [placedTiles, playChunk]);

  const checkAnswer = useCallback(() => {
    const ordered = placedTiles.every((t, i) => t && t.orderIdx === i);
    if (ordered) {
      setIsCorrect(true);
      playWord();
    } else {
      hasFailedRef.current = true;
      setShake(true);
      setTimeout(() => setShake(false), 500);
      speak('Versuch es noch einmal');
    }
  }, [placedTiles, playWord]);

  // Belohnung: fertig -> weiter
  const handleWeiter = () => {
    if (audioRef.current) audioRef.current.pause();
    onComplete(!hasFailedRef.current);
  };

  if (!segments) {
    // Fallback: kein Segmentierungseintrag -> Buchstaben-Modus wie GameScreen
    return (
      <div className="flex flex-col items-center justify-center min-h-[var(--vh)] p-6 text-center">
        <p className="text-stone-500 mb-4">Für „{canonicalWord}" gibt es noch keine Lautabschnitte.</p>
        <button onClick={onExit} className="px-6 py-3 bg-primary text-white rounded-xl font-bold">Zurück</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto bg-background">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4">
        <button onClick={onExit} className="p-2 rounded-full hover:bg-stone-200 text-stone-600 transition-colors">
          <span className="material-symbols-outlined text-3xl">close</span>
        </button>
        <span className="text-xl font-bold text-stone-700">Laute zusammensetzen</span>
        <button onClick={() => speak('Setze die Laute in die richtige Reihenfolge')} className="p-2 rounded-full hover:bg-stone-200 text-stone-600 transition-colors">
          <span className="material-symbols-outlined text-3xl">help</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-1 px-6 mb-4">
        {Array.from({ length: totalLevels }).map((_, i) => (
          <div key={i} className={`h-2 flex-1 rounded-full ${i < sessionProgress ? 'bg-primary' : 'bg-stone-200'}`} />
        ))}
      </div>

      {/* Bild + Wort hoeren */}
      <div className="flex-1 px-4 flex flex-col items-center justify-center py-2">
        <div className="relative w-full aspect-[4/3] bg-white rounded-2xl shadow-sm border-4 border-white overflow-hidden">
          <img src={level.image} alt={canonicalWord} className="w-full h-full object-contain" />
        </div>
        <button
          onClick={playWord}
          className="mt-3 px-6 py-3 bg-blue-500 text-white text-lg font-bold rounded-2xl shadow-lg hover:bg-blue-600 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-2xl">volume_up</span>
          Wort hören
        </button>
      </div>

      <div className="text-center py-2">
        <p className="text-stone-500 font-medium">Setze die Laute zusammen</p>
      </div>

      {/* Slot-Reihe */}
      <div className={`px-4 py-4 flex justify-center gap-2 sm:gap-3 mb-4 select-none ${shake ? 'animate-shake' : ''}`}>
        {placedTiles.map((tile, index) => (
          <div
            key={index}
            onClick={() => tile && returnToBank(index)}
            className={`
                min-w-14 h-16 sm:min-w-16 sm:h-20 rounded-xl border-2 border-dashed px-2
                flex items-center justify-center transition-all cursor-pointer
                ${tile ? 'border-transparent' : 'border-stone-300 bg-stone-100'}
            `}
          >
            {tile && (
              <div className={`${tile.colorClass} h-full px-3 rounded-xl shadow-[0_4px_0_0_rgba(0,0,0,0.2)] flex items-center justify-center text-white text-2xl sm:text-3xl font-bold`}>
                {tile.text}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Kachel-Bank */}
      <div className="px-4 pb-6 grid grid-cols-3 sm:grid-cols-4 gap-3 place-items-center select-none min-h-[120px]">
        {bankTiles.map((tile) => (
          <div
            key={tile.id}
            onClick={() => moveToSlot(tile.id)}
            className={`
                ${tile.colorClass}
                min-w-16 h-16 sm:min-w-20 sm:h-20 px-3 rounded-xl shadow-[0_4px_0_0_rgba(0,0,0,0.2)]
                flex items-center justify-center text-white text-2xl sm:text-3xl font-bold
                cursor-pointer hover:scale-105 transition-transform
            `}
          >
            {tile.text}
          </div>
        ))}
      </div>

      {/* Pruefen-Button */}
      <div className="p-4 bg-white/80 backdrop-blur border-t border-stone-100 sticky bottom-0">
        <button
          onClick={checkAnswer}
          disabled={placedTiles.includes(null) || isCorrect}
          className={`
              w-full py-4 rounded-xl text-xl font-bold text-white shadow-lg transition-all
              ${placedTiles.includes(null) || isCorrect
                  ? 'bg-stone-300 cursor-not-allowed'
                  : 'bg-primary hover:bg-orange-600 active:scale-[0.98]'}
          `}
        >
          Prüfen
        </button>
      </div>

      {/* Belohnungs-Overlay mit Animation */}
      {isCorrect && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 text-center">
          <p className="text-3xl font-bold text-stone-700 mb-2">Super gemacht! 🎉</p>
          <div className="w-full max-w-sm aspect-square bg-white rounded-2xl overflow-hidden mb-4">
            {hasVideo ? (
              <video
                ref={videoRef}
                src={`/WordAnimationen/${canonicalWord}.mp4`}
                autoPlay
                muted
                playsInline
                loop
                onError={() => setHasVideo(false)}
                className="w-full h-full object-contain"
              />
            ) : (
              <img src={level.image} alt={canonicalWord} className="w-full h-full object-contain" />
            )}
          </div>
          <div className="flex gap-2 mb-6">
            {placedTiles.map((tile, i) => (
              <div key={i} className={`${tile?.colorClass} px-3 py-2 rounded-xl text-white text-2xl font-bold shadow-[0_4px_0_0_rgba(0,0,0,0.2)]`}>
                {tile?.text}
              </div>
            ))}
          </div>
          <button
            onClick={handleWeiter}
            className="w-full max-w-sm py-4 bg-primary text-white text-xl font-bold rounded-2xl shadow-xl hover:bg-orange-600 transition-all"
          >
            Weiter
          </button>
        </div>
      )}
    </div>
  );
};
