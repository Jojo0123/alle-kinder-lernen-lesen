#!/usr/bin/env python3
"""Wortkarten-Animationen fuer 'Alle Kinder lernen lesen' via MiniMax H3 (I2V).

Jede Wortkarte (data/1/images/<WORT>.png) wird als First-Frame genutzt, die
Bewegung kommt aus einem Motion-Prompt. Output: public/WordAnimationen/<WORT>.mp4
(gemuted, H.264, klein genug fuer die PWA-Belohnungsansicht).

Aufruf:  python3 animate_cards.py            # alle fehlenden (resume-safe)
         python3 animate_cards.py Affe Stuhl  # nur diese (Kanarienvoegel)
"""
import json, os, sys, time, urllib.request, http.client, uuid, subprocess

BASE = "http://127.0.0.1:8188"
APP = "/home/johannes/JojosCode/AlleKinderlernenlesen"
IMG_DIR = os.path.join(APP, "data", "1", "images")
OUT_DIR = os.path.join(APP, "public", "WordAnimationen")
RAW_DIR = os.path.join(APP, "animationen", "raw")
os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(RAW_DIR, exist_ok=True)

W, H = 512, 512          # /32-clean; Karten-Anzeige braucht nicht mehr
LENGTH_FRAMES = 90       # 3.75 s @24fps, 17k+5-Grid
SEED_BASE = 20261101000000

STYLE = ("Traditional children's book watercolor illustration, isolated on a pure white background, "
         "soft organic edges, no black outlines, visible watercolor paper texture and gentle pigment bleed, "
         "warm earthy palette with soft cool translucent shadows. The white background stays clean and empty. "
         "Motion is gentle, soft and fluid, slow storybook pacing, the subject stays in its exact watercolor look and colors. ")
NEG = ("No photorealism, no 3D CGI, no live action, no outlines, no text, no letters, no numbers, no watermark, "
       "no background scenery, no dark background, no morphing or melting shapes, no sudden jerky movements. ")
AUDIO = "Audio: gentle playful storybook sound effects matching the motion, soft and quiet."

