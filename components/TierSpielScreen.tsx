import React, { useState, useEffect, useCallback, useRef } from 'react';
import { speak } from '../utils/tts';

// Tier-Spiel: Der Name eines Tieres wird eingeblendet. Das Kind liest den Namen
// und tippt das richtige Tier im Bild an -> Name wird groß und gruen, das Tier
// gibt sein Geräusch von sich und bewegt sich (H3-Belohnungsvideo ueber dem Bild).
// Der Name wird NICHT vorgelesen — Lesen ist die Uebung.

interface TierAnimal {
  id: string;
  name: string;
  box: [number, number, number, number]; // tight pixel box [x1,y1,x2,y2]
  clip: string;   // relative to /TierSpiel/
  sound: string;  // relative to /TierSpiel/
  cutout: string; // relative to /TierSpiel/
}

interface TierData {
  width: number;
  height: number;
  animals: TierAnimal[];
}

interface TierSpielScreenProps {
  onExit: () => void;
}

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const TierSpielScreen: React.FC<TierSpielScreenProps> = ({ onExit }) => {
  const [data, setData] = useState<TierData | null>(null);
  const [order, setOrder] = useState<TierAnimal[]>([]);
  const [round, setRound] = useState(0);
  const [solved, setSolved] = useState(false);
  const [videoOk, setVideoOk] = useState(true);
  const [shake, setShake] = useState(false);
  const [finished, setFinished] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const target = order[round] || null;

  useEffect(() => {
    fetch('/TierSpiel/regions.json')
      .then(r => r.json())
      .then((d: TierData) => {
        setData(d);
        setOrder(shuffle(d.animals));
      })
      .catch(() => setData(null));
  }, []);

  const playSound = useCallback((animal: TierAnimal) => {
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(`/TierSpiel/${animal.sound}`);
    audioRef.current = audio;
    audio.play().catch(() => {});
  }, []);

  // Belohnungsvideo explizit starten, sobald es erscheint
  useEffect(() => {
    if (solved && videoOk && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [solved, videoOk]);

  const handleTap = useCallback((animal: TierAnimal) => {
    if (solved || !target) return;
    if (animal.id === target.id) {
      setSolved(true);
      playSound(target);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      speak('Versuch es noch einmal');
    }
  }, [solved, target, playSound]);

  const handleWeiter = () => {
    if (audioRef.current) audioRef.current.pause();
    if (round + 1 >= order.length) {
      setFinished(true);
    } else {
      setSolved(false);
      setVideoOk(true);
      setRound(r => r + 1);
    }
  };

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[var(--vh)] p-6 text-center">
        <p className="text-stone-500 mb-4">Das Tier-Spiel konnte nicht geladen werden.</p>
        <button onClick={onExit} className="px-6 py-3 bg-primary text-white rounded-xl font-bold">Zurück</button>
      </div>
    );
  }

  const pct = (v: number, total: number) => `${(v / total) * 100}%`;

  // Tap-Boxen: enge Masken-Boxen plus etwas Spielraum fuer Kinderfinger
  const tapBox = (a: TierAnimal) => {
    const padX = data.width * 0.015;
    const padY = data.height * 0.015;
    const x1 = Math.max(0, a.box[0] - padX);
    const y1 = Math.max(0, a.box[1] - padY);
    const x2 = Math.min(data.width, a.box[2] + padX);
    const y2 = Math.min(data.height, a.box[3] + padY);
    return {
      left: pct(x1, data.width),
      top: pct(y1, data.height),
      width: pct(x2 - x1, data.width),
      height: pct(y2 - y1, data.height),
    };
  };

  return (
    <div className="flex flex-col min-h-[var(--vh)] mx-auto bg-background">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4">
        <button onClick={onExit} className="p-2 rounded-full hover:bg-stone-200 text-stone-600 transition-colors">
          <span className="material-symbols-outlined text-3xl">close</span>
        </button>
        <span className="text-xl font-bold text-stone-700">Tiere finden</span>
        <button onClick={() => speak('Tippe das Tier an, dessen Namen du liest')} className="p-2 rounded-full hover:bg-stone-200 text-stone-600 transition-colors">
          <span className="material-symbols-outlined text-3xl">help</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-1 px-6 mb-4">
        {order.map((_, i) => (
          <div key={i} className={`h-2 flex-1 rounded-full ${i < round + (solved ? 1 : 0) ? 'bg-primary' : 'bg-stone-200'}`} />
        ))}
      </div>

      {/* Bild mit Tap-Bereichen — randlos ueber die volle Bildschirmbreite */}
      <div>
        <div className={`relative w-full aspect-[1280/714] overflow-hidden ${shake ? 'animate-shake' : ''}`}>
          <img src="/TierSpiel/scene.jpg" alt="Dschungel mit Tieren" className="w-full h-full object-fill select-none" draggable={false} />

          {/* Belohnungsvideo deckt das Bild exakt ab */}
          {solved && videoOk && target && (
            <video
              ref={videoRef}
              src={`/TierSpiel/${target.clip}`}
              autoPlay
              muted
              playsInline
              onError={() => setVideoOk(false)}
              className="absolute inset-0 w-full h-full object-fill"
            />
          )}

          {/* Fallback: angeschnittenes Tier huepft (Vollbild-Canvas, nur das Tier sichtbar) */}
          {solved && !videoOk && target && (
            <>
              <img
                src={`/TierSpiel/${target.cutout}`}
                alt={target.name}
                className="absolute inset-0 w-full h-full object-fill animate-bounce"
              />
              <div
                className="absolute rounded-2xl border-4 border-green-500 animate-pulse pointer-events-none"
                style={tapBox(target)}
              />
            </>
          )}

          {/* Unsichtbare Tap-Bereiche */}
          {!solved && data.animals.map((a) => (
            <button
              key={a.id}
              aria-label={a.name}
              onClick={() => handleTap(a)}
              className="absolute rounded-2xl active:bg-white/20 transition-colors"
              style={tapBox(a)}
            />
          ))}
        </div>
      </div>

      {/* Zielname */}
      <div className="flex-1 flex flex-col items-center justify-end px-4 pb-8 text-center">
        <p className="text-stone-400 font-medium mb-1">Welches Tier ist das?</p>
        {target && (
          <p
            className={`font-bold text-stone-800 transition-all duration-500 ${
              solved ? 'text-6xl sm:text-7xl text-green-600 scale-110' : 'text-4xl sm:text-5xl'
            }`}
          >
            {target.name}
          </p>
        )}
        {solved && (
          <p className="mt-2 text-2xl">🎉</p>
        )}
      </div>

      {/* Weiter-Button nach Belohnung */}
      {solved && (
        <div className="p-4 bg-white/80 backdrop-blur border-t border-stone-100">
          <button
            onClick={handleWeiter}
            className="w-full py-4 bg-primary text-white text-xl font-bold rounded-2xl shadow-xl hover:bg-orange-600 transition-all"
          >
            {round + 1 >= order.length ? 'Fertig' : 'Weiter'}
          </button>
        </div>
      )}

      {/* Abschluss-Overlay */}
      {finished && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 text-center">
          <p className="text-4xl font-bold text-stone-700 mb-4">Super gemacht! 🎉</p>
          <p className="text-xl text-stone-500 mb-8">Du hast alle Tiere gefunden!</p>
          <button
            onClick={onExit}
            className="w-full max-w-sm py-4 bg-primary text-white text-xl font-bold rounded-2xl shadow-xl hover:bg-orange-600 transition-all"
          >
            Fertig
          </button>
        </div>
      )}
    </div>
  );
};
