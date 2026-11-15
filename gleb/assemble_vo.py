"""Assemble per-line voice clips into one track with scripted gaps; write vo.wav + timings.json."""
import json, subprocess
from pathlib import Path

HERE = Path(__file__).parent
VO = HERE / "assets" / "vo"
# line id -> silence (s) after it
GAPS = {"l01": 0.7, "l02": 0.5, "l03": 0.2, "l04": 0.3, "l05": 0.4, "l06": 0.9, "l07": 1.4,
        "l08": 1.1, "l09": 0.5, "l10": 0.3, "l11": 0.9, "l12": 1.6, "l13": 0.6, "l14": 0.5, "l15": 0.0}
LEAD = 0.3

def dur(p):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)]))

def main():
    norm = VO / "norm"; norm.mkdir(exist_ok=True)
    t, timings, parts = LEAD, [], []
    for lid, gap in GAPS.items():
        src, dst = VO / f"{lid}.wav", norm / f"{lid}.wav"
        # trim edge silence, level each line to the same loudness
        subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(src), "-af",
                        "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-18:TP=-2:LRA=9",
                        "-ar", "48000", "-ac", "1", str(dst)], check=True)
        d = dur(dst)
        timings.append({"id": lid, "start": round(t, 3), "end": round(t + d, 3)})
        parts.append((dst, d, gap))
        t += d + gap
    filt, inputs = [], []
    for i, (p, d, gap) in enumerate(parts):
        inputs += ["-i", str(p)]
        filt.append(f"[{i}]apad=pad_dur={gap}[a{i}]")
    filt.append("".join(f"[a{i}]" for i in range(len(parts))) + f"concat=n={len(parts)}:v=0:a=1,adelay={int(LEAD*1000)}[out]")
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *inputs, "-filter_complex", ";".join(filt),
                    "-map", "[out]", "-ar", "48000", "-ac", "2", str(HERE / "assets" / "vo.wav")], check=True)
    json.dump({"lines": timings, "voice_end": round(t, 3)}, open(HERE / "assets" / "timings.json", "w"), indent=1)
    print(json.dumps(timings[-1]), "total", round(t, 2))

main()
