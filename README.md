# AI-Medics

## Healthcare Resource Intelligence

A Gemini-powered healthcare supply-chain decision-support platform designed to help regional hospital networks identify medicine shortages, detect inventory risks, simulate disruptions, and coordinate potential resource redistribution.

Built for:

**Google for Developers × Hack2Skill**  
**Code for Communities 2.0**  
**Track: Smart Health & Supply Chain Resilience**  
**Repository:** [https://github.com/singh1806adhiraj-collab/AI-medics](https://github.com/singh1806adhiraj-collab/AI-medics)

---

## Problem

Healthcare facilities across a region frequently experience:

- Critical medicine stockouts in emergency and intensive care units
- Excess inventory and approaching expiry waste at nearby partner facilities
- Uneven and unpredictable consumption velocity
- Vulnerability to sudden supplier or cold-chain delivery disruptions
- Rapid demand surges from localized epidemic outbreaks or mass casualty events

The core problem is often not a total regional lack of pharmaceuticals, but a **lack of coordinated visibility** into where supplies exist, where shortages are emerging, and which facilities have safe surplus capacity to act as mutual-aid donors.

AI-Medics addresses this coordination failure by providing an intelligent, network-wide operational intelligence layer.

---

## Solution

AI-Medics provides an end-to-end operational decision-support workflow combining:

1. **Deterministic Inventory Calculations** — Exact math for consumption velocity, days-to-stockout runway, and expiry risk indexing.
2. **Stockout Risk Analysis** — Real-time classification of network supplies into Critical (<2 days), Warning (2–5 days), Stable, and Surplus.
3. **Expiry-Aware Redistribution Logic** — Prioritization of batches nearing expiration to prevent costly pharmaceutical wastage.
4. **Multi-Hospital Resource Matching** — Algorithmic pairing of surplus donor facilities with critical deficit hospitals without compromising donor safety buffers.
5. **Scenario Simulation** — Dynamic stress-testing against demand surges, supply disruptions, and regional shocks.
6. **Gemini-Powered Operational Reasoning** — Contextual briefings, root-cause reasoning, risk evaluation, and data-grounded administrative answers.
7. **Human-in-the-Loop Authorization** — Verification checkpoints ensuring hospital administrators retain sole authority over physical dispatch.
8. **Dispatch Manifests** — Automated creation of formal, audit-ready pharmaceutical transit manifests.
9. **Permanent Audit Trails** — Real-time tracking of historical authorizations, quantities transferred, and runway impacts.

The system is strictly designed for **administrative logistics decision support**, not clinical treatment decisions.

---

## Core Features

### Command Center
Regional overview displaying:
- Hospitals actively monitored across the regional health network
- Critical medicine formulations tracked
- Network-wide critical shortages (<48h runway)
- Inventory warning states (2–5 days runway)
- Stable stock levels and surplus reserves
- Expiry exposure requiring immediate reallocation
- Prioritized queue of urgent operational interventions

### Inventory Intelligence
Searchable and filterable telemetry across 160 batch-level inventory records:
- Current on-hand stock and storage temperature requirements
- Average daily consumption burn rate
- Calculated days until stockout runway
- Historical consumption trend indicators (increasing, decreasing, stable)
- Expiry risk scoring and lot tracking
- Therapeutic category categorization
- Contextual algorithmic and AI recommendations

### Resource Redistribution Network
Visualizes regional facilities and computes transfer pathways based on:
- Eligible donor surplus beyond mandatory safety buffers
- Recipient clinical urgency and deficit gap units
- Donor-to-recipient transit time and geographic distance
- Impending batch expiry mitigation
- Cold-chain transport criteria (-20°C, 2–8°C, ambient 20–25°C)

### Scenario Simulator
Allows healthcare emergency coordinators to simulate:
- Regional patient demand surges (0% to +100%)
- Supply chain delivery shortfalls (0% to -75%)
- Pre-configured crisis events (viral epidemics, mass casualty, API supply bottlenecks)
- Algorithmic mutual-aid rebalancing
- Gemini-powered strategic stress testing analyzing emergent systemic risks

### Gemini Operations Assistant
Connected directly to live synthetic telemetry, Gemini delivers:
- **Regional Critical Shortage Deep-Dive** — Multi-facility deficit synthesis and priority actions
- **Pharmaceutical Waste Mitigation Strategy** — Batch reallocation before expiration
- **Cold-Chain Redistribution Logistics Protocol** — Transit safety and thermal container standards
- **Fair Multi-Hospital Donor Capacity Audit** — Equitable burden distribution across donor facilities
- **Custom Operational Questions** — Natural-language query interface with structured data citations
- **Disaster Stress-Test Analysis** — Vulnerability evaluations under simulated stress scenarios

### Human-in-the-Loop Authorization
- AI recommendations and algorithmic pairings are strictly advisory.
- Physical transfers require mandatory human administrator review, clearance role verification, and electronic authorization.

### Dispatch & Audit
Every authorized reallocation generates:
- Unique cryptographic transfer tracking ID
- Standardized pharmaceutical mutual-aid dispatch manifest
- Full donor, recipient, medication, and dosage specifications
- Authorizing administrator name, role, and courier identification
- Pre- and post-transfer runway buffer verification
- Immutable audit log tracking network history

---

## Architecture

```
User
 ↓
Authentication & Role
 ↓
AI-Medics Operational Dashboard
 ↓
Deterministic Intelligence Engine
 ├── Inventory Analysis
 ├── Stockout Calculation
 ├── Redistribution Matching
 └── Scenario Simulation
 ↓
Gemini Reasoning Layer
 ├── Operational Analysis
 ├── Stress Testing
 ├── Recommendations
 └── Custom Questions
 ↓
Human Authorization
 ↓
Dispatch Manifest
 ↓
Audit Log
```

Numerical calculations are executed **deterministically in JavaScript/TypeScript** to guarantee accuracy, while **Google Gemini** provides contextual reasoning, qualitative risk evaluation, scenario synthesis, and conversational decision support.

---

## AI Design

The architecture enforces a strict boundary between deterministic calculations and language model reasoning:

```
┌──────────────────────────────────────┐     ┌──────────────────────────────────────┐
│        DETERMINISTIC ENGINE          │     │            GEMINI LAYER              │
│       (src/utils/calculations.ts)     │     │             (server.ts)              │
├──────────────────────────────────────┤     ├──────────────────────────────────────┤
│ • Stock runway calculation           │     │ • Interpreting operational state     │
│ • Projected daily burn velocity      │     │ • Identifying hidden risk patterns   │
│ • Projected stockout dates           │     │ • Synthesizing multi-hospital impact │
│ • Minimum safety buffer enforcement  │     │ • Generating operational briefings   │
│ • Donor eligibility thresholds       │     │ • Explaining redistribution tradeoffs│
│ • Exact transfer unit quantities     │     │ • Cold-chain transport protocols     │
│ • Scenario demand & supply math      │     │ • Answering custom telemetry queries │
└──────────────────────────────────────┘     └──────────────────────────────────────┘
```

### Deterministic Engine
Responsible for numerical facts:
- Calculating days-to-stockout (`currentStock / dailyConsumption`)
- Determining donor eligibility (preserving minimum 14-day reserve buffer)
- Computing exact transfer quantities required to bridge recipient deficit
- Measuring transit distance (Haversine formula) and estimated transit minutes
- Applying mathematical shifts for simulated demand and supply shocks

### Gemini
Responsible for operations reasoning:
- Interpreting multi-facility shortages across diverse therapeutic categories
- Explaining logistical risks and operational assumptions
- Formulating actionable, prioritized intervention steps
- Evaluating scenario stress tests and highlighting emerging systemic vulnerabilities
- Answering operator questions with citations grounded exclusively in supplied telemetry

**Why this separation matters:** Language models are not calculators. By computing quantities, runways, and thresholds deterministically, AI-Medics ensures that the numbers are always mathematically verified, while leveraging Gemini's strengths in synthesis, explanation, and decision assistance.

---

## Technology Stack

The application is built using the following technologies:

- **AI Engine**: Google Gemini (`gemini-3.8-flash`, with `gemini-3.1-flash-lite` fallback) via the `@google/genai` TypeScript SDK
- **Backend**: Express 4 (`express`) running on Node.js with `tsx` and Vite middlewares
- **Frontend Framework**: React 19 (`react`, `react-dom`)
- **Build Tool**: Vite 8 (`vite`, `@vitejs/plugin-react`)
- **Language**: TypeScript (`typescript`, `tsx`)
- **Styling**: Tailwind CSS v4 (`tailwindcss`, `@tailwindcss/vite`)
- **Icons & Motion**: Lucide React (`lucide-react`) and Motion (`motion`)
- **Configuration & Security**: `dotenv` for environment variable isolation

---

## Gemini Configuration

AI-Medics interfaces with Google Gemini via the official `@google/genai` TypeScript SDK configured in `server.ts`.

### Models Used:
- **`gemini-3.8-flash`** — Primary operational intelligence model used for structured shortage analysis, inventory Q&A, and disaster stress testing.
- **`gemini-3.1-flash-lite`** — Automatic fallback model ensuring system resilience during transient upstream rate limits (429/503).

System instructions in `server.ts` explicitly bind Gemini to:
1. Reason **exclusively** from the supplied synthetic dataset without hallucinating facilities or stock outside the telemetry.
2. Formulate **administrative and logistics recommendations only** (never clinical, medical, or diagnostic advice).
3. Always disclose assumptions and operational risks.

---

## Environment Variables

All sensitive credentials and environment configurations are managed via environment variables.

| Variable | Description | Required |
|---|---|---|
| `GEMINI_API_KEY` | Google AI Studio Gemini API key for operations reasoning | Yes |
| `APP_URL` | Application base hosting URL (automatically set in AI Studio) | Optional |

To set up your local environment:
```bash
cp .env.example .env
```
Open `.env` and assign your Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

*(Never commit `.env` or real API keys to version control. The repository's `.gitignore` automatically prevents `.env` tracking).*

---

## Running Locally

Follow these steps to run AI-Medics locally:

```bash
# 1. Clone the repository
git clone https://github.com/singh1806adhiraj-collab/AI-medics.git
cd AI-medics

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env and insert your GEMINI_API_KEY

# 4. Start the full-stack development server
npm run dev
```

The application will be accessible at: **`http://localhost:3000`**

### Additional Scripts

- `npm run build` — Compile TypeScript and generate the production web build via Vite.
- `npm run lint` — Validate types and codebase syntax using TypeScript (`tsc --noEmit`).
- `npm run start` — Run the production server via `tsx server.ts`.

---

## Synthetic Demonstration Dataset

To allow comprehensive demonstration without handling Protected Health Information (PHI) or restricted hospital data, AI-Medics includes a rich synthetic dataset:

- **10 Simulated Hospitals**: Ranging from Level I Trauma centers to Community Hospitals, Pediatric Pavilions, and Surgical Specialty Centers.
- **16 Critical Pharmaceuticals**: Spanning Emergency Vasopressors (Norepinephrine, Epinephrine), Anesthesia (Propofol, Fentanyl), Critical Care Antibiotics (Cefepime, Meropenem), Respiratory Solutions, and Metabolic Agents.
- **160 Synthetic Inventory Records**: Complete with batch lot codes, days-to-expiry, on-hand counts, consumption rates, and storage criteria.

---

## Clinical Safety Disclaimer

**AI-Medics is an administrative supply chain and operations intelligence decision-support prototype.**  
It does **NOT** provide clinical diagnostic advice, patient medical treatments, or clinical prescription guidance. All mutual-aid transfers require review, verification, and physical sign-off by licensed hospital pharmacy directors or regional logistics coordinators.

---

## License

This project is licensed under the [Apache-2.0 License](LICENSE).
