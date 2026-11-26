#!/usr/bin/env python3
"""Build check: fail if the shipped data carries dates, places, facts or photos for anyone not marked deceased.
Run before every push: python3 scripts/check_privacy.py"""
import json, sys
d = json.load(open(__file__.replace('scripts/check_privacy.py', 'tree-data.json')))
bad = []
for i, p in d['p'].items():
    if not p.get('dead'):
        for k in ('y', 'bp', 'f', 'fl', 'aka'):
            if p.get(k):
                bad.append((i, p['n'], k))
if bad:
    print('PRIVACY CHECK FAILED: living or unmarked people carry private fields:')
    for b in bad: print(' ', b)
    sys.exit(1)
print('privacy check ok:', sum(1 for p in d['p'].values() if not p.get('dead')), 'living or unmarked people carry no dates, places or facts')
