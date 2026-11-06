// Lautabschnitt-Segmentierung fuer alle 77 Woerter aus data/1.
// Prinzip (Johannes, 2026-11-01): Wort ganz hoeren, dann in Lautabschnitte zerlegen,
// das Kind setzt die Kacheln (Buchstaben) zusammen.
// Regeln:
//  - Vokal-Digraphen = EINE Kachel (ah/eh/ih/oh/uh/aa/ee/oo/ie/ei/eu/aeu/au)
//  - Konsonant-Digraphen = EINE Kachel (ch/ck/sch/ff/gg/ll/mm/nn/pp/rr/ss/tt/zz/pf/tz/ng)
//  - Wortanlautliche Cluster = EINE Kachel (St->"Scht", Br, Gl ...)
//  - Auslautliche Cluster = Einzelbuchstaben (Hund = H·u·n·d)
//  - Doppelkonsonanten = EINE Kachel (markiert den kurzen Vokal)
//  - "e" am Ende = Schwa (e-schwa)
// sound = Datei-Schluessel in /Lautabschnitte/<sound>.mp3
// Hinweis: Kachel-Text zeigt immer die Schreibweise des WORTES, der Sound ist der Laut.

export interface Lautabschnitt {
  text: string; // was auf der Kachel steht (Schreibweise im Wort)
  sound: string; // Audio-Schluessel /Lautabschnitte/<sound>.mp3
}

