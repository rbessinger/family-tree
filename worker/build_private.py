#!/usr/bin/env python3
"""Build the private Worker bundle: worker.js (from this repo) + research notes (kept OUT of the repo).
Usage: python3 worker/build_private.py /path/to/ask-notes.json /path/to/ask-worker-with-notes.js
The notes file is a JSON list of {"t": title, "x": text}. It lives in Ross's private Drive folder, never in git.
The bundle is always worker.js plus notes, so the repo and the deployed Worker cannot drift apart.
The response field "v" tells you which version is live (e.g. 2026-11-25-c+notes69)."""
import json, sys
src = open(__file__.replace('build_private.py', 'worker.js')).read()
notes = json.load(open(sys.argv[1]))
marker = "/*NOTES_BEGIN*/ const NOTES = []; /*NOTES_END*/"
assert marker in src, "marker missing in worker.js"
open(sys.argv[2], 'w').write(src.replace(marker, "/*NOTES_BEGIN*/ const NOTES = " + json.dumps(notes, ensure_ascii=False) + "; /*NOTES_END*/"))
print("wrote", sys.argv[2], len(notes), "notes")
