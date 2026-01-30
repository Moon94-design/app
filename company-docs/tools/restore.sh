#!/usr/bin/env bash
set -euo pipefail
b="$1"
t="$2"
if [ ! -f "$b" ]; then
  echo "NO BACKUP: $b"
  exit 1
fi
cp "$b" "$t"
echo "RESTORE $b -> $t"