export const wortSegmentierung: Record<string, Lautabschnitt[]> = {
  'Affe':  [{ text: 'A', sound: 'a' }, { text: 'ff', sound: 'f' }, { text: 'e', sound: 'e-schwa' }],
  'Ast':   [{ text: 'A', sound: 'a' }, { text: 's', sound: 's' }, { text: 't', sound: 't' }],
  'Auge':  [{ text: 'Au', sound: 'au' }, { text: 'g', sound: 'g' }, { text: 'e', sound: 'e-schwa' }],
  'Auto':  [{ text: 'Au', sound: 'au' }, { text: 't', sound: 't' }, { text: 'o', sound: 'oh' }],
  'Ball':  [{ text: 'B', sound: 'b' }, { text: 'a', sound: 'a' }, { text: 'll', sound: 'l' }],
  'Baum':  [{ text: 'B', sound: 'b' }, { text: 'au', sound: 'au' }, { text: 'm', sound: 'm' }],
  'Bett':  [{ text: 'B', sound: 'b' }, { text: 'e', sound: 'e' }, { text: 'tt', sound: 't' }],
  'Boot':  [{ text: 'B', sound: 'b' }, { text: 'oo', sound: 'oh' }, { text: 't', sound: 't' }],
  'Brot':  [{ text: 'Br', sound: 'br' }, { text: 'o', sound: 'oh' }, { text: 't', sound: 't' }],
  'Buch':  [{ text: 'B', sound: 'b' }, { text: 'u', sound: 'uh' }, { text: 'ch', sound: 'ch-hard' }],
  'Bus':   [{ text: 'B', sound: 'b' }, { text: 'u', sound: 'u' }, { text: 's', sound: 's' }],
  'Dach':  [{ text: 'D', sound: 'd' }, { text: 'a', sound: 'a' }, { text: 'ch', sound: 'ch-hard' }],
  'Dose':  [{ text: 'D', sound: 'd' }, { text: 'o', sound: 'oh' }, { text: 's', sound: 's' }, { text: 'e', sound: 'e-schwa' }],
  'Ei':    [{ text: 'Ei', sound: 'ei' }],
  'Eis':   [{ text: 'Ei', sound: 'ei' }, { text: 's', sound: 's' }],
  'Esel':  [{ text: 'E', sound: 'eh' }, { text: 's', sound: 's' }, { text: 'e', sound: 'e-schwa' }, { text: 'l', sound: 'l' }],
  'Fass':  [{ text: 'F', sound: 'f' }, { text: 'a', sound: 'a' }, { text: 'ss', sound: 's' }],
  'Fest':  [{ text: 'F', sound: 'f' }, { text: 'e', sound: 'e' }, { text: 's', sound: 's' }, { text: 't', sound: 't' }],
  'Fisch': [{ text: 'F', sound: 'f' }, { text: 'i', sound: 'i' }, { text: 'sch', sound: 'sch' }],
  'Fuß':   [{ text: 'F', sound: 'f' }, { text: 'u', sound: 'uh' }, { text: 'ß', sound: 's' }],
  'Gans':  [{ text: 'G', sound: 'g' }, { text: 'a', sound: 'a' }, { text: 'n', sound: 'n' }, { text: 's', sound: 's' }],
  'Geld':  [{ text: 'G', sound: 'g' }, { text: 'e', sound: 'e' }, { text: 'l', sound: 'l' }, { text: 'd', sound: 'd' }],
  'Glas':  [{ text: 'Gl', sound: 'gl' }, { text: 'a', sound: 'ah' }, { text: 's', sound: 's' }],
  'Hahn':  [{ text: 'H', sound: 'h' }, { text: 'ah', sound: 'ah' }, { text: 'n', sound: 'n' }],
  'Hand':  [{ text: 'H', sound: 'h' }, { text: 'a', sound: 'a' }, { text: 'n', sound: 'n' }, { text: 'd', sound: 'd' }],
  'Hase':  [{ text: 'H', sound: 'h' }, { text: 'a', sound: 'ah' }, { text: 's', sound: 's' }, { text: 'e', sound: 'e-schwa' }],
  'Haus':  [{ text: 'H', sound: 'h' }, { text: 'au', sound: 'au' }, { text: 's', sound: 's' }],
  'Herd':  [{ text: 'H', sound: 'h' }, { text: 'e', sound: 'e' }, { text: 'r', sound: 'r' }, { text: 'd', sound: 'd' }],
  'Herz':  [{ text: 'H', sound: 'h' }, { text: 'e', sound: 'e' }, { text: 'r', sound: 'r' }, { text: 'z', sound: 'z' }],
  'Hund':  [{ text: 'H', sound: 'h' }, { text: 'u', sound: 'u' }, { text: 'n', sound: 'n' }, { text: 'd', sound: 'd' }],
  'Hut':   [{ text: 'H', sound: 'h' }, { text: 'u', sound: 'uh' }, { text: 't', sound: 't' }],
  'Igel':  [{ text: 'I', sound: 'ih' }, { text: 'g', sound: 'g' }, { text: 'e', sound: 'e-schwa' }, { text: 'l', sound: 'l' }],
  'Insel': [{ text: 'I', sound: 'i' }, { text: 'n', sound: 'n' }, { text: 's', sound: 's' }, { text: 'e', sound: 'e-schwa' }, { text: 'l', sound: 'l' }],
  'Kuh':   [{ text: 'K', sound: 'k' }, { text: 'uh', sound: 'uh' }],
  'Kuss':  [{ text: 'K', sound: 'k' }, { text: 'u', sound: 'u' }, { text: 'ss', sound: 's' }],
  'Lampe': [{ text: 'L', sound: 'l' }, { text: 'a', sound: 'a' }, { text: 'm', sound: 'm' }, { text: 'p', sound: 'p' }, { text: 'e', sound: 'e-schwa' }],
  'Laus':  [{ text: 'L', sound: 'l' }, { text: 'au', sound: 'au' }, { text: 's', sound: 's' }],
  'Lied':  [{ text: 'L', sound: 'l' }, { text: 'ie', sound: 'ih' }, { text: 'd', sound: 'd' }],
  'Mama':  [{ text: 'M', sound: 'm' }, { text: 'a', sound: 'ah' }, { text: 'm', sound: 'm' }, { text: 'a', sound: 'ah' }],
  'Maus':  [{ text: 'M', sound: 'm' }, { text: 'au', sound: 'au' }, { text: 's', sound: 's' }],
  'Milch': [{ text: 'M', sound: 'm' }, { text: 'i', sound: 'i' }, { text: 'l', sound: 'l' }, { text: 'ch', sound: 'ch-soft' }],
  'Mond':  [{ text: 'M', sound: 'm' }, { text: 'o', sound: 'oh' }, { text: 'n', sound: 'n' }, { text: 'd', sound: 'd' }],
  'Nase':  [{ text: 'N', sound: 'n' }, { text: 'a', sound: 'ah' }, { text: 's', sound: 's' }, { text: 'e', sound: 'e-schwa' }],
  'Nest':  [{ text: 'N', sound: 'n' }, { text: 'e', sound: 'e' }, { text: 's', sound: 's' }, { text: 't', sound: 't' }],
  'Nuss':  [{ text: 'N', sound: 'n' }, { text: 'u', sound: 'u' }, { text: 'ss', sound: 's' }],
  'Ofen':  [{ text: 'O', sound: 'oh' }, { text: 'f', sound: 'f' }, { text: 'e', sound: 'e-schwa' }, { text: 'n', sound: 'n' }],
  'Oma':   [{ text: 'O', sound: 'oh' }, { text: 'm', sound: 'm' }, { text: 'a', sound: 'ah' }],
  'Opa':   [{ text: 'O', sound: 'oh' }, { text: 'p', sound: 'p' }, { text: 'a', sound: 'ah' }],
  'Oper':  [{ text: 'O', sound: 'oh' }, { text: 'p', sound: 'p' }, { text: 'e', sound: 'e-schwa' }, { text: 'r', sound: 'r' }],
  'Papa':  [{ text: 'P', sound: 'p' }, { text: 'a', sound: 'ah' }, { text: 'p', sound: 'p' }, { text: 'a', sound: 'ah' }],
  'Post':  [{ text: 'P', sound: 'p' }, { text: 'o', sound: 'oh' }, { text: 's', sound: 's' }, { text: 't', sound: 't' }],
  'Puppe': [{ text: 'P', sound: 'p' }, { text: 'u', sound: 'u' }, { text: 'pp', sound: 'p' }, { text: 'e', sound: 'e-schwa' }],
  'Rad':   [{ text: 'R', sound: 'r' }, { text: 'a', sound: 'ah' }, { text: 'd', sound: 'd' }],
  'Reh':   [{ text: 'R', sound: 'r' }, { text: 'eh', sound: 'eh' }],
  'Ring':  [{ text: 'R', sound: 'r' }, { text: 'i', sound: 'i' }, { text: 'ng', sound: 'ng' }],
  'Rose':  [{ text: 'R', sound: 'r' }, { text: 'o', sound: 'oh' }, { text: 's', sound: 's' }, { text: 'e', sound: 'e-schwa' }],
  'Saft':  [{ text: 'S', sound: 's' }, { text: 'a', sound: 'a' }, { text: 'f', sound: 'f' }, { text: 't', sound: 't' }],
  'Salz':  [{ text: 'S', sound: 's' }, { text: 'a', sound: 'a' }, { text: 'l', sound: 'l' }, { text: 'z', sound: 'z' }],
  'See':   [{ text: 'S', sound: 's' }, { text: 'ee', sound: 'eh' }],
  'Sofa':  [{ text: 'S', sound: 's' }, { text: 'o', sound: 'oh' }, { text: 'f', sound: 'f' }, { text: 'a', sound: 'ah' }],
  'Sonne': [{ text: 'S', sound: 's' }, { text: 'o', sound: 'o' }, { text: 'nn', sound: 'n' }, { text: 'e', sound: 'e-schwa' }],
  'Stein': [{ text: 'St', sound: 'scht' }, { text: 'ei', sound: 'ei' }, { text: 'n', sound: 'n' }],
  'Stuhl': [{ text: 'St', sound: 'scht' }, { text: 'uh', sound: 'uh' }, { text: 'l', sound: 'l' }],
  'Tanz':  [{ text: 'T', sound: 't' }, { text: 'a', sound: 'a' }, { text: 'n', sound: 'n' }, { text: 'z', sound: 'z' }],
  'Tee':   [{ text: 'T', sound: 't' }, { text: 'ee', sound: 'eh' }],
  'Tier':  [{ text: 'T', sound: 't' }, { text: 'ie', sound: 'ih' }, { text: 'r', sound: 'r' }],
  'Tisch': [{ text: 'T', sound: 't' }, { text: 'i', sound: 'i' }, { text: 'sch', sound: 'sch' }],
  'Topf':  [{ text: 'T', sound: 't' }, { text: 'o', sound: 'o' }, { text: 'pf', sound: 'pf' }],
  'Uhr':   [{ text: 'Uh', sound: 'uh' }, { text: 'r', sound: 'r' }],
  'Wald':  [{ text: 'W', sound: 'w' }, { text: 'a', sound: 'a' }, { text: 'l', sound: 'l' }, { text: 'd', sound: 'd' }],
  'Wind':  [{ text: 'W', sound: 'w' }, { text: 'i', sound: 'i' }, { text: 'n', sound: 'n' }, { text: 'd', sound: 'd' }],
  'Wolf':  [{ text: 'W', sound: 'w' }, { text: 'o', sound: 'o' }, { text: 'l', sound: 'l' }, { text: 'f', sound: 'f' }],
  'Zahn':  [{ text: 'Z', sound: 'z' }, { text: 'ah', sound: 'ah' }, { text: 'n', sound: 'n' }],
  'Zeit':  [{ text: 'Z', sound: 'z' }, { text: 'ei', sound: 'ei' }, { text: 't', sound: 't' }],
  'Zelt':  [{ text: 'Z', sound: 'z' }, { text: 'e', sound: 'e' }, { text: 'l', sound: 'l' }, { text: 't', sound: 't' }],
  'Ziege': [{ text: 'Z', sound: 'z' }, { text: 'ie', sound: 'ih' }, { text: 'g', sound: 'g' }, { text: 'e', sound: 'e-schwa' }],
  'Zug':   [{ text: 'Z', sound: 'z' }, { text: 'u', sound: 'uh' }, { text: 'g', sound: 'g' }],
};

