"""v2: assemble lines into vo2.wav with gaps; word timings (syllable spread over speech) and
lip-sync envelopes (mouth 0/1/2 at 15 fps from RMS) per line."""
import csv, json, re, subprocess, wave, struct, math
from pathlib import Path

HERE = Path(__file__).parent
SRC = HERE / "assets" / "vo"
NORM = SRC / "norm"; NORM.mkdir(exist_ok=True)
rows = list(csv.DictReader(open(HERE / "script.tsv", encoding="utf-8"), delimiter="\t"))
GAP = {"l01": .5, "l02": .5, "l03": .6, "l04": .25, "l05": .4, "l06": .8, "l07": .8, "l08": .3, "l09": .5, "l10": .2, "l11": 1.0,
       "l12": .5, "l13": .3, "l14": .3, "l15": .8, "l16": 0}
LEAD = 1.2
VOW = set("аеёиоуыэюяАЕЁИОУЫЭЮЯ")

def run(*a): subprocess.run(a, check=True)
def dur(p): return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)]))

def rms_frames(path, fps=15):
    raw = NORM / "tmp.raw"
    run("ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(path), "-f", "s16le", "-ac", "1", "-ar", "16000", str(raw))
    data = raw.read_bytes(); n = len(data) // 2
    samples = struct.unpack(f"<{n}h", data); step = 16000 // fps
    return [math.sqrt(sum(x * x for x in samples[i:i + step]) / max(1, len(samples[i:i + step]))) / 32768 for i in range(0, n, step)]

def segments(path, d):
    out = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(path), "-af", "silencedetect=noise=-36dB:d=0.12", "-f", "null", "-"], capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", out)]; en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", out)]
    segs, cur = [], 0.0
    for s, e in zip(st, en):
        if s > cur + 0.05: segs.append((cur, s))
        cur = e
    if d > cur + 0.05: segs.append((cur, d))
    return segs or [(0, d)]

t, lines, words, lips, parts = LEAD, [], [], [], []
for r in rows:
    lid = r["id"]; dst = NORM / f"{lid}.wav"
    run("ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(SRC / f"{lid}.wav"), "-af",
        "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-18:TP=-2:LRA=9",
        "-ar", "48000", "-ac", "1", str(dst))
    d = dur(dst)
    lines.append({"id": lid, "role": r["role"], "start": round(t, 3), "end": round(t + d, 3)})
    # words
    text = re.sub(r"\[[^\]]+\]\s*", "", r["text"]).strip()
    toks = [w for w in text.split() if re.search(r"\w", w)]
    segs = segments(dst, d); total = sum(e - s for s, e in segs)
    wts = [sum(c in VOW for c in w) + 0.6 for w in toks]; Wt = sum(wts)
    def at(pos):
        for s, e in segs:
            if pos <= e - s: return s + pos
            pos -= e - s
        return segs[-1][1]
    acc = 0
    for w, wt in zip(toks, wts):
        a = at(acc / Wt * total); acc += wt; b = at(acc / Wt * total)
        words.append({"text": w, "start": round(t + a, 3), "end": round(t + b, 3), "line": lid, "role": r["role"]})
    # lips
    fr = rms_frames(dst); peak = max(fr) or 1
    states = [0 if v < peak * .12 else 1 if v < peak * .45 else 2 for v in fr]
    lips.append({"id": lid, "role": r["role"], "start": round(t, 3), "fps": 15, "states": states})
    parts.append((dst, GAP[lid])); t += d + GAP[lid]
for i, w in enumerate(words): w["id"] = f"w{i}"
inputs, filt = [], []
for i, (p, g) in enumerate(parts):
    inputs += ["-i", str(p)]; filt.append(f"[{i}]apad=pad_dur={g}[a{i}]")
filt.append("".join(f"[a{i}]" for i in range(len(parts))) + f"concat=n={len(parts)}:v=0:a=1,adelay={int(LEAD*1000)}[o]")
run("ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *inputs, "-filter_complex", ";".join(filt), "-map", "[o]", "-ar", "48000", "-ac", "2", str(HERE / "assets" / "vo.wav"))
json.dump({"lines": lines, "voice_end": round(t, 3)}, open(HERE / "assets" / "timings.json", "w"), indent=1)
json.dump(words, open(HERE / "assets" / "words.json", "w"), ensure_ascii=False)
json.dump(lips, open(HERE / "assets" / "lips.json", "w"))
for l in lines: print(l["id"], l["role"], l["start"], l["end"])
print("voice end", round(t, 2), "words", len(words))
