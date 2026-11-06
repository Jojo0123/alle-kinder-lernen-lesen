#!/usr/bin/env python3
"""Drossel-Nachlauf fuer die Lautabschnitt-Sounds: 25s zwischen JEDEM API-Call,
90s bei 429, Modell-Fallback (3.8-flash-tts -> 3.8-flash-lite-tts).
Vorhandene LAUT_OK-Eintraege werden uebersprungen, eh.mp3 wird nur verifiziert.
"""
import base64, json, os, subprocess, time, urllib.request

APP = "/home/johannes/JojosCode/AlleKinderlernenlesen"
OUT = os.path.join(APP, "public", "Lautabschnitte")
LOG = "/home/johannes/JojosCode/AlleKinderlernenlesen/animationen/lautabschnitte_log.json"

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
TTS_MODELS = ["gemini-3.8-flash-tts", "gemini-3.8-flash-lite-tts"]
VERIFY_MODEL = "gemini-3.8-flash"

def token():
    p = os.path.join(os.path.expanduser("~/.config"), "novosip", "gemini.key")
    with open(p) as f:
        return f.read().strip()

def api_post(model, payload):
    req = urllib.request.Request(
        f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={token()}",
        data=json.dumps(payload).encode(), headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())

def paced_post(model, payload, is_tts=False):
    """Ein Call mit Pacing; 429 -> 90s warten, 2x wiederholen; TTS mit Modell-Fallback."""
    models = TTS_MODELS if is_tts else [model]
    last_err = None
    for m in models:
        for attempt in range(3):
            time.sleep(25)  # Grundpacing gegen Quota-Stuerme
            try:
                return api_post(m, payload)
            except urllib.error.HTTPError as e:
                last_err = e
                if e.code == 429:
                    print(f"    429 ({m}), warte 90s", flush=True)
                    time.sleep(90)
                    continue
                raise
    raise last_err

def synthesize(ipa, inner):
    ssml = f'<speak><phoneme alphabet="ipa" ph="{ipa}">{inner}</phoneme></speak>'
    res = paced_post(None, {"contents": [{"parts": [
        {"text": ssml, "speechMetadata": {"style": "very short, clipped"}}]}],
        "generationConfig": {"responseModalities": ["AUDIO"],
            "speechConfig": {"languageCode": "de-DE",
                "voiceConfig": {"prebuiltVoiceConfig": {"voiceName": "Kore"}}}}}, is_tts=True)
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
    res = paced_post(VERIFY_MODEL, {"contents": [{"parts": [
        {"inlineData": {"mimeType": "audio/mp3", "data": b64}}, {"text": prompt}]}],
        "generationConfig": {"responseMimeType": "application/json", "temperature": 0.0}})
    return json.loads(res["candidates"][0]["content"]["parts"][0]["text"])

def main():
    try:
        results = json.load(open(LOG))
    except Exception:
        results = {}
    todo = [k for k in NEU
            if results.get(k, {}).get("verdict", {}).get("kategorie") != "LAUT_OK"]
    print(f"Noch offen: {todo}", flush=True)

    for key in todo:
        ipa, inner, kind = NEU[key]
        out = os.path.join(OUT, f"{key}.mp3")
        for versuch in range(1, 4):
            try:
                # Datei vorhanden (z.B. eh aus dem Vorlauf)? Erst nur verifizieren.
                if not (os.path.exists(out) and versuch == 1 and key == "eh"):
                    wav = synthesize(ipa, inner)
                    to_mp3(wav, out, kind)
                verdict = verify(out, key, ipa)
            except Exception as e:
                verdict = {"kategorie": "FEHLER", "gehoert": str(e)[:150]}
                print(f"[{key}] Versuch {versuch}: {verdict}", flush=True)
                time.sleep(60)
                continue
            print(f"[{key}] Versuch {versuch}: {verdict}", flush=True)
            if verdict.get("kategorie") == "LAUT_OK":
                break
        results[key] = {"versuche": versuch, "verdict": verdict}
        with open(LOG, "w") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)

    ok = sum(1 for k in NEU if results.get(k, {}).get("verdict", {}).get("kategorie") == "LAUT_OK")
    print(f"\nFERTIG: {ok}/16 LAUT_OK", flush=True)

if __name__ == "__main__":
    main()
