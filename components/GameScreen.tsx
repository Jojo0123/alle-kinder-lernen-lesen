import React, { useState, useEffect, useCallback } from 'react';
import { WordLevel, LetterTile } from '../types';
import { tileColors } from '../data/words';
import { speak } from '../utils/tts';

interface GameScreenProps {
  level: WordLevel;
  onComplete: (wasFirstTry: boolean) => void;
  onExit: () => void;
  sessionProgress: number;
  totalLevels: number;
}

export const GameScreen: React.FC<GameScreenProps> = ({ level, onComplete, onExit, sessionProgress, totalLevels }) => {
  const [bankTiles, setBankTiles] = useState<LetterTile[]>([]);
  const [placedTiles, setPlacedTiles] = useState<(LetterTile | null)[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Initialize level
  useEffect(() => {
    const word = level.word.toUpperCase();
    const chars = word.split('');

    // Create random distinct colors for visual appeal
    const tiles: LetterTile[] = chars.map((char, index) => ({
      id: `${char}-${index}-${Math.random()}`,
      char,
      colorClass: tileColors[index % tileColors.length],
    }));

    // Shuffle tiles for the bank
    const shuffled = [...tiles].sort(() => Math.random() - 0.5);

    setBankTiles(shuffled);
    setPlacedTiles(new Array(word.length).fill(null));
    setIsCorrect(false);
    setAttempts(0);
  }, [level]);

  // Handle dropping or clicking a tile from bank to slot
  const moveToSlot = useCallback((tileId: string) => {
    // Find the tile in the bank
    const tileIndex = bankTiles.findIndex(t => t.id === tileId);
    if (tileIndex === -1) return;

    const tile = bankTiles[tileIndex];

    // Find first empty slot
    const emptySlotIndex = placedTiles.findIndex(s => s === null);
    if (emptySlotIndex === -1) return; // No space left

    // Update state
    const newBank = [...bankTiles];
    newBank.splice(tileIndex, 1);

    const newPlaced = [...placedTiles];
    newPlaced[emptySlotIndex] = tile;

    setBankTiles(newBank);
    setPlacedTiles(newPlaced);

    // Play sound of letter (with TTS fallback if audio file is missing)
    const audio = new Audio(`/Laute/${tile.char}.mp3`);
    let fallbackCalled = false;
    const fallback = () => {
      if (fallbackCalled) return;
      fallbackCalled = true;
      speak(tile.char.toLowerCase());
    };
    audio.onerror = fallback;
    audio.play().catch((e) => {
      if (e?.name !== 'AbortError') fallback();
    });
  }, [bankTiles, placedTiles]);

  // Handle moving a tile back to bank
  const returnToBank = useCallback((slotIndex: number) => {
    const tile = placedTiles[slotIndex];
    if (!tile) return;

    const newPlaced = [...placedTiles];
    newPlaced[slotIndex] = null;

    setBankTiles(prev => [...prev, tile]);
    setPlacedTiles(newPlaced);
  }, [placedTiles]);

  // Check win condition
  const checkAnswer = useCallback(() => {
    const currentWord = placedTiles.map(t => t?.char || '').join('');
    setAttempts(prev => prev + 1);

    if (currentWord === level.word.toUpperCase()) {
      setIsCorrect(true);
      onComplete(attempts === 0); // First try if attempts is still 0
    } else {
        // Simple shake animation trigger or error sound could go here
        speak("Versuch es noch einmal");
    }
  }, [placedTiles, level, onComplete, attempts]);

  // Drag and Drop handlers (Native HTML5)
  const handleDragStart = (e: React.DragEvent, tileId: string) => {
    e.dataTransfer.setData("text/plain", tileId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDropSlot = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const tileId = e.dataTransfer.getData("text/plain");
    
    // Check if tile comes from bank
    const bankTile = bankTiles.find(t => t.id === tileId);
    
    if (bankTile) {
       // It's coming from the bank.
       // Special logic: If dropping onto a specific index, we want it THERE.
       // But our current simplified logic just fills first empty.
       // Let's stick to "move to slot" logic for simplicity which fills first available, 
       // unless we want to support arbitrary placement which is harder for kids (they might leave gaps).
       moveToSlot(tileId);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto bg-background">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4">
        <button onClick={onExit} className="p-2 rounded-full hover:bg-stone-200 text-stone-600 transition-colors">
          <span className="material-symbols-outlined text-3xl">close</span>
        </button>
        <span className="text-xl font-bold text-stone-700">Level 1</span>
        <button onClick={() => speak("Ziehe die Buchstaben in die richtige Reihenfolge")} className="p-2 rounded-full hover:bg-stone-200 text-stone-600 transition-colors">
          <span className="material-symbols-outlined text-3xl">help</span>
        </button>
      </div>

      {/* Progress Bar - 12 steps */}
      <div className="flex gap-1 px-6 mb-4">
        {Array.from({ length: totalLevels }).map((_, i) => (
            <div key={i} className={`h-2 flex-1 rounded-full ${i < sessionProgress ? 'bg-primary' : 'bg-stone-200'}`} />
        ))}
      </div>

      {/* Main Image */}
      <div className="flex-1 px-4 flex items-center justify-center py-2">
        <div className="relative w-full aspect-[4/3] bg-white rounded-2xl shadow-sm border-4 border-white overflow-hidden">
            <img
                src={level.image}
                alt={level.word}
                className="w-full h-full object-contain" // Full image, not cropped
            />
        </div>
      </div>

      <div className="text-center py-2">
          <p className="text-stone-500 font-medium">Bilde das Wort</p>
      </div>

      {/* Drop Slots Area */}
      <div className="px-4 py-4 flex justify-center gap-2 sm:gap-4 mb-4 select-none">
        {placedTiles.map((tile, index) => (
          <div
            key={index}
            onClick={() => returnToBank(index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDropSlot(e, index)}
            className={`
                w-14 h-16 sm:w-16 sm:h-20 rounded-xl border-2 border-dashed 
                flex items-center justify-center transition-all cursor-pointer
                ${tile ? 'border-transparent' : 'border-stone-300 bg-stone-100'}
            `}
          >
            {tile && (
              <div className={`${tile.colorClass} w-full h-full rounded-xl shadow-[0_4px_0_0_rgba(0,0,0,0.2)] flex items-center justify-center text-white text-3xl font-bold animate-bounce-short`}>
                {tile.char}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bank Tiles Area */}
      <div className="px-4 pb-8 grid grid-cols-4 gap-3 place-items-center select-none min-h-[160px]">
        {bankTiles.map((tile) => (
          <div
            key={tile.id}
            draggable
            onDragStart={(e) => handleDragStart(e, tile.id)}
            onClick={() => moveToSlot(tile.id)}
            className={`
                ${tile.colorClass} 
                w-16 h-16 sm:w-20 sm:h-20 rounded-xl shadow-[0_4px_0_0_rgba(0,0,0,0.2)] 
                flex items-center justify-center text-white text-4xl font-bold 
                cursor-grab active:cursor-grabbing hover:scale-105 transition-transform
            `}
          >
            {tile.char}
          </div>
        ))}
      </div>

      {/* Footer Action */}
      <div className="p-4 bg-white/80 backdrop-blur border-t border-stone-100 sticky bottom-0">
         <button 
            onClick={checkAnswer}
            disabled={placedTiles.includes(null)}
            className={`
                w-full py-4 rounded-xl text-xl font-bold text-white shadow-lg transition-all
                ${placedTiles.includes(null) 
                    ? 'bg-stone-300 cursor-not-allowed' 
                    : 'bg-primary hover:bg-orange-600 active:scale-[0.98]'}
            `}
         >
            Überprüfen
         </button>
      </div>
    </div>
  );
};