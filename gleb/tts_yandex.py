"""Generate the Gleb part-1 voiceover line by line with Yandex SpeechKit (API v3).

Usage: python3 tts_yandex.py [line_id ...]
The API key is injected by the session's network proxy; nothing is read from env.
"""

import base64
import csv
import json
import re
import sys
import urllib.request
from pathlib import Path

HERE = Path(__file__).parent
OUT = HERE / "assets" / "vo"
OUT.mkdir(parents=True, exist_ok=True)
URL = "https://tts.api.cloud.yandex.net/tts/v3/utteranceSynthesis"

# role -> voice settings. Kids are a female / light voice lifted in pitch.
CAST = {
    "narrator": {"voice": "madirus", "speed": 0.92},
    "gleb": {"voice": "kirill", "speed": 1.0},
    "masha": {"voice": "marina", "speed": 1.0},
    "son_old": {"voice": "filipp", "speed": 1.05, "pitch": 160},
    "son_young": {"voice": "dasha", "speed": 1.08, "pitch": 140},
}
# script tag -> SpeechKit role per voice (only roles each voice supports)
ROLES = {
    "kirill": {"firm": "strict", "urgent": "strict", "warm": "good", "tired": "neutral"},
    "marina": {"whispers": "whisper", "cheerful": "friendly", "scared": "whisper"},
    "dasha": {"excited": "friendly"},
    "madirus": {},
    "filipp": {},
}


def parse(text):
    tags = [t.strip() for g in re.findall(r"\[([^\]]+)\]", text) for t in g.split(",")]
    clean = re.sub(r"\s*\[pause\]\s*", " sil<[400]> ", text)
    clean = re.sub(r"\[[^\]]+\]\s*", "", clean)
    return re.sub(r"\s+", " ", clean).strip(), tags


def speak(line_id, role, text):
    cfg = CAST[role]
    clean, tags = parse(text)
    hints = [{"voice": cfg["voice"]}, {"speed": cfg["speed"]}]
    voice_roles = ROLES.get(cfg["voice"], {})
    picked = next((voice_roles[t] for t in tags if t in voice_roles), None)
    if picked:
        hints.append({"role": picked})
    if "pitch" in cfg:
        hints.append({"pitchShift": cfg["pitch"]})
    body = json.dumps(
        {
            "text": clean,
            "hints": hints,
            "outputAudioSpec": {"containerAudio": {"containerAudioType": "WAV"}},
            "loudnessNormalizationType": "LUFS",
        }
    ).encode()
    req = urllib.request.Request(
        URL, data=body, headers={"Content-Type": "application/json", "Authorization": "Api-Key proxy-injected"}
    )
    audio = b""
    with urllib.request.urlopen(req, timeout=120) as r:
        for raw in r.read().decode().splitlines():
            if raw.strip():
                chunk = json.loads(raw).get("result", {}).get("audioChunk", {}).get("data")
                if chunk:
                    audio += base64.b64decode(chunk)
    (OUT / f"{line_id}.wav").write_bytes(audio)
    print(f"{line_id} {role:9} {cfg['voice']:8} {picked or '-':8} {clean}")


def main():
    only = set(sys.argv[1:])
    with open(HERE / "script_roles.tsv", encoding="utf-8") as f:
        for row in csv.DictReader(f, delimiter="\t"):
            if only and row["id"] not in only:
                continue
            speak(row["id"], row["role"], row["text"])


if __name__ == "__main__":
    main()
