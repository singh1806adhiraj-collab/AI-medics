# AI-Medics — Healthcare Resource Intelligence

[![Track: Smart Health & Supply Chain Resilience](https://img.shields.io/badge/Hackathon-Code%20for%20Communities%202.0-0ea5e9.svg)](https://hack2skill.com)
[![Google Cloud Gemini 3.8 Flash](https://img.shields.io/badge/AI%20Engine-Gemini%203.8%20Flash-4285F4.svg?logo=google)](https://aistudio.google.com)
[![React 19](https://img.shields.io/badge/Frontend-React%2019-61DAFB.svg?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%205-3178C6.svg?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS v4](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com)
[![Status: Production Ready](https://img.shields.io/badge/Status-Production%20Ready-10b981.svg)](#)

> **Submission for Google for Developers × Hack2Skill Code for Communities 2.0**  
> **Track:** Smart Health & Supply Chain Resilience

---

## 📋 Executive Overview

**AI-Medics** is a healthcare operations intelligence platform designed to eliminate life-critical pharmaceutical stockouts and eliminate clinical medicine wastage across regional hospital networks.

In modern healthcare, hospitals operate in isolated silos: while one regional facility faces an acute stockout of critical vasopressors or pediatric antibiotics, an adjacent facility within 20 miles often holds surplus batches expiring on the shelf. **AI-Medics solves this coordination failure** by continuously monitoring hospital consumption velocity, calculating stockout runways deterministically, matching mutual-aid donor/recipient facilities, and using Google's **Gemini 3.8 Flash** model to provide transparent, contextual operations reasoning for human hospital leadership.

---

## 🏛 System Architecture: Hybrid Intelligence

AI-Medics employs an explicit **Hybrid Deterministic + LLM Architecture** that adheres to strict medical operations safety principles:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      Regional Hospital Network                         │
│   (10 Facilities · 16 Critical Medicines · 160 Real-Time Records)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Deterministic JavaScript Engine                      │
│                      (src/utils/calculations.ts)                       │
│                                                                        │
│   • Stockout Runway = Current Stock ÷ Daily Burn Rate                 │
│   • Expiry Risk Index = Days to Expiry ÷ Stock Runway Days             │
│   • Mutual-Aid Donor Algorithm (Greedy, Buffer-Safe Optimization)      │
│   • Geographic Route Distance & Cold-Chain Transit Math               │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │ Verified Math                  │ Structured Telemetry
                    ▼                                ▼
┌───────────────────────────────────────┐  ┌─────────────────────────────┐
│       Interactive Operations UI       │  │      Server-Side Gemini     │
│   • Command Center Dashboard          │  │     3.8 Flash Integration   │
│   • Inventory Intelligence Table      │  │         (server.ts)         │
│   • Resource Network SVG Graph        │  │                             │
│   • Interactive Scenario Simulator    │  │  • Deep-Dive Shortage Audit │
│   • Human-in-the-Loop Manifest Modal  │  │  • Cold-Chain Logistics     │
│   • Role-Based Security Audit Log     │  │  • Waste Prevention Strategy│
└───────────────────────────────────────┘  │  • Grounded Telemetry Q&A   │
                                           └─────────────────────────────┘
```

1. **Deterministic Core (JavaScript / TypeScript)**:
   - Days-to-stockout calculations, consumption burn velocity, expiry risk ratios, transit times, and transfer candidate matching are **never hallucinated**. They are computed with 100% deterministic precision.
2. **Reasoning Engine (Google Gemini 3.8 Flash)**:
   - Gemini handles what heuristics cannot: synthesizing multi-hospital trade-offs, justifying redistribution logic, evaluating supply chain disruption risks, verifying cold-chain compliance, and answering custom natural-language administrative queries citing exact telemetry.
3. **Human-in-the-Loop Governance**:
   - AI recommendations require explicit administrative sign-off, role verification, and electronic manifest generation before stock quantities can be adjusted.

---

## 🌟 Key Features

### 1. 🎛 Command Center
- **Network-Wide Telemetry**: High-level visibility across 10 regional hospitals and 16 monitored critical medications.
- **Stock Health Classification**: Real-time segmentation into Critical Shortages (<2 days runway), Warning (2–5 days), Stable (5–15 days), and Surplus (>15 days).
- **Mutual-Aid Opportunity Highlights**: Instant alerts when a high-impact transfer is available to resolve an acute shortage without endangering the donor hospital's safety buffer.
- **Urgent Administrative Action Queue**: Prioritized list of operational tasks ready for immediate dispatch.

### 2. 🔍 Inventory Intelligence
- **Deep Telemetry Grid**: Search and filter 160 distinct inventory records across facilities, categories, and stock status.
- **Safety Gauges**: Visual indicators for stock level, daily consumption rates, and projected stockout dates.
- **Batch & Cold-Chain Tracking**: Sub-record inspection showing lot numbers, manufacturer, storage temperature requirements (-20°C, 2–8°C, or ambient 20–25°C), and impending expiration warnings.
- **One-Click Reallocation**: Directly initiate a mutual-aid transfer manifest from any vulnerable medicine row.

### 3. 🌐 Resource Network Visualizer
- **Interactive SVG Regional Canvas**: Positioned representation of all 10 hospitals across the metropolitan and regional health authority.
- **Dynamic Status Rings**: Color-coded pulse rings indicating critical distress, warning, or donor readiness.
- **Directed Transfer Arcs**: Animated, curved transfer vectors demonstrating recommended inter-facility supply lanes with transit times and distance indicators.
- **Medicine Filter Mode**: Focus the topology map on specific vital medicines (e.g., Norepinephrine, Propofol, Insulin Glargine).

### 4. 🧪 Scenario Simulator & Stress Testing
- **Demand Shock Controls**: Real-time slider adjusting regional patient surges (from 0% up to +100%).
- **Supply Chain Disruption Controls**: Simulate regional delivery deficits (from 0% down to -75%).
- **Scenario Presets**: One-click simulation of realistic crisis events:
  - *Viral Respiratory Epidemic* (+40% bronchodilator & oxygen demand)
  - *Mass Casualty Incident* (+65% trauma & anesthesia demand)
  - *Port Strike / Active Pharmaceutical Ingredient (API) Supply Shock* (-50% antibiotic deliveries)
  - *Summer Heatwave & Cold-Chain Grid Outage*
- **Algorithmic Rebalancing**: Deterministic simulation of how automated mutual transfers would preserve hospital operations under stress.
- **Gemini Strategic Stress Test**: Gemini analyzes the simulated stress state to project newly vulnerable facilities and identify supply bottlenecks.

### 5. 🤖 AI Operations Assistant (Real Gemini 3.8 Flash)
- **Zero Pre-Written Responses**: All AI insights are dynamically generated via server-side Gemini API calls using live application telemetry.
- **4 Automated Strategic Audits**:
  1. *Regional Critical Shortage Deep-Dive*
  2. *Pharmaceutical Waste Mitigation Strategy*
  3. *Cold-Chain Redistribution Logistics Protocol*
  4. *Fair Multi-Hospital Donor Capacity Audit*
- **Natural-Language Telemetry Q&A**: Ask custom administrative questions (e.g., *"Which hospital has the safest surplus of Norepinephrine to supply Metropolitan General?"*).
- **Strict Grounding & Data Citations**: Gemini is instructed to reason exclusively from the provided synthetic dataset, citing specific hospital names, burn rates, and buffer margins.

### 6. 🛡 Human-in-the-Loop Transfer Governance
- **Official Transfer Manifests**: Generates structured pharmaceutical transfer manifests with cryptographic tracking IDs, transport temperature criteria, courier identification, and timestamps.
- **Role-Based Access Control**:
  - `Director of Pharmacy Supply Chain` (Full dispatch clearance)
  - `Regional Health Logistics Officer` (Full dispatch clearance)
  - `Operations Analyst (Read-Only)` (Preview only; dispatch locked)
- **Live Inventory Mutation**: Authorizing a manifest immediately debits the donor hospital, credits the recipient, logs the transfer in the permanent audit trail, and recalculates network metrics in real-time.
- **Printable Manifest Support**: Print-ready layout for field drivers and receiving pharmacy docks.

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript 5, Vite 8, Tailwind CSS v4, Motion, Lucide Icons |
| **Backend** | Express 4, Node.js / `tsx`, Vite Middleware proxy |
| **AI / LLM** | `@google/genai` TypeScript SDK, Google Gemini 3.8 Flash, fallback to Gemini 3.1 Flash-Lite |
| **Mathematics** | Custom deterministic supply chain algorithms (Haversine routing, runway decay models) |
| **Security** | Zero-secret client bundle, server-side API proxying, strict role authentication |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Package Manager**: `npm` or `bun`
- **Gemini API Key**: Obtain a free key from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-org/ai-medics.git
cd ai-medics

# Install dependencies
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory (based on `.env.example`):
```bash
cp .env.example .env
```

Open `.env` and add your Gemini API key:
```env
# Required for real AI reasoning endpoints
GEMINI_API_KEY=your_gemini_api_key_here

# App hosting URL (defaults to http://localhost:3000 in local dev)
APP_URL=http://localhost:3000
```

> **Note:** In Google AI Studio Build containers, `GEMINI_API_KEY` is automatically injected into the server environment at runtime.

### 3. Launch Development Server
```bash
npm run dev
```
The application will launch at: **`http://localhost:3000`**

### 4. Build for Production
```bash
npm run build
```

---

## 📡 Backend API Endpoints

The Express server (`server.ts`) serves both the Vite application and dedicated backend intelligence endpoints:

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | `GET` | Health status and verification of Gemini API configuration |
| `/api/gemini/analyze-structured` | `POST` | Executes deep-dive strategic audits returning structured JSON |
| `/api/gemini/custom-query` | `POST` | Answers natural language operational questions grounded in inventory data |
| `/api/gemini/simulate-stress` | `POST` | Performs strategic vulnerability evaluations under simulated disaster scenarios |

---

## 📊 Synthetic Demonstration Dataset

To allow comprehensive testing without compromising real-world Patient Health Information (PHI) or hospital confidentiality, AI-Medics includes a rich, realistic synthetic regional dataset:

- **10 Regional Hospitals**:
  - Metropolitan General Hospital (*Level I Trauma*, 850 beds)
  - St. Jude Regional Medical Center (*Level II Trauma*, 420 beds)
  - Valley Medical Center (*Community Teaching*, 310 beds)
  - Community Memorial Hospital (*Community General*, 180 beds)
  - Children's Health Pavilion (*Pediatric Specialty*, 240 beds)
  - Apex Trauma & Surgical Institute (*Surgical Specialty*, 190 beds)
  - Cedar Memorial Hospital (*Suburban Community*, 260 beds)
  - Northside Community Hospital (*Community General*, 150 beds)
  - Highland University Medical Center (*Academic Medical Center*, 720 beds)
  - Bayview Specialty Surgery Center (*Surgical Center*, 95 beds)
- **16 Monitored Critical Medications**:
  - Norepinephrine, Epinephrine, Propofol, Fentanyl, Cefepime, Vancomycin, Meropenem, Albuterol, Cisatracurium, Heparin, Enoxaparin, Insulin Regular, Insulin Glargine, Dexmedetomidine, Dextrose 50%, Sodium Bicarbonate.
- **160 Complete Inventory Records**: Realistic burn velocities, on-hand counts, batch lot numbers, storage conditions, and expiry dates.

---

## 🔒 Security & Privacy Discipline

- **No Clinical Diagnosis**: AI-Medics strictly governs logistics, inventory buffer preservation, and transfer manifests. It never provides medical treatment advice or direct patient care instructions.
- **Server-Side API Protection**: The `GEMINI_API_KEY` is never bundled into the client-side JavaScript artifact or exposed in network logs. All calls pass through the authenticated Express proxy.
- **Git Hygiene**: Strict `.gitignore` configurations ensure environment files, logs, and sensitive credentials are never committed.

---

## 🏆 Hackathon Information

- **Event**: Google for Developers × Hack2Skill Code for Communities 2.0
- **Track**: Smart Health & Supply Chain Resilience
- **Objective**: Deploy innovative developer tools and Google AI technologies to solve pressing community health and operational resilience challenges.

---

## 📄 License
This project is open-source under the [Apache-2.0 License](LICENSE).
