# CivicMind — The AI Operating System for Smarter Communities

**Project Title:** CivicMind  
**Tagline:** *The AI Operating System for Smarter Communities.*  
**Hackathon Challenge:** Community Hero — Hyperlocal Problem Solver

---

## 1. Problem Statement

### The Hyperlocal Challenge
Every day, municipalities receive thousands of reports concerning public infrastructure issues — potholes, water leaks, broken streetlights, waste accumulation, and structural failures. However, traditional municipal systems struggle with:
- **Fragmented Ingestion:** Citizens submit reports across disconnected hotlines, web forms, and emails.
- **Verification Bottlenecks:** Cities waste critical labor hours verifying duplicate complaints or sorting out spam.
- **Inefficient Prioritization:** Urgent issues (e.g., a pothole near a hospital) are placed in the same linear queue as low-impact issues.
- **Lack of Forward Planning:** Cities act as reactive caretakers, missing the predictive insights that connect a minor leak to a future major road base failure.

### The Real Problem
The problem isn't that citizens cannot report issues — it's that **cities don't have an intelligent operating system that can detect, analyze, prioritize, coordinate, predict, verify, and learn from hyperlocal infrastructure anomalies.**

---

## 2. Solution Overview

**CivicMind** is an Autonomous Multi-Agent Civic Intelligence Platform that manages the entire lifecycle of public infrastructure issues from initial detection to consensus-verified resolution.

Instead of building a simple "complaint form app," CivicMind introduces an autonomous city control room dashboard connected to a **Multi-Agent AI Network** and live IoT data feeds. When an issue is reported:
1. **Smart Detection:** Gemini Vision parses uploaded media to assess category, severity, and confidence (with full mock fallback when no API key is configured).
2. **AI Investigation:** 8 specialized, cooperative AI agents run concurrent scans — checking coordinate radius for duplicates, calculating asset distances for priority, and forecasting decay chains.
3. **Autonomous Planning:** A Planning Agent instantly compiles a municipal work order (materials list, estimated cost, labor crew, live weather alerts, and sequential repair tasks).
4. **Consensus Verification:** Nearby citizens verify repairs through consensus validation checkouts.
5. **Digital Twin:** Visualizes urban integrity through a live Leaflet GIS map that changes color based on health metrics.

---

## 3. Key Features

### First-Launch Profile Initializer
- Blocks application access on first load until the user registers their custom profile name.
- Custom names dynamically populate volunteer signature cards, leaderboards, and profile status overlays.

### Module 1: Smart Ingestion & Detection
- **Multi-Modal Reporting:** Upload photos and input text details.
- **Voice Reporting Simulation:** Mock voice memo transcription with CSS audio waveforms.
- **Instant Vision Assessment:** Leverages Gemini Vision (or mock engine) to identify the asset category, severity index, confidence scores, and safety hazards.
- **Quick Demo Presets:** One-click preset scenarios (Pothole, Pipe Leak, Streetlight Outage) for fast demonstrations.

### Module 2: AI Investigation (Autonomous Agent Network)
Visualizes 8 cooperating AI Agent nodes collaborating in real-time:
- **Vision Agent:** Scans visual files for structural cracking or leakage patterns.
- **Geo Agent:** Cross-references coordinate metadata with hospital, school, or mall proximities.
- **Duplicate Agent:** Performs radius checks (150m) to group overlapping tickets.
- **Priority Agent:** Calculates composite hazard weights.
- **Prediction Agent:** Models future consequences (e.g., base erosion → sinkhole → road collapse).
- **Planning, Authority, & Monitoring Agents:** Formulate dispatches, track repair tasks, and reward points.

### Module 3: Autonomous Resolution Planning
- **Prioritized Municipal Queue:** Ranks issues dynamically (critical assets first).
- **AI Work Order Generator:** Calculates labor crew size, materials, estimated repair duration, and budget requirements.
- **Live Weather (Open-Meteo):** Queries the weather API in real-time for safe work windows.

### Module 4: Live Resolution Monitoring
- **Before / After Comparison:** Side-by-side vision match validation (98%+ confidence).
- **Consensus Signatures:** Pings nearby volunteer devices for verification before closing tickets.

### Module 5: Civic Intelligence & Digital Twin Map
- **Interactive Leaflet Map:** Live GIS District Map with CartoDB tiles and dynamic issue markers.
- **Nominatim Reverse Geocoding:** Double-click anywhere to fetch the real street address.
- **Analytics Panel:** Resolution metrics, spent vs pending capital, department speed, and AI predictive budgeting alerts.
- **Community Hero Gamification:** Volunteers earn verification points, levels, and climb the neighborhood leaderboard.

---

## 4. Technologies

### Core
- **React 19** with TypeScript and Vite
- **Leaflet** for interactive GIS mapping
- **Nominatim / OpenStreetMap** for reverse geocoding
- **Open-Meteo API** for live weather data

### AI Integration
- **Gemini API (`gemini-2.5-flash`):** Direct JSON-mode endpoints for report categorization, hazard identification, and work order compilation.
- **Built-in Mock Engine:** Full fallback simulation when no API key is configured — all features work out of the box.

---

## 5. Setup & Local Development

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation
```bash
npm install
```

### Running
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### Optional: Gemini API Key
The app works fully without an API key using the built-in mock engine. To enable real AI analysis:
1. Open the app and click **"Configure Gemini Key"** in the header.
2. Paste your Gemini API key (stored locally in your browser only).

### Building
```bash
npm run build
```
Output is saved to the `/dist` directory.
