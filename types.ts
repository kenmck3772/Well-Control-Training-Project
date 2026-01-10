export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  SIMULATOR = 'SIMULATOR',
  LEARNING_CENTER = 'LEARNING_CENTER',
  QUIZ = 'QUIZ'
}

export enum UnitSystem {
  IMPERIAL = 'IMPERIAL',
  METRIC = 'METRIC'
}

export enum SimulationMode {
  STANDARD_KILL = 'STANDARD_KILL',
  GAS_MIGRATION = 'GAS_MIGRATION',
  STRIPPING = 'STRIPPING',
  INTERVENTION_PRESSURE_TEST = 'INTERVENTION_PRESSURE_TEST',
  SLICKLINE_OPERATION = 'SLICKLINE_OPERATION',
  WIRELINE_OPERATION = 'WIRELINE_OPERATION',
  COILED_TUBING_MILLING = 'COILED_TUBING_MILLING',
  SNUBBING_OPERATION = 'SNUBBING_OPERATION',
  MPD_CONTROL = 'MPD_CONTROL'
}

export type SimStatus = 'READY' | 'RUNNING' | 'PAUSED';

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'Fundamentals' | 'Calculations' | 'Equipment' | 'Operations' | 'Intervention';
  lessonPrompt: string;
  objectives: string[];
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  category: 'Equipment' | 'Physics' | 'Operations';
}

export interface KillSheetData {
  currentMudWeight: number;
  scrPressure: number;
  sidpp: number;
  sicp: number;
  tvd: number;
  measuredDepth: number;
  shoeTVD: number;
  leakOffTestMW: number;
  drillStringCapacity: number;
  drillStringLength: number;
  annulusCapacity: number;
  surfaceTemp: number;
  bottomHoleTemp: number;
  ambientTemp: number;
  atmPressure: number;
  expectedDuration: number;
  fluidType: 'WBM' | 'OBM';
  rigPowerSource: 'Diesel' | 'Hybrid' | 'Grid';
}

export interface KillSheetCalculatorProps {
  initialData: KillSheetData;
}

export interface SavedScenario {
  id: string;
  name: string;
  data: KillSheetData;
  timestamp: string;
}

export interface CalculationResults {
  killMudWeight: number;
  icp: number;
  fcp: number;
  drillStringVolume: number;
  annulusVolume: number;
  strokesToBit: number;
  maasp: number;
  pressureSchedule: { strokes: number; pressure: number }[];
  co2eTotal: number;
  co2eBreakdown: {
    power: number;
    fluid: number;
    weight: number;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TrackProgress {
  trackId: string;
  title: string;
  completed: number;
  total: number;
  status: 'active' | 'locked' | 'completed';
}