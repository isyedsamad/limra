# EnergyBoard: UK Day-Ahead Renewable Procurement Intelligence Platform

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20TypeScript-61DAFB.svg)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Container-Docker%20Compose-2496ED.svg)](https://www.docker.com/)
[![Tests](https://img.shields.io/badge/Tests-21%20Passed-brightgreen.svg)]()

EnergyBoard is an enterprise-grade analytics dashboard designed for UK wholesale energy procurement desks. It provides transparent evaluation of day-ahead wind generation forecasts against actual outturn data published by Elexon BMRS for January 2026, enabling trading and procurement teams to quantify forecast error and procure required thermal power with confidence.

---

## 1. Live Deployment & Video Demo Links

- **Live Web Application (Vercel)**: [https://energyboard.vercel.app](https://energyboard.vercel.app) *(or your deployed Vercel link)*
- **Live Backend API & Swagger Docs (Render/Heroku)**: [https://energyboard-backend.onrender.com/docs](https://energyboard-backend.onrender.com/docs)
- **Unlisted Video Walkthrough (YouTube)**: [https://youtu.be/sample-video-link](https://youtu.be/sample-video-link)
  - **Part 1 (0:00 - 4:45)**: Client Pitch & Product Walkthrough (Wholesale Procurement Context, Day-Ahead Forecast Evaluation, Quantified Error Buffering).
  - **Part 2 (4:45 - 9:30)**: Technical Architecture & Review (FastAPI Service Layer, Timezone-Aware Look-Ahead Cutoff Engine, React/Vite UI Architecture, Test Suite).

---

## 2. Directory and File Structure

Below is the complete organization of the repository and the specific role of each file and module:

```
energyboard/
├── .gitignore                      # Git exclusion rules (dependencies, caches, raw datasets, test folders)
├── docker-compose.yml              # Multi-container orchestration (FastAPI backend + Vite/Nginx frontend)
├── README.md                       # Comprehensive project documentation, run guides, and disclosures
├── render.yaml                     # Cloud deployment configuration for Render web service
├── vercel.json                     # Vercel deployment configuration set to India (bom1) region
├── backend/                        # Python FastAPI backend service
│   ├── Dockerfile                  # Container specification for Python 3.12 runtime
│   ├── requirements.txt            # Python dependencies (fastapi, uvicorn, pydantic, httpx, pytz, pytest)
│   ├── app/
│   │   ├── main.py                 # FastAPI application factory, CORS middleware, and route mounting
│   │   ├── api/
│   │   │   ├── deps.py             # Dependency injection providers for data and forecast services
│   │   │   └── routes/
│   │   │       ├── analytics.py    # Statistical accuracy endpoints (MAE, RMSE, MBE, coverage)
│   │   │       ├── data_quality.py # Settlement period completeness and audit endpoints
│   │   │       ├── forecasts.py    # Day-ahead forecast retrieval and historical vintage inspection
│   │   │       ├── generation.py   # Paired half-hour actual vs forecast delivery time-series
│   │   │       ├── health.py       # API heartbeat, cache verification, and record counters
│   │   │       ├── overview.py     # High-level procurement KPIs and daily performance summaries
│   │   │       └── procurement.py  # Thermal procurement balancing and error safety margin calculations
│   │   ├── core/
│   │   │   ├── config.py           # Application settings, data paths, and environment variable parsing
│   │   │   └── constants.py        # UK market settlement periods (48/day) and default cutoff times
│   │   ├── schemas/                # Pydantic v2 validation models
│   │   │   ├── analytics.py        # Error metric schemas and response models
│   │   │   ├── data_quality.py     # Missing period and quality status schemas
│   │   │   ├── forecast.py         # Vintage and forecast response schemas
│   │   │   ├── generation.py       # Settlement period generation pair schemas
│   │   │   ├── health.py           # Health response model
│   │   │   ├── metrics.py          # Metric value schemas
│   │   │   ├── overview.py         # Overview summary schemas
│   │   │   └── procurement.py      # Thermal procurement balancing schemas
│   │   ├── services/               # Core business logic
│   │   │   ├── analytics_service.py # Pure mathematical engine for MAE, RMSE, MBE, and signed errors
│   │   │   ├── elexon_service.py   # Live streaming connector for Elexon BMRS FUELHH & WINDFOR streams
│   │   │   ├── forecast_service.py # Strict look-ahead bias cutoff engine and vintage ranking
│   │   │   └── processing_service.py# Data normalizer and local dataset fallback cache loader
│   │   └── utils/
│   │       └── datetime_utils.py   # Timezone conversion (UTC to Europe/London) and period mapper
│   └── tests/                      # Automated test suite (21 test cases)
│       ├── test_analytics.py       # Unit tests for accuracy equations, signed bias, and zero-division safety
│       ├── test_api.py             # HTTP integration tests for all 8 REST endpoints
│       └── test_forecasts.py       # Verification of D-1 10:00 cutoff logic and look-ahead bias prevention
├── data/
│   ├── processed/
│   │   └── january_2026_normalized.json # Unified 1,488 settlement period baseline for January 2026
│   └── raw/
│       ├── fuelhh_2026_01.json     # Elexon BMRS FUELHH actual outturn stream cache
│       └── windfor_2026_01.json    # Elexon BMRS WINDFOR published forecast stream cache
├── frontend/                       # React 19 + TypeScript + Vite web dashboard
│   ├── Dockerfile                  # Multi-stage build container serving production bundle via Nginx
│   ├── index.html                  # HTML entry point with metadata and fonts
│   ├── nginx.conf                  # Production reverse-proxy and client-side routing config
│   ├── package.json                # NPM package manifest (React 19, Lucide, Recharts, Tailwind CSS)
│   ├── postcss.config.js           # PostCSS configuration for Tailwind CSS
│   ├── tailwind.config.ts          # Tailwind design tokens, typography, and color palette
│   ├── tsconfig.json               # TypeScript compiler configuration (strict mode)
│   ├── vercel.json                 # Vercel deployment routing and SPA fallback rewrite rules
│   ├── vite.config.ts              # Vite bundler configuration and proxy routes
│   └── src/
│       ├── App.tsx                 # Main application state manager, tab router, and layout coordinator
│       ├── index.css               # Global styling, Tailwind directives, and dark mode tokens
│       ├── main.tsx                # React DOM root entry point
│       ├── components/
│       │   ├── analysis/
│       │   │   ├── GenerationTable.tsx # 48 settlement period delivery table with error badges
│       │   │   └── VintageModal.tsx    # Slide-over modal comparing publication revisions against cutoff
│       │   ├── common/
│       │   │   ├── PageControls.tsx    # Delivery date picker (Jan 1-31, 2026) and cutoff selector
│       │   │   └── ThemeToggle.tsx     # Light/Dark mode switcher
│       │   ├── dashboard/
│       │   │   ├── ErrorRampChart.tsx  # Signed forecast error (MW) bar chart (over/under forecast)
│       │   │   ├── GenerationChart.tsx # 24-hour generation area & line chart (Actual vs Forecast MW)
│       │   │   ├── Highlights.tsx      # Maximum error, best period, and procurement bias summary
│       │   │   └── StatsCards.tsx      # Top-level KPI cards (Total Generation, MAE, RMSE, MBE)
│       │   ├── layout/
│       │   │   └── Navbar.tsx          # Enterprise navigation bar with system status pill
│       │   ├── methodology/
│       │   │   └── AuditGrid.tsx       # Settlement period completeness and data coverage audit
│       │   └── ui/                     # Accessible UI component primitives (Button, Card, Badge, Table)
│       ├── lib/
│       │   └── utils.ts            # Class merging utility (clsx + tailwind-merge)
│       ├── services/
│       │   └── api.ts              # Strongly typed Axios HTTP client for all backend endpoints
│       └── types/
│           └── index.ts            # TypeScript interfaces matching backend Pydantic schemas
```

---

## 3. How to Start the Application

### Option 1: Docker Compose (Recommended)

Ensure Docker Desktop or Docker Engine is running, then execute from the repository root:

```bash
docker compose up --build
```

- **Frontend Application**: Navigate to `http://localhost:5173`
- **Backend API & Interactive Swagger**: Navigate to `http://localhost:8000/docs`
- **Health Endpoint**: `http://localhost:8000/api/health`

To stop the containers:
```bash
docker compose down
```

---

### Option 2: Running Locally from Source

#### Prerequisites
- **Python**: 3.10, 3.11, or 3.12
- **Node.js**: v18.x or v20.x+
- **Git**

#### Step 1: Start the Backend (FastAPI)

1. Open a terminal in the project root directory.
2. (Optional) Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # macOS/Linux:
   source .venv/bin/activate
   ```
3. Install Python dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
4. Start the FastAPI development server:
   ```bash
   uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   The backend API is now running at `http://localhost:8000`.

#### Step 2: Start the Frontend (React + Vite)

1. Open a second terminal window and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser.

---

## 4. Running Automated Tests

The backend test suite contains 21 unit and integration tests verifying domain equations, cutoff enforcement, and API schemas:

```bash
pytest backend/tests -v
```

### Test Coverage Highlights
- `backend/tests/test_forecasts.py`: Verifies look-ahead bias prevention, ensuring that no forecast published after the D-1 10:00 AM cutoff is ever selected.
- `backend/tests/test_analytics.py`: Verifies exact mathematical formulations for MAE, RMSE, MBE, and handles edge cases such as missing records without dividing by zero.
- `backend/tests/test_api.py`: Tests all 8 REST endpoints for 200 OK responses, query parameter validation, and expected JSON structures.

---

## 5. Wholesale Market Problem Setting & Domain Logic

### 5.1 The UK Wholesale Market Challenge
In the UK electricity market, energy suppliers must purchase power in the Day-Ahead wholesale market to cover anticipated consumer demand for the delivery day ($D$). Because wind power output is weather-dependent and volatile, procurement teams must forecast renewable generation. Any shortfall between contracted power and actual metered delivery forces the utility into expensive balancing mechanism cash-out settlements.

### 5.2 Strict Prevention of Look-Ahead Bias
Decisions for delivery day $D$ must be submitted before gate closure on day $D-1$ (standard auction cutoff at 10:00 Europe/London time).
1. For target date $D$ and decision cutoff time $T_{\text{cutoff}}$ (e.g. 10:00 AM):
   $$T_{\text{decision\_cutoff}} = (D - 1\text{ day}) \text{ at } T_{\text{cutoff}}$$
2. Only forecasts with $\text{publishTime} \le T_{\text{decision\_cutoff}}$ are eligible.
3. The latest eligible publication is designated as the Day-Ahead Operational Forecast:
   $$F_p = \text{forecast with } \max(\text{publishTime}) \le T_{\text{decision\_cutoff}}$$
4. Forecasts published after this cutoff are strictly excluded from Day-Ahead metrics to prevent unrealistic retrospective bias.

### 5.3 Error Formulations
- **Signed Error ($e_i$)**: $F_i - A_i$ (Positive = Over-forecast; Negative = Under-forecast)
- **Mean Absolute Error (MAE)**: $\frac{1}{n} \sum_{i=1}^n |F_i - A_i|$
- **Root Mean Squared Error (RMSE)**: $\sqrt{\frac{1}{n} \sum_{i=1}^n (F_i - A_i)^2}$
- **Mean Bias Error (MBE)**: $\frac{1}{n} \sum_{i=1}^n (F_i - A_i)$
- **Coverage Rate**: $(\frac{n_{\text{valid}}}{48}) \times 100\%$

---

## 6. Explicit AI Tools Disclosure

As required by the assignment guidelines, this project explicitly discloses the use of artificial intelligence tools during design, development, and testing:

1. **AI Tools Used**:
   - **OpenAI ChatGPT**: Utilized during the initial phase to deeply understand the UK wholesale day-ahead market domain, break down the client requirements, plan the product architecture/roadmap, and design the presentation flow for pitching to the client and technical lead.
   - **Google Antigravity / Gemini 2.5 Coding Assistant**: Utilized as an autonomous pair-programming agent for full-stack system implementation, TypeScript UI components, and Python FastAPI service modeling.
   - **Domain & Market Analysis**: Used for interpreting UK Balancing & Settlement Code (BSC) conventions, BMRS dataset specifications (`FUELHH` and `WINDFOR`), and gate closure timing rules.

2. **Areas of AI Assistance**:
   - **Problem Understanding & Product Planning**: Deconstructing the day-ahead procurement challenge, defining core user journeys for trading desks, and structuring the demo pitch narratives with ChatGPT.
   - **Architecture & Scaffolding**: Fast generation of boilerplate code, Pydantic v2 validation models, and Docker container configurations.
   - **UI Design & Data Visualization**: Structuring the modern dark-mode responsive dashboard using Tailwind CSS and Recharts (`GenerationChart`, `ErrorRampChart`, `AuditGrid`, `VintageModal`).
   - **Test Case Synthesis**: Generating edge-case unit and integration tests in `backend/tests/` to guarantee look-ahead cutoff safety and mathematical correctness.

3. **Human Governance & Verification**:
   - Every algorithmic calculation (signed error, MAE, RMSE, MBE, thermal net demand) was independently reviewed and mathematically audited against the official Elexon BMRS API specifications.
   - All code was developed under a strict zero-comment policy (`//`, `/* */`, `#` comments strictly forbidden in implementation code) to ensure maximum clean-code readability.

---

## 7. Submission Checklist

- [x] Python backend with FastAPI and modular service layer
- [x] React 19 frontend with TypeScript, Vite, and Tailwind CSS
- [x] Dockerization with `docker-compose.yml` and container health checks
- [x] January 2026 Elexon BMRS wind generation data (`FUELHH` and `WINDFOR`)
- [x] Look-ahead bias prevention with configurable D-1 cutoff times
- [x] Quantitative error evaluation (MAE, RMSE, MBE, Ramp rate analysis)
- [x] Historical forecast vintage revision modal inspector
- [x] 21 automated tests covering domain logic and REST API endpoints
- [x] README file detailing repository structure, how to start, and AI disclosure
- [x] Ready for anonymous GitHub repo upload and deployment on Vercel/Render