// Alle benoetigten Sound-Schluessel aus der Wort-Segmentierung (fuer die Audio-Generierung)
export const benoetigteSounds = Array.from(
  new Set(Object.values(wortSegmentierung).flatMap(seg => seg.map(s => s.sound)))
).sort();

// Alle deutschen Mehrbuchstaben-Laute (Digraphen, Cluster, Dehnungs-/Doppelvokale, Schwa)
export const mehrbuchstabenLaute: { key: string; label: string; hint: string }[] = [
  { key: 'eu', label: 'eu', hint: '„eu" wie in Eule, neun (oi)' },
  { key: 'aeu', label: 'äu (aeu)', hint: '„äu" wie in Bäume, Mäuse (oi)' },
  { key: 'ei', label: 'ei', hint: '„ei" in Ei, Eis, Stein' },
  { key: 'ie', label: 'ie', hint: '„ie" in Lied, Tier, Ziege (langes i)' },
  { key: 'au', label: 'au', hint: '„au" in Auge, Auto, Baum' },
  { key: 'aa', label: 'aa', hint: '„aa" wie in Haar, Saal (langes a)' },
  { key: 'ee', label: 'ee', hint: '„ee" in See, Tee (langes e)' },
  { key: 'oo', label: 'oo', hint: '„oo" in Boot, Zoo (langes o)' },
  { key: 'ah', label: 'ah', hint: '„ah" in Hahn, Zahn (langes a)' },
  { key: 'eh', label: 'eh', hint: '„eh" in Reh, Esel (langes e)' },
  { key: 'ih', label: 'ih', hint: '„ih" in Igel (langes i)' },
  { key: 'oh', label: 'oh', hint: '„oh" in Boot, Dose (langes o)' },
  { key: 'uh', label: 'uh', hint: '„uh" in Kuh, Stuhl, Uhr (langes u)' },
  { key: 'st', label: 'st', hint: '„st" wie in Stein, Stuhl / Ast' },
  { key: 'scht', label: 'scht (St-)', hint: '„St" am Wortanfang in Stein, Stuhl' },
  { key: 'sp', label: 'sp', hint: '„sp" wie in Spinne, Spiel (schp)' },
  { key: 'sch', label: 'sch', hint: '„sch" in Fisch, Tisch' },
  { key: 'ch', label: 'ch', hint: '„ch" allgemein (vgl. ch-soft / ch-hard)' },
  { key: 'ch-soft', label: 'ch-soft', hint: '„ch" weich in Milch, ich' },
  { key: 'ch-hard', label: 'ch-hard', hint: '„ch" hart in Buch, Dach' },
  { key: 'ck', label: 'ck', hint: '„ck" wie in Socke, Bäcker (k)' },
  { key: 'ng', label: 'ng', hint: '„ng" in Ring, singen' },
  { key: 'pf', label: 'pf', hint: '„pf" in Topf, Pferd' },
  { key: 'tz', label: 'tz', hint: '„tz" wie in Katze, Mütze (z)' },
  { key: 'qu', label: 'qu', hint: '„qu" wie in Qualle, quer (kw)' },
  { key: 'zw', label: 'zw', hint: '„zw" wie in Zwerg, zwei' },
  { key: 'br', label: 'br', hint: '„Br" in Brot' },
  { key: 'gl', label: 'gl', hint: '„Gl" in Glas' },
  { key: 'e-schwa', label: 'e-schwa (-e)', hint: '„-e" am Wortende in Affe, Hase' },
];

