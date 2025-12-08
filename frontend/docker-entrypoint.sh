#!/usr/bin/env bash
set -e

TEMPLATE_FILE="/usr/share/nginx/html/env-config.template.js"
OUT_FILE="/usr/share/nginx/html/env-config.js"

echo "=== Runtime ENV Injection ==="

if [ -f "$TEMPLATE_FILE" ]; then
  echo "Generating env-config.js from template..."

  envsubst "__VITE_API_BASE__ __VITE_CLERK_PUBLISHABLE_KEY__" \
    < "$TEMPLATE_FILE" > "$OUT_FILE"

  echo "Generated env-config.js:"
  cat "$OUT_FILE"
else
  echo "Template not found. Creating default env-config.js..."

  cat > "$OUT_FILE" <<EOF
window._env_ = {
  VITE_API_BASE: "${VITE_API_BASE}",
  VITE_CLERK_PUBLISHABLE_KEY: "${VITE_CLERK_PUBLISHABLE_KEY}"
};
EOF
fi

exec "$@"
