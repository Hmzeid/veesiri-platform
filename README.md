# VeeSIRI Platform

A unified digital compliance and transformation management system built around the **Smart Industry Readiness Index (SIRI)** framework — serving both Saudi manufacturers and government regulators (MIMR, SIDF, regional authorities) under Saudi Vision 2030.

**Built by:** Veebase LLC
**Target market:** Kingdom of Saudi Arabia (9,000+ factories), expanding to GCC.

---

## Highlights

- 🏭 **Factory Portal** — onboarding, SIRI self-assessment across 16 dimensions, gap analysis, transformation roadmap, AI recommendations, vendor marketplace, certifications, training hub
- 🏛 **Government Portal** — national KPI dashboard, live interactive Saudi map with factory heatmap, sector × dimension matrix, live activity feed, Vision 2030 progress tracker, ministerial printable report
- 🌐 **Public site** — animated landing page, interactive SIRI framework explainer, public certificate verification, REST API documentation
- 🤖 **AI Assistant** — contextual floating chat widget, reads your factory data and answers questions in Arabic or English
- 🗺 **Real interactive map** — Leaflet + OpenStreetMap tiles with Saudi admin region polygons, factory markers, popups, pan/zoom, light & dark themes
- 📈 **What-if Simulator & ROI Calculator** — drag sliders to see projected SIRI scores; model cost / break-even for gap closure
- 🗓 **Calendar + Kanban** — milestone calendar, drag-and-drop initiative board
- 🌍 **Bilingual** — full Arabic / English with RTL layout
- 📱 **Mobile-responsive** — hamburger navigation drawers, fluid typography, responsive cards

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Factory admin | `demo@veesiri.sa` | `demo12345` |
| MIMR Minister (national) | `minister@mimr.gov.sa` | `gov12345` |
| SIDF Analyst | `analyst@sidf.gov.sa` | `gov12345` |
| Riyadh Regional Officer (region-scoped) | `riyadh@mimr.gov.sa` | `gov12345` |

## Seed data

- **15 demo factories** across all 14 SIRI industry groups, 6 Saudi regions, with varied maturity profiles (leader / average / emerging / laggard)
- **15 full assessments** (240 dimension responses), all certified
- **15 gap analyses** with 240 dimension gaps + severity, effort, cost, ROI
- **15 roadmaps**, 3 phases × ~2 initiatives × 3 milestones each (~270 milestones)
- **~90 AI recommendations** with impact / cost / confidence
- **15 SIRI certificates** with QR-verifiable codes
- **45+ documents** pre-tagged to dimensions
- **32+ notifications**, compliance alerts, benchmark snapshots

## Stack

**Backend** — NestJS 10 · TypeScript · Prisma 5 · PostgreSQL · JWT auth (factory + gov scopes) · bcrypt

**Frontend** — React 18 · Vite · Ant Design (with RTL) · TanStack Query · Zustand · ECharts · Leaflet · react-i18next · JetBrains/Inter/Tajawal fonts

