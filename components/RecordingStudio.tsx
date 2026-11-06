import React, { useState, useRef, useEffect } from 'react';
import { wortSegmentierung, mehrbuchstabenLaute, alleLautabschnitte } from '../data/laute';
import { speak } from '../utils/tts';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Sprech-Hinweise für die Buchstaben-Laute (phonetisch, nicht Buchstabennamen)
const LETTER_HINTS: Record<string, string> = {
  A: 'aaa', B: 'b', C: 'k', D: 'd', E: 'ää', F: 'fff', G: 'g', H: 'hhh',
  I: 'i', J: 'jjj', K: 'k', L: 'lll', M: 'mmm', N: 'nnn', O: 'o', P: 'p',
  Q: 'kw', R: 'rrr', S: 'sss', T: 't', U: 'u', V: 'fff', W: 'www', X: 'ks',
  Y: 'ü', Z: 'z',
};

const MEHRBUCHSTABEN_HINT_MAP: Record<string, string> = Object.fromEntries(
  mehrbuchstabenLaute.map((m) => [m.key, m.hint])
);

type Category = 'laute' | 'lautabschnitte' | 'woerter';

const CATEGORY_LABELS: Record<Category, string> = {
  laute: 'Buchstaben & Laute',
  lautabschnitte: 'Lautabschnitte',
  woerter: 'Wörter',
};

