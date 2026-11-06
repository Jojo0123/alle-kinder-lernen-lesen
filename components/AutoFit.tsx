import React from 'react';

// ==========================================
// AUTO-FIT: automatische Zoom-to-Fit-Hoehenskalierung
// ==========================================
// Misst die visuelle Hoehe des aktuellen Bildschirms und stellt den Root-Zoom
// so ein, dass ALLES exakt in die Bildschirmhoehe passt — auf jedem Display
// (Tablet hoch/kquer, Handy, Laptop, TV). Funktioniert wie Browser-Zoom, nur
// automatisch: alle Elemente, Bilder und Schriften skalieren konsistent.
//
// Verhalten:
// - Inhalt hoeher als der Bildschirm -> Zoom < 1, alles sichtbar, kein Scrollen
// - Inhalt kuerzer -> Zoom > 1, der Bildschirm wird exakt aufgefuellt
// - Grenzen: MIN_Z (darunter lieber scrollbar als Mikro-Schrift),
//   MAX_Z (kein Riesenschrift-Kick bei sehr leeren Screens)
// - Kein Reskalieren mitten im Tippen (Fokus-Guard fuer Eingabefelder)
export default function AutoFit({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const rafRef = React.useRef(0);
  const timerRef = React.useRef(0);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measureEl = el.querySelector<HTMLElement>('[data-autofit-main], main') || el;

    const MIN_Z = 0.6;
    const MAX_Z = 1.6;

    const fit = () => {
      const vh = window.innerHeight;
      const setZ = (z: number) => {
        document.documentElement.style.zoom = String(z);
        // --vh = die CSS-Pixel-Hoehe, die bei Zoom z visuell EXAKT der
        // Bildschirmhoehe entspricht (fuer min-h-[var(--vh)]-Elemente)
        document.documentElement.style.setProperty('--vh', (vh / z) + 'px');
      };
      // Bisektion statt Iteration: die Hoehen-Kennlinie ist durch Re-Flow
      // sprunghaft (Karten/Buttons umbrechen -> Hoehe springt). Gesucht wird
      // der groesste Zoom, bei dem der Inhalt noch in die Hoehe passt.
      let lo = MIN_Z, hi = MAX_Z, best: number | null = null;
      for (let i = 0; i < 12; i++) {
        const mid = (lo + hi) / 2;
        setZ(mid);
        const h = measureEl.getBoundingClientRect().height; // visuell (inkl. Zoom)
        if (!h || !isFinite(h)) return;
        if (h <= vh + 2) { best = mid; lo = mid; } else { hi = mid; }
      }
      setZ(best != null ? best : MIN_Z);
    };

    const schedule = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        // nicht mitten im Tippen reskalieren
        const a = document.activeElement;
        if (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA')) return;
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(fit);
      }, 200);
    };

    fit();
    const ro = new ResizeObserver(schedule);
    ro.observe(measureEl);
    window.addEventListener('resize', schedule);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', schedule);
      clearTimeout(timerRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return <div ref={ref} id="autofit-root">{children}</div>;
}