# WORT -> Motion-Prompt (fluessige Verben, eine klare Idee pro Clip)
MOTION = {
 "Affe": "the baby monkey hops up once and lands softly, its tail swaying in one fluid motion, eyes blinking gently",
 "Ast": "a soft breeze sways the branch gently, one leaf detaches and glides down",
 "Auge": "the eye blinks slowly twice, then glides looking to the left and right",
 "Auto": "the little car glides forward in a smooth small circle and returns to its starting pose",
 "Ball": "the ball bounces up and down in a smooth rhythm, squashing slightly on each landing",
 "Baum": "the tree sways gently in the wind, leaves shimmering, one leaf gliding down",
 "Bett": "the blanket ripples softly as if breathing, the pillow sinks and rises gently",
 "Boot": "the boat rocks gently on soft waves, gliding slightly forward and back",
 "Brot": "the bread slice tilts and wobbles playfully, crumbs dancing upward softly",
 "Buch": "the book opens smoothly, pages flip in a fluid wave, then it closes",
 "Bus": "the bus glides forward smoothly and stops, the door swings open and closed",
 "Dach": "warm sun sweeps across the roof tiles, a small bird glides in and lands on the ridge",
 "Dose": "the tin can wobbles gently, the lid lifts slightly and settles back with a soft bounce",
 "Ei": "the egg rocks side to side and hops once, a tiny crack line appearing on the shell",
 "Eis": "the ice cream scoop wobbles softly, a single drop glides down the cone",
 "Esel": "the donkey trots a smooth small circle, its ears wiggling, tail swaying",
 "Fass": "the barrel rolls half a turn to the side and rolls back smoothly",
 "Fest": "colorful flags wave gently and confetti glides down through the air",
 "Fisch": "the fish glides in a smooth loop, bubbles rising softly behind it",
 "Fuß": "the foot taps up and down twice, the toes wiggling gently",
 "Gans": "the goose waddles in a small smooth curve, its beak opening once, wings ruffling",
 "Geld": "the coins spin and settle into a small stack, banknotes fluttering down gently",
 "Glas": "the glass tilts gently side to side, light shimmering through it",
 "Hahn": "the rooster flaps its wings in a smooth sweep and opens its beak as if crowing",
 "Hand": "the hand waves friendly in a smooth back-and-forth motion, fingers swaying",
 "Hase": "the rabbit hops twice in a smooth arc, its nose twitching, ears swaying",
 "Haus": "the windows glow warm on and off, a wisp of smoke gliding up from the chimney",
 "Herd": "the pots bubble softly, steam rising and curling in a fluid motion",
 "Herz": "the heart pulses warmly twice, small sparkles drifting around it",
 "Hund": "the dog wags its tail smoothly, its mouth opening once in a happy bark",
 "Hut": "the hat tips playfully and lifts up and down with a soft bounce",
 "Igel": "the hedgehog waddles forward smoothly, leaves rustling beneath it",
 "Insel": "the palm sways gently, soft waves lap around the island, a bird glides across",
 "Kuh": "the cow sways its tail smoothly, chewing, its head nodding gently",
 "Kuss": "the lips pucker and blow a kiss, small hearts gliding upward",
 "Lampe": "the lamp switches on with a warm glow, brightening and dimming softly once",
 "Laus": "the little louse crawls in a smooth small curve, its antennae waving",
 "Lied": "musical notes rise and dance in a slow fluid spiral",
 "Mama": "the mother waves gently and tilts her head with a warm smile, blinking softly",
 "Maus": "the mouse takes tiny smooth steps, nose twitching, ears wiggling",
 "Milch": "milk swirls gently in the glass, the carton tilts and pours a smooth stream",
 "Mond": "the moon glows softly, thin clouds gliding past, stars twinkling",
 "Nase": "the nose wiggles up and down twice, then a small butterfly glides in and lands on its tip",
 "Nest": "a baby bird peeks out softly, the mother bird gliding in to land on the nest edge",
 "Nuss": "the nut spins slowly in place, a small crack line appearing on its shell",
 "Ofen": "warm light glows from inside the oven, heat shimmer rising smoothly, the handle wiggling",
 "Oma": "the grandmother waves gently and nods with a warm smile, blinking softly",
 "Opa": "the grandfather waves gently and tips his glasses with a warm smile",
 "Oper": "the opera singer opens her mouth singing, the curtains swaying gently beside her",
 "Papa": "the father waves smoothly and gives a warm thumbs up, blinking softly",
 "Post": "letters glide smoothly into the mailbox, the little flag raising up",
 "Puppe": "the doll tilts its head and waves one arm smoothly, eyes blinking",
 "Rad": "the wheel spins around twice in a smooth motion, spokes shimmering",
 "Reh": "the deer takes delicate smooth steps, ears twitching, head turning gracefully",
 "Ring": "the ring spins slowly, sparkling light glinting across its surface",
 "Rose": "the rose sways gently, one petal detaching and gliding down softly",
 "Saft": "the bottle tilts and pours a smooth stream of juice, bubbles rising in the glass",
 "Salz": "the salt shaker tilts and sprinkles fine salt grains gliding down",
 "See": "soft waves ripple across the lake, sunlight sparkling and dancing on the water",
 "Sofa": "the cushion sinks softly and bounces back, the blanket rippling gently",
 "Sonne": "the sun spins slowly, warm rays pulsing outward in a gentle rhythm",
 "Stein": "the stone sits solid while a ladybug crawls smoothly across its surface",
 "Stuhl": "the camera slowly orbits once around the chair in one fluid motion",
 "Tanz": "the dancing pair sways and spins gracefully in a smooth turn, scarves flowing",
 "Tee": "steam rises and curls softly from the cup, the cup tilting gently",
 "Tier": "the little animal stretches smoothly and takes one playful step, blinking",
 "Tisch": "an apple on the table rolls gently back and forth, light sweeping across the wood",
 "Topf": "the pot lid rattles softly, steam puffing up and curling",
 "Uhr": "the clock hands glide around once smoothly, the pendulum swinging steadily",
 "Wald": "trees sway gently, leaves gliding down, a deer passing softly in the background",
 "Wind": "invisible wind swirls through, leaves and grass bending and gliding through the air",
 "Wolf": "the wolf lifts its head and howls, a soft breath cloud drifting upward",
 "Zahn": "the tooth sparkles and shines, small stars twinkling around it",
 "Zeit": "the clock hands glide forward, hourglass sand flowing smoothly",
 "Zelt": "the tent flap opens softly, warm light glowing from inside, the flag waving",
 "Ziege": "the goat walks in a smooth small circle, wiggling its ears, tail swaying",
 "Zug": "the train glides forward smoothly, wheels turning, soft puffs of smoke rising",
}

def build_prompt(word, motion):
    return ("First frame: the provided watercolor word-card illustration of '" + word +
            "', keeping its exact colors, brushwork and composition on white.\n\n" +
            "Motion: " + motion + "\n\n" + STYLE + NEG + "\n\n" + AUDIO)

