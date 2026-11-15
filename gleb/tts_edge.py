"""Draft voiceover for Gleb part 1 with free Microsoft Edge TTS (no account, no key).

Usage: python3 tts_edge.py [line_id ...]
Only two Russian voices exist (Dmitry, Svetlana); roles are separated by pitch and rate.
"""

import asyncio
import csv
import os
import re
import sys
from pathlib import Path

import edge_tts

HERE = Path(__file__).parent
OUT = HERE / "assets" / "vo"
OUT.mkdir(parents=True, exist_ok=True)
PROXY = os.environ.get("HTTPS_PROXY")

CAST = {
    "narrator": {"voice": "ru-RU-DmitryNeural", "rate": "-10%", "pitch": "-12Hz"},
    "gleb": {"voice": "ru-RU-DmitryNeural", "rate": "+4%", "pitch": "+6Hz"},
    "masha": {"voice": "ru-RU-SvetlanaNeural", "rate": "+0%", "pitch": "+0Hz"},
    "son_old": {"voice": "ru-RU-DmitryNeural", "rate": "+8%", "pitch": "+70Hz"},
    "son_young": {"voice": "ru-RU-SvetlanaNeural", "rate": "+12%", "pitch": "+60Hz"},
}
# rough stand-ins for emotions Edge voices do not have
MOOD = {
    "whispers": {"rate": -12, "volume": "-40%"},
    "excited": {"rate": 8, "pitch": 15},
    "urgent": {"rate": 12},
    "fast": {"rate": 12},
    "tense": {"rate": -4},
    "sad": {"rate": -8, "pitch": -6},
}


def pct(s):
    return int(s.rstrip("%"))


def hz(s):
    return int(s.rstrip("Hz"))


async def speak(line_id, role, text):
    cfg = dict(CAST[role])
    tags = [t.strip() for g in re.findall(r"\[([^\]]+)\]", text) for t in g.split(",")]
    rate, pitch, volume = pct(cfg["rate"]), hz(cfg["pitch"]), "+0%"
    for t in tags:
        m = MOOD.get(t, {})
        rate += m.get("rate", 0)
        pitch += m.get("pitch", 0)
        volume = m.get("volume", volume)
    clean = re.sub(r"\s*\[pause\]\s*", ". ", text)
    clean = re.sub(r"\[[^\]]+\]\s*", "", clean).replace("…", ".").replace("—", ",").strip()
    clean = re.sub(r"\.\s*\.", ".", clean)
    comm = edge_tts.Communicate(
        clean, cfg["voice"], rate=f"{rate:+d}%", pitch=f"{pitch:+d}Hz", volume=volume, proxy=PROXY
    )
    await comm.save(str(OUT / f"{line_id}.mp3"))
    print(f"{line_id} {role:9} {cfg['voice']:22} rate{rate:+d}% pitch{pitch:+d}Hz {clean}")


async def main():
    only = set(sys.argv[1:])
    with open(HERE / "script_roles.tsv", encoding="utf-8") as f:
        rows = [r for r in csv.DictReader(f, delimiter="\t") if not only or r["id"] in only]
    for r in rows:
        await speak(r["id"], r["role"], r["text"])


if __name__ == "__main__":
    asyncio.run(main())
