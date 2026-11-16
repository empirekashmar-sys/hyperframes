"""Part 3: assemble lines into vo.wav with gaps; word timings (syllable spread over speech) and
lip-sync envelopes (mouth 0/1/2 at 15 fps from RMS) per line."""
import csv, json, re, subprocess, struct, math
from pathlib import Path

HERE = Path(__file__).parent
SRC = HERE / "assets" / "vo"
NORM = SRC / "norm"; NORM.mkdir(exist_ok=True)
rows = list(csv.DictReader(open(HERE / "script.tsv", encoding="utf-8"), delimiter="\t"))
# silence after each line: room for the tank to arrive, the bus, the checkpoint, the climb
GAP = {"l01": 0.35, "l02": 0.35, "l03": 0.35, "l04": 0.6, "l05": 0.6, "l06": 0.35, "l07": 0.6, "l08": 0.35, "l09": 0.6, "l10": 0.35, "l11": 1.4, "l12": 0.35, "l13": 1.0, "l14": 0.6, "l15": 0.8, "l16": 0.35, "l17": 0.35, "l18": 0.5, "l19": 0.35, "l20": 0.5, "l21": 0.35, "l22": 0.6, "l23": 1.5, "l24": 1.2, "l25": 1.0, "l26": 1.6, "l27": 0.8, "l28": 0.35, "l29": 0.35, "l30": 1.0, "l31": 0.8, "l32": 0.35, "l33": 0.6, "l34": 1.2, "l35": 0.8, "l36": 0.8, "l37": 0.8, "l38": 1.0, "l39": 0.6, "l40": 0.8, "l41": 0.35, "l42": 0.35, "l43": 0.35, "l44": 0.35, "l45": 0.35, "l46": 0.35, "l47": 0.35, "l48": 0.6, "l49": 1.2, "l50": 0.6, "l51": 0.35, "l52": 0.35, "l53": 0.35, "l54": 0.35, "l55": 0.6, "l56": 1.2, "l57": 0.35, "l58": 0.35, "l59": 1.4, "l60": 0.6, "l61": 0.35, "l62": 0.35, "l63": 0.35, "l64": 0.35, "l65": 0.35, "l66": 0.6, "l67": 0.35, "l68": 0.35, "l69": 0.35, "l70": 0.35, "l71": 0.8, "l72": 3.5, "l73": 0.35, "l74": 0.35, "l75": 0.35, "l76": 0.8, "l77": 0.4, "l78": 0.35, "l79": 1.4, "l80": 1.0, "l81": 1.4, "l82": 0.35, "l83": 1.2, "l84": 0.6, "l85": 0.8, "l86": 0.4, "l87": 0.35, "l88": 1.0, "l89": 0.8, "l90": 0.35, "l91": 0.35, "l92": 1.6, "l93": 0.8, "l94": 0.6, "l95": 0.35, "l96": 0.6, "l97": 1.4, "l98": 0.8, "l99": 0.35, "l100": 0.8, "l101": 0.8, "l102": 0.8, "l103": 1.2, "l104": 0.8, "l105": 0.6, "l106": 0.35, "l107": 0.4, "l108": 1.2, "l109": 0.8, "l110": 0}
LEAD = 2.2
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
