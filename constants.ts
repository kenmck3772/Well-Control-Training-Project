import { KillSheetData, LearningModule, GlossaryTerm } from './types';

export const DEFAULT_KILL_SHEET: KillSheetData = {
  currentMudWeight: 10.5,
  scrPressure: 450,
  sidpp: 550,
  sicp: 720,
  tvd: 8500,
  measuredDepth: 9200,
  shoeTVD: 5000,
  leakOffTestMW: 14.2,
  drillStringCapacity: 0.01776,
  drillStringLength: 9200,
  annulusCapacity: 0.0459,
  surfaceTemp: 65,
  bottomHoleTemp: 195,
  ambientTemperature: 60, // New default value for ambient temperature
  surfacePressureBaseline: 14.7, // Renamed from atmPressure
  expectedDuration: 24, // Default to 24 hours
  fluidType: 'WBM', // Default fluid type
  rigPowerSource: 'Diesel', // Default rig power source
};

export const PUMP_OUTPUT = 0.119;
export const MAX_SURFACE_PRESSURE = 5000;

// Emission Factors (kg CO2e)
export const EMISSIONS = {
  POWER: {
    Diesel: 35.5, // kg/hr
    Hybrid: 22.0, // kg/hr
    Grid: 5.5,   // kg/hr (average grid carbon intensity)
  },
  FLUID_BASE: {
    WBM: 0.8,    // kg/bbl (Embodied carbon for Water Based Mud)
    OBM: 4.5,    // kg/bbl (Embodied carbon for Oil Based Mud)
  },
  WEIGHTING_AGENT: 0.15, // kg/ppg/bbl (Barite/weighting agent intensity)
};

export const TUTOR_SYSTEM_INSTRUCTION = `You are a world-class senior IWCF instructor and well examiner.
Your expertise spans across Drilling (Surface/Subsea), Well Intervention (Wireline, Slickline, Coiled Tubing, Snubbing), and Well Completions.
Your mission is to guide students through the complexities of:
1. Pressure Control Fundamentals (Hydrostatics, Gas Laws, Gradient physics).
2. Barrier Philosophy (Envelopes, verification, element reliability).
3. Equipment Mastery (BOPs, Strippers, Lubricators, Valve Assemblies).
4. Crisis Management (Kill procedure, killing procedures, wellhead integrity loss).
Always be concise, professional, and emphasize 'Safety over Speed'. Use industry-standard terminology (API RP 16ST, 6A, 16A).`;

