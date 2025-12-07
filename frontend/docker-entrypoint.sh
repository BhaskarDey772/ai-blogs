#!/usr/bin/env bash
set -e

TEMPLATE_FILE="/usr/share/nginx/html/env-config.template.js"
OUT_FILE="/usr/share/nginx/html/env-config.js"

# DEFAULT VALUES IF ENV NOT PROVIDED
: ${VITE_API_BASE:="http://localhost:4000/api"}
: ${VITE_CLERK_PUBLISHABLE_KEY:=""}

if [ -f "$TEMPLATE_FILE" ]; then
  echo "Generating env-config.js from template"

  export VITE_API_BASE VITE_CLERK_PUBLISHABLE_KEY

  envsubst '__VITE_API_BASE__ __VITE_CLERK_PUBLISHABLE_KEY__' \
    < "$TEMPLATE_FILE" > "$OUT_FILE"
else
  echo "No template found — creating env-config.js"
  cat > "$OUT_FILE" <<EOF
window._env_ = {
  VITE_API_BASE: "${VITE_API_BASE}",
  VITE_CLERK_PUBLISHABLE_KEY: "${VITE_CLERK_PUBLISHABLE_KEY}"
};
EOF
fi

exec nginx -g 'daemon off;'
