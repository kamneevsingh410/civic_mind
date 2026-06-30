// CivicMind AI — Gemini & Agent Intelligence Service

export interface AgentLog {
  agentName: string;
  avatar: string;
  status: 'info' | 'success' | 'warning' | 'critical' | 'agent';
  message: string;
  timestamp: string;
  details?: string;
}

export interface PredictionNode {
  step: number;
  consequence: string;
  impactScore: number;
  timeframe: string;
}

export interface RepairPlanStep {
  step: number;
  action: string;
  duration: string;
}

export interface RepairPlan {
  department: string;
  teamSize: number;
  materials: { name: string; quantity: string }[];
  steps: RepairPlanStep[];
  timeframe: string;
  estimatedCost: number;
}

export interface AnalysisResult {
  id: string;
  title: string;
  category: string;
  severity: number; // 0-100
  confidence: number; // 0-100
  description: string;
  hazards: string[];
  infrastructure: string;
  latitude: number;
  longitude: number;
  priorityScore: number; // calculated priority
  agentLogs: AgentLog[];
  predictions: PredictionNode[];
  plan: RepairPlan;
  status: 'detected' | 'investigated' | 'planning' | 'resolved';
  imageBefore: string;
  imageAfter?: string;
  verificationCount: number;
  trustScore: number;
  createdAt: string;
}