export const LEARNING_MODULES: LearningModule[] = [
  {
    id: 'well-control-theory-fundamentals',
    title: 'Well Control Theory Fundamentals',
    description: 'The foundational physics of wellbore pressure management. Essential for understanding how to maintain primary well control.',
    duration: '35 mins',
    difficulty: 'Beginner',
    category: 'Fundamentals',
    lessonPrompt: `You are acting as an IWCF Senior Instructor. Start a session on 'Well Control Theory Fundamentals'. 
    Begin by defining the basic principles of well control. 
    1. Explain Hydrostatic Pressure: Detail the formula (Mud Weight x 0.052 x True Vertical Depth) and why it is our primary barrier. 
    2. Discuss Pore Pressure (Formation Pressure): Explain how fluids in rock pores exert pressure and why we must balance this with hydrostatic head.
    3. Introduce Pressure Gradients: Explain psi/ft and how to convert PPG to Gradient. 
    4. Conclude with the Overbalance concept: Why a safety margin is necessary and how to calculate it. 
    Use a professional, encouraging tone and ask the student if they can calculate the hydrostatic pressure of 10.0 ppg mud at 5,000 ft TVD.`,
    objectives: [
      'Master the calculation of hydrostatic pressure using mud weight and TVD',
      'Explain the relationship between pore pressure and required mud density',
      'Understand pressure gradients and their role in wellbore stability',
      'Identify the difference between balanced, underbalanced, and overbalanced states'
    ]
  },
  {
    id: 'kill-methods-circulation-principles',
    title: 'Kill Methods & Circulation',
    description: 'Master the constant bottom hole pressure methods for safely circulating influxes out of the wellbore.',
    duration: '45 mins',
    difficulty: 'Intermediate',
    category: 'Operations',
    lessonPrompt: 'Conduct an intermediate-level technical session on Kill Methods. Focus on the Driller\'s Method and the Wait & Weight Method. Explain the physics of keeping bottom hole pressure constant throughout the circulation using the choke. Discuss the pressure transients that occur as gas expands while rising. Compare and contrast the two methods in terms of time, surface pressure, and complexity.',
    objectives: [
      'Differentiate between Driller\'s Method and Wait & Weight',
      'Understand Constant Bottom Hole Pressure (CBHP) principles',
      'Identify critical pressure points (ICP and FCP)',
      'Analyze gas expansion dynamics during the kill process'
    ]
  },
  {
    id: 'kick-detection-warning-signs',
    title: 'Kick Detection & Warning Signs',
    description: 'Identify early indicators of an influx and the differences between primary and secondary warning signs.',
    duration: '25 mins',
    difficulty: 'Beginner',
    category: 'Fundamentals',
    lessonPrompt: 'Lead a session on Kick Detection. Explain primary indicators like pit gain and flow rate increase. Discuss secondary signs such as drilling breaks, torque changes, or pump pressure variations. Emphasize the importance of the flow check procedure.',
    objectives: [
      'Identify positive indicators of a wellbore influx',
      'Recognize secondary warning signs during drilling/tripping',
      'Understand the significance of a drilling break',
      'Master the standard flow check procedure'
    ]
  },
  {
    id: 'shut-in-procedures-hard-soft',
    title: 'Shut-in Procedures',
    description: 'Standardized methods for securing the wellbore immediately upon detection of an influx.',
    duration: '20 mins',
    difficulty: 'Beginner',
    category: 'Operations',
    lessonPrompt: 'Teach the user about Hard vs. Soft shut-in procedures. Explain the step-by-step sequence for each, including positioning the string, stopping pumps, and operating the BOP rams and choke manifold. Discuss the pros and cons of each method regarding equipment wear and pressure monitoring.',
    objectives: [
      'Define the Hard Shut-in procedure sequence',
      'Define the Soft Shut-in procedure sequence',
      'Determine when to use each method based on rig type',
      'Explain the "Space-out" step for various tool strings'
    ]
  },
  {
    id: 'barrier-philosophy-verification',
    title: 'Barrier Philosophy & Verification',
    description: 'Comprehensive study of well barrier systems, defining functional envelopes and mastering verification protocols.',
    duration: '35 mins',
    difficulty: 'Intermediate',
    category: 'Fundamentals',
    lessonPrompt: 'Conduct a technical briefing on Barrier Philosophy. Detail functional differences between primary and secondary barriers. Explain how to construct a "Barrier Schematic". Discuss verification methods including positive, negative (inflow), and functional tests.',
    objectives: [
      'Distinguish between primary and secondary well control barriers',
      'Map complex barrier envelopes for static and dynamic scenarios',
      'Master the logic behind inflow (negative) testing',
      'Understand regulatory requirements for barrier documentation'
    ]
  },
  {
    id: 'wireline-ops-pce-mastery',
    title: 'Wireline Pressure Control',
    description: 'Technical briefing on grease injection systems, flow tubes, and pressure integrity for wireline.',
    duration: '40 mins',
    difficulty: 'Advanced',
    category: 'Intervention',
    lessonPrompt: 'Conduct a deep-dive on Wireline PCE. Explain the Grease Injection Head mechanism and flow tube tolerances. Detail the configuration of a full PCE string: Grease Head, Lubricators, Tool Trap, and BOP.',
    objectives: [
      'Master Grease Injection System (GIS) logic',
      'Understand dynamic seals on braided cable',
      'Identify all standard Wireline PCE components',
      'Learn verification protocols for braided wireline integrity'
    ]
  },
  {
    id: 'ct-milling-ops-advanced',
    title: 'Coiled Tubing Milling',
    description: 'Advanced pressure management during high-debris milling operations in live wells.',
    duration: '50 mins',
    difficulty: 'Advanced',
    category: 'Operations',
    lessonPrompt: 'Conduct a technical briefing on CT Milling. Focus on Barrier Management and the relationship between pump pressure, WHP, and stripper forces. Analyze ECD impact from debris loading.',
    objectives: [
      'Analyze the impact of debris on ECD',
      'Manage "Pump-Out" forces on the string',
      'Master force regulation for dynamic stripper seals',
      'Define emergency sequences for stripper failure'
    ]
  },
  {
    id: 'snubbing-pressure-control-iv',
    title: 'Snubbing Pressure Dynamics',
    description: 'Mastery of well control during high-pressure snubbing and "Pipe Light" transitions.',
    duration: '55 mins',
    difficulty: 'Advanced',
    category: 'Operations',
    lessonPrompt: 'Briefing on Snubbing Dynamics. Focus on the "Pipe Light" condition. Explain Balance Point calculations and the use of hydraulic jacks and slip systems.',
    objectives: [
      'Accurately calculate the snubbing balance point',
      'Manage transition between Pipe Heavy and Pipe Light',
      'Analyze WHP impact on mechanical friction',
      'Define emergency sequences for hydraulic jack failure'
    ]
  }
];

