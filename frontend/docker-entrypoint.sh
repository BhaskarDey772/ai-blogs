#!/usr/bin/env bash
set -e

# Generate runtime env-config.js from template (if exists)
TEMPLATE_FILE="/usr/share/nginx/html/env-config.template.js"
OUT_FILE="/usr/share/nginx/html/env-config.js"

if [ -f "$TEMPLATE_FILE" ]; then
  echo "Found env template, generating env-config.js"
  # Default: if VITE_API_BASE not set, try VITE_API_BASE from environment or fallback to /api
  : ${VITE_API_BASE:="http://localhost:4000/api"}
  export VITE_API_BASE
  envsubst '__VITE_API_BASE__' < "$TEMPLATE_FILE" > "$OUT_FILE"
else
  echo "No env template found at $TEMPLATE_FILE, creating basic env-config.js"
  cat > "$OUT_FILE" <<EOF
window._env_ = { VITE_API_BASE: "${VITE_API_BASE:-http://localhost:4000/api}" };
EOF
fi

# Start nginx in foreground
exec nginx -g 'daemon off;'
