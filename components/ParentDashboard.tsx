import React, { useState } from 'react';
import { UserProgress } from '../types';
import { RecordingStudio } from './RecordingStudio';

interface ParentDashboardProps {
  progress: UserProgress;
  onHome: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ progress, onHome }) => {
  const [showStudio, setShowStudio] = useState(false);

  if (showStudio) {
    return <RecordingStudio onBack={() => setShowStudio(false)} />;
  }

  const resetAppCache = async () => {
    if (!window.confirm('App-Cache zurücksetzen? Die App lädt danach alles frisch neu (Code, Audio, Videos).')) return;
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    } finally {
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col min-h-[var(--vh)] bg-background text-stone-800 font-sans pb-20">
      
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm p-4 flex items-center justify-between border-b border-stone-200">
        <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-orange-100 overflow-hidden border-2 border-white shadow-sm">
                <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjBfQJjHXF68tpTJ0cP9prhl3-d8jYl9PLkTC6DY1plFV835uGsly6bgvU003nsILdqvKAbsmWF2SYYjIEkOWRcFyj1PFKirOVvo7_P4ozZ-Lhi5gJusy5r6iAixJHaOzhllSHg4H62Hq6AmyikfIqh4qboOyJVQS_0wk9AfzdwxV52X1BaDuVH1wjvm0d3NCWkTPu6b-UseCHdDkS-fSQPcfS7NS-N4GNX3L7qOMqtustJ23fDpUNABR9wnE5iRkBGLy1WSJrbns9" 
                    alt="Leo" 
                    className="w-full h-full object-cover"
                />
             </div>
             <h1 className="text-xl font-bold">Leos Fortschritt</h1>
        </div>
        <button className="p-2 text-stone-400">
            <span className="material-symbols-outlined">notifications</span>
        </button>
      </div>

      <div className="px-4 py-6 space-y-8">
        
        {/* Headline */}
        <h2 className="text-2xl font-bold">Gesamtfortschritt</h2>

        {/* Laute-Aufnahme Einstieg */}
        <button
          onClick={() => setShowStudio(true)}
          className="w-full bg-white rounded-2xl p-5 shadow-sm border border-stone-100 flex items-center gap-4 text-left active:scale-[0.98] transition-transform"
        >
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-red-500 text-2xl">mic</span>
          </div>
          <div className="flex-1">
            <p className="font-bold text-stone-800">Laute &amp; Wörter einsprechen</p>
            <p className="text-sm text-stone-400">Eigene Aussprache für Buchstaben, Lautabschnitte und Wörter</p>
          </div>
          <span className="material-symbols-outlined text-stone-300">chevron_right</span>
        </button>

        {/* Cache-Reset */}
        <button
          onClick={resetAppCache}
          className="w-full bg-white rounded-2xl p-5 shadow-sm border border-stone-100 flex items-center gap-4 text-left active:scale-[0.98] transition-transform"
        >
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-blue-500 text-2xl">cached</span>
          </div>
          <div className="flex-1">
            <p className="font-bold text-stone-800">App-Cache zurücksetzen</p>
            <p className="text-sm text-stone-400">Wenn etwas nicht aktualisiert erscheint — lädt alles frisch neu</p>
          </div>
          <span className="material-symbols-outlined text-stone-300">chevron_right</span>
        </button>

        {/* Main Stats Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
            {/* Circle Chart (Simplified SVG) */}
            <div className="flex justify-center mb-6">
                <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="80" cy="80" r="70" stroke="#f3f4f6" strokeWidth="12" fill="none" />
                        <circle cx="80" cy="80" r="70" stroke="#4A90E2" strokeWidth="12" fill="none" strokeDasharray="440" strokeDashoffset="154" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-stone-800">65%</span>
                        <span className="text-sm text-stone-400 font-medium">Abgeschlossen</span>
                    </div>
                </div>
            </div>

            {/* Sub Stats */}
            <div className="flex gap-4">
                <div className="flex-1 bg-background rounded-xl p-4 text-center">
                    <p className="text-sm text-stone-500 mb-1">Gelerne Wörter</p>
                    <p className="text-2xl font-bold text-stone-800">{progress.wordsLearned}</p>
                </div>
                <div className="flex-1 bg-background rounded-xl p-4 text-center">
                    <p className="text-sm text-stone-500 mb-1">Abzeichen</p>
                    <p className="text-2xl font-bold text-stone-800">{progress.badges}</p>
                </div>
            </div>
        </div>

        {/* Learned Words List */}
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Gelernte Wörter</h3>
                <span className="text-sm text-primary font-bold">Alle ansehen</span>
            </div>

            {/* Filter Chips */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                <button className="px-4 py-2 bg-primary text-white rounded-full text-sm font-semibold whitespace-nowrap">Alle Wörter</button>
                <button className="px-4 py-2 bg-white border border-stone-200 text-stone-600 rounded-full text-sm font-semibold whitespace-nowrap">Tiere</button>
                <button className="px-4 py-2 bg-white border border-stone-200 text-stone-600 rounded-full text-sm font-semibold whitespace-nowrap">Essen</button>
            </div>

            {/* List */}
            <div className="space-y-3 mt-4">
                {[
                    { word: 'Apfel', date: '24. Okt' },
                    { word: 'Ball', date: '23. Okt' },
                    { word: 'Katze', date: '22. Okt' },
                    { word: 'Sonne', date: '21. Okt' },
                ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white rounded-xl border border-stone-100">
                        <div>
                            <p className="font-bold text-stone-800 text-lg">{item.word}</p>
                            <p className="text-xs text-stone-400">Gelernt am {item.date}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-sm">check</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Badges */}
        <div>
             <h3 className="text-lg font-bold mb-4">Abzeichen</h3>
             <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
                {[
                    { icon: 'looks_one', label: 'Erste 10!', active: true },
                    { icon: 'pets', label: 'Tier Experte', active: true },
                    { icon: 'star', label: 'Perfekte Woche', active: true },
                    { icon: 'school', label: 'Profi', active: false },
                    { icon: 'local_florist', label: 'Natur', active: false },
                ].map((badge, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 min-w-[90px]">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 ${badge.active ? 'bg-white border-primary' : 'bg-stone-100 border-transparent'}`}>
                             <span className={`material-symbols-outlined text-4xl ${badge.active ? 'text-primary' : 'text-stone-300'}`}>{badge.icon}</span>
                        </div>
                        <p className={`text-xs text-center font-medium ${badge.active ? 'text-stone-600' : 'text-stone-300'}`}>{badge.label}</p>
                    </div>
                ))}
             </div>
        </div>

      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur border-t border-stone-200 flex justify-around p-2 pb-4">
        <button onClick={onHome} className="flex flex-col items-center gap-1 p-2 text-stone-400">
            <span className="material-symbols-outlined">home</span>
            <span className="text-[10px] font-bold">Start</span>
        </button>
        <button className="flex flex-col items-center gap-1 p-2 text-primary">
            <span className="material-symbols-outlined">bar_chart</span>
            <span className="text-[10px] font-bold">Fortschritt</span>
        </button>
        <button className="flex flex-col items-center gap-1 p-2 text-stone-400">
            <span className="material-symbols-outlined">book</span>
            <span className="text-[10px] font-bold">Bibliothek</span>
        </button>
      </div>

    </div>
  );
};