#!/usr/bin/env python3
"""Generiert die 16 neuen Lautabschnitt-Sounds via gemini-3.8-flash-tts (SSML IPA)
mit Verifikationsschleife. Die 20 uebrigen werden aus /Laute uebernommen (copy).
Ziel: public/Lautabschnitte/<key>.mp3 — MP3, mono, 44.1kHz.
"""
import base64, json, os, shutil, subprocess, time, urllib.request

APP = "/home/johannes/JojosCode/AlleKinderlernenlesen"
SRC = os.path.join(APP, "public", "Laute")
OUT = os.path.join(APP, "public", "Lautabschnitte")
os.makedirs(OUT, exist_ok=True)

# key -> (ipa, inner, kind)
NEU = {
    "ah":       ("a\u02d0",  "aa",   "vowel"),
    "eh":       ("e\u02d0",  "ee",   "vowel"),
    "ih":       ("i\u02d0",  "ih",   "vowel"),
    "oh":       ("o\u02d0",  "oo",   "vowel"),
    "uh":       ("u\u02d0",  "uu",   "vowel"),
    "au":       ("a\u028a\u032f", "au", "vowel"),
    "ei":       ("a\u026a\u032f", "ei", "vowel"),
    "e-schwa":  ("\u0259",   "e",    "vowel"),
    "sch":      ("\u0283",   "sch",  "cont"),
    "ch-soft":  ("\u00e7",   "ch",   "cont"),
    "ch-hard":  ("x",        "ch",   "cont"),
    "scht":     ("\u0283t",  "scht", "cont"),
    "ng":       ("\u014b",   "ng",   "cont"),
    "pf":       ("pf",       "pf",   "cont"),
    "br":       ("b\u0279",  "br",   "cont"),
    "gl":       ("\u0261l",  "gl",   "cont"),
}

# key -> Quelldatei in /Laute (die heute verifizierten Buchstaben-Laute)
REUSE = {
    "a": "A", "e": "E", "i": "I", "o": "O", "u": "U",
    "b": "B", "d": "D", "f": "F", "g": "G", "h": "H", "k": "K",
    "l": "L", "m": "M", "n": "N", "p": "P", "r": "R", "s": "S",
    "t": "T", "w": "W", "z": "Z",
}

def token():
    p = os.path.join(os.path.expanduser("~/.config"), "novosip", "gemini.key")
    with open(p) as f:
        return f.read().strip()

def api_post(model, payload):
    for i in range(6):
        req = urllib.request.Request(
            f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={token()}",
            data=json.dumps(payload).encode(), headers={"Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            if e.code == 429 and i < 5:
                time.sleep(30); continue
            raise

def synthesize(ipa, inner):
    ssml = f'<speak><phoneme alphabet="ipa" ph="{ipa}">{inner}</phoneme></speak>'
    res = api_post("gemini-3.8-flash-tts", {"contents": [{"parts": [
        {"text": ssml, "speechMetadata": {"style": "very short, clipped"}}]}],
        "generationConfig": {"responseModalities": ["AUDIO"],
            "speechConfig": {"languageCode": "de-DE",
                "voiceConfig": {"prebuiltVoiceConfig": {"voiceName": "Kore"}}}}})
    for p in res.get("candidates", [{}])[0].get("content", {}).get("parts", []):
        if "inlineData" in p:
            return base64.b64decode(p["inlineData"]["data"])
    raise RuntimeError(json.dumps(res)[:200])

def to_mp3(wav, out, kind):
    if kind == "vowel":
        af = ("silenceremove=start_periods=1:start_threshold=-38dB:"
              "stop_periods=-1:stop_threshold=-38dB:stop_duration=0.04,"
              "atrim=0:0.55,afade=t=out:st=0.45:d=0.10,"
              "loudnorm=I=-16:TP=-1.5:LRA=11")
    else:
        af = ("silenceremove=start_periods=1:start_threshold=-38dB:"
              "stop_periods=-1:stop_threshold=-38dB:stop_duration=0.04,"
              "atrim=0:0.42,afade=t=out:st=0.34:d=0.08,"
              "loudnorm=I=-16:TP=-1.5:LRA=11")
    subprocess.run(["ffmpeg","-y","-f","wav","-i","pipe:0","-ac","1","-ar","44100",
                    "-af",af,"-codec:a","libmp3lame","-q:a","4",out],
                   input=wav, check=True, capture_output=True)

def verify(mp3_path, key, ipa):
    with open(mp3_path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()
    prompt = (f'Diese Audiodatei soll genau EINEN isolierten deutschen Laut enthalten, '
              f'naemlich IPA [{ipa}] (Schluessel "{key}"). '
              'Antworte NUR als JSON: {"kategorie": "LAUT_OK|BUCHSTABENNAME|WORT|ANWEISUNG|FALSCHER_LAUT", '
              '"gehoert": "was hoerst du?"}')
    res = api_post("gemini-3.8-flash", {"contents": [{"parts": [
        {"inlineData": {"mimeType": "audio/mp3", "data": b64}}, {"text": prompt}]}],
        "generationConfig": {"responseMimeType": "application/json", "temperature": 0.0}})
    return json.loads(res["candidates"][0]["content"]["parts"][0]["text"])

def main():
    results = {}
    # 1) Wiederverwendete Sounds kopieren
    for key, src in REUSE.items():
        dst = os.path.join(OUT, f"{key}.mp3")
        if not os.path.exists(dst):
            shutil.copy(os.path.join(SRC, f"{src}.mp3"), dst)
    print(f"{len(REUSE)} Sounds aus /Laute uebernommen", flush=True)

    # 2) Neue Sounds generieren + verifizieren
    for key, (ipa, inner, kind) in NEU.items():
        out = os.path.join(OUT, f"{key}.mp3")
        verdict = None
        for attempt in range(1, 5):
            try:
                wav = synthesize(ipa, inner)
                to_mp3(wav, out, kind)
                verdict = verify(out, key, ipa)
            except Exception as e:
                verdict = {"kategorie": "FEHLER", "gehoert": str(e)[:150]}
                time.sleep(5); continue
            if verdict.get("kategorie") == "LAUT_OK":
                break
            time.sleep(8)
        results[key] = {"versuche": attempt, "verdict": verdict}
        ok = verdict.get("kategorie") == "LAUT_OK"
        print(f"[{'OK ' if ok else 'WARN'}] {key}.mp3 (Versuch {attempt}): {verdict}", flush=True)

    log = "/home/johannes/JojosCode/AlleKinderlernenlesen/animationen/lautabschnitte_log.json"
    with open(log, "w") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    ok = sum(1 for r in results.values() if r["verdict"].get("kategorie") == "LAUT_OK")
    print(f"\nFERTIG: {ok}/16 neu generiert LAUT_OK | Log: {log}", flush=True)

if __name__ == "__main__":
    main()
