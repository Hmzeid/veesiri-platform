#!/usr/bin/env bash
# VeeSIRI Platform — graceful shutdown.
# - Stops backend + frontend (using PIDs saved by start.sh)
# - Optionally tears down Docker services with --down

set -e
cd "$(dirname "$0")"
LOG_DIR="$PWD/.run"

GREEN='\033[1;32m'
GOLD='\033[1;33m'
RESET='\033[0m'
say() { printf "${GREEN}▸${RESET} %s\n" "$*"; }
warn() { printf "${GOLD}▸${RESET} %s\n" "$*"; }

stop_pid() {
  local file="$1" name="$2"
  if [ -f "$file" ]; then
    local pid; pid=$(cat "$file")
    if kill -0 "$pid" 2>/dev/null; then
      say "Stopping $name (pid $pid)…"
      kill "$pid" 2>/dev/null || true
      sleep 1
      kill -9 "$pid" 2>/dev/null || true
    else
      warn "$name pid $pid not running."
    fi
    rm -f "$file"
  else
    warn "No $name pidfile found at $file."
  fi
}

stop_pid "$LOG_DIR/backend.pid"  "backend"
stop_pid "$LOG_DIR/frontend.pid" "frontend"

# Also catch any straggler vite/nest start watchers
pkill -f 'frontend/node_modules/.bin/vite' 2>/dev/null || true
pkill -f 'backend/dist/src/main.js' 2>/dev/null || true

if [ "${1:-}" = "--down" ]; then
  say "Tearing down Postgres + Redis…"
  docker compose down
fi

say "Stopped."
