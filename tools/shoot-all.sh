#!/usr/bin/env bash
# Shoots the review set: name|path|flags
cd "$(dirname "$0")/.."
OUT=${OUT:-qa/shots}
mkdir -p "$OUT"
while IFS='|' read -r name path flags; do
  [ -z "$name" ] && continue
  echo "== $name"
  eval node tools/shoot.mjs "'$OUT/$name.png'" "'$path'" $flags 2>&1 | grep -v '^$' | head -5 &
  while [ "$(jobs -r | wc -l)" -ge 4 ]; do sleep 0.3; done
done
wait
