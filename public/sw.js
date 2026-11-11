const CACHE_NAME = 'lesen-lernen-v130';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/Titelbild.png',
  '/manifest.json',
  // Buchstabenbilder
  '/Buchstabenbilder/A_v2.png',
  '/Buchstabenbilder/B_v2.png',
  '/Buchstabenbilder/C_v2.png',
  '/Buchstabenbilder/D_v2.png',
  '/Buchstabenbilder/E_v2.png',
  '/Buchstabenbilder/F_v2.png',
  '/Buchstabenbilder/G_v2.png',
  '/Buchstabenbilder/H_v2.png',
  '/Buchstabenbilder/I_v2.png',
  '/Buchstabenbilder/J_v2.png',
  '/Buchstabenbilder/K_v2.png',
  '/Buchstabenbilder/L_v2.png',
  '/Buchstabenbilder/M_v2.png',
  '/Buchstabenbilder/N_v2.png',
  '/Buchstabenbilder/O_v2.png',
  '/Buchstabenbilder/P_v2.png',
  '/Buchstabenbilder/Q_v2.png',
  '/Buchstabenbilder/R_v2.png',
  '/Buchstabenbilder/S_v2.png',
  '/Buchstabenbilder/T_v2.png',
  '/Buchstabenbilder/U_v2.png',
  '/Buchstabenbilder/V_v2.png',
  '/Buchstabenbilder/W_v2.png',
  '/Buchstabenbilder/X_v2.png',
  '/Buchstabenbilder/Y_v2.png',
  '/Buchstabenbilder/Z_v2.png',
  // Buchstaben-Animationen (H3-Clips, Standbild-Fallback in LetterGameScreen)
  '/BuchstabenAnimationen/A.mp4',
  '/BuchstabenAnimationen/B.mp4',
  '/BuchstabenAnimationen/C.mp4',
  '/BuchstabenAnimationen/D.mp4',
  '/BuchstabenAnimationen/E.mp4',
  '/BuchstabenAnimationen/F.mp4',
  '/BuchstabenAnimationen/G.mp4',
  '/BuchstabenAnimationen/H.mp4',
  '/BuchstabenAnimationen/I.mp4',
  '/BuchstabenAnimationen/J.mp4',
  '/BuchstabenAnimationen/K.mp4',
  '/BuchstabenAnimationen/L.mp4',
  '/BuchstabenAnimationen/M.mp4',
  '/BuchstabenAnimationen/N.mp4',
  '/BuchstabenAnimationen/O.mp4',
  '/BuchstabenAnimationen/P.mp4',
  '/BuchstabenAnimationen/Q.mp4',
  '/BuchstabenAnimationen/R.mp4',
  '/BuchstabenAnimationen/S.mp4',
  '/BuchstabenAnimationen/T.mp4',
  '/BuchstabenAnimationen/U.mp4',
  '/BuchstabenAnimationen/V.mp4',
  '/BuchstabenAnimationen/W.mp4',
  '/BuchstabenAnimationen/X.mp4',
  '/BuchstabenAnimationen/Y.mp4',
  '/BuchstabenAnimationen/Z.mp4',
  // Laute (Audio)
  '/Laute/A.mp3',
  '/Laute/B.mp3',
  '/Laute/C.mp3',
  '/Laute/D.mp3',
  '/Laute/E.mp3',
  '/Laute/F.mp3',
  '/Laute/G.mp3',
  '/Laute/H.mp3',
  '/Laute/I.mp3',
  '/Laute/J.mp3',
  '/Laute/K.mp3',
  '/Laute/L.mp3',
  '/Laute/M.mp3',
  '/Laute/N.mp3',
  '/Laute/O.mp3',
  '/Laute/P.mp3',
  '/Laute/Q.mp3',
  '/Laute/R.mp3',
  '/Laute/S.mp3',
  '/Laute/T.mp3',
  '/Laute/U.mp3',
  '/Laute/V.mp3',
  '/Laute/W.mp3',
  '/Laute/X.mp3',
  '/Laute/Y.mp3',
  '/Laute/Z.mp3',
  // Lautabschnitte (Audio) — Wort-Zusammensetzen-Modus
  '/Lautabschnitte/a.mp3',
  '/Lautabschnitte/ah.mp3',
  '/Lautabschnitte/au.mp3',
  '/Lautabschnitte/b.mp3',
  '/Lautabschnitte/br.mp3',
  '/Lautabschnitte/ch-hard.mp3',
  '/Lautabschnitte/ch-soft.mp3',
  '/Lautabschnitte/d.mp3',
  '/Lautabschnitte/e.mp3',
  '/Lautabschnitte/e-schwa.mp3',
  '/Lautabschnitte/eh.mp3',
  '/Lautabschnitte/ei.mp3',
  '/Lautabschnitte/f.mp3',
  '/Lautabschnitte/g.mp3',
  '/Lautabschnitte/gl.mp3',
  '/Lautabschnitte/h.mp3',
  '/Lautabschnitte/i.mp3',
  '/Lautabschnitte/ih.mp3',
  '/Lautabschnitte/k.mp3',
  '/Lautabschnitte/l.mp3',
  '/Lautabschnitte/m.mp3',
  '/Lautabschnitte/n.mp3',
  '/Lautabschnitte/ng.mp3',
  '/Lautabschnitte/o.mp3',
  '/Lautabschnitte/oh.mp3',
  '/Lautabschnitte/p.mp3',
  '/Lautabschnitte/pf.mp3',
  '/Lautabschnitte/r.mp3',
  '/Lautabschnitte/s.mp3',
  '/Lautabschnitte/sch.mp3',
  '/Lautabschnitte/scht.mp3',
  '/Lautabschnitte/t.mp3',
  '/Lautabschnitte/u.mp3',
  '/Lautabschnitte/uh.mp3',
  '/Lautabschnitte/w.mp3',
  '/Lautabschnitte/z.mp3',
];

// Install event - cache assets (robust: einzelne 404s blockieren KEIN Update mehr)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching app assets...');
      return Promise.allSettled(
        ASSETS_TO_CACHE.map((url) =>
          cache.add(url).catch(() => console.warn('Asset fehlt, übersprungen:', url))
        )
      );
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Shell (HTML/JS/CSS) network-first, Assets cache-first
const SHELL_PATHS = ['/', '/index.html'];
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isShell =
    SHELL_PATHS.includes(url.pathname) ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css');

  if (isShell) {
    // Network-first: neuer Code kommt IMMER an, Cache nur als Offline-Fallback
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && event.request.method === 'GET') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() =>
          caches.match(event.request).then((cached) => cached || caches.match('/'))
        )
    );
    return;
  }

  // Assets: cache-first mit Netzwerk-Nachschlag
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses or non-GET requests
        if (!response || response.status !== 200 || event.request.method !== 'GET') {
          return response;
        }
        // Clone and cache the response
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      }).catch(() => {
        // Return offline fallback if available
        return caches.match('/');
      });
    })
  );
});
