"""Generate the Gleb part-1 voiceover line by line with Fish Audio (model s1).

Usage: python3 tts_fish.py [line_id ...]
The API key is injected by the session's network proxy; nothing is read from env.
"""

import csv
import json
import re
import sys
import urllib.request
from pathlib import Path

HERE = Path(__file__).parent
OUT = HERE / "assets" / "vo"
OUT.mkdir(parents=True, exist_ok=True)

# role -> Fish Audio voice model id (generic library voices, no celebrity clones)
CAST = {
    "narrator": "2270bb203a424d1881678ba5e4b82b54",  # deep authoritative Russian narrator
    "gleb": "7312c38557eb4fb384e3874e8e9cea67",  # young confident male
    "masha": "d567e990d9ad433892ed15ecfd70ce54",  # young female, clear
    "son_old": "fe159e25498f4cde84164011d774808b",  # boy, 12 years old
    "son_young": "e503facf02cc49cda839f3c226503a70",  # little boy
}
# script tags -> Fish s1 emotion / tone markers
TAGS = {
    "calm": "(calm)",
    "excited": "(excited)",
    "tired": "(sighing)",
    "warm": "(gentle)",
    "cheerful": "(joyful)",
    "calling from another room": "(shouting)",
    "sad": "(sad)",
    "tense": "(nervous)",
    "whispers": "(whispering)",
    "scared": "(scared)",
    "firm": "(serious)",
    "urgent": "(hurried tone)",
    "fast": "(hurried tone)",
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
        {"text": convert(text), "reference_id": CAST[role], "format": "wav", "normalize": True, "latency": "normal"}
    ).encode()
    req = urllib.request.Request(
        "https://api.fish.audio/v1/tts",
        data=body,
        headers={"Content-Type": "application/json", "Authorization": "Bearer proxy-injected", "model": "s1"},
    )
    with urllib.request.urlopen(req, timeout=180) as r:
        (OUT / f"{line_id}.wav").write_bytes(r.read())
    print(f"{line_id} {role:9} {convert(text)}")


def main():
    only = set(sys.argv[1:])
    with open(HERE / "script_roles.tsv", encoding="utf-8") as f:
        for row in csv.DictReader(f, delimiter="\t"):
            if only and row["id"] not in only:
                continue
            speak(row["id"], row["role"], row["text"])


if __name__ == "__main__":
    main()
