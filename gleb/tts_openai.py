"""Generate the Gleb part-1 voiceover line by line with OpenAI TTS.

Usage: python3 tts_openai.py [line_id ...]
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

MODEL = "gpt-4o-mini-tts"
# role -> (voice, base direction)
CAST = {
    "narrator": ("onyx", "Низкий драматичный мужской голос рассказчика, как в трейлере фильма. Говори по-русски, неторопливо, с весом."),
    "gleb": ("ash", "Мужчина около 30 лет, живой и естественный, говорит по-русски как обычный отец семьи."),
    "masha": ("nova", "Молодая женщина около 30 лет, тёплый живой голос, говорит по-русски."),
    "son_old": ("verse", "Мальчик-подросток 12 лет, ломающийся голос, говорит по-русски просто и по-детски."),
    "son_young": ("shimmer", "Маленький мальчик 6 лет, высокий звонкий детский голос, говорит по-русски."),
}
# English bracket tags in the script -> Russian direction for the model
TAGS = {
    "calm": "спокойно",
    "excited": "радостно, восторженно",
    "tired": "устало",
    "warm": "тепло, с улыбкой",
    "cheerful": "весело",
    "calling from another room": "громко зовёт из другой комнаты",
    "sad": "грустно, тише",
    "tense": "напряжённо, тревожно",
    "whispers": "шёпотом",
    "scared": "испуганно",
    "firm": "твёрдо, собранно",
    "urgent": "срочно, быстро",
    "fast": "быстро, на одном дыхании",
}


def parse(text):
    tags = []
    for group in re.findall(r"\[([^\]]+)\]", text):
        for t in group.split(","):
            t = t.strip()
            if t != "pause":
                tags.append(TAGS.get(t, t))
    clean = re.sub(r"\s*\[pause\]\s*", " … ", text)
    clean = re.sub(r"\[[^\]]+\]\s*", "", clean).strip()
    return clean, tags


def speak(line_id, role, text):
    voice, base = CAST[role]
    clean, tags = parse(text)
    instructions = base + (" Интонация: " + ", ".join(tags) + "." if tags else "")
    body = json.dumps(
        {"model": MODEL, "voice": voice, "input": clean, "instructions": instructions, "response_format": "wav"}
    ).encode()
    req = urllib.request.Request(
        "https://api.openai.com/v1/audio/speech",
        data=body,
        headers={"Content-Type": "application/json", "Authorization": "Bearer proxy-injected"},
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        (OUT / f"{line_id}.wav").write_bytes(r.read())
    print(f"{line_id} {role:9} {voice:8} {clean}")


def main():
    only = set(sys.argv[1:])
    with open(HERE / "script_roles.tsv", encoding="utf-8") as f:
        for row in csv.DictReader(f, delimiter="\t"):
            if only and row["id"] not in only:
                continue
            speak(row["id"], row["role"], row["text"])


if __name__ == "__main__":
    main()
