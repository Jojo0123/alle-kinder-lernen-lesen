#!/usr/bin/env python3
"""Fix fuer die letzten zwei Lautabschnitt-Sounds:
- scht [ʃt]: deterministisch aus sch.mp3 + t.mp3 konkateniert (Q = K+W-Trick)
- ch-soft [ç]: Strategie-Kette (x-sampa, Pausentrick, Style-Hints), pacing wie gehabt.
"""
import base64, io, json, os, struct, subprocess, time, urllib.request, array

APP = "/home/johannes/JojosCode/AlleKinderlernenlesen"
OUT = os.path.join(APP, "public", "Lautabschnitte")
LOG = "/home/johannes/JojosCode/AlleKinderlernenlesen/animationen/lautabschnitte_log.json"

def token():
    p = os.path.join(os.path.expanduser("~/.config"), "novosip", "gemini.key")
    with open(p) as f:
        return f.read().strip()

def api_post(model, payload):
    for i in range(4):
        time.sleep(25)
        req = urllib.request.Request(
            f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={token()}",
            data=json.dumps(payload).encode(), headers={"Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            if e.code == 429 and i < 3:
                print("    429, warte 90s", flush=True)
                time.sleep(90); continue
            raise

def tts(parts):
    res = api_post("gemini-3.8-flash-tts", {"contents": [{"parts": parts}],
        "generationConfig": {"responseModalities": ["AUDIO"],
            "speechConfig": {"languageCode": "de-DE",
                "voiceConfig": {"prebuiltVoiceConfig": {"voiceName": "Kore"}}}}})
    for p in res.get("candidates", [{}])[0].get("content", {}).get("parts", []):
        if "inlineData" in p:
            return base64.b64decode(p["inlineData"]["data"])
    raise RuntimeError(json.dumps(res)[:200])

def to_mp3(wav, out):
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

# --- scht: sch + t Konkatenation ---
def fix_scht():
    out = os.path.join(OUT, "scht.mp3")
    cmd = ["ffmpeg","-y","-i",os.path.join(OUT,"sch.mp3"),"-i",os.path.join(OUT,"t.mp3"),
           "-filter_complex","[0:a][1:a]acrossfade=d=0.03:c1=tri:c2=tri,loudnorm=I=-16:TP=-1.5:LRA=11",
           "-ac","1","-ar","44100","-codec:a","libmp3lame","-q:a","4",out]
    subprocess.run(cmd, check=True, capture_output=True)
    v = verify(out, "scht", "\u0283t")
    print(f"[scht] Konkatenation sch+t: {v}", flush=True)
    return v

# --- ch-soft: Strategien ---
def cut_before_pause(wav_bytes, gap_ms=120, thresh_frac=0.06):
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
    win = int(sr * 0.01); n = len(a)
    env = []
    for i in range(0, n - win, win):
        s = sum(x * x for x in a[i:i+win])
        env.append((s / win) ** 0.5)
    peak = max(env) or 1
    thr = peak * thresh_frac
    onset = next((i for i, e in enumerate(env) if e > thr), 0)
    need = gap_ms // 10; run = 0; cut = len(env)
    for i in range(onset, len(env)):
        if env[i] <= thr:
            run += 1
            if run >= need:
                cut = i - run + 1; break
        else:
            run = 0
    raw = a[int(onset*0.01*sr):int(cut*0.01*sr)]
    out = array.array("h", raw)
    hdr = b"RIFF" + struct.pack("<I", 36 + len(out.tobytes())) + b"WAVE"
    hdr += b"fmt " + struct.pack("<IHHIIHH", 16, 1, 1, sr, sr*2, 2, 16)
    hdr += b"data" + struct.pack("<I", len(out.tobytes()))
    return hdr + out.tobytes()

CH_STRATEGIEN = [
    ("xsampa-C", lambda: tts([{"text": '<speak><phoneme alphabet="x-sampa" ph="C">ch</phoneme></speak>',
        "speechMetadata": {"style": "very short, clipped"}}])),
    ("pausentrick", lambda: cut_before_pause(tts([{"text": 'ch ... <short pause> Milch'}]))),
    ("ipa-style", lambda: tts([{"text": '<speak><phoneme alphabet="ipa" ph="\u00e7">ch</phoneme></speak>',
        "speechMetadata": {"style": "soft German ich-laut, gentle palatal fricative, no t-sound"}}])),
    ("inner-ich", lambda: tts([{"text": '<speak><phoneme alphabet="ipa" ph="\u00e7">\u00e7</phoneme></speak>',
        "speechMetadata": {"style": "very short, clipped"}}])),
]

def fix_ch_soft():
    out = os.path.join(OUT, "ch-soft.mp3")
    for name, fn in CH_STRATEGIEN:
        for versuch in (1, 2):
            try:
                wav = fn()
                to_mp3(wav, out)
                v = verify(out, "ch-soft", "\u00e7")
            except Exception as e:
                print(f"[ch-soft/{name} #{versuch}] FEHLER: {str(e)[:120]}", flush=True)
                time.sleep(60); continue
            print(f"[ch-soft/{name} #{versuch}] {v}", flush=True)
            if v.get("kategorie") == "LAUT_OK":
                return v
    return v

def main():
    results = json.load(open(LOG))
    v1 = fix_scht()
    results["scht"] = {"versuche": "sch+t-Konkatenation", "verdict": v1}
    v2 = fix_ch_soft()
    results["ch-soft"] = {"versuche": "Strategie-Kette", "verdict": v2}
    with open(LOG, "w") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    ok = sum(1 for k in ["scht","ch-soft"] if results[k]["verdict"].get("kategorie") == "LAUT_OK")
    print(f"\nFERTIG: {ok}/2 gefixt", flush=True)

if __name__ == "__main__":
    main()
