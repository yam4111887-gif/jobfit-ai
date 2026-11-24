#!/usr/bin/env python3
"""Build self-hosted font subsets for jobfit-ai (same pipeline as game-radar v4).

Outputs into jobfit-ai/fonts/:
  - NotoSansTC-sub.woff2   (variable wght 100-900, charset = jobfit corpus + Big5 level-1 + punctuation blocks)
  - ChakraPetch-{Medium,SemiBold,Bold}.woff2 (latin + symbols)
"""
import glob
import os
import subprocess

REPO = "/home/node/.openclaw/workspace/jobfit-ai"
SRC = "/tmp/fonts"
OUT = os.path.join(REPO, "fonts")
os.makedirs(OUT, exist_ok=True)

# ---------- 1. collect charset ----------
corpus_chars = set()
for pattern in ("*.html", "en/*.html", "*.js"):
    for path in glob.glob(os.path.join(REPO, pattern)):
        with open(path, encoding="utf-8", errors="ignore") as f:
            corpus_chars.update(f.read())

# ASCII printable
corpus_chars.update(chr(c) for c in range(0x20, 0x7F))
# CJK punctuation, full-width forms, arrows, bullets, dashes, quotes, symbols
for start, end in (
    (0x3000, 0x303F),  # CJK punctuation
    (0x2190, 0x21FF),  # arrows
    (0x2022, 0x2026),  # bullet, ellipsis
    (0x00B7, 0x00B7),  # middle dot
    (0x2013, 0x2014),  # dashes
    (0x2018, 0x201D),  # curly quotes
    (0x00A9, 0x00A9),  # (c)
    (0x00D7, 0x00D7),  # multiply sign
    (0x2018, 0x2019),  # quotes
    (0x25CF, 0x25CF),  # black circle (dot)
    (0x2013, 0x2013),
):
    corpus_chars.update(chr(c) for c in range(start, end + 1))

# Big5 level-1 (常用字, 0xA440-0xC67E) → unicode via big5 codec
big5 = set()
for hi in range(0xA4, 0xC7):
    for lo in list(range(0x40, 0x7F)) + list(range(0xA1, 0xFF)):
        if (hi, lo) > (0xC6, 0x7E):
            break
        try:
            ch = bytes([hi, lo]).decode("big5")
            if len(ch) == 1:
                big5.add(ch)
        except UnicodeDecodeError:
            pass

charset = corpus_chars | big5
print(f"corpus unique: {len(corpus_chars)} | big5 L1: {len(big5)} | union: {len(charset)}")

text_file = "/tmp/fonts/jobfit-charset.txt"
with open(text_file, "w", encoding="utf-8") as f:
    f.write("".join(sorted(charset)))

# ---------- 2. subset Noto variable ----------
noto_out = os.path.join(OUT, "NotoSansTC-sub.woff2")
subprocess.run(
    [
        "python3", "-m", "fontTools.subset", os.path.join(SRC, "NotoSansTC-var.ttf"),
        f"--text-file={text_file}",
        f"--output-file={noto_out}",
        "--flavor=woff2",
        "--layout-features=*",
        "--name-IDs=*",
        "--drop-tables+=DSIG",
    ],
    check=True,
)
axes = subprocess.run(
    ["python3", "-c",
     "from fontTools.ttLib import TTFont;f=TTFont(r'%s');print([(a.axisTag,a.minValue,a.maxValue) for a in f['fvar'].axes])" % noto_out],
    capture_output=True, text=True)
print("noto axes:", axes.stdout.strip())
print("noto size:", round(os.path.getsize(noto_out) / 1024), "KB")

# ---------- 3. subset Chakra Petch (latin + symbols) ----------
chakra_text = "".join(sorted(
    {chr(c) for c in range(0x20, 0x7F)}
    | set("·—–→←↑↓↔●○◆◎□■▲△▼★☆♥♦✓✕×÷±°«»‹›€£¥")
))
chakra_file = "/tmp/fonts/jobfit-chakra-charset.txt"
with open(chakra_file, "w", encoding="utf-8") as f:
    f.write(chakra_text)

for weight in ("Medium", "SemiBold", "Bold"):
    out = os.path.join(OUT, f"ChakraPetch-{weight}.woff2")
    subprocess.run(
        [
            "python3", "-m", "fontTools.subset", os.path.join(SRC, f"ChakraPetch-{weight}.ttf"),
            f"--text-file={chakra_file}",
            f"--output-file={out}",
            "--flavor=woff2",
            "--layout-features=*",
            "--name-IDs=*",
        ],
        check=True,
    )
    print(f"chakra {weight}:", round(os.path.getsize(out) / 1024), "KB")

# licenses
import shutil
for lic, dst in (("ofl-noto.txt", "OFL-NotoSansTC.txt"), ("ofl-chakra.txt", "OFL-ChakraPetch.txt")):
    shutil.copy(os.path.join(SRC, lic), os.path.join(OUT, dst))

print("DONE")