// Vollstaendige Liste aller Lautabschnitte (Einzelbuchstaben a-z + benoetigteSounds + mehrbuchstabenLaute)
export const alleLautabschnitte = Array.from(
  new Set([
    ...benoetigteSounds,
    ...mehrbuchstabenLaute.map(m => m.key),
    ...'abcdefghijklmnopqrstuvwxyz'.split(''),
  ])
).sort();

// Loest einen Wortnamen (auch in GROSSBUCHSTABEN wie "AFFE" oder "FUSS") zum exakten
// Dateinamen-Schluessel (z.B. "Affe", "Fuß", "Stuhl") auf.
export const resolveCanonicalWord = (word: string): string => {
  if (!word) return word;
  if (wortSegmentierung[word]) return word;
  const upper = word.toUpperCase();
  for (const key of Object.keys(wortSegmentierung)) {
    if (key.toUpperCase() === upper) return key;
  }
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};

// Cache-Busting-Version fuer Audio-Dateien (umgeht Cloudflare max-age=14400, Browser-HTTP-Cache & alten SW-Cache).
// Wird bei jedem Upload in vite.config.ts automatisch hochgezaehlt.
export const AUDIO_VERSION = 'lesen-lernen-v62';

export const withAudioVersion = (url: string): string => {
  if (!url) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}v=${AUDIO_VERSION}`;
};