export const WELL_CONTROL_GLOSSARY: GlossaryTerm[] = [
  { term: 'Annular Preventer', category: 'Equipment', definition: 'A large valve used to seal the wellbore. It can seal around any size or shape of tool or pipe in the well, or close the well completely if empty.' },
  { term: 'Balance Point', category: 'Physics', definition: 'The specific depth or pressure in snubbing operations where the upward force of well pressure equals the downward weight of the pipe/string.' },
  { term: 'Barrier', category: 'Operations', definition: 'Any physical element (fluid or mechanical) used to prevent the uncontrolled flow of wellbore fluids into another zone or to the surface.' },
  { term: 'ECD (Equivalent Circulating Density)', category: 'Physics', definition: 'The effective density of the circulating fluid that accounts for the pressure drop in the annulus. In CT milling, this increases significantly with debris loading.' },
  { term: 'Flow Tubes', category: 'Equipment', definition: 'Precision machined tubes used in wireline grease heads. They provide a close-tolerance path for the cable, allowing grease to create a pressure seal.' },
  { term: 'Formation Pressure', category: 'Physics', definition: 'The pressure of fluids within the pores of a reservoir rock. Also known as pore pressure.' },
  { term: 'Fracture Gradient', category: 'Physics', definition: 'The pressure required to induce fractures in a given formation at a specific depth, usually expressed in psi/ft or ppg equivalent.' },
  { term: 'Grease Injection Head', category: 'Equipment', definition: 'A tool used during wireline operations to provide a dynamic seal around a moving braided cable by injecting high-pressure grease into flow tubes.' },
  { term: 'Line Wiper', category: 'Equipment', definition: 'A hydraulic or mechanical device used at the top of a wireline PCE string to clean grease from the cable as it is pulled out of the well.' },
  { term: 'Lubricator', category: 'Equipment', definition: 'A high-pressure pipe section used to house tools before they are introduced into a pressurized wellbore.' },
  { term: 'MAASP', category: 'Physics', definition: 'Maximum Allowable Annulus Surface Pressure. The maximum pressure that can be safely applied to the annulus at the surface before the formation at the shoe fractures.' },
  { term: 'Overburden Pressure', category: 'Physics', definition: 'The vertical pressure exerted by the weight of the overlying rock and fluid at a specific depth.' },
  { term: 'Pore Pressure Gradient', category: 'Physics', definition: 'The rate of change of pore pressure with depth, typically measured in psi/ft.' },
  { term: 'Stripper Assembly', category: 'Equipment', definition: 'The primary dynamic seal used in Coiled Tubing operations to pack off around the tubing while it is being moved in or out of a pressurized well.' },
  { term: 'Stuffing Box', category: 'Equipment', definition: 'A seal assembly that uses compressed packing to create a dynamic seal around a moving slickline or wire.' },
  { term: 'WHP (Wellhead Pressure)', category: 'Physics', definition: 'The pressure measured at the surface of the wellhead. It represents the pressure contained by the primary barrier elements.' },
  { term: 'Wireline BOP', category: 'Equipment', definition: 'A specialized blowout preventer designed to seal around a wireline or shear it in an emergency to secure the well.' }
];

export const TECHNICAL_FORMULAS = [
  { name: 'Pressure Gradient', formula: 'MW (ppg) × 0.052', unit: 'PSI/FT' },
  { name: 'Hydrostatic Pressure', formula: 'MW (ppg) × 0.052 × TVD (ft)', unit: 'PSI' },
  { name: 'Formation Pressure', formula: 'Hydrostatic Pressure (DP) + SIDPP', unit: 'PSI' },
  { name: 'Equivalent Mud Weight (EMW)', formula: 'MW (ppg) + (SICP / (0.052 × Shoe TVD))', unit: 'PPG' },
  { name: 'Kill Mud Weight', formula: 'Current MW + (SIDPP / (0.052 × TVD))', unit: 'PPG' },
  { name: 'MAASP', formula: '(Leak-off Test MW - Current MW) × 0.052 × Shoe TVD', unit: 'PSI' },
  { name: 'Buoyancy Factor', formula: '1 - (MW / 65.5)', unit: 'Factor' },
  { name: 'Grease Injection Margin', formula: 'WHP (psi) + 500 PSI', unit: 'Min PSI' },
  { name: 'Snubbing Balance Point', formula: 'WHP (psi) × Area (sq in) / Tool Weight (lbs)', unit: 'Factor' }
];