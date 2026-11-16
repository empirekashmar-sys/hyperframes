"""Generate the Gleb part-3 voiceover line by line with Fish Audio (model s2.1-pro-free).

Usage: python3 tts.py [line_id ...]   (skips lines already generated; retries network hiccups)
The API key is injected by the session's network proxy; nothing is read from env.
"""

import csv
import json
import re
import sys
import time
import urllib.request
from pathlib import Path

HERE = Path(__file__).parent
OUT = HERE / "assets" / "vo"
OUT.mkdir(parents=True, exist_ok=True)

# role -> Fish Audio voice model id (generic library voices, no celebrity clones)
CAST = {
    "narrator": "2270bb203a424d1881678ba5e4b82b54",
    "gleb": "7312c38557eb4fb384e3874e8e9cea67",
    "masha": "d567e990d9ad433892ed15ecfd70ce54",
    "son_old": "757954ebf9cb4acab46aafefa74b9b3a",
    "son_young": "e503facf02cc49cda839f3c226503a70",
    "maxim": "59977ee6f0f643b1b18a984352b2e5bc",
    "soldier": "868377a7b08f4c0d9acf8c9f059571aa",
    "voice": "b4b3cd5e89cc4fb682301b43e627d5ef",
    "soldier1": "868377a7b08f4c0d9acf8c9f059571aa",
    "soldier2": "6ada82e315e648b6a30a2e2210844cbf",
    "soldier3": "ad345871bcbd4ab0af5f3af9940287d2",
    "granny": "2a1036d645634680b3cc69aeeb60375b",
}
TAGS = {
    "calm": "[calm]",
    "excited": "[excited]",
    "tired": "[tired sigh]",
    "warm": "[warm]",
    "cheerful": "[cheerful]",
    "sad": "[sad]",
    "whispers": "[whispering]",
    "scared": "[scared]",
    "firm": "[firm]",
    "laughs": "[laughing]",
    "quiet": "[quiet]",
    "shocked": "[shocked]",
    "groaning": "[groaning]",
    "crying": "[crying, sobbing]",
    "proud": "[proud]",
    "shouting": "[shouting]",
    "angry": "[angry]",
    "curious": "[curious]",
    "confused": "[confused]",
    "threatening": "[threatening]",
    "tense": "[tense]",
    "determined": "[determined]",
    "embarrassed": "[embarrassed]",
    "teasing": "[teasing]",
    "serious": "[serious]",
}


def convert(text):
    def repl(m):
        out = []
        for t in m.group(1).split(","):
            t = t.strip()
            if t == "pause":
                out.append("…")
            elif t in TAGS:
                out.append(TAGS[t])
        return " ".join(out) + " "

    return re.sub(r"\s+", " ", re.sub(r"\[([^\]]+)\]\s*", repl, text)).strip()


def speak(line_id, role, text):
    body = json.dumps(
        {"text": convert(text), "reference_id": CAST[role], "format": "wav", "normalize": True, "latency": "normal", "chunk_length": 200}
    ).encode()
    req = urllib.request.Request(
        "https://api.fish.audio/v1/tts",
        data=body,
        headers={"Content-Type": "application/json", "Authorization": "Bearer proxy-injected", "model": "s2.1-pro-free"},
    )
    with urllib.request.urlopen(req, timeout=180) as r:
        (OUT / f"{line_id}.wav").write_bytes(r.read())
    print(f"{line_id} {role:9} {convert(text)}")


def speak_retry(line_id, role, text, tries=4):
    f = OUT / f"{line_id}.wav"
    if f.exists() and f.stat().st_size > 10000:
        return
    for k in range(tries):
        try:
            return speak(line_id, role, text)
        except Exception as e:  # network hiccups: retry with backoff
            print("retry", line_id, e)
            time.sleep(3 * (k + 1))
    raise SystemExit(f"failed: {line_id}")


def main():
    only = set(sys.argv[1:])
    with open(HERE / "script.tsv", encoding="utf-8") as f:
        for row in csv.DictReader(f, delimiter="\t"):
            if only and row["id"] not in only:
                continue
            speak_retry(row["id"], row["role"], row["text"])


if __name__ == "__main__":
    main()
