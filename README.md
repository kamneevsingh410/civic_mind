# CivicMind AI — The AI Operating System for Smarter Communities

**Project Title:** CivicMind AI  
**Tagline:** *The AI Operating System for Smarter Communities.*  
**Hackathon Challenge:** Community Hero — Hyperlocal Problem Solver  
**Target Deployment:** Google Cloud Platform (Firebase Hosting / Google Cloud Run)

---

## 1. Problem Statement Selected

### The Hyperlocal Challenge
Every day, municipalities receive thousands of reports concerning public infrastructure issues—potholes, water leaks, broken streetlights, waste accumulation, and structural failures. However, traditional municipal systems struggle with:
- **Fragmented Ingestion:** Citizens submit reports across disconnected hotlines, web forms, and emails.
- **Verification Bottlenecks:** Cities waste critical labor hours verifying duplicate complaints or sorting out spam.
- **Inefficient Prioritization:** Urgent issues (e.g., a pothole near a hospital) are placed in the same linear queue as low-impact issues.
- **Lack of Forward Planning:** Cities act as reactive caretakers, missing the predictive insights that connect a minor leak to a future major road base failure.

### The Real Problem
The problem isn't that citizens cannot report issues; it's that **cities don't have an intelligent operating system that can detect, analyze, prioritize, coordinate, predict, verify, and learn from hyperlocal infrastructure anomalies.**

---

## 2. Solution Overview

**CivicMind AI** is an Autonomous Multi-Agent Civic Intelligence Platform that manages the entire lifecycle of public infrastructure issues from initial detection to consensus-verified resolution.

Instead of building a simple "complaint form app," CivicMind AI introduces an autonomous city control room dashboard connected to a **Multi-Agent AI Network** and live IoT data feeds. When an issue is reported:
1. **Smart Detection:** Gemini Vision parses uploaded media to assess category, severity, and confidence.
2. **AI Investigation:** 10 specialized, cooperative AI agents run concurrent scans (checking coordinate radius for duplicates, calculating asset distances for priority, and forecasting decay chains).
3. **Autonomous Planning:** A Planning Agent instantly compiles a municipal work order (materials list, estimated cost, labor crew, live weather alerts, and sequential repair tasks).
4. **Consensus Verification:** Nearby citizens verify repairs through consensus validation checkouts.
5. **Digital Twin:** Visualizes urban integrity through vector overlays (water, electricity, road nets) that change color based on health metrics.

---

## 3. Key Features (The Five Pillars)

### First-Launch Profile Initializer
- Blocks application access on first load until the user registers their custom profile name.
- Custom names dynamically populate the volunteer signature cards, leaderboards, and profile status overlays, ensuring that judges can test the platform under their own name.

### Module 1: Smart Ingestion & Detection
- **Multi-Modal Reporting:** Upload photos and input text details.
- **Voice Reporting Simulation:** Integrates a mock voice memo transcription with pulsing CSS audio waveforms.
- **Instant Vision Assessment:** Leverages Gemini Vision to identify the asset category, severity index, confidence scores, and safety hazards on the spot.

### Module 2: AI Investigation (Autonomous Agent Network)
Visualizes 10 cooperating AI Agent nodes collaborating in real-time:
- **Vision Agent:** Scans visual files for structural cracking or leakage patterns.
- **Geo Agent:** Cross-references coordinate metadata with hospital, school, or mall proximities.
- **Duplicate Agent:** Performs radius checks (150m) to group overlapping tickets.
- **Priority Agent:** Calculates composite hazard weights.
- **Prediction Agent:** Models future consequences (e.g., base erosion -> sinkhole -> road collapse).
- **Planning, Authority, & Monitoring Agents:** Formulate dispatches, track repair tasks, and reward points.

### Module 3: Autonomous Resolution Planning
- **Prioritized Municipal Queue:** Ranks issues dynamically (critical assets first).
- **AI Work Order Generator:** Instantly calculates labor crew size, materials (e.g. tons of hot mix asphalt, sleeves), estimated repair duration, and budget requirements.
- **Live Weather Schedule (Open-Meteo Integration):** Selected coordinates query the weather API in real-time, fetching temperatures and conditions to ensure safe work windows (rain triggers auto-reschedule warnings).

### Module 4: Live Resolution Monitoring
- **Before / After AI Comparison:** Uploads "after" photographs and runs a side-by-side vision match validation (e.g., 98% asphalt fill match).
- **Consensus Signatures:** Pings nearby volunteer devices to collect consensus verifications before closing tickets.

### Module 5: Civic Intelligence & Digital Twin Map
- **Interactive Toggled Map:** Users can switch between a cyber-schematic Digital Twin overlay (SVG mesh) and a live **GIS District Map** using Leaflet and CartoDB Dark Matter tiles.
- **Nominatim Reverse Geocoding:** Double-clicking anywhere on the GIS map queries OpenStreetMap in real-time to fetch the actual local street address and suburb.
- **Analytics Panel:** Tracks resolution metrics, spent vs pending capital, department speed leaderboards, and AI predictive budgeting alerts.
- **Community Hero Gamification:** Volunteers earn verification points, levels, and climb the neighborhood leaderboard live.

---

## 4. Google Technologies Utilized

1. **Gemini API (`gemini-2.5-flash` / `gemini-2.5-pro`):**
   - Implemented direct JSON-mode endpoints via `fetch` to categorize raw reports, identify hazards, and compile structured work orders.
   - Built a secure client-side **Gemini Key Configuration Drawer** so administrators and judges can paste their personal keys in the UI to run live vision tests on custom files.
2. **Google Maps SDK / Places API (Blueprint):**
   - Configured for geocoding coordination and asset routing layouts.
3. **Google Cloud Run (Deployment Target):**
   - The React build is optimized for containerization and rapid deployment to Google Cloud Run or Firebase Hosting.

---

## 5. Setup & Local Development

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation
1. Clone the repository to your local directory.
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App
Start the local Vite development server:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### Building for Production
Compile and bundle the project:
```bash
npm run build
```
This output is saved to the `/dist` directory, ready to be deployed to Google Cloud or Firebase.