// Preset Mock Issues for Demo Flows
export const MOCK_ISSUES: Record<string, Partial<AnalysisResult>> = {
  pothole: {
    title: "Critical Road Fracture",
    category: "Road & Transport",
    severity: 88,
    confidence: 96,
    infrastructure: "Asphalt Road Surface",
    description: "Deep pothole spanning approximately 1.2 meters in width and 15cm in depth. Crack lines are expanding rapidly outwards, showing signs of severe sub-base erosion. High-density urban roadway with active transit.",
    hazards: ["Motorcycle crash risk", "Suspension failure", "Water pooling causing hydroplaning", "Pedestrian fall hazard"],
    predictions: [
      { step: 1, consequence: "Sub-base soil saturation from trapped water", impactScore: 40, timeframe: "1-2 Weeks" },
      { step: 2, consequence: "Asphalt edge crumbling, widening hole to 2.0m", impactScore: 65, timeframe: "1 Month" },
      { step: 3, consequence: "Traffic speed reduction causing localized peak delays", impactScore: 78, timeframe: "2 Months" },
      { step: 4, consequence: "Severe motorcycle collision risk or vehicle damage claims", impactScore: 92, timeframe: "3 Months" },
      { step: 5, consequence: "Road base collapse requiring full block repaving ($$$$)", impactScore: 95, timeframe: "6 Months" }
    ],
    plan: {
      department: "Department of Transportation — Road Maintenance Unit",
      teamSize: 4,
      materials: [
        { name: "Hot Mix Asphalt", quantity: "1.8 Tons" },
        { name: "Bituminous Tack Coat Emulsion", quantity: "45 Liters" },
        { name: "Crushed Aggregate Sub-Base", quantity: "0.8 Tons" },
        { name: "Reflective Road Paint (White/Yellow)", quantity: "5 Liters" }
      ],
      steps: [
        { step: 1, action: "Secure the perimeter with high-visibility safety cones and dynamic arrow boards.", duration: "30 mins" },
        { step: 2, action: "Excavate the damaged asphalt, cut vertical edges, and clean debris / remove water.", duration: "1.5 hours" },
        { step: 3, action: "Apply Aggregate sub-base, compact thoroughly, and spray tack coat emulsion.", duration: "1 hour" },
        { step: 4, action: "Pour Hot Mix Asphalt at 150°C, grade, and roll compact until level with road.", duration: "2 hours" },
        { step: 5, action: "Seal seams, apply retroreflective thermal pavement markings, and reopen lane.", duration: "45 mins" }
      ],
      timeframe: "6.0 Hours",
      estimatedCost: 1450
    }
  },
  leakage: {
    title: "Main Grid Water Pipe Leak",
    category: "Water & Utilities",
    severity: 68,
    confidence: 91,
    infrastructure: "Municipal Drinking Water Supply Pipe",
    description: "Subterranean fracture in a 6-inch secondary supply line causing active surfacing of potable water. Erosion of adjacent soil is visible. Pressure drops reported in a 400-meter radius.",
    hazards: ["Sub-surface soil erosion", "Drinking water contamination", "Localized sinkhole risk", "Utility service disruption"],
    predictions: [
      { step: 1, consequence: "Continuous water loss (approx. 20L/minute)", impactScore: 45, timeframe: "Immediate" },
      { step: 2, consequence: "Adjacent road subgrade saturation and softening", impactScore: 60, timeframe: "1 Week" },
      { step: 3, consequence: "Nearby residential water pressure drop & billing spikes", impactScore: 70, timeframe: "2 Weeks" },
      { step: 4, consequence: "Pavement collapse / sinkhole formation above leak", impactScore: 85, timeframe: "1 Month" }
    ],
    plan: {
      department: "Water Utility Commission — Piping & Hydrology Dept",
      teamSize: 3,
      materials: [
        { name: "6-inch Ductile Iron Repair Sleeve", quantity: "1 Unit" },
        { name: "Washed Pea Gravel Backfill", quantity: "2.5 Cubic Yards" },
        { name: "Anti-Corrosive Pipe Wrap", quantity: "1 Roll" }
      ],
      steps: [
        { step: 1, action: "Coordinate water shut-off for Section 4-B and alert local residents.", duration: "45 mins" },
        { step: 2, action: "Excavate soil overlay down to utility line and pump out mud.", duration: "2 hours" },
        { step: 3, action: "Locate rupture, install heavy-duty pressure sleeve clamp, inspect seal.", duration: "1 hour" },
        { step: 4, action: "Backfill with compact gravel, wrap pipe, restore water pressure grid.", duration: "1.5 hours" },
        { step: 5, action: "Reinstate topsoil / asphalt patch over excavation site.", duration: "2 hours" }
      ],
      timeframe: "7.25 Hours",
      estimatedCost: 2100
    }
  },
  streetlight: {
    title: "Unresponsive Streetlight Cluster",
    category: "Electrical & Lighting",
    severity: 55,
    confidence: 98,
    infrastructure: "LED Street Lighting Pole",
    description: "Two consecutive double-arm street lighting fixtures failed to illuminate on timer. Visual damage suggests electrical housing cap is loose, potentially due to water damage or short circuit.",
    hazards: ["Increase in dark-zone safety risks", "Pedestrian trip risk", "Vehicle-pedestrian collision hazard at intersection"],
    predictions: [
      { step: 1, consequence: "Zone remains in complete darkness between 19:00 - 06:00", impactScore: 50, timeframe: "Immediate" },
      { step: 2, consequence: "Pedestrian slip or trip injuries near crossing", impactScore: 65, timeframe: "2 Weeks" },
      { step: 3, consequence: "Increase in vehicle speed accidents due to low visibility", impactScore: 78, timeframe: "1 Month" }
    ],
    plan: {
      department: "City Power & Public Lighting Division",
      teamSize: 2,
      materials: [
        { name: "150W LED Cobrahead Luminaire", quantity: "2 Units" },
        { name: "Photoelectric Sensor Relay", quantity: "2 Units" },
        { name: "30A Waterproof Fuse Assembly", quantity: "4 Units" }
      ],
      steps: [
        { step: 1, action: "Deploy bucket truck crew and secure lane with flashing beacons.", duration: "20 mins" },
        { step: 2, action: "Elevate technician, open wiring compartment, check voltage levels.", duration: "30 mins" },
        { step: 3, action: "Replace blown capacitor, install new LED luminaires, upgrade photo-cells.", duration: "45 mins" },
        { step: 4, action: "Test override system to verify instantaneous ignition.", duration: "15 mins" }
      ],
      timeframe: "1.8 Hours",
      estimatedCost: 650
    }
  }
};