**Infra (local)** — Docker Compose (Postgres + Redis)

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  Frontend (React + Vite)                                     │
│  /              LandingPage + AnnouncementBar                │
│  /siri          SIRI Framework explainer                     │
│  /api-docs      REST API reference                           │
│  /verify/:code  Public certificate verification              │
│  /login         Factory login                                │
│  /gov/login     Government login                             │
│                                                              │
│  ┌────────────────────────┐  ┌───────────────────────────┐   │
│  │ /app/*  Factory portal │  │ /gov/*  Gov portal        │   │
│  │ - Dashboard            │  │ - National dashboard      │   │
│  │ - Factories            │  │ - Interactive Saudi map   │   │
│  │ - Assessment           │  │ - Activity feed           │   │
│  │ - Gap Analysis         │  │ - Trends / heatmap        │   │
│  │ - What-if Simulator    │  │ - Factory search          │   │
│  │ - ROI Calculator       │  │ - Compare factories       │   │
│  │ - Roadmap / Kanban     │  │ - Alerts                  │   │
│  │ - Calendar             │  │ - Leaderboard             │   │
│  │ - Recommendations      │  │ - Ministerial report      │   │
│  │ - Documents            │  │                           │   │
│  │ - Certificate          │  │                           │   │
│  │ - Benchmarks           │  │                           │   │
│  │ - Vendor Marketplace   │  │                           │   │
│  │ - Integrations         │  │                           │   │
│  │ - Training Hub         │  │                           │   │
│  │ - Team                 │  │                           │   │
│  │ - Settings             │  │                           │   │
│  │ - AI Chat (floating)   │  │                           │   │
│  └────────────────────────┘  └───────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
                    │  /api/v1 (JWT)
                    ▼
┌──────────────────────────────────────────────────────────────┐
│  Backend (NestJS)                                            │
│                                                              │
│  Auth · Factories · Question Bank · Assessments              │
│  Gap Analysis · Roadmap · Recommendations · Notifications    │
│  Documents · Certificates · Benchmarks · AI · Public · Gov   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                    │
                    ▼
           PostgreSQL (Prisma)
           Redis (cache)
```

## Getting started

### Prerequisites
- Node.js 18+
- Docker + Docker Compose
- npm 10+

### One-line start

```bash
./start.sh
```

That's it. The script will:

1. Verify Node + Docker are present and the daemon is running
2. Spin up Postgres + Redis via Docker Compose
3. Wait for Postgres to be ready
4. `npm install` if `node_modules` is missing
5. Create `backend/.env` from the example (using a free local port)
6. Generate the Prisma client and apply migrations
7. Seed 15 demo factories + assessments + roadmaps + recommendations + certificates (only if the database is empty — pass `--reseed` to refresh)
8. Compile the backend (skip with cached `dist/`, force with `--rebuild`)
9. Launch the backend and frontend in the background, with logs in `.run/`

When it finishes you'll see the URLs and demo credentials printed in your terminal.

### Stop everything

```bash
./stop.sh           # stop backend + frontend
./stop.sh --down    # also tear down Postgres + Redis containers
```

### Manual setup (if you don't want the script)

```bash
npm install
docker compose up -d postgres redis
cp backend/.env.example backend/.env

cd backend
npx prisma generate
npx prisma migrate deploy   # or `migrate dev --name init` first time
npm run prisma:seed
npx tsc -p tsconfig.json --outDir dist
node dist/src/main.js &     # backend on 3101
cd ..

cd frontend && npx vite     # frontend on 5173
```

Open **http://localhost:5173**.

### Log in

- **Factory portal** — `demo@veesiri.sa` / `demo12345`
- **Government portal** — `minister@mimr.gov.sa` / `gov12345`

Toggle Arabic / English from the profile dropdown (or the language button on the landing page).

## Project layout

```
VEESIRI/
├── docker-compose.yml            # Postgres + Redis
├── package.json                  # npm workspaces root
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma         # Full data model (20+ entities)
│   │   └── seed.ts               # 15 demo factories + assessments + everything
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       ├── prisma/               # PrismaService
│       ├── auth/                 # Factory auth (JWT)
│       ├── factories/            # Factory CRUD + teams + SIDF pre-check
│       ├── question-bank/        # SIRI dimensions
│       ├── assessments/          # Start / save response / submit / score
│       ├── gap-analysis/         # Prioritize / quick-wins / SIDF filter
│       ├── roadmap/              # Phases / initiatives / milestones
│       ├── recommendations/      # AI rec catalog
│       ├── notifications/        # Inbox + unread counter
│       ├── documents/            # Folders + metadata + expiry
│       ├── certificates/         # Issued certs + public verify
│       ├── benchmarks/           # Industry percentiles
│       ├── gov/                  # Gov auth + national dashboard APIs
│       ├── public/               # Anonymized stats + map
│       └── ai/                   # Rule-based chat assistant
└── frontend/
    └── src/
        ├── main.tsx              # React Query + router + i18n bootstrap
        ├── App.tsx               # Routes
        ├── i18n.ts               # AR/EN translation bundles
        ├── styles.css            # Design tokens + mobile media queries
        ├── api/client.ts         # Axios + JWT interceptor (dual scope)
        ├── store/                # Zustand: auth, govAuth, selectedFactory
        ├── components/
        │   ├── AppShell.tsx      # Factory shell + mobile drawer
        │   ├── GovShell.tsx      # Gov dark shell + mobile drawer
        │   ├── SaudiMap.tsx      # Leaflet map with regions + markers
        │   ├── AiChatWidget.tsx  # Floating AI assistant
        │   ├── AnnouncementBar.tsx
        │   ├── Achievements.tsx  # 9 gamified badges
        │   ├── CountUp.tsx       # Animated counters
        │   └── ScoreRing.tsx     # SVG progress ring
        └── pages/
            ├── LandingPage.tsx
            ├── SiriFrameworkPage.tsx
            ├── ApiDocsPage.tsx
            ├── LoginPage.tsx     RegisterPage.tsx   OnboardingPage.tsx
            ├── DashboardPage.tsx FactoriesPage.tsx
            ├── AssessmentPage.tsx
            ├── GapAnalysisPage.tsx
            ├── RoadmapPage.tsx   KanbanPage.tsx     CalendarPage.tsx
            ├── SimulatorPage.tsx RoiCalculatorPage.tsx
            ├── RecommendationsPage.tsx
            ├── DocumentsPage.tsx
            ├── CertificatePage.tsx
            ├── BenchmarksPage.tsx
            ├── VendorMarketplacePage.tsx
            ├── IntegrationsPage.tsx
            ├── TrainingHubPage.tsx
            ├── TeamPage.tsx
            ├── NotificationsPage.tsx
            ├── SettingsPage.tsx
            ├── ExecReportPage.tsx
            ├── public/
            │   └── VerifyCertificatePage.tsx
            └── gov/
                ├── GovLoginPage.tsx
                ├── GovDashboardPage.tsx
                ├── GovFactoryDetailPage.tsx
                ├── GovAlertsPage.tsx
                ├── GovLeaderboardPage.tsx
                ├── GovSearchPage.tsx
                ├── GovComparePage.tsx
                └── GovMinisterialReportPage.tsx
```

## SIRI framework reference

The platform is built on the canonical Smart Industry Readiness Index:

- **3 Building Blocks:** Process · Technology · Organization
- **8 Pillars:** Operations · Supply Chain · Product Lifecycle · Automation · Connectivity · Intelligence · Talent Readiness · Structure & Management
- **16 Dimensions** (each scored 0–5): Undefined → Defined → Digital → Integrated → Automated → Intelligent

Every dimension is seeded with bilingual AR/EN questions and level descriptors.

## Key API endpoints

```
# Public (no auth)
GET  /api/v1/public/stats              National headline stats
GET  /api/v1/public/map                Anonymized map points
GET  /api/v1/certificates/verify/:code QR-verifiable cert lookup

# Factory (JWT)
POST /api/v1/auth/register              POST /api/v1/auth/login
POST /api/v1/factories                  GET  /api/v1/factories
POST /api/v1/assessments                POST /api/v1/assessments/:id/submit
POST /api/v1/gap-analysis               GET  /api/v1/roadmaps/latest
GET  /api/v1/recommendations            GET  /api/v1/certificates/latest
POST /api/v1/ai/chat                    (+ team, documents, notifications…)

# Government (separate JWT scope)
POST /api/v1/gov/auth/login
GET  /api/v1/gov/dashboard/{summary,map,regions,sectors,trends,activity,heatmap,leaderboard,score-distribution}
GET  /api/v1/gov/search/factories?q=&industry=&region=
POST /api/v1/gov/compare
GET  /api/v1/gov/alerts
GET  /api/v1/gov/factories/:id
```

Full reference available at `/api-docs` in the running app.

## Saudi / Vision 2030 specifics

- **14 SIRI industry groups** aligned with MIMR classification
- **13 admin regions** as interactive polygons on the map
- **SIDF financing pre-check** at onboarding
- **Hijri calendar toggle** in Settings
- **Prayer-time quiet hours** for notifications
- **Bilingual AR/EN** with RTL layout
- **Vision 2030 progress tracker** on gov dashboard (target: 4,000 assessed factories)

## Deliberately stubbed (next steps)

This is an MVP — real production deployment would add:

- Live SIDF / MIMR / Absher / SASO / ZATCA integrations (currently mocked in the Integrations page)
- Real file uploads for documents (currently metadata-only)
- LLM-powered assessment pre-scoring (rule-based today)
- ERP connectors (SAP / Oracle / Dynamics) — placeholders only
- WhatsApp / SMS / email notification delivery
- Multi-tenancy hardened with Postgres RLS
- PDPL data-residency guarantees (KSA-hosted)
- PDF generation engine with Arabic typesetting (HTML-print used today)
- Kubernetes manifests + CI/CD + Prometheus/Grafana
- Penetration test + SDAIA breach notification plumbing

## License

© Veebase LLC. All rights reserved.
