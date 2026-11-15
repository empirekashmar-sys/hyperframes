"""Estimate per-word timings: split each line's speech (silencedetect) and spread words by syllables."""
import csv, json, re, subprocess
from pathlib import Path

HERE = Path(__file__).parent
T = json.load(open(HERE / "assets" / "timings.json"))
rows = {r["id"]: r for r in csv.DictReader(open(HERE / "script_roles.tsv", encoding="utf-8"), delimiter="\t")}
VOW = set("аеёиоуыэюяАЕЁИОУЫЭЮЯ")

def speech_segments(path, dur):
    out = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(path), "-af", "silencedetect=noise=-36dB:d=0.12", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", out)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", out)]
    segs, cur = [], 0.0
    for s, e in zip(starts, ends):
        if s > cur + 0.05: segs.append((cur, s))
        cur = e
    if dur > cur + 0.05: segs.append((cur, dur))
    return segs or [(0, dur)]

words = []
for line in T["lines"]:
    lid = line["id"]
    text = re.sub(r"\[[^\]]+\]\s*", "", rows[lid]["text"]).strip()
    toks = [w for w in text.split() if re.search(r"\w", w)]
    dur = line["end"] - line["start"]
    segs = speech_segments(HERE / "assets" / "vo" / "norm" / f"{lid}.wav", dur)
    total = sum(e - s for s, e in segs)
    weights = [sum(c in VOW for c in w) + 0.6 for w in toks]
    W = sum(weights)
    def at(pos):  # map speech-time position -> clip time
        for s, e in segs:
            if pos <= e - s: return s + pos
            pos -= e - s
        return segs[-1][1]
    acc = 0.0
    for w, wt in zip(toks, weights):
        a = at(acc / W * total); acc += wt; b = at(acc / W * total)
        words.append({"text": w, "start": round(line["start"] + a, 3), "end": round(line["start"] + b, 3), "line": lid, "role": rows[lid]["role"]})
for i, w in enumerate(words): w["id"] = f"w{i}"
json.dump(words, open(HERE / "assets" / "words.json", "w"), ensure_ascii=False, indent=0)
print(len(words), words[0], words[-1])