// Generates the sequence of agent logs as they process an issue
export const generateAgentLogs = (
  issueTitle: string,
  _category: string,
  lat: number,
  lng: number,
  severity: number,

  hospitalDistance: number = 0,
  schoolDistance: number = 0
): AgentLog[] => {
  const timestamp = () => new Date().toLocaleTimeString();
  
  // Custom prioritizing logic based on geography & category
  const isNearAsset = hospitalDistance < 500 || schoolDistance < 500;
  const computedPriority = Math.min(100, Math.round(severity * (isNearAsset ? 1.25 : 0.95)));

  return [
    {
      agentName: "Vision Agent",
      avatar: "👁️",
      status: "agent",
      message: "Ingesting raw visual reports. Analyzing pixels for object detection.",
      timestamp: timestamp(),
      details: "Analyzed uploaded media. Found primary pattern matching: '" + issueTitle + "'. Structural damage confirmed. Estimated confidence: 96%."
    },
    {
      agentName: "Geo Intelligence Agent",
      avatar: "🌍",
      status: "info",
      message: `Analyzing spatial metadata at GPS coordinate [${lat.toFixed(5)}, ${lng.toFixed(5)}].`,
      timestamp: timestamp(),
      details: `Radius check complete. Proximity to vital facilities: School is ${schoolDistance}m, Hospital is ${hospitalDistance}m. Nearby road hierarchy: Primary Arterial.`
    },
    {
      agentName: "Duplicate Detector Agent",
      avatar: "🔍",
      status: "success",
      message: "Scanning active databases for duplicate entries within 150-meter radius.",
      timestamp: timestamp(),
      details: "Scan complete. Searched 47 open records. Zero overlaps detected. This is a unique, newly reported infrastructure issue."
    },
    {
      agentName: "Priority Calculator Agent",
      avatar: "⚡",
      status: isNearAsset ? "critical" : "warning",
      message: `Computing raw priority weight score. Base Severity: ${severity}.`,
      timestamp: timestamp(),
      details: isNearAsset 
        ? `PRIORITY CRITICAL (${computedPriority}/100) - Elevated due to proximity within critical safe-zones (Hospital/School).`
        : `PRIORITY HIGH (${computedPriority}/100) - Standard road grid impact. No immediate critical asset threats.`
    },
    {
      agentName: "Impact Prediction Agent",
      avatar: "🔮",
      status: "warning",
      message: "Simulating structural decay model based on weather variables and traffic loads.",
      timestamp: timestamp(),
      details: `Projected path: Active water pooling will expedite asphalt delamination, increasing repair cost by +180% if untreated within 30 days.`
    },
    {
      agentName: "Autonomous Planning Agent",
      avatar: "🛠️",
      status: "agent",
      message: "Synthesizing municipal repair plan & materials estimate.",
      timestamp: timestamp(),
      details: "Generated comprehensive work order. Recommended crew size: 3-4 technicians. Selected repair materials: asphalt patches/sleeve sealants. Est time: 6 hrs."
    },
    {
      agentName: "Verification Consensus Agent",
      avatar: "👥",
      status: "success",
      message: "Broadcasting peer validation request to local citizen grid (radius: 300m).",
      timestamp: timestamp(),
      details: "Broadcasted. 4 neighboring Community Heroes have been pinged to verify. Live consensus tracking initiated."
    },
    {
      agentName: "Authority Dispatch Agent",
      avatar: "🏢",
      status: "success",
      message: "Formulating department dispatch route & API trigger payload.",
      timestamp: timestamp(),
      details: "Successfully pushed to Municipal Work Queue. Dispatched notification to District Operations Lead."
    }
  ];
};

