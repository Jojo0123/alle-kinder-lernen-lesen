#!/usr/bin/env python3
"""Geduldiger Upgrade-Lauf fuer scht: ersetzt das espeak-Interim durch einen
natuerlichen [ʃt]-Slice aus Gemini-TTS-Wort 'Stuhl', sobald die Quota wieder atmet.
Laeuft bis ~4h, alle 15 Min ein Versuch. Bei Erfolg: Datei ersetzen, Log updaten.
"""
import base64, io, json, os, struct, subprocess, array, time, urllib.request
import numpy as np

OUT = "/home/johannes/JojosCode/AlleKinderlernenlesen/public/Lautabschnitte/scht.mp3"
LOG = "/home/johannes/JojosCode/AlleKinderlernenlesen/animationen/lautabschnitte_log.json"

def token():
    return open(os.path.join(os.path.expanduser("~/.config"), "novosip", "gemini.key")).read().strip()

def api_post(model, payload):
    req = urllib.request.Request(
        f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={token()}",
        data=json.dumps(payload).encode(), headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())

def wav_parse(wav_bytes):
    f = io.BytesIO(wav_bytes); f.seek(8)
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

def main():
    deadline = time.time() + 4*3600
    attempt = 0
    while time.time() < deadline:
        attempt += 1
        try:
            res = api_post("gemini-3.8-flash-tts", {"contents": [{"parts": [{"text": "Stuhl"}]}],
                "generationConfig": {"responseModalities": ["AUDIO"],
                    "speechConfig": {"languageCode": "de-DE",
                        "voiceConfig": {"prebuiltVoiceConfig": {"voiceName": "Kore"}}}}})
            wav = next(base64.b64decode(p["inlineData"]["data"])
                       for p in res["candidates"][0]["content"]["parts"] if "inlineData" in p)
            a, sr = wav_parse(wav)
            win = max(1, int(sr*0.02))
            def feats(i):
                seg = np.array([x/32768 for x in a[i:i+win]])
                rms = float(np.sqrt(np.mean(seg**2)))
                X = np.abs(np.fft.rfft(seg*np.hanning(len(seg))))
                fr = np.fft.rfftfreq(len(seg), 1/sr)
                tot = float(np.sum(X**2))+1e-9
                return rms, float(np.sum(X[fr<1000]**2)/tot), float(np.sum(X[fr>=3000]**2)/tot)
            frames = [feats(i) for i in range(0, len(a)-win, win)]
            peak = max(r for r,_,_ in frames) or 1
            aktiv = [(i, r, lo, hi) for i,(r,lo,hi) in enumerate(frames) if r > 0.08*peak]
            start = aktiv[0][0]
            vokal = next((i for i,r,lo,hi in aktiv if i > start and lo > hi and r > 0.25*peak), None)
            if vokal is None:
                raise RuntimeError("kein Vokal-Onset")
            chunk = array.array("h", a[start*win : vokal*win]).tobytes()
            hdr = b"RIFF" + struct.pack("<I", 36+len(chunk)) + b"WAVE"
            hdr += b"fmt " + struct.pack("<IHHIIHH", 16,1,1,sr,sr*2,2,16)
            hdr += b"data" + struct.pack("<I", len(chunk))
            af = ("silenceremove=start_periods=1:start_threshold=-38dB:"
                  "stop_periods=-1:stop_threshold=-38dB:stop_duration=0.02,"
                  "apad=pad_dur=0.3,loudnorm=I=-16:TP=-1.5:LRA=11,atrim=0:0.55")
            tmp = "/tmp/scht_gemini.mp3"
            subprocess.run(["ffmpeg","-y","-f","wav","-i","pipe:0","-ac","1","-ar","44100","-af",af,
                            "-codec:a","libmp3lame","-q:a","4",tmp], input=hdr+chunk, check=True, capture_output=True)
            b64 = base64.b64encode(open(tmp,"rb").read()).decode()
            v = api_post("gemini-3.8-flash", {"contents": [{"parts": [
                {"inlineData": {"mimeType": "audio/mp3", "data": b64}},
                {"text": 'Enthaelt diese Audiodatei ein deutliches, knalliges "t" (plosiver t-Laut)? '
                         'Antworte NUR als JSON: {"enthaelt_t": true/false, "gehoert": "...", "urteil": "PASST|PASST_NICHT"}'}]}],
                "generationConfig": {"responseMimeType": "application/json", "temperature": 0.0}})
            verdict = json.loads(v["candidates"][0]["content"]["parts"][0]["text"])
            print(f"[Versuch {attempt}] {verdict}", flush=True)
            if verdict.get("urteil") == "PASST":
                subprocess.run(["cp", tmp, OUT], check=True)
                log = json.load(open(LOG))
                log["scht"] = {"versuche": f"Gemini-Wort-Slice 'Stuhl' (Versuch {attempt})",
                               "verdict": {"kategorie": "LAUT_OK", "gehoert": verdict.get("gehoert")}}
                json.dump(log, open(LOG, "w"), ensure_ascii=False, indent=2)
                print("SCHT UPGRADED (natuerliche Stimme)", flush=True)
                return
        except Exception as e:
            print(f"[Versuch {attempt}] {str(e)[:120]}", flush=True)
        time.sleep(900)
    print("Upgrade abgebrochen — espeak-Interim bleibt", flush=True)

if __name__ == "__main__":
    main()
