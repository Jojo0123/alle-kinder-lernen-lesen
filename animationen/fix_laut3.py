#!/usr/bin/env python3
"""Fix-Lauf 3 fuer scht + ch-soft:
- scht: plain concat sch+t (kein Crossfade — das verschluckte das t), Lautfolge-Verifikation
- ch-soft: SOFORT espeak-ng Interim (phonetisch korrekt, ersetzt das falsche "tsch"),
  dann Gemini-Upgrade-Runden mit Wort-Slicing ("ich" -> [ç] herausschneiden) und
  Lite-Modell-Fallback. Langes Warten zwischen den Runden (Quota-Fenster sind gross).
"""
import base64, io, json, os, struct, subprocess, time, urllib.request, array

APP = "/home/johannes/JojosCode/AlleKinderlernenlesen"
OUT = os.path.join(APP, "public", "Lautabschnitte")
LOG = "/home/johannes/JojosCode/AlleKinderlernenlesen/animationen/lautabschnitte_log.json"
TTS_MODELS = ["gemini-3.8-flash-lite-tts", "gemini-3.1-flash-tts-preview", "gemini-3.8-flash-tts"]

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
    models = TTS_MODELS if is_tts else [model]
    last_err = None
    for m in models:
        for attempt in range(2):
            try:
                return api_post(m, payload)
            except urllib.error.HTTPError as e:
                last_err = e
                if e.code == 429:
                    print(f"    429 ({m}), warte 60s", flush=True)
                    time.sleep(60)
                    continue
                raise
    raise last_err

def wav_from_tts(parts):
    res = paced_post(None, {"contents": [{"parts": parts}],
        "generationConfig": {"responseModalities": ["AUDIO"],
            "speechConfig": {"languageCode": "de-DE",
                "voiceConfig": {"prebuiltVoiceConfig": {"voiceName": "Kore"}}}}}, is_tts=True)
    for p in res.get("candidates", [{}])[0].get("content", {}).get("parts", []):
        if "inlineData" in p:
            return base64.b64decode(p["inlineData"]["data"])
    raise RuntimeError(json.dumps(res)[:200])

def wav_parse(wav_bytes):
    f = io.BytesIO(wav_bytes)
    assert f.read(4) == b"RIFF"; f.seek(8)
    assert f.read(4) == b"WAVE"
    data = None; sr = 16000; ch = 1
    while True:
        hdr = f.read(8)
        if len(hdr) < 8: break
        cid, size = hdr[:4], struct.unpack("<I", hdr[4:8])[0]
        if cid == b"fmt ":
            fmt = f.read(size)
            ch = struct.unpack("<H", fmt[2:4])[0]
            sr = struct.unpack("<I", fmt[4:8])[0]
        elif cid == b"data":
            data = f.read(size)
        else:
            f.seek(size + (size % 2), 1)
    a = array.array("h"); a.frombytes(data)
    if ch == 2: a = a[::2]
    return a, sr

def to_mp3_from_wavbytes(wav_bytes, out):
    af = ("silenceremove=start_periods=1:start_threshold=-38dB:"
          "stop_periods=-1:stop_threshold=-38dB:stop_duration=0.04,"
          "atrim=0:0.42,afade=t=out:st=0.34:d=0.08,"
          "loudnorm=I=-16:TP=-1.5:LRA=11")
    subprocess.run(["ffmpeg","-y","-f","wav","-i","pipe:0","-ac","1","-ar","44100",
                    "-af",af,"-codec:a","libmp3lame","-q:a","4",out],
                   input=wav_bytes, check=True, capture_output=True)

def to_mp3_from_samples(samples, sr, out):
    raw = array.array("h", samples).tobytes()
    hdr = b"RIFF" + struct.pack("<I", 36 + len(raw)) + b"WAVE"
    hdr += b"fmt " + struct.pack("<IHHIIHH", 16, 1, 1, sr, sr*2, 2, 16)
    hdr += b"data" + struct.pack("<I", len(raw))
    to_mp3_from_wavbytes(hdr + raw, out)