def api_prompt(text, seed, image_filename):
    i2v = {"clip": ["13", 0], "vae": ["11", 0], "prompt": text,
           "width": W, "height": H, "length": LENGTH_FRAMES, "first_frame": ["100", 0]}
    prompt = {
        "6":  {"class_type": "UNETLoader", "inputs": {"unet_name": "minimax_h3_fl2va_pruned_int8_convrot.safetensors", "weight_dtype": "default"}},
        "11": {"class_type": "VAELoader", "inputs": {"vae_name": "minimax_h3_video_vae_fp16.safetensors"}},
        "13": {"class_type": "CLIPLoader", "inputs": {"clip_name": "qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors", "type": "minimax", "device": "default"}},
        "24": {"class_type": "VAELoader", "inputs": {"vae_name": "minimax_h3_audio_vae_fp32.safetensors"}},
        "10": {"class_type": "VAEDecode", "inputs": {"samples": ["14", 0], "vae": ["11", 0]}},
        "17": {"class_type": "KSamplerSelect", "inputs": {"sampler_name": "res_multistep"}},
        "9":  {"class_type": "BasicScheduler", "inputs": {"scheduler": "simple", "steps": 20, "denoise": 1.0, "model": ["6", 0]}},
        "15": {"class_type": "RandomNoise", "inputs": {"noise_seed": seed}},
        "16": {"class_type": "BasicGuider", "inputs": {"model": ["6", 0], "conditioning": ["104", 0]}},
        "14": {"class_type": "SamplerCustomAdvanced", "inputs": {"noise": ["15", 0], "guider": ["16", 0], "sampler": ["17", 0], "sigmas": ["9", 0], "latent_image": ["104", 1]}},
        "23": {"class_type": "VAEDecodeAudio", "inputs": {"samples": ["14", 0], "vae": ["24", 0]}},
        "91": {"class_type": "CreateVideo", "inputs": {"fps": 24.0, "images": ["10", 0], "audio": ["23", 0]}},
        "92": {"class_type": "SaveVideo", "inputs": {"filename_prefix": "video/wortkarte", "format": "auto", "codec": "auto", "video": ["91", 0]}},
        "104": {"class_type": "MiniMaxH3ImageToVideo", "inputs": i2v},
        "100": {"class_type": "LoadImage", "inputs": {"image": image_filename}},
    }
    return {"prompt": prompt}

def post(path, data):
    req = urllib.request.Request(BASE + path, data=json.dumps(data).encode(),
                                 headers={"Content-Type": "application/json"})
    return json.load(urllib.request.urlopen(req))

def get(path):
    return json.load(urllib.request.urlopen(BASE + path))

def upload_image(png_path):
    boundary = uuid.uuid4().hex
    filename = os.path.basename(png_path)
    data = open(png_path, "rb").read()
    body = (f"--{boundary}\r\nContent-Disposition: form-data; name=\"image\"; filename=\"{filename}\"\r\n"
            f"Content-Type: image/png\r\n\r\n").encode() + data + f"\r\n--{boundary}--\r\n".encode()
    conn = http.client.HTTPConnection("127.0.0.1", 8188)
    conn.request("POST", "/upload/image", body,
                 {"Content-Type": f"multipart/form-data; boundary={boundary}"})
    return json.load(conn.getresponse())["name"]

def wait_done(pid, label, timeout=3600):
    t0 = time.time()
    while True:
        time.sleep(15)
        h = get("/history/" + pid)
        if pid in h:
            st = h[pid].get("status", {})
            if st.get("completed"):
                print(f"[{label}] DONE in {(time.time()-t0)/60:.1f} min", flush=True)
                for node_out in h[pid].get("outputs", {}).values():
                    for key in ("videos", "gifs", "images"):
                        if key in node_out:
                            f = node_out[key][0]
                            return os.path.join(os.path.expanduser("~/ComfyUI/output"),
                                                f.get("subfolder", ""), f["filename"])
                return None
            if st.get("status_str") == "error":
                print(f"[{label}] ERROR: {json.dumps(st)[:500]}", flush=True)
                return None
        if time.time() - t0 > timeout:
            print(f"[{label}] TIMEOUT", flush=True)
            return None

def make_app_mp4(raw_path, target):
    # Audio streichen, klein + web-tauglich
    subprocess.run(["ffmpeg", "-y", "-i", raw_path, "-an",
                    "-c:v", "libx264", "-crf", "26", "-preset", "medium",
                    "-pix_fmt", "yuv420p", "-movflags", "+faststart", target],
                   check=True, capture_output=True)

def main():
    only = sys.argv[1:] or list(MOTION.keys())
    missing = [w for w in only if w in MOTION and
               not os.path.exists(os.path.join(OUT_DIR, w + ".mp4"))]
    print(f"{len(missing)} Karten zu rendern: {missing}", flush=True)
    for i, word in enumerate(missing):
        png = os.path.join(IMG_DIR, word + ".png")
        if not os.path.exists(png):
            print(f"[{word}] KEIN BILD, skip", flush=True)
            continue
        img_name = upload_image(png)
        seed = SEED_BASE + i
        pid = post("/prompt", api_prompt(build_prompt(word, MOTION[word]), seed, img_name))["prompt_id"]
        print(f"[{word}] queued pid={pid} seed={seed}", flush=True)
        vid = wait_done(pid, word)
        if not vid:
            print(f"[{word}] FAILED, stoppe Batch", flush=True)
            sys.exit(1)
        raw = os.path.join(RAW_DIR, word + ".mp4")
        subprocess.run(["cp", vid, raw], check=True)
        make_app_mp4(raw, os.path.join(OUT_DIR, word + ".mp4"))
        print(f"[{word}] -> {OUT_DIR}/{word}.mp4", flush=True)
        time.sleep(20)  # kurze Atempause zwischen den Jobs
    print("=== FERTIG ===", flush=True)

if __name__ == "__main__":
    main()
