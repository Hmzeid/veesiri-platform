#!/usr/bin/env bash
# VeeSIRI Platform — one-shot startup script
# - Checks prerequisites
# - Brings up Postgres + Redis via Docker
# - Installs deps if needed
# - Generates Prisma client + runs migrations
# - Seeds the database if empty
# - Builds the backend
# - Starts backend (3101) and frontend (5173)
# Usage: ./start.sh [--rebuild] [--reseed]

set -e

cd "$(dirname "$0")"
ROOT="$PWD"
BACKEND_PORT=3101
FRONTEND_PORT=5173
LOG_DIR="$ROOT/.run"
mkdir -p "$LOG_DIR"

REBUILD=0
RESEED=0
for arg in "$@"; do
  case "$arg" in
    --rebuild) REBUILD=1 ;;
    --reseed) RESEED=1 ;;
    -h|--help)
      cat <<EOF
VeeSIRI start.sh — boot the full stack.

Options:
  --rebuild   Force rebuild of the backend (npx tsc) before starting
  --reseed    Wipe and re-seed the demo data
  -h, --help  Show this help

Logs:
  Backend  → $LOG_DIR/backend.log
  Frontend → $LOG_DIR/frontend.log

Stop everything with:  ./stop.sh
EOF
      exit 0
      ;;
  esac
done

# ---------- pretty output ----------
GREEN='\033[1;32m'
GOLD='\033[1;33m'
RED='\033[1;31m'
DIM='\033[2m'
RESET='\033[0m'
say() { printf "${GREEN}▸${RESET} %s\n" "$*"; }
warn() { printf "${GOLD}▸${RESET} %s\n" "$*"; }
err()  { printf "${RED}✗${RESET} %s\n" "$*" >&2; }

# ---------- prerequisites ----------
say "Checking prerequisites…"
for bin in node npm docker; do
  if ! command -v $bin >/dev/null 2>&1; then
    err "$bin is required but not installed."
    exit 1
  fi
done
NODE_MAJOR=$(node -v | sed -E 's/v([0-9]+).*/\1/')
if [ "$NODE_MAJOR" -lt 18 ]; then
  err "Node 18+ required (found $(node -v))"
  exit 1
fi
if ! docker info >/dev/null 2>&1; then
  err "Docker daemon is not running. Start Docker first."
  exit 1
fi
say "Node $(node -v) · npm $(npm -v) · Docker $(docker -v | sed -E 's/Docker version ([^,]+),.*/\1/')"

# ---------- pick a free backend port if 3101 is busy ----------
if ss -tln 2>/dev/null | grep -qE ":${BACKEND_PORT}\\s"; then
  warn "Port $BACKEND_PORT is busy."
  for p in 3102 3201 3202 4001 4002 4101; do
    if ! ss -tln 2>/dev/null | grep -qE ":${p}\\s"; then
      BACKEND_PORT=$p
      warn "Falling back to port $BACKEND_PORT"
      break
    fi
  done
fi

# ---------- docker compose ----------
say "Starting Postgres + Redis…"
docker compose up -d postgres redis

# ---------- wait for postgres ----------
say "Waiting for Postgres to accept connections…"
for i in $(seq 1 30); do
  if docker exec veesiri-postgres pg_isready -U veesiri -d veesiri >/dev/null 2>&1; then
    say "Postgres ready."
    break
  fi
  sleep 1
  if [ "$i" = 30 ]; then err "Postgres did not become ready in 30s"; exit 1; fi
done

# ---------- npm install ----------
if [ ! -d node_modules ]; then
  say "Installing workspace dependencies (this may take a minute)…"
  npm install
else
  say "Dependencies present (skipping install — re-run \`npm install\` to refresh)."
fi

# ---------- backend env ----------
if [ ! -f backend/.env ]; then
  say "Creating backend/.env from example…"
  cp backend/.env.example backend/.env
fi
# Make sure .env has the chosen port
if grep -q '^PORT=' backend/.env; then
  sed -i.bak -E "s/^PORT=.*/PORT=${BACKEND_PORT}/" backend/.env && rm -f backend/.env.bak
else
  echo "PORT=${BACKEND_PORT}" >> backend/.env
fi

