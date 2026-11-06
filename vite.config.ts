import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';

// Upload-Endpoint fürs Aufnahme-Studio: POST /api/upload-laut
// Header:
//   X-Category: 'laute' | 'lautabschnitte' | 'woerter' (default: laute)
//   X-Name: encodeURIComponent(Name) — z.B. 'S', 'ch-soft', 'Stuhl'
//   (X-Letter bleibt als Abwärtskompatibilität für category=laute)
// Body: WAV-Audio -> MP3 (ffmpeg, mono, 44.1kHz, loudnorm) an die Zieldatei.
// Vor dem Überschreiben wird die Originaldatei einmal nach backup-einsingen/ gesichert.
// Danach SW-Cache-Version bumpen.
function lautUploadPlugin(): Plugin {
  const TARGETS: Record<string, { dir: string[]; validate: (n: string) => boolean }> = {
    laute: {
      dir: ['public', 'Laute'],
      validate: (n) => /^[A-ZÄÖÜß][A-Z0-9ÄÖÜß-]{0,15}$/.test(n),
    },
    lautabschnitte: {
      dir: ['public', 'Lautabschnitte'],
      validate: (n) => /^[a-zäöüß][a-z0-9äöüß-]{0,19}$/.test(n),
    },
    woerter: {
      dir: ['data', '1', 'sounds'],
      validate: (n) => /^[A-Za-zÄÖÜäöüß]{1,30}$/.test(n),
    },
  };
  return {
    name: 'laut-upload',
    configureServer(server) {
      // Verhindert, dass Cloudflare (Standard: max-age=14400 fuer .mp3) oder der Browser
      // umgesprochene Audio-Dateien und den Service-Worker veraltet cached.
      server.middlewares.use((req, res, next) => {
        const u = req.url || '';
        if (
          u.startsWith('/Laute/') ||
          u.startsWith('/Lautabschnitte/') ||
          u.startsWith('/data/') ||
          u.startsWith('/sw.js')
        ) {
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
          res.setHeader('CDN-Cache-Control', 'no-store');
          res.setHeader('Cloudflare-CDN-Cache-Control', 'no-store');
        }
        next();
      });

      server.middlewares.use('/api/upload-laut', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method not allowed');
          return;
        }
        const category = String(req.headers['x-category'] || 'laute');
        const rawName = String(req.headers['x-name'] || req.headers['x-letter'] || '');
        let name = rawName;
        try { name = decodeURIComponent(rawName); } catch { /* unencoded ok */ }
        if (category === 'laute') name = name.toUpperCase();
        if (category === 'lautabschnitte') name = name.toLowerCase();
        const target = TARGETS[category];
        if (!target || !target.validate(name)) {
          res.statusCode = 400;
          res.end(`Invalid name/category: ${category} / ${name}`);
          return;
        }
        const chunks: Buffer[] = [];
        req.on('data', (c: Buffer) => chunks.push(c));
        req.on('end', async () => {
          try {
            const tmpWav = path.join('/tmp', `laut-${category}-${Date.now()}.wav`);
            const outMp3 = path.join(process.cwd(), ...target.dir, `${name}.mp3`);
            fs.writeFileSync(tmpWav, Buffer.concat(chunks));
            // Backup der Originaldatei (einmal, vor dem ersten Überschreiben)
            const backupIfNeeded = (dirParts: string[], fileName: string) => {
              const targetFile = path.join(process.cwd(), ...dirParts, `${fileName}.mp3`);
              if (fs.existsSync(targetFile)) {
                const backupDir = path.join(process.cwd(), ...dirParts, 'backup-einsingen');
                const backupFile = path.join(backupDir, `${fileName}.mp3`);
                if (!fs.existsSync(backupFile)) {
                  fs.mkdirSync(backupDir, { recursive: true });
                  fs.copyFileSync(targetFile, backupFile);
                }
              }
            };
            backupIfNeeded(target.dir, name);
            // ffmpeg: mono, 44.1kHz, loudness-normalisiert
            const { execSync } = await import('child_process');
            execSync(
              `ffmpeg -y -i "${tmpWav}" -ac 1 -ar 44100 -af loudnorm=I=-16:TP=-1.5:LRA=11 -codec:a libmp3lame -q:a 4 "${outMp3}"`,
              { stdio: 'pipe' }
            );
            fs.unlinkSync(tmpWav);
            // Einzelbuchstaben A-Z zwischen public/Laute/<X>.mp3 und public/Lautabschnitte/<x>.mp3 synchron halten
            if (category === 'laute' && /^[A-Z]$/.test(name)) {
              const lower = name.toLowerCase();
              backupIfNeeded(['public', 'Lautabschnitte'], lower);
              fs.copyFileSync(outMp3, path.join(process.cwd(), 'public', 'Lautabschnitte', `${lower}.mp3`));
            } else if (category === 'lautabschnitte' && /^[a-z]$/.test(name)) {
              const upper = name.toUpperCase();
              backupIfNeeded(['public', 'Laute'], upper);
              fs.copyFileSync(outMp3, path.join(process.cwd(), 'public', 'Laute', `${upper}.mp3`));
            }
            // SW-Cache und AUDIO_VERSION bumpen, damit Clients sofort die neue Datei holen
            const swPath = path.join(process.cwd(), 'public', 'sw.js');
            const sw = fs.readFileSync(swPath, 'utf8');
            const m = sw.match(/lesen-lernen-v(\d+)/);
            if (m) {
              const nextVer = `lesen-lernen-v${parseInt(m[1]) + 1}`;
              const bumped = sw.replace(/lesen-lernen-v\d+/, nextVer);
              fs.writeFileSync(swPath, bumped);
              const lautePath = path.join(process.cwd(), 'data', 'laute.ts');
              if (fs.existsSync(lautePath)) {
                const lauteContent = fs.readFileSync(lautePath, 'utf8');
                const updatedLaute = lauteContent.replace(
                  /AUDIO_VERSION\s*=\s*'[^']+'/,
                  `AUDIO_VERSION = '${nextVer}'`
                );
                if (updatedLaute !== lauteContent) {
                  fs.writeFileSync(lautePath, updatedLaute);
                }
              }
            }
            res.statusCode = 200;
            res.end('OK');
          } catch (e: any) {
            res.statusCode = 500;
            res.end(String(e.message || e));
          }
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        allowedHosts: ['kinder.extensos.de', 'leselernspiel.de', 'www.leselernspiel.de', 'localhost'],
      },
      plugins: [react(), lautUploadPlugin()],
      publicDir: 'public',
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
