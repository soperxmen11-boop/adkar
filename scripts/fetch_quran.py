#!/usr/bin/env python3
# Fetch full Uthmani Quran and save to data/quran.json (offline-ready)
import json, os, sys, urllib.request
URL = "https://api.alquran.cloud/v1/quran/quran-uthmani"
print("Downloading Quran text...")
with urllib.request.urlopen(URL) as r:
    j = json.load(r)
surahs = [
    {"number": s["number"], "name": s["name"], "ayahs": [a["text"] for a in s["ayahs"]]}
    for s in j["data"]["surahs"]
]
out = {"surahs": surahs}
os.makedirs("data", exist_ok=True)
with open("data/quran.json", "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=2)
print("Saved to data/quran.json ✔︎")
