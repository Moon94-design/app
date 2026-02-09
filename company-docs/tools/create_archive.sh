#!/usr/bin/env bash
# Script to create a compressed archive for sharing the current project state
# Excludes: node_modules, build artifacts, existing archives, and cache directories

set -euo pipefail

# Generate timestamp for unique archive name
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ARCHIVE_NAME="app_snapshot_${TIMESTAMP}.tar.gz"

# Navigate to project root (parent of company-docs)
cd "$(dirname "$0")/../.."

echo "Creating archive: ${ARCHIVE_NAME}"
echo "Excluding: node_modules, build artifacts, .git, existing archives (*.zip, *.gz, *.tar.gz), and cache directories"

# Create the archive with exclusions
# The exit code 1 with "file changed as we read it" is expected and safe
if tar -czf "${ARCHIVE_NAME}" \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='dist-ssr' \
  --exclude='.git' \
  --exclude='.next' \
  --exclude='build' \
  --exclude='coverage' \
  --exclude='.turbo' \
  --exclude='.cache' \
  --exclude='.vite' \
  --exclude='.netlify' \
  --exclude='*.zip' \
  --exclude='*.tar.gz' \
  --exclude='*.gz' \
  --exclude='.backups' \
  . 2>&1 | grep -v "file changed as we read it" || [ $? -eq 1 ]; then
  
  if [ -f "${ARCHIVE_NAME}" ]; then
    echo "✓ Archive created successfully: ${ARCHIVE_NAME}"
    echo "  Location: $(pwd)/${ARCHIVE_NAME}"
    echo "  Size: $(du -h "${ARCHIVE_NAME}" | cut -f1)"
  else
    echo "✗ Failed to create archive"
    exit 1
  fi
else
  echo "✗ Failed to create archive"
  exit 1
fi