# ---------- update Vite proxy to match chosen backend port ----------
if grep -q "target: 'http://localhost:" frontend/vite.config.ts; then
  sed -i.bak -E "s|target: 'http://localhost:[0-9]+'|target: 'http://localhost:${BACKEND_PORT}'|" frontend/vite.config.ts && rm -f frontend/vite.config.ts.bak
fi

# ---------- prisma ----------
say "Generating Prisma client + applying migrations…"
( cd backend && npx prisma generate >/dev/null 2>&1 )
( cd backend && npx prisma migrate deploy ) || ( cd backend && npx prisma migrate dev --name init --skip-seed --skip-generate )

# ---------- seed (if empty or forced) ----------
FACTORY_COUNT=$(docker exec veesiri-postgres psql -U veesiri -d veesiri -tAc 'SELECT COUNT(*) FROM "Factory"' 2>/dev/null || echo 0)
if [ "$RESEED" = 1 ] || [ "$FACTORY_COUNT" = "0" ]; then
  say "Seeding demo data (15 factories + assessments + roadmaps + recommendations)…"
  ( cd backend && npm run prisma:seed )
else
  say "Database already seeded ($FACTORY_COUNT factories) — skipping. Use --reseed to refresh."
fi

# ---------- build backend ----------
if [ "$REBUILD" = 1 ] || [ ! -f backend/dist/src/main.js ]; then
  say "Compiling backend…"
  ( cd backend && npx tsc -p tsconfig.json --outDir dist )
else
  say "Backend already compiled (run with --rebuild to force)."
fi

# ---------- kill any prior instances we own ----------
if [ -f "$LOG_DIR/backend.pid" ]; then
  OLD=$(cat "$LOG_DIR/backend.pid"); kill -9 $OLD 2>/dev/null || true; rm -f "$LOG_DIR/backend.pid"
fi
if [ -f "$LOG_DIR/frontend.pid" ]; then
  OLD=$(cat "$LOG_DIR/frontend.pid"); kill -9 $OLD 2>/dev/null || true; rm -f "$LOG_DIR/frontend.pid"
fi

# ---------- start backend ----------
say "Starting backend on http://localhost:${BACKEND_PORT}…"
( cd backend && nohup node dist/src/main.js > "$LOG_DIR/backend.log" 2>&1 & echo $! > "$LOG_DIR/backend.pid" )

# wait until it answers
for i in $(seq 1 20); do
  if curl -sf "http://localhost:${BACKEND_PORT}/api/v1/public/stats" >/dev/null 2>&1; then
    say "Backend is up."
    break
  fi
  sleep 1
  if [ "$i" = 20 ]; then
    err "Backend did not answer in 20s. Check $LOG_DIR/backend.log"
    tail -30 "$LOG_DIR/backend.log" || true
    exit 1
  fi
done

# ---------- start frontend ----------
say "Starting frontend on http://localhost:${FRONTEND_PORT}…"
( cd frontend && nohup npx vite --port ${FRONTEND_PORT} --host 0.0.0.0 > "$LOG_DIR/frontend.log" 2>&1 & echo $! > "$LOG_DIR/frontend.pid" )

# wait for vite
for i in $(seq 1 20); do
  if curl -sf "http://localhost:${FRONTEND_PORT}/" >/dev/null 2>&1; then
    say "Frontend is up."
    break
  fi
  sleep 1
done

# ---------- summary ----------
cat <<EOF

${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}
  ${GOLD}VeeSIRI Platform is running${RESET}

  Frontend:           http://localhost:${FRONTEND_PORT}
  Backend (API):      http://localhost:${BACKEND_PORT}/api/v1
  Public stats API:   http://localhost:${BACKEND_PORT}/api/v1/public/stats

  Demo accounts:
    Factory:          demo@veesiri.sa / demo12345
    MIMR Minister:    minister@mimr.gov.sa / gov12345
    SIDF Analyst:     analyst@sidf.gov.sa / gov12345
    Riyadh Officer:   riyadh@mimr.gov.sa / gov12345

  Logs:               ${DIM}$LOG_DIR/backend.log${RESET}
                      ${DIM}$LOG_DIR/frontend.log${RESET}
  Stop:               ./stop.sh
${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}

EOF
