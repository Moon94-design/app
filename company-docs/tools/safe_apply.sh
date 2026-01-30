#!/usr/bin/env bash
set -euo pipefail

# usage:
#   tools/safe_apply.sh "<files...>" -- bash -lc "<commands>"
FILES_STR="${1:-}"
shift || true
if [ "${1:-}" != "--" ]; then
  echo 'Usage: tools/safe_apply.sh "<files...>" -- <command...>'
  exit 2
fi
shift

ts="$(date +%Y%m%d-%H%M%S)"
mkdir -p backups

# split files
mapfile -t FILES < <(printf "%s\n" $FILES_STR)

declare -A MAP
for f in "${FILES[@]}"; do
  [ -f "$f" ] || { echo "SKIP(no file): $f"; continue; }
  b="backups/${ts}__${f//\//_}.bak"
  cp "$f" "$b"
  MAP["$f"]="$b"
  echo "BACKUP $f -> $b"
done

restore_all() {
  echo "PATCH FAILED. RESTORING..."
  for f in "${!MAP[@]}"; do
    cp "${MAP[$f]}" "$f"
    echo "RESTORE ${MAP[$f]} -> $f"
  done
  echo "RESTORE DONE."
}
trap restore_all ERR

"$@"

trap - ERR
echo "PATCH OK (no restore)."
