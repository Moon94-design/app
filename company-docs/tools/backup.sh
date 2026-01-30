#!/usr/bin/env bash
set -euo pipefail
ts="$(date +%Y%m%d-%H%M%S)"
mkdir -p backups
for f in "$@"; do
  if [ ! -f "$f" ]; then
    echo "SKIP(no file): $f"
    continue
  fi
  b="backups/${ts}__${f//\//_}.bak"
  cp "$f" "$b"
  echo "BACKUP $f -> $b"
done
