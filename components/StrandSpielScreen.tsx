import React, { useState, useEffect, useCallback, useRef } from 'react';
import { speak } from '../utils/tts';

// Strand-Spiel: Ein Wort wird eingeblendet. Das Kind liest das Wort und tippt
// das richtige Objekt im Strandbild an -> Wort wird groß und gruen, das
// Belohnungsvideo (H3, MIT Geraeusch) spielt ueber dem Bild. Gags z.B.: der Hai
// taucht hinter dem Taucher auf, der Surfer faellt ins Wasser.
// Das Wort wird NICHT vorgelesen — Lesen ist die Uebung.

interface StrandObject {
  id: string;
  name: string;
  box: [number, number, number, number]; // tight pixel box [x1,y1,x2,y2]
  tapBoxes?: [number, number, number, number][] | null; // mehrere Taps (z.B. 2 Kinder)
  clip: string;   // relative to /StrandSpiel/
  sound: string;  // relative to /StrandSpiel/ (Fallback-Audio)
  cutout: string; // relative to /StrandSpiel/
}

interface StrandData {
  width: number;
  height: number;
  objects: StrandObject[];
}

interface StrandSpielScreenProps {
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

export const StrandSpielScreen: React.FC<StrandSpielScreenProps> = ({ onExit }) => {
  const [data, setData] = useState<StrandData | null>(null);
  const [order, setOrder] = useState<StrandObject[]>([]);
  const [round, setRound] = useState(0);
  const [solved, setSolved] = useState(false);
  const [videoOk, setVideoOk] = useState(true);
  const [shake, setShake] = useState(false);
  const [finished, setFinished] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const target = order[round] || null;

  useEffect(() => {
    fetch('/StrandSpiel/regions.json')
      .then(r => r.json())
      .then((d: StrandData) => {
        setData(d);
        setOrder(shuffle(d.objects));
      })
      .catch(() => setData(null));
  }, []);

  // Fallback-Geraeusch (nur wenn das Video nicht laeuft — das Clip-Audio selbst
  // kommt aus dem H3-Video)
  const playSound = useCallback((obj: StrandObject) => {
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(`/StrandSpiel/${obj.sound}`);
    audioRef.current = audio;
    audio.play().catch(() => {});
  }, []);

  // Belohnungsvideo explizit starten, sobald es erscheint (MIT Ton)
  useEffect(() => {
    if (solved && videoOk && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [solved, videoOk]);

  const handleTap = useCallback((obj: StrandObject) => {
    if (solved || !target) return;
    if (obj.id === target.id) {
      setSolved(true);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      speak('Versuch es noch einmal');
    }
  }, [solved, target]);

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
        <p className="text-stone-500 mb-4">Das Strand-Spiel konnte nicht geladen werden.</p>
        <button onClick={onExit} className="px-6 py-3 bg-primary text-white rounded-xl font-bold">Zurück</button>
      </div>
    );
  }

  const pct = (v: number, total: number) => `${(v / total) * 100}%`;

  // Tap-Boxen: Masken-Boxen plus Spielraum fuer Kinderfinger, Mindestgroesse
  // fuer kleine Motive (z.B. die Haiflosse). Ueberlappungen: kleinere Boxen
  // liegen oben (z-index), damit der Hai neben dem Taucher tippbar bleibt.
  const tapBoxStyle = (b: [number, number, number, number]) => {
    const padX = data.width * 0.015;
    const padY = data.height * 0.015;
    const minW = data.width * 0.09;
    const minH = data.height * 0.07;
    let x1 = Math.max(0, b[0] - padX);
    let y1 = Math.max(0, b[1] - padY);
    let x2 = Math.min(data.width, b[2] + padX);
    let y2 = Math.min(data.height, b[3] + padY);
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    const w = Math.max(x2 - x1, minW);
    const h = Math.max(y2 - y1, minH);
    x1 = Math.max(0, Math.min(cx - w / 2, data.width - w));
    y1 = Math.max(0, Math.min(cy - h / 2, data.height - h));
    x2 = x1 + w;
    y2 = y1 + h;
    return {
      left: pct(x1, data.width),
      top: pct(y1, data.height),
      width: pct(w, data.width),
      height: pct(h, data.height),
    };
  };

  const boxArea = (b: [number, number, number, number]) => (b[2] - b[0]) * (b[3] - b[1]);
  const allTaps: { obj: StrandObject; box: [number, number, number, number] }[] = [];
  for (const o of data.objects) {
    for (const b of (o.tapBoxes && o.tapBoxes.length ? o.tapBoxes : [o.box])) {
      allTaps.push({ obj: o, box: b });
    }
  }
  allTaps.sort((p, q) => boxArea(q.box) - boxArea(p.box)); // gross unten, klein oben

  return (
    <div className="flex flex-col min-h-[var(--vh)] mx-auto bg-background">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4">
        <button onClick={onExit} className="p-2 rounded-full hover:bg-stone-200 text-stone-600 transition-colors">
          <span className="material-symbols-outlined text-3xl">close</span>
        </button>
        <span className="text-xl font-bold text-stone-700">Am Strand</span>
        <button onClick={() => speak('Tippe auf das, was du liest')} className="p-2 rounded-full hover:bg-stone-200 text-stone-600 transition-colors">
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
          <img src="/StrandSpiel/scene.jpg" alt="Strand mit Boot, Wal und Sandburg" className="w-full h-full object-fill select-none" draggable={false} />

          {/* Belohnungsvideo deckt das Bild exakt ab (MIT Geraeusch) */}
          {solved && videoOk && target && (
            <video
              ref={videoRef}
              src={`/StrandSpiel/${target.clip}`}
              autoPlay
              playsInline
              onError={() => { setVideoOk(false); playSound(target); }}
              className="absolute inset-0 w-full h-full object-fill"
            />
          )}

          {/* Fallback: angeschnittenes Objekt huepft (Vollbild-Canvas, nur das Objekt sichtbar) */}
          {solved && !videoOk && target && (
            <>
              <img
                src={`/StrandSpiel/${target.cutout}`}
                alt={target.name}
                className="absolute inset-0 w-full h-full object-fill animate-bounce"
              />
              <div
                className="absolute rounded-2xl border-4 border-green-500 animate-pulse pointer-events-none"
                style={tapBoxStyle(target.box)}
              />
            </>
          )}

          {/* Unsichtbare Tap-Bereiche */}
          {!solved && allTaps.map((t, i) => (
            <button
              key={`${t.obj.id}-${i}`}
              aria-label={t.obj.name}
              onClick={() => handleTap(t.obj)}
              className="absolute rounded-2xl active:bg-white/20 transition-colors"
              style={{ ...tapBoxStyle(t.box), zIndex: i + 1 }}
            />
          ))}
        </div>
      </div>

      {/* Zielwort */}
      <div className="flex-1 flex flex-col items-center justify-end px-4 pb-8 text-center">
        <p className="text-stone-400 font-medium mb-1">Wo ist das?</p>
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
          <p className="text-xl text-stone-500 mb-8">Du hast alles am Strand gefunden!</p>
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