// Wortbilder & Wort-Audio über glob auflösen (funktioniert in dev + build)
const imageGlob = import.meta.glob('../data/1/images/*.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const soundGlob = import.meta.glob('../data/1/sounds/*.{mp3,wav,ogg}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const basename = (p: string) => p.split('/').pop()!.replace(/\.[^.]+$/, '');
const imageUrl: Record<string, string> = {};
for (const [p, url] of Object.entries(imageGlob)) imageUrl[basename(p)] = url;
const soundUrl: Record<string, string> = {};
for (const [p, url] of Object.entries(soundGlob)) soundUrl[basename(p)] = url;

// Beispiele pro Lautabschnitt aus der Segmentierung ableiten: „uh" in Stuhl, Kuh
const soundExamples: Record<string, string> = {};
{
  const counts: Record<string, number> = {};
  for (const [word, segs] of Object.entries(wortSegmentierung)) {
    for (const s of segs) {
      counts[s.sound] = (counts[s.sound] || 0) + 1;
      if (!soundExamples[s.sound]) soundExamples[s.sound] = `„${s.text}" in ${word}`;
      else if (counts[s.sound] <= 2) soundExamples[s.sound] += `, ${word}`;
    }
  }
}

// ---- Auto-Trim: Stille vorne/hinten entfernen ----
// Arbeitet auf PCM-Float32-Daten, RMS pro Fenster, Schwellwert relativ zur Peak-Lautstärke.
async function trimSilence(blob: Blob): Promise<{ blob: Blob; duration: number }> {
  const arrayBuffer = await blob.arrayBuffer();
  const ctx = new OfflineAudioContext(1, 1, 44100);
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
  const data = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;

  const windowSize = Math.floor(sampleRate * 0.01); // 10ms Fenster
  let peak = 0;
  for (let i = 0; i < data.length; i++) {
    const a = Math.abs(data[i]);
    if (a > peak) peak = a;
  }
  if (peak < 0.001) throw new Error('Aufnahme ist komplett still');

  const threshold = peak * 0.08; // 8% vom Peak = "kein Laut"

  const isLoud = (start: number) => {
    let sum = 0;
    const end = Math.min(start + windowSize, data.length);
    for (let i = start; i < end; i++) sum += data[i] * data[i];
    return Math.sqrt(sum / (end - start)) > threshold;
  };

  // Anfang finden
  let startSample = 0;
  while (startSample < data.length && !isLoud(startSample)) startSample += windowSize;
  // Ende finden
  let endSample = data.length;
  while (endSample > startSample && !isLoud(endSample - windowSize)) endSample -= windowSize;

  // Kleine Ränder lassen (30ms), damit nichts abgehackt klingt
  const pad = Math.floor(sampleRate * 0.03);
  startSample = Math.max(0, startSample - pad);
  endSample = Math.min(data.length, endSample + pad);

  const trimmed = data.slice(startSample, endSample);
  const duration = trimmed.length / sampleRate;

  // Als WAV encodieren (16-bit PCM)
  const wavBuffer = encodeWav(trimmed, sampleRate);
  return {
    blob: new Blob([wavBuffer], { type: 'audio/wav' }),
    duration,
  };
}

function encodeWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
}

interface RecordingState {
  name: string;
  uploadCategory: Category;
  rawBlob: Blob;
  trimmedBlob: Blob;
  trimmedUrl: string;
  duration: number;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface Item {
  key: string;             // Dateiname (A, eu, ch-soft, Stuhl)
  label: string;           // Anzeige
  hint?: string;           // Sprech-Hinweis
  image?: string;          // Wortbild-URL
  section?: string;        // Optionale Gruppen-Überschrift
  uploadCategory: Category;// Server-Zielkategorie ('laute' | 'lautabschnitte' | 'woerter')
}

const getHintForLautabschnitt = (s: string): string | undefined => {
  const ex = soundExamples[s];
  const mh = MEHRBUCHSTABEN_HINT_MAP[s];
  if (ex && mh && !ex.includes(mh)) return ex;
  return ex || mh || LETTER_HINTS[s.toUpperCase()];
};

const itemsFor = (cat: Category): Item[] => {
  if (cat === 'laute') {
    const singleLetters: Item[] = LETTERS.map((l) => ({
      key: l,
      label: l,
      hint: LETTER_HINTS[l],
      section: 'Einzelbuchstaben (A–Z)',
      uploadCategory: 'laute',
    }));
    const multiLetters: Item[] = mehrbuchstabenLaute.map((m) => ({
      key: m.key,
      label: m.label,
      hint: soundExamples[m.key] || m.hint,
      section: 'Mehrbuchstaben-Laute (Digraphen & Cluster)',
      uploadCategory: 'lautabschnitte',
    }));
    return [...singleLetters, ...multiLetters];
  }
  if (cat === 'lautabschnitte') {
    return alleLautabschnitte.map((s) => ({
      key: s,
      label: s,
      hint: getHintForLautabschnitt(s),
      uploadCategory: 'lautabschnitte',
    }));
  }
  return Object.keys(wortSegmentierung).map((w) => ({
    key: w,
    label: w,
    image: imageUrl[w],
    uploadCategory: 'woerter',
  }));
};

const currentFileUrl = (item: Item): string | null => {
  if (item.uploadCategory === 'laute') return `/Laute/${item.key}.mp3`;
  if (item.uploadCategory === 'lautabschnitte') return `/Lautabschnitte/${item.key}.mp3`;
  return soundUrl[item.key] || null;
};

export const RecordingStudio: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [category, setCategory] = useState<Category>('laute');
  const [active, setActive] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<RecordingState | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [existing, setExisting] = useState<Record<string, boolean>>({});
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const items = itemsFor(category);
  const activeItem = items.find((i) => i.key === active) || null;

  // Check which files already exist (HEAD, prüft auch Content-Type gegen Vite SPA-HTML-Fallback)
  useEffect(() => {
    const list = itemsFor(category);
    Promise.all(
      list.map(async (it) => {
        const url = currentFileUrl(it);
        if (!url) return [it.key, false] as const;
        try {
          const r = await fetch(`${url}?check=${Date.now()}`, { method: 'HEAD', cache: 'no-store' });
          const ct = (r.headers.get('content-type') || '').toLowerCase();
          const exists = r.ok && !ct.includes('text/html');
          return [it.key, exists] as const;
        } catch {
          return [it.key, false] as const;
        }
      })
    ).then((entries) => setExisting(Object.fromEntries(entries)));
  }, [category]);

  const uploadRecording = async (targetCat: Category, name: string, blob: Blob, fileUrl: string | null) => {
    setSaveStatus('saving');
    setErrorMsg('');
    try {
      const res = await fetch('/api/upload-laut', {
        method: 'POST',
        headers: {
          'Content-Type': 'audio/wav',
          'X-Category': targetCat,
          'X-Name': encodeURIComponent(name),
        },
        body: blob,
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `HTTP ${res.status}`);
      }
      setSaveStatus('saved');
      setExisting((prev) => ({ ...prev, [name]: true }));

      // Browser-Cache / Service-Worker-Cache für diese Audio-URL invalidieren
      if (fileUrl && 'caches' in window) {
        try {
          const cacheKeys = await window.caches.keys();
          await Promise.all(
            cacheKeys.map(async (k) => {
              const c = await window.caches.open(k);
              await c.delete(fileUrl);
            })
          );
        } catch {
          // ignore cache eviction errors
        }
      }
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then((reg) => reg?.update()).catch(() => {});
      }
    } catch (e: any) {
      setErrorMsg('Speichern fehlgeschlagen: ' + (e.message || String(e)));
      setSaveStatus('error');
    }
  };

  const startRecording = async (name: string) => {
    const targetItem = items.find((i) => i.key === name);
    if (!targetItem) return;

    audioRef.current?.pause();
    setErrorMsg('');
    setRecording(null);
    setSaveStatus('idle');
    setActive(name);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
        const rawBlob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' });
        try {
          const { blob: trimmedBlob, duration } = await trimSilence(rawBlob);
          const url = URL.createObjectURL(trimmedBlob);
          const newRec: RecordingState = {
            name: targetItem.key,
            uploadCategory: targetItem.uploadCategory,
            rawBlob,
            trimmedBlob,
            trimmedUrl: url,
            duration,
          };
          setRecording(newRec);
          // Auto-Speichern sofort nach dem Stoppen & Trimmen
          await uploadRecording(
            targetItem.uploadCategory,
            targetItem.key,
            trimmedBlob,
            currentFileUrl(targetItem)
          );
        } catch (e: any) {
          setErrorMsg(e.message || 'Trimmen fehlgeschlagen');
          setSaveStatus('error');
        }
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setIsRecording(true);
    } catch (e: any) {
      setErrorMsg('Mikrofon-Zugriff verweigert: ' + e.message);
      setActive(null);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const playPreview = () => {
    if (!recording) return;
    audioRef.current?.pause();
    const a = new Audio(recording.trimmedUrl);
    audioRef.current = a;
    a.play();
  };

  const playCurrent = () => {
    if (!activeItem) return;
    const url = currentFileUrl(activeItem);
    if (!url || !existing[activeItem.key]) {
      speak(activeItem.key.toLowerCase());
      return;
    }
    audioRef.current?.pause();
    const a = new Audio(`${url}?t=${Date.now()}`);
    audioRef.current = a;
    let fallbackCalled = false;
    const fallback = () => {
      if (fallbackCalled) return;
      fallbackCalled = true;
      speak(activeItem.key.toLowerCase());
    };
    a.onerror = fallback;
    a.play().catch((err) => {
      if (err?.name !== 'AbortError') fallback();
    });
  };

  const save = async () => {
    if (!recording) return;
    const targetItem = items.find((i) => i.key === recording.name);
    await uploadRecording(
      recording.uploadCategory,
      recording.name,
      recording.trimmedBlob,
      targetItem ? currentFileUrl(targetItem) : null
    );
  };

  // Gruppiere Items nach section (falls vorhanden)
  const sections: { title?: string; list: Item[] }[] = [];
  for (const it of items) {
    const last = sections[sections.length - 1];
    if (!last || last.title !== it.section) {
      sections.push({ title: it.section, list: [it] });
    } else {
      last.list.push(it);
    }
  }

  return (
    <div className="flex flex-col min-h-[var(--vh)] bg-background text-stone-800 font-sans pb-20">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm p-4 flex items-center gap-3 border-b border-stone-200">
        <button onClick={onBack} className="p-2 text-stone-400">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold">Laute &amp; Wörter einsprechen</h1>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Kategorie-Tabs */}
        <div className="flex gap-2">
          {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
            <button
              key={c}
              onClick={() => {
                if (isRecording) stopRecording();
                setCategory(c);
                setActive(null);
                setRecording(null);
                setSaveStatus('idle');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                category === c ? 'bg-primary text-white' : 'bg-white border border-stone-200 text-stone-600'
              }`}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>

        <p className="text-sm text-stone-500">
          {category === 'laute' && (
            <>Tippe einen Buchstaben oder Mehrbuchstaben-Laut (z.B. <b>„eu"</b>, <b>„st"</b>, <b>„sch"</b>) und sprich den <b>Laut</b> (z.B. <b>„sss"</b> für S — nicht „Es").</>
          )}
          {category === 'lautabschnitte' && (
            <>Tippe einen Lautabschnitt und sprich genau diesen Laut (z.B. <b>„scht"</b> für St, <b>„eu"</b> wie in Eule).</>
          )}
          {category === 'woerter' && (
            <>Tippe ein Wort und sprich es aus — wie es bisher in der App klingt (z.B. <b>„der Stuhl"</b> mit Artikel).</>
          )}
          {' '}Nach dem Stoppen wird Stille automatisch entfernt und die Aufnahme <b>sofort gespeichert</b>.
        </p>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm flex items-center justify-between gap-3">
            <span>{errorMsg}</span>
            {recording && (
              <button
                onClick={save}
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg font-bold text-xs whitespace-nowrap"
              >
                ↻ Wiederholen
              </button>
            )}
          </div>
        )}

        {/* Aufnahme-Panel */}
        {active && activeItem && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {activeItem.image && (
                  <img src={activeItem.image} alt={activeItem.label} className="w-14 h-14 rounded-xl object-cover bg-stone-100" />
                )}
                <div className="min-w-0">
                  <span className="text-3xl font-bold text-primary block truncate">{activeItem.label}</span>
                  {activeItem.hint && (
                    <span className="text-sm text-stone-500 block truncate">{activeItem.hint}</span>
                  )}
                </div>
              </div>
              {isRecording && (
                <span className="flex items-center gap-2 text-red-500 text-sm font-bold whitespace-nowrap">
                  <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  Läuft…
                </span>
              )}
              {!isRecording && saveStatus === 'saving' && (
                <span className="text-sm font-bold text-amber-600 whitespace-nowrap">
                  Wird gespeichert…
                </span>
              )}
              {!isRecording && saveStatus === 'saved' && (
                <span className="text-sm font-bold text-green-600 whitespace-nowrap">
                  Gespeichert ✓
                </span>
              )}
              {!isRecording && saveStatus === 'error' && (
                <span className="text-sm font-bold text-red-600 whitespace-nowrap">
                  Fehler beim Speichern
                </span>
              )}
            </div>

            {!isRecording && !recording && (
              <div className="flex gap-2">
                <button
                  onClick={() => startRecording(active)}
                  className="flex-1 py-4 bg-red-500 text-white rounded-xl font-bold text-lg"
                >
                  ● Aufnahme starten
                </button>
                {currentFileUrl(activeItem) && (
                  <button
                    onClick={playCurrent}
                    className="px-5 py-4 bg-stone-100 text-stone-600 rounded-xl font-bold"
                  >
                    {existing[activeItem.key] ? '▶ Aktuell' : '▶ Vorlesen (TTS)'}
                  </button>
                )}
              </div>
            )}
            {isRecording && (
              <button
                onClick={stopRecording}
                className="w-full py-4 bg-stone-800 text-white rounded-xl font-bold text-lg"
              >
                ■ Stopp &amp; Auto-Speichern
              </button>
            )}

            {recording && (
              <div className="space-y-3">
                <p className="text-sm text-stone-500">
                  ✂️ Getrimmt auf <b>{recording.duration.toFixed(2)}s</b> — Stille entfernt.{' '}
                  {saveStatus === 'saving' && <b className="text-amber-600">Wird gespeichert…</b>}
                  {saveStatus === 'saved' && <b className="text-green-600">Gespeichert ✓</b>}
                  {saveStatus === 'error' && <b className="text-red-600">Nicht gespeichert</b>}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={playPreview}
                    className="flex-1 py-3 bg-secondary text-white rounded-xl font-bold"
                  >
                    ▶ Anhören
                  </button>
                  <button
                    onClick={() => startRecording(active)}
                    className="flex-1 py-3 bg-stone-200 text-stone-700 rounded-xl font-bold"
                  >
                    ↺ Neu
                  </button>
                  <button
                    onClick={save}
                    disabled={saveStatus === 'saving'}
                    className={`flex-1 py-3 text-white rounded-xl font-bold disabled:opacity-50 ${
                      saveStatus === 'error'
                        ? 'bg-red-600'
                        : saveStatus === 'saved'
                        ? 'bg-green-600'
                        : 'bg-primary'
                    }`}
                  >
                    {saveStatus === 'saving'
                      ? 'Wird gespeichert…'
                      : saveStatus === 'saved'
                      ? 'Gespeichert ✓'
                      : saveStatus === 'error'
                      ? '↻ Wiederholen'
                      : '✓ Speichern'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Item-Grids (gruppiert nach Sektion, falls vorhanden) */}
        {sections.map((sec, idx) => (
          <div key={sec.title || idx} className="space-y-3">
            {sec.title && (
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500 pt-2">
                {sec.title}
              </h2>
            )}
            <div
              className={`grid gap-3 ${
                category === 'laute' && idx === 0 ? 'grid-cols-4' : 'grid-cols-2 sm:grid-cols-3'
              }`}
            >
              {sec.list.map((it) => (
                <button
                  key={`${it.uploadCategory}-${it.key}`}
                  onClick={() => {
                    if (isRecording) stopRecording();
                    setActive(it.key);
                    setRecording(null);
                    setSaveStatus('idle');
                    setErrorMsg('');
                  }}
                  className={`relative rounded-2xl border-2 transition-colors p-2 text-center ${
                    active === it.key
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white border-stone-200 text-stone-700'
                  }`}
                >
                  {it.image && (
                    <img
                      src={it.image}
                      alt=""
                      className="w-full aspect-square object-cover rounded-xl mb-1 bg-stone-100"
                    />
                  )}
                  <span
                    className={`${
                      category === 'laute' && idx === 0 ? 'text-2xl' : 'text-lg'
                    } font-bold block truncate`}
                  >
                    {it.label}
                  </span>
                  {it.hint && category !== 'woerter' && (
                    <span
                      className={`text-xs block truncate ${
                        active === it.key ? 'text-white/80' : 'text-stone-400'
                      }`}
                    >
                      {it.hint}
                    </span>
                  )}
                  {existing[it.key] && (
                    <span
                      title="Audio-Datei vorhanden"
                      className="absolute top-1 right-1 w-2.5 h-2.5 bg-green-400 rounded-full"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}

        <p className="text-xs text-stone-400 text-center">
          <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-1" />
          = Audio-Datei vorhanden (ohne Punkt = nutzt aktuell TTS-Fallback). Jede Aufnahme wird nach
          dem Stoppen automatisch gespeichert (das Original wird einmalig in{' '}
          <code>backup-einsingen/</code> gesichert).
        </p>
      </div>
    </div>
  );
};
