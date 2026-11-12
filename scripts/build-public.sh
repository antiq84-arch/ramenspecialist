#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
dist_dir="${root_dir}/dist"
rm -rf "${dist_dir}"
mkdir -p "${dist_dir}"

public_files=(
  index.html
  snelleprijs.html
  configurator.html
  offerte-vergelijker.html
  privacy.html
  cookies.html
  algemene-voorwaarden.html
)

for file in "${public_files[@]}"; do
  cp "${root_dir}/${file}" "${dist_dir}/${file}"
done
cp -R "${root_dir}/assets" "${dist_dir}/assets"

if find "${dist_dir}" -type f \( -path '*/n8n/*' -o -path '*/docs/*' -o -name 'prompts.md' \) | grep -q .; then
  echo "Private source entered public artifact" >&2
  exit 1
fi
echo "Public artifact created at ${dist_dir}"