def verify(mp3_path, key, ipa):
    with open(mp3_path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()
    prompt = (f'Diese Audiodatei soll genau EINEN isolierten deutschen Laut enthalten, '
              f'naemlich IPA [{ipa}] (Schluessel "{key}"). '
              'Antworte NUR als JSON: {"kategorie": "LAUT_OK|BUCHSTABENNAME|WORT|ANWEISUNG|FALSCHER_LAUT", '
              '"gehoert": "was hoerst du?"}')
    res = paced_post("gemini-3.8-flash", {"contents": [{"parts": [
        {"inlineData": {"mimeType": "audio/mp3", "data": b64}}, {"text": prompt}]}],
        "generationConfig": {"responseMimeType": "application/json", "temperature": 0.0}})
    return json.loads(res["candidates"][0]["content"]["parts"][0]["text"])

def verify_scht(mp3_path):
    with open(mp3_path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()
    prompt = ('Diese Audiodatei soll die Lautfolge [ʃt] enthalten (wie deutsches "St" am Wortanfang, '
              'z.B. "Stuhl"). Transkribiere die Lautfolge EXAKT als Liste und antworte NUR als JSON: '
              '{"lautfolge": [...], "enthaelt_sch": true/false, "enthaelt_t": true/false}')
    res = paced_post("gemini-3.8-flash", {"contents": [{"parts": [
        {"inlineData": {"mimeType": "audio/mp3", "data": b64}}, {"text": prompt}]}],
        "generationConfig": {"responseMimeType": "application/json", "temperature": 0.0}})
    return json.loads(res["candidates"][0]["content"]["parts"][0]["text"])

# ---------- scht: plain concat ----------
def fix_scht():
    out = os.path.join(OUT, "scht.mp3")
    cmd = ["ffmpeg","-y","-i",os.path.join(OUT,"sch.mp3"),"-i",os.path.join(OUT,"t.mp3"),
           "-filter_complex","[0:a][1:a]concat=n=2:v=0:a=1,loudnorm=I=-16:TP=-1.5:LRA=11",
           "-ac","1","-ar","44100","-codec:a","libmp3lame","-q:a","4",out]
    subprocess.run(cmd, check=True, capture_output=True)
    v = verify_scht(out)
    print(f"[scht] plain concat sch+t: {v}", flush=True)
    return v

# ---------- ch-soft ----------
def espeak_interim(out):
    r = subprocess.run(["espeak-ng","-v","de","[[\u00e7]]","-w","/tmp/ch_soft_espeak.wav"],
                       capture_output=True)
    wav = open("/tmp/ch_soft_espeak.wav","rb").read()
    to_mp3_from_wavbytes(wav, out)
    print("[ch-soft] espeak-ng Interim geschrieben", flush=True)

def slice_from_ich():
    """Wort "ich" generieren, das finale [ç] herausschneiden (Frikativ nach Vokal)."""
    wav = wav_from_tts([{"text": "ich"}])
    a, sr = wav_parse(wav)
    win = int(sr * 0.01); n = len(a)
    # HF-Anteil pro Fenster: [ç] ist Frikativ (viel HF), [ɪ] periodisch (wenig HF)
    cut = None
    for i in range(0, n - win, win):
        seg = a[i:i+win]
        # Differenzenenergie als HF-Schaetzer
        diff = sum((seg[j+1]-seg[j])**2 for j in range(0, len(seg)-1, 2))
        tot = sum(x*x for x in seg) + 1
        if diff / tot > 0.55:
            cut = i
            break
    if cut is None:
        raise RuntimeError("kein Frikativ-Anfang in 'ich' gefunden")
    # 20ms frueher ansetzen, bis zum Ende (minus Rand)
    start = max(0, cut - int(0.02 * sr))
    end = min(n, n - int(0.02 * sr))
    return array.array("h", a[start:end]), sr

def gemini_upgrade_rounds(out):
    strategien = [
        ("slice-ich", lambda: to_mp3_from_samples(*slice_from_ich(), out)),
        ("xsampa-C", lambda: to_mp3_from_wavbytes(wav_from_tts([{"text":
            '<speak><phoneme alphabet="x-sampa" ph="C">ch</phoneme></speak>',
            "speechMetadata": {"style": "very short, clipped"}}]), out)),
        ("pausentrick", lambda: to_mp3_from_wavbytes(wav_from_tts([{"text":
            'ch ... <short pause> Milch'}]), out)),
    ]
    v = {"kategorie": "UNVERIFIZIERT", "gehoert": "keine Strategie durchgekommen"}
    for round_no in range(1, 4):
        print(f"--- ch-soft Upgrade-Runde {round_no} ---", flush=True)
        for name, fn in strategien:
            try:
                fn()
                v = verify(out, "ch-soft", "\u00e7")
            except Exception as e:
                print(f"[ch-soft/{name}] FEHLER: {str(e)[:120]}", flush=True)
                continue
            print(f"[ch-soft/{name}] {v}", flush=True)
            if v.get("kategorie") == "LAUT_OK":
                return v
        time.sleep(300)  # Quota-Fenster wieder atmen lassen
    return v

def main():
    results = json.load(open(LOG))
    v = {"kategorie": "UNVERIFIZIERT"}
    try:
        v = fix_scht()
    except Exception as e:
        print(f"[scht] FEHLER: {str(e)[:150]}", flush=True)
    results["scht"] = {"versuche": "plain concat sch+t", "verdict": v}

    # Interim zuerst: das falsche "tsch" SOFORT ersetzen
    espeak_interim(os.path.join(OUT, "ch-soft.mp3"))
    try:
        v2 = gemini_upgrade_rounds(os.path.join(OUT, "ch-soft.mp3"))
    except Exception as e:
        v2 = {"kategorie": "FEHLER", "gehoert": str(e)[:150]}
        print(f"[ch-soft] Upgrade gescheitert: {v2}", flush=True)
    results["ch-soft"] = {"versuche": "espeak-Interim + Gemini-Upgrade", "verdict": v2}

    with open(LOG, "w") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print("\nFERTIG", flush=True)

if __name__ == "__main__":
    main()