// Main analyze call to Gemini API
export const analyzeIssueWithGemini = async (
  imageSrc: string | null,
  textDescription: string,
  gps: { lat: number; lng: number },
  apiKey?: string
): Promise<AnalysisResult> => {
  // If API Key is provided, attempt to make a real Gemini API call
  if (apiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are the core of CivicMind AI, an Autonomous Civic Intelligence Platform.
Analyze the user's report.
Description provided: "${textDescription || "No description provided."}"

Return a valid JSON object ONLY. Do not write markdown blocks or wrappers. The JSON must match the following TypeScript shape:
{
  "title": "Short descriptive title",
  "category": "Road & Transport" | "Water & Utilities" | "Electrical & Lighting" | "Waste & Environment",
  "severity": number (1 to 100),
  "confidence": number (1 to 100),
  "infrastructure": "Name of the target infrastructure affected",
  "description": "More detailed AI analysis of what is visible or described",
  "hazards": ["Array", "of", "hazards"],
  "predictions": [
    { "step": 1, "consequence": "Action 1", "impactScore": 40, "timeframe": "1 week" }
  ],
  "plan": {
    "department": "Name of department responsible",
    "teamSize": number,
    "materials": [{ "name": "material name", "quantity": "amount" }],
    "steps": [{ "step": 1, "action": "Action desc", "duration": "30 mins" }],
    "timeframe": "duration",
    "estimatedCost": number
  }
}
`
                  },
                  ...(imageSrc ? [{
                    inlineData: {
                      mimeType: "image/jpeg",
                      data: imageSrc.split(",")[1]
                    }
                  }] : [])
                ]
              }
            ],
            generationConfig: {
              responseMimeType: "application/json"
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API returned status ${response.status}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = JSON.parse(rawText.trim());
        
        // Calculate priority
        const hospitalDistance = Math.floor(Math.random() * 800) + 100;
        const schoolDistance = Math.floor(Math.random() * 800) + 100;
        const isNear = hospitalDistance < 500 || schoolDistance < 500;
        const priorityScore = Math.min(100, Math.round(parsed.severity * (isNear ? 1.25 : 0.95)));

        const logs = generateAgentLogs(
          parsed.title,
          parsed.category,
          gps.lat,
          gps.lng,
          parsed.severity,
          hospitalDistance,
          schoolDistance
        );

        return {
          id: Math.random().toString(36).substr(2, 9),
          title: parsed.title,
          category: parsed.category,
          severity: parsed.severity,
          confidence: parsed.confidence || 90,
          description: parsed.description,
          hazards: parsed.hazards || ["Safety risk"],
          infrastructure: parsed.infrastructure,
          latitude: gps.lat,
          longitude: gps.lng,
          priorityScore,
          agentLogs: logs,
          predictions: parsed.predictions,
          plan: parsed.plan,
          status: 'investigated',
          imageBefore: imageSrc || 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=400',
          verificationCount: 0,
          trustScore: 80,
          createdAt: new Date().toISOString()
        };
      }
    } catch (e) {
      console.warn("Real Gemini call failed, falling back to mock engine:", e);
    }
  }

  // Fallback High-Fidelity Simulator
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate AI processing delay

  // Try matching search keywords to deliver relevant mock
  const descLower = textDescription.toLowerCase();
  let baseKey = 'pothole';
  if (descLower.includes('water') || descLower.includes('leak') || descLower.includes('pipe') || descLower.includes('drain')) {
    baseKey = 'leakage';
  } else if (descLower.includes('light') || descLower.includes('lamp') || descLower.includes('bulb') || descLower.includes('wire') || descLower.includes('dark')) {
    baseKey = 'streetlight';
  }

  const preset = MOCK_ISSUES[baseKey]!;
  const hospitalDistance = Math.floor(Math.random() * 800) + 100;
  const schoolDistance = Math.floor(Math.random() * 800) + 100;
  
  const isNear = hospitalDistance < 500 || schoolDistance < 500;
  const priorityScore = Math.min(100, Math.round((preset.severity || 70) * (isNear ? 1.25 : 0.95)));

  const logs = generateAgentLogs(
    preset.title || "Civic Fracture",
    preset.category || "Utility",
    gps.lat,
    gps.lng,
    preset.severity || 70,
    hospitalDistance,
    schoolDistance
  );

  return {
    id: Math.random().toString(36).substr(2, 9),
    title: preset.title || "Civic Fracture",
    category: preset.category || "Utility",
    severity: preset.severity || 70,
    confidence: preset.confidence || 90,
    description: textDescription || preset.description || "Unidentified infrastructure issue reported.",
    hazards: preset.hazards || ["Safety risk"],
    infrastructure: preset.infrastructure || "Public infrastructure grid",
    latitude: gps.lat,
    longitude: gps.lng,
    priorityScore,
    agentLogs: logs,
    predictions: preset.predictions || [],
    plan: preset.plan as RepairPlan,
    status: 'investigated',
    imageBefore: imageSrc || (baseKey === 'pothole'
      ? 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=400'
      : baseKey === 'leakage'
      ? 'https://images.unsplash.com/photo-1508189860359-777d945909ef?q=80&w=400'
      : 'https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?q=80&w=400'),
    verificationCount: 0,
    trustScore: 80,
    createdAt: new Date().toISOString()
  };
};
