import React, { useState, useEffect, useMemo, useReducer, useRef } from 'react';
import { KillSheetData, CalculationResults, SimulationMode, KillSheetCalculatorProps, SimStatus, UnitSystem } from '../types';
import { PUMP_OUTPUT, TECHNICAL_FORMULAS, EMISSIONS } from '../constants';
import { AITutor } from './AITutor';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  ReferenceLine,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { 
  Play, 
  Pause, 
  Activity, 
  Waves, 
  ShieldAlert, 
  Settings2, 
  RotateCw, 
  X, 
  AlertTriangle, 
  HardHat, 
  MonitorCheck, 
  Zap, 
  GaugeCircle, 
  Target, 
  Radio, 
  ChevronDown, 
  Terminal, 
  MousePointer2, 
  Brain, 
  MoveUp, 
  MoveDown, 
  Scale, 
  ChevronUp, 
  ListFilter, 
  FileText, 
  Calculator, 
  TableProperties, 
  CircleSlash, 
  ToggleRight, 
  ToggleLeft, 
  BookOpenCheck, 
  Flame, 
  ArrowBigDownDash, 
  Rotate3d, 
  Navigation,
  Lock,
  Timer,
  Circle,
  Leaf,
  Cloud,
  Clock,
  Activity as PulseIcon,
  PowerOff,
  RefreshCw,
  Thermometer,
  ArrowDownToLine,
  Droplets,
  BarChart3,
  Weight,
  Cpu,
  CircleEqual,
  ShieldHalf,
  GanttChartSquare,
  Repeat,
  ChevronRightCircle,
  Wind,
  ThermometerSnowflake,
  Database,
  ArrowRightLeft,
  Settings,
  ShieldX,
  ThermometerSun
} from 'lucide-react';

// --- Simulation Constants & Physics ---
const BASE_GAS_VOLUME = 10.0;
const SLICKLINE_TOOL_WEIGHT_LBS = 450;
const WIRELINE_TOOL_WEIGHT_LBS = 850;
const GAS_MIGRATION_BASE_SPEED = 1.25; 

// Stripping Operation Physics Constants
const PIPE_AREA_SQIN = 15.9;
const PIPE_WEIGHT_LBF_FT = 16.6;
const STRIPPING_FRICTION_LBF = 7500;

// --- Conversion Constants ---
const CONV = {
  PSI_TO_BAR: 0.0689476,
  PPG_TO_SG: 0.119826,
  FT_TO_M: 0.3048,
  BBL_TO_M3: 0.158987,
  LBF_TO_KG: 0.453592,
  BBLFT_TO_M3M: 0.158987 / 0.3048, // (bbl/ft) to (m3/m)
};

const TOOLTIP_DATA: Record<string, string> = {
  killMudWeight: "Required mud density to balance formation pressure. Formula: OMW + (SIDPP / (0.052 × TVD)).",
  maasp: "Max Allowable Annulus Surface Pressure. Surface pressure limit to avoid fracturing the formation at the shoe.",
  gasDepth: "Current vertical depth of the migrating gas bubble. Essential for volumetric calculations.",
  icp: "Initial Circulating Pressure. The pressure required to start circulating the kill mud. Formula: SIDPP + SCR.",
  fcp: "Final Circulating Pressure. The pressure required when kill mud reaches the bit. Formula: SCR × (KMW / OMW).",
  esd: "FUNCTION: Automated emergency sequence that secures the wellbore immediately.",
  simSpeed: "Global simulation time multiplier. Controls the rate of pressure transients.",
  safetyLock: "AUTOMATED LOCK: Engaged when surface pressure exceeds MAASP.",
  co2e: "Carbon Dioxide Equivalent (CO2e). Total estimated greenhouse gas emissions based on rig power source, base fluid choice, and weighting agent consumption (Barite).",
  hookLoad: "The net downward force measured by the weight indicator. In stripping, this accounts for buoyant weight, pressure force, and stripping friction.",
  ambientTemp: "Air temperature at the rig site. Extremes affect equipment efficiency and hydraulic response times.",
  atmPressure: "Local atmospheric pressure. Essential for calculating absolute gas expansion in wellbore transients.",
  surfaceTemp: "The temperature at the wellhead. Influences gas density and thermal gradients.",
  bottomHoleTemp: "The temperature at the bottom of the well. Critical for calculating gas expansion during migration.",
  annular: "Annular Preventer: A flexible seal that can close around any pipe size or the open hole. Used as the first line of secondary well control.",
  pipeRam: "Pipe Rams: Mechanical blocks designed to close specifically around drill pipe. Provides a high-pressure mechanical seal.",
  blindRam: "Blind Rams: Large mechanical blocks that close the entire wellbore when no pipe is present. Essential for full shut-in.",
  shearRam: "Shear Rams: Emergency mechanical blocks equipped with blades to cut through drill pipe and seal the wellbore completely.",
  chokeValve: "Choke Valve: Controls fluid flow and maintains backpressure during circulation to keep Bottom Hole Pressure constant.",
  killValve: "Kill Valve: Entry point for pumping heavy mud directly into the annulus to regain hydrostatic control."
};

const Tooltip: React.FC<{ id: string; children: React.ReactNode; position?: 'top' | 'bottom' | 'left' | 'right' }> = ({ id, children, position = 'top' }) => {
  const positionClasses = {
    top: 'bottom-full mb-4 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-4 left-1/2 -translate-x-1/2',
    left: 'right-full mr-4 top-1/2 -translate-y-1/2',
    right: 'left-full ml-4 top-1/2 -translate-y-1/2'
  };

  return (
    <div className="group relative inline-flex w-full">
      {children}
      <div className={`absolute ${positionClasses[position]} w-64 p-5 bg-[#0f172a] backdrop-blur-2xl text-white rounded-[1.5rem] shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[200] border border-white/10 pointer-events-none scale-90 group-hover:scale-100 origin-center`}>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2 pb-2.5 border-b border-white/5">
            <BookOpenCheck size={12} className="text-blue-400" />
            <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] font-mono">WellTegra Data Node</span>
          </div>
          <p className="text-[10px] font-medium leading-relaxed text-slate-300">
            {TOOLTIP_DATA[id] || "Technical parameter for well control calculations."}
          </p>
        </div>
      </div>
    </div>
  );
};

type ValveState = 'OPEN' | 'CLOSED';
type StripDirection = 'IN' | 'OUT' | 'NONE';

interface HistoryEvent {
  id: string;
  timestamp: number;
  type: 'SYSTEM' | 'OPS' | 'ALARM' | 'SUCCESS' | 'TEST' | 'STRIP' | 'MILLING' | 'GAS' | 'VOLUMETRIC' | 'SNUBBING' | 'PARAMETER' | 'EMERGENCY';
  message: string;
  severity: 'info' | 'warning' | 'danger' | 'success';
}

interface SimulationState {
  status: SimStatus;
  mode: SimulationMode;
  speed: number; 
  surfacePressure: number;  
  gasDepth: number; 
  gasVolume: number; 
  targetPressure: number;
  toolDepth: number;
  indicatedWeight: number;
  upwardForce: number;
  downwardForce: number;
  winchDirection: StripDirection;
  winchSpeed: number; 
  millSpeed: number; 
  circRate: number; 
  chokePosition: number; 
  currentStrokes: number;
  valves: {
    choke: ValveState;
    kill: ValveState;
    annular: ValveState;
    pipeRam: ValveState;
    shearRam: ValveState;
    blindRam: ValveState;
  };
  rigFloor: {
    drawworks: 'ENGAGED' | 'DISENGAGED';
    topDrive: 'ACTIVE' | 'IDLE';
    rotaryTable: 'ROTATING' | 'STATIONARY';
  };
  history: HistoryEvent[];
  pressureHistory: { time: number; pressure: number; target: number }[];
  initialBHP: number;
}

type SimulationAction = 
  | { type: 'TICK'; results: CalculationResults; data: KillSheetData }
  | { type: 'SET_STATUS'; status: SimStatus }
  | { type: 'SET_MODE'; mode: SimulationMode; data: KillSheetData }
  | { type: 'SET_SPEED'; value: number }
  | { type: 'SET_WINCH_SPEED'; value: number }
  | { type: 'SET_CHOKE_POSITION'; value: number }
  | { type: 'TOGGLE_VALVE'; component: keyof SimulationState['valves'] }
  | { type: 'EMERGENCY_SEQUENCE' }
  | { type: 'SET_WINCH_DIR'; direction: StripDirection }
  | { type: 'SET_MILL_SPEED'; value: number }
  | { type: 'SET_CIRC_RATE'; value: number }
  | { type: 'TOGGLE_DRAWWORKS' }
  | { type: 'TOGGLE_ROTATION' }
  | { type: 'BLEED_PRESSURE'; amount: number }
  | { type: 'LOG_EVENT'; message: string; severity?: HistoryEvent['severity']; eventType?: HistoryEvent['type'] };

const INITIAL_STATE: SimulationState = {
  status: 'READY',
  mode: SimulationMode.STANDARD_KILL,
  speed: 1.0,
  surfacePressure: 0,
  gasDepth: 8000, 
  gasVolume: BASE_GAS_VOLUME,
  targetPressure: 3500, 
  toolDepth: 0,
  indicatedWeight: SLICKLINE_TOOL_WEIGHT_LBS,
  upwardForce: 0,
  downwardForce: SLICKLINE_TOOL_WEIGHT_LBS,
  winchDirection: 'NONE',
  winchSpeed: 100,
  millSpeed: 0,
  circRate: 0,
  chokePosition: 0,
  currentStrokes: 0,
  valves: {
    choke: 'CLOSED', 
    kill: 'CLOSED',
    annular: 'OPEN',
    pipeRam: 'OPEN',
    shearRam: 'OPEN',
    blindRam: 'OPEN',
  },
  rigFloor: {
    drawworks: 'DISENGAGED',
    topDrive: 'IDLE',
    rotaryTable: 'STATIONARY',
  },
  history: [{ id: 'init', timestamp: Date.now(), type: 'SYSTEM', message: 'WellTegra Core Systems Online.', severity: 'info' }],
  pressureHistory: [],
  initialBHP: 0
};

const BopStackGraphic: React.FC<{ valves: SimulationState['valves'] }> = ({ valves }) => {
  return (
    <div className="flex flex-col items-center gap-0.5 scale-90 -translate-y-4">
      <div className="relative group/annular">
        <div className={`w-14 h-8 rounded-t-xl border-x-2 border-t-2 transition-all duration-700 ${valves.annular === 'CLOSED' ? 'bg-orange-600/40 border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]' : 'bg-slate-800/40 border-slate-700'}`}>
           <div className={`absolute inset-x-1 top-2 h-4 transition-all duration-1000 ${valves.annular === 'CLOSED' ? 'bg-orange-400 scale-x-[0.2]' : 'bg-slate-600 scale-x-90'} rounded-sm`} />
        </div>
        <div className="absolute -right-8 top-1/2 -translate-y-1/2 text-[5px] font-black text-slate-500 uppercase tracking-widest font-mono">Annular</div>
      </div>
      <div className="relative">
        <div className={`w-16 h-7 bg-slate-900 border-2 transition-colors duration-500 ${valves.shearRam === 'CLOSED' || valves.blindRam === 'CLOSED' ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.2)]' : 'border-slate-800'} flex items-center justify-between px-1`}>
           <div className={`w-[45%] h-4 transition-all duration-500 ${valves.shearRam === 'CLOSED' || valves.blindRam === 'CLOSED' ? 'translate-x-[5%] bg-red-600' : '-translate-x-full bg-slate-700 opacity-20'}`} />
           <div className={`w-[45%] h-4 transition-all duration-500 ${valves.shearRam === 'CLOSED' || valves.blindRam === 'CLOSED' ? '-translate-x-[5%] bg-red-600' : 'translate-x-full bg-slate-700 opacity-20'}`} />
        </div>
        <div className="absolute -left-10 top-1/2 -translate-y-1/2 text-[5px] font-black text-slate-500 uppercase tracking-widest font-mono">SR/BR</div>
      </div>
      <div className="relative">
        <div className={`w-16 h-7 bg-slate-900 border-2 transition-colors duration-500 ${valves.pipeRam === 'CLOSED' ? 'border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.2)]' : 'border-slate-800'} flex items-center justify-between px-1`}>
           <div className={`w-[42%] h-4 transition-all duration-500 ${valves.pipeRam === 'CLOSED' ? 'bg-blue-600' : '-translate-x-full bg-slate-700 opacity-20'} rounded-r-lg`} />
           <div className={`w-[42%] h-4 transition-all duration-500 ${valves.pipeRam === 'CLOSED' ? 'bg-blue-600' : 'translate-x-full bg-slate-700 opacity-20'} rounded-l-lg`} />
        </div>
        <div className="absolute -right-10 top-1/2 -translate-y-1/2 text-[5px] font-black text-slate-500 uppercase tracking-widest font-mono">Pipe Ram</div>
      </div>
      <div className="relative w-16 h-6 bg-slate-800/80 border-x-2 border-slate-700 flex items-center justify-between">
         <div className="absolute -left-4 flex items-center">
            <div className={`w-4 h-1.5 transition-colors ${valves.kill === 'OPEN' ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-slate-700'}`} />
            <div className={`w-2 h-2 rounded-full transition-colors ${valves.kill === 'OPEN' ? 'bg-emerald-400' : 'bg-slate-900 border border-slate-700'}`} />
         </div>
         <div className="absolute -right-4 flex items-center">
            <div className={`w-2 h-2 rounded-full transition-colors ${valves.choke === 'OPEN' ? 'bg-blue-400 shadow-[0_0_5px_#60a5fa]' : 'bg-slate-900 border border-slate-700'}`} />
            <div className={`w-4 h-1.5 transition-colors ${valves.choke === 'OPEN' ? 'bg-blue-500 shadow-[0_0_5px_#3b82f6]' : 'bg-slate-700'}`} />
         </div>
         <div className="w-full h-full flex items-center justify-center">
            <div className="w-1.5 h-full bg-slate-950 opacity-40" />
         </div>
      </div>
      <div className="w-20 h-2 bg-slate-900 rounded-sm border-x border-slate-700 shadow-lg" />
    </div>
  );
};

const WellboreVisualizer: React.FC<{
  gasDepth: number;
  totalDepth: number;
  shoeDepth: number;
  gasVolume: number;
  mode: SimulationMode;
  toolDepth: number;
  valves: SimulationState['valves'];
  onToggleValve: (comp: keyof SimulationState['valves']) => void;
  onEmergencySequence: () => void;
}> = ({ gasDepth, totalDepth, shoeDepth, gasVolume, mode, toolDepth, valves, onToggleValve, onEmergencySequence }) => {
  const shoePos = (shoeDepth / totalDepth) * 100;
  const toolPos = (toolDepth / totalDepth) * 100;
  const isMilling = mode === SimulationMode.COILED_TUBING_MILLING;
  const isMigration = mode === SimulationMode.GAS_MIGRATION;
  const isStripping = mode === SimulationMode.STRIPPING;
  const gasPos = (gasDepth / totalDepth) * 100;
  
  const volFactor = gasVolume / BASE_GAS_VOLUME;
  const bubbleWidth = Math.min(90, 40 * Math.pow(volFactor, 0.5));

  return (
    <div className="w-72 bg-[#020617] border-l border-white/5 relative flex flex-col items-center py-8 group shrink-0 shadow-2xl">
      <div className="absolute inset-x-4 top-4 h-[440px] bg-[#0f172a]/95 rounded-[2.5rem] border border-white/10 z-50 p-4 flex flex-col gap-2.5 backdrop-blur-3xl shadow-2xl transition-all hover:border-white/20">
         <div className="flex justify-between items-center px-2 mb-2">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-blue-400 uppercase tracking-[0.25em] font-sans">BOP Control</span>
              <span className="text-[6px] font-black text-slate-500 uppercase tracking-widest font-mono">Master Console Alpha</span>
            </div>
            <Activity size={10} className="text-emerald-500 animate-pulse" />
         </div>
         {['annular', 'pipeRam', 'shearRam', 'blindRam'].map((valve) => {
           const label = valve.charAt(0).toUpperCase() + valve.slice(1).replace('Ram', ' Ram');
           const isClosed = valves[valve as keyof SimulationState['valves']] === 'CLOSED';
           const isShear = valve === 'shearRam';
           const isBlind = valve === 'blindRam';
           return (
             <Tooltip key={valve} id={valve} position="left">
               <button onClick={() => onToggleValve(valve as any)} className="group relative h-12 w-full bg-slate-800/20 rounded-[1rem] border border-white/5 overflow-hidden flex items-center justify-center transition-all hover:bg-slate-700/30">
                 {valve === 'annular' ? (
                   <>
                     <div className={`absolute inset-0 transition-all duration-700 ${isClosed ? 'bg-orange-500/10' : 'opacity-0'}`} />
                     <div className="relative w-8 h-8 flex items-center justify-center">
                       <div className={`absolute inset-0 rounded-full border-2 border-slate-600 transition-all duration-700 ${isClosed ? 'scale-110 border-orange-500/50' : ''}`} />
                       <div className={`absolute inset-0 rounded-full bg-slate-900 border-[4px] border-slate-800 transition-all duration-1000 ${isClosed ? 'scale-[0.4] border-orange-500 shadow-[0_0_15px_#f97316]' : 'scale-[0.8]'}`} />
                     </div>
                   </>
                 ) : (
                   <>
                     <div className={`absolute left-0 top-0 bottom-0 bg-gradient-to-r ${isShear ? 'from-red-900/60' : isBlind ? 'from-blue-900/60' : 'from-slate-700/60'} to-transparent transition-all duration-500 ease-in-out border-r border-white/10 ${isClosed ? 'w-[48%]' : 'w-0'}`} />
                     <div className={`absolute right-0 top-0 bottom-0 bg-gradient-to-l ${isShear ? 'from-red-900/60' : isBlind ? 'from-blue-900/60' : 'from-slate-700/60'} to-transparent transition-all duration-500 ease-in-out border-l border-white/10 ${isClosed ? 'w-[48%]' : 'w-0'}`} />
                   </>
                 )}
                 <span className={`relative z-10 text-[7px] font-black uppercase tracking-[0.2em] transition-all ${isClosed ? (isShear ? 'text-red-400' : 'text-white scale-105') : 'text-slate-500 group-hover:text-slate-300'}`}>{label}</span>
               </button>
             </Tooltip>
           );
         })}
         <div className="grid grid-cols-2 gap-3 mt-auto mb-2 px-1">
            {['choke', 'kill'].map(v => (
              <Tooltip key={v} id={v === 'choke' ? 'chokeValve' : 'killValve'} position="bottom">
                <button onClick={() => onToggleValve(v as any)} className={`group w-full flex flex-col items-center justify-center gap-2 p-2.5 rounded-[1.25rem] border transition-all duration-500 ${valves[v as keyof SimulationState['valves']] === 'OPEN' ? 'bg-blue-500/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-slate-900/60 border-white/5'}`}>
                  <div className={`relative p-1.5 rounded-lg transition-all duration-500 ${valves[v as keyof SimulationState['valves']] === 'OPEN' ? 'text-blue-400 rotate-180' : 'text-slate-600'}`}>
                    <Settings2 size={14} className={valves[v as keyof SimulationState['valves']] === 'OPEN' ? 'animate-spin-slow' : ''} />
                  </div>
                  <span className={`text-[6px] font-black uppercase tracking-[0.2em] ${valves[v as keyof SimulationState['valves']] === 'OPEN' ? 'text-blue-400' : 'text-slate-600'}`}>{v} Line</span>
                </button>
              </Tooltip>
            ))}
         </div>
         <div className="pt-2 border-t border-white/5">
           <Tooltip id="esd" position="bottom">
             <button onClick={onEmergencySequence} className="w-full bg-red-600 hover:bg-red-500 active:scale-95 text-white rounded-[1rem] py-3.5 px-2 flex items-center justify-center gap-2 transition-all shadow-xl shadow-red-900/30 group/esd">
               <PowerOff size={12} className="group-hover/esd:animate-pulse" />
               <span className="text-[8px] font-black uppercase tracking-[0.3em]">ESD Sequence</span>
             </button>
           </Tooltip>
         </div>
      </div>
      <div className="absolute inset-x-16 top-6 bottom-6 bg-black border-x-2 border-[#1e293b] rounded-b-[2rem] overflow-hidden shadow-[inset_0_0_80px_rgba(0,0,0,1)] z-10">
        <div className="absolute top-2 inset-x-0 z-40">
           <BopStackGraphic valves={valves} />
        </div>
        <div className="absolute inset-x-0 border-b border-orange-500/40 z-20 transition-all duration-1000" style={{ top: `${shoePos}%` }}>
           <div className="absolute right-[-45px] top-[-8px] text-[6px] font-black text-orange-400/80 uppercase font-mono bg-black/60 px-1.5 py-0.5 rounded border border-orange-500/20">Shoe Matrix</div>
        </div>
        {isMigration && gasDepth > 0 && (
          <div className="absolute left-1/2 -translate-x-1/2 transition-all duration-500 z-30" style={{ top: `${gasPos}%`, width: `${bubbleWidth}%` }}>
            <div className="w-full h-8 bg-blue-500/20 rounded-full border border-blue-400/30 shadow-[0_0_40px_rgba(59,130,246,0.4)] flex items-center justify-center animate-pulse">
               <Waves className="text-blue-300/40" size={14} />
            </div>
          </div>
        )}
        <div className={`absolute left-1/2 -translate-x-1/2 w-3.5 transition-all duration-500 ease-out z-40 ${isMilling ? 'bg-blue-600' : isStripping ? 'bg-orange-500' : 'bg-slate-700'} border-x border-white/10`} style={{ top: 0, height: `${toolPos}%` }}>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 flex flex-col items-center group/bit">
             <div className={`w-8 h-8 rounded-[0.75rem] ${isMilling ? 'bg-blue-400' : isStripping ? 'bg-orange-600' : 'bg-slate-600'} border border-white/30 flex items-center justify-center relative transition-transform group-hover/bit:scale-110 shadow-lg`}>
                {isMilling ? <RotateCw size={14} className="text-white animate-spin" /> : isStripping ? <ArrowDownToLine size={14} className="text-white" /> : <Target size={14} className="text-slate-300" />}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const simReducer = (state: SimulationState, action: SimulationAction): SimulationState => {
  const log = (type: HistoryEvent['type'], message: string, severity: HistoryEvent['severity'] = 'info'): HistoryEvent => ({
    id: crypto.randomUUID(), timestamp: Date.now(), type, message, severity
  });

  switch (action.type) {
    case 'SET_STATUS': 
      return { ...state, status: action.status, history: [log('SYSTEM', `Simulation ${action.status.toLowerCase()}.`, action.status === 'RUNNING' ? 'success' : 'warning'), ...state.history].slice(0, 100) };
    case 'SET_MODE': {
      const isGasMigration = action.mode === SimulationMode.GAS_MIGRATION;
      const isStripping = action.mode === SimulationMode.STRIPPING;
      const mudGradient = 0.052 * action.data.currentMudWeight;
      const initialBHP = (mudGradient * action.data.tvd) + action.data.sidpp;
      return { 
        ...INITIAL_STATE, 
        mode: action.mode, 
        status: 'READY', 
        initialBHP,
        surfacePressure: isGasMigration || isStripping ? action.data.sidpp : 0,
        gasDepth: isGasMigration ? action.data.tvd : 0,
        toolDepth: isStripping ? 500 : 0,
        history: [log('SYSTEM', `Wellbore profile updated: ${action.mode.replace(/_/g, ' ')} method engaged.`, 'info'), ...state.history].slice(0, 100) 
      };
    }
    case 'SET_SPEED': return { ...state, speed: action.value };
    case 'SET_WINCH_SPEED': return { ...state, winchSpeed: action.value };
    case 'SET_CHOKE_POSITION': return { ...state, chokePosition: action.value };
    case 'SET_WINCH_DIR': return { ...state, winchDirection: action.direction };
    case 'SET_MILL_SPEED': return { ...state, millSpeed: action.value };
    case 'SET_CIRC_RATE': return { ...state, circRate: action.value };
    case 'LOG_EVENT': return { ...state, history: [log(action.eventType || 'SYSTEM', action.message, action.severity || 'info'), ...state.history].slice(0, 100) };
    case 'BLEED_PRESSURE': {
      const nextSurface = Math.max(0, state.surfacePressure - action.amount);
      return {
        ...state,
        surfacePressure: nextSurface,
        history: [log('VOLUMETRIC', `Pressure bleed successful: ${action.amount} PSI reduction verified.`, 'info'), ...state.history].slice(0, 100)
      };
    }
    case 'TOGGLE_DRAWWORKS': {
        const nextDir: StripDirection = state.winchDirection === 'IN' ? 'NONE' : 'IN';
        return { 
          ...state, 
          winchDirection: nextDir, 
          rigFloor: { ...state.rigFloor, drawworks: nextDir !== 'NONE' ? 'ENGAGED' : 'DISENGAGED' } 
        };
    }
    case 'TOGGLE_ROTATION': {
        const nextSpeed = state.millSpeed > 0 ? 0 : 60;
        return { 
          ...state, 
          millSpeed: nextSpeed, 
          rigFloor: { ...state.rigFloor, topDrive: nextSpeed > 0 ? 'ACTIVE' : 'IDLE', rotaryTable: nextSpeed > 0 ? 'ROTATING' : 'STATIONARY' } 
        };
    }
    case 'TOGGLE_VALVE': {
      const nextValves = { ...state.valves, [action.component]: state.valves[action.component] === 'OPEN' ? 'CLOSED' : 'OPEN' };
      return { ...state, valves: nextValves, history: [log('OPS', `${action.component} valve state change: ${nextValves[action.component]}`, 'info'), ...state.history].slice(0, 100) };
    }
    case 'EMERGENCY_SEQUENCE': {
      const isPipePresent = state.toolDepth > 0;
      const nextValves = { 
        ...state.valves, 
        annular: 'CLOSED' as ValveState, 
        pipeRam: isPipePresent ? 'CLOSED' as ValveState : state.valves.pipeRam, 
        blindRam: !isPipePresent ? 'CLOSED' as ValveState : state.valves.blindRam 
      };
      return { 
        ...state, 
        status: 'PAUSED', 
        valves: nextValves, 
        history: [log('EMERGENCY', `ESD TRIGGERED: Wellbore secured. ${isPipePresent ? 'Pipe Rams verified closed.' : 'Blind Rams verified closed.'}`, 'danger'), ...state.history].slice(0, 100) 
      };
    }
    case 'TICK': {
      if (state.status !== 'RUNNING') return state;
      const { data, results } = action;
      let nextSurface = state.surfacePressure;
      let nextDepth = state.toolDepth;
      let nextGasDepth = state.gasDepth;
      let nextGasVolume = state.gasVolume;
      let nextStrokes = state.currentStrokes;
      let nextIndicatedWeight = state.indicatedWeight;
      let nextUpwardForce = state.upwardForce;
      let nextDownwardForce = state.downwardForce;
      let newEvents: HistoryEvent[] = [];
      let nextStatus: SimStatus = state.status;
      
      // GRANULAR EQUIPMENT EFFICIENCY BASED ON AMBIENT TEMP
      const equipmentEfficiency = data.ambientTemp < 20 ? 0.60 : data.ambientTemp < 40 ? 0.80 : data.ambientTemp > 115 ? 0.75 : 1.0;
      
      if (nextSurface > results.maasp) {
        nextStatus = 'PAUSED';
        newEvents.push(log('ALARM', 'MAASP BREACH DETECTED. AUTO-LOCK ENGAGED.', 'danger'));
      }
      if (state.winchDirection !== 'NONE') {
        const baseVelocity = (state.winchSpeed / 60) * state.speed;
        const velocity = baseVelocity * equipmentEfficiency;
        nextDepth = Math.max(0, Math.min(data.tvd, nextDepth + (state.winchDirection === 'IN' ? velocity : -velocity)));
      }
      if (state.mode === SimulationMode.STANDARD_KILL) nextStrokes += 10 * state.speed * equipmentEfficiency;
      if (state.mode === SimulationMode.STRIPPING) {
        const buoyancyFactor = 1 - (data.currentMudWeight / 65.5);
        nextDownwardForce = nextDepth * PIPE_WEIGHT_LBF_FT * buoyancyFactor;
        nextUpwardForce = nextSurface * PIPE_AREA_SQIN;
        const frictionEffect = state.winchDirection !== 'NONE' ? STRIPPING_FRICTION_LBF : 0;
        const resultant = nextDownwardForce - nextUpwardForce;
        if (state.winchDirection === 'IN') {
           nextIndicatedWeight = resultant - frictionEffect;
        } else if (state.winchDirection === 'OUT') {
           nextIndicatedWeight = resultant + frictionEffect;
        } else {
           nextIndicatedWeight = resultant;
        }
      }
      if (state.mode === SimulationMode.GAS_MIGRATION && nextGasDepth > 0) {
        const mudGradient = 0.052 * data.currentMudWeight;
        const migrationRate = GAS_MIGRATION_BASE_SPEED * state.speed;
        
        // Dynamic Thermal Gradient for expansion
        const currentTemp = data.surfaceTemp + (data.bottomHoleTemp - data.surfaceTemp) * (nextGasDepth / data.tvd);
        const prevTemp = data.surfaceTemp + (data.bottomHoleTemp - data.surfaceTemp) * (state.gasDepth / data.tvd);
        
        const hydroAbove = mudGradient * state.gasDepth;
        const hydroAboveNext = mudGradient * (state.gasDepth - migrationRate);
        const p1_abs = state.surfacePressure + hydroAbove + data.atmPressure;
        
        nextGasDepth = Math.max(0, state.gasDepth - migrationRate);
        if (state.valves.choke === 'CLOSED') {
          const pressureIncrease = migrationRate * mudGradient;
          nextSurface += pressureIncrease;
        } else {
          const bleedFactor = (state.chokePosition / 100) * 150 * state.speed * equipmentEfficiency;
          const targetSurface = Math.max(0, state.surfacePressure - bleedFactor);
          const p2_abs = targetSurface + hydroAboveNext + data.atmPressure;
          const t1_abs = prevTemp + 460; // Rankine
          const t2_abs = currentTemp + 460; // Rankine
          
          if (p2_abs > 0 && p1_abs > 0) {
            // Boyle's and Charles' Law Combined for Influx Expansion
            const expansionFactor = (p1_abs / p2_abs) * (t2_abs / t1_abs);
            nextGasVolume = state.gasVolume * expansionFactor;
            nextSurface = targetSurface;
          }
        }
      }
      return {
        ...state,
        status: nextStatus,
        toolDepth: nextDepth,
        gasDepth: nextGasDepth,
        gasVolume: nextGasVolume,
        surfacePressure: nextSurface,
        currentStrokes: nextStrokes,
        indicatedWeight: nextIndicatedWeight,
        upwardForce: nextUpwardForce,
        downwardForce: nextDownwardForce,
        history: [...newEvents, ...state.history].slice(0, 100),
        pressureHistory: [...state.pressureHistory, { time: Date.now(), pressure: nextSurface, target: state.targetPressure }].slice(-100)
      };
    }
    default: return state;
  }
};

export const KillSheetCalculator: React.FC<KillSheetCalculatorProps> = ({ initialData }) => {
  const [data, setData] = useState<KillSheetData>(initialData);
  const [simState, dispatch] = useReducer(simReducer, INITIAL_STATE);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(UnitSystem.IMPERIAL);
  const [isAICoachOpen, setIsAICoachOpen] = useState(false);
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(true);
  const [isSustainabilityCollapsed, setIsSustainabilityCollapsed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Technical Formatting & Unit Management ---
  const fmt = useMemo(() => ({
    // Output formatters based on UnitSystem
    press: (v: number) => unitSystem === UnitSystem.METRIC ? (v * CONV.PSI_TO_BAR).toFixed(1) : Math.round(v).toString(),
    pUnit: () => unitSystem === UnitSystem.METRIC ? 'BAR' : 'PSI',
    weight: (v: number) => unitSystem === UnitSystem.METRIC ? (v * CONV.PPG_TO_SG).toFixed(2) : v.toFixed(2),
    wUnit: () => unitSystem === UnitSystem.METRIC ? 'SG' : 'PPG',
    depth: (v: number) => unitSystem === UnitSystem.METRIC ? (v * CONV.FT_TO_M).toFixed(0) : Math.round(v).toString(),
    dUnit: () => unitSystem === UnitSystem.METRIC ? 'M' : 'FT',
    vol: (v: number) => unitSystem === UnitSystem.METRIC ? (v * CONV.BBL_TO_M3).toFixed(2) : v.toFixed(2),
    vUnit: () => unitSystem === UnitSystem.METRIC ? 'M³' : 'BBLS',
    force: (v: number) => unitSystem === UnitSystem.METRIC ? (v * CONV.LBF_TO_KG).toFixed(0) : Math.round(v).toString(),
    fUnit: () => unitSystem === UnitSystem.METRIC ? 'KG' : 'LBF',
    temp: (v: number) => unitSystem === UnitSystem.METRIC ? ((v - 32) * 5/9).toFixed(1) : Math.round(v).toString(),
    tUnit: () => unitSystem === UnitSystem.METRIC ? '°C' : '°F',
    cap: (v: number) => unitSystem === UnitSystem.METRIC ? (v * CONV.BBLFT_TO_M3M).toFixed(4) : v.toFixed(4),
    cUnit: () => unitSystem === UnitSystem.METRIC ? 'M³/M' : 'BBL/FT',
    
    // Input un-formatters (convert back to Imperial for internal engine)
    toImpPress: (v: string) => {
      const n = parseFloat(v) || 0;
      return unitSystem === UnitSystem.METRIC ? n / CONV.PSI_TO_BAR : n;
    },
    toImpWeight: (v: string) => {
      const n = parseFloat(v) || 0;
      return unitSystem === UnitSystem.METRIC ? n / CONV.PPG_TO_SG : n;
    },
    toImpDepth: (v: string) => {
      const n = parseFloat(v) || 0;
      return unitSystem === UnitSystem.METRIC ? n / CONV.FT_TO_M : n;
    },
    toImpTemp: (v: string) => {
      const n = parseFloat(v) || 0;
      return unitSystem === UnitSystem.METRIC ? (n * 9/5) + 32 : n;
    },
    toImpCap: (v: string) => {
      const n = parseFloat(v) || 0;
      return unitSystem === UnitSystem.METRIC ? n / CONV.BBLFT_TO_M3M : n;
    }
  }), [unitSystem]);

  const results: CalculationResults = useMemo(() => {
    const { currentMudWeight, sidpp, tvd, leakOffTestMW, shoeTVD, scrPressure, measuredDepth, annulusCapacity, drillStringCapacity, drillStringLength, rigPowerSource, fluidType, expectedDuration } = data;
    const killMudWeight = currentMudWeight + (sidpp / (0.052 * tvd));
    const icp = sidpp + scrPressure;
    const fcp = scrPressure * (killMudWeight / currentMudWeight);
    const maasp = (leakOffTestMW - currentMudWeight) * 0.052 * shoeTVD;
    const totalVolume = (annulusCapacity * measuredDepth) + (drillStringCapacity * drillStringLength);
    const strokesToBit = Math.round((drillStringCapacity * drillStringLength) / PUMP_OUTPUT);
    const powerCO2 = expectedDuration * EMISSIONS.POWER[rigPowerSource];
    const fluidCO2 = totalVolume * EMISSIONS.FLUID_BASE[fluidType];
    const weightCO2 = totalVolume * Math.max(0, currentMudWeight - 8.33) * EMISSIONS.WEIGHTING_AGENT;
    return { 
      killMudWeight, icp, fcp, 
      drillStringVolume: drillStringCapacity * drillStringLength, annulusVolume: annulusCapacity * measuredDepth, 
      strokesToBit, maasp, pressureSchedule: [],
      co2eTotal: powerCO2 + fluidCO2 + weightCO2,
      co2eBreakdown: { power: powerCO2, fluid: fluidCO2, weight: weightCO2 }
    };
  }, [data]);

  const co2ChartData = useMemo(() => [
    { name: 'Power', value: results.co2eBreakdown.power, color: '#10b981' },
    { name: 'Fluid', value: results.co2eBreakdown.fluid, color: '#3b82f6' },
    { name: 'Weighting', value: results.co2eBreakdown.weight, color: '#8b5cf6' }
  ], [results.co2eBreakdown]);

  const isMaaspBreached = simState.surfacePressure > results.maasp;
  const currentBHP = simState.initialBHP + (simState.surfacePressure - data.sidpp);

  useEffect(() => {
    if (simState.status === 'RUNNING') {
      timerRef.current = setInterval(() => { dispatch({ type: 'TICK', results, data }); }, 100);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [simState.status, data, results]);

  const modeOptions = [
    { label: 'Well Kill', value: SimulationMode.STANDARD_KILL },
    { label: 'Gas Migration', value: SimulationMode.GAS_MIGRATION },
    { label: 'Stripping', value: SimulationMode.STRIPPING },
    { label: 'Slickline', value: SimulationMode.SLICKLINE_OPERATION },
    { label: 'Wireline', value: SimulationMode.WIRELINE_OPERATION },
    { label: 'Coiled Tubing', value: SimulationMode.COILED_TUBING_MILLING },
    { label: 'Snubbing', value: SimulationMode.SNUBBING_OPERATION },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 h-full bg-slate-50/50 p-6 overflow-hidden">
      
      {/* Sidebar: Technical Inputs */}
      <div className="xl:col-span-3 flex flex-col gap-8 overflow-y-auto pr-2 custom-scrollbar shrink-0">
        
        {/* Unit & Mode Selection Card */}
        <div className="bg-[#020617] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-6 opacity-10">
              <Database size={100} className="text-blue-500" />
           </div>
           <div className="relative z-10 space-y-8">
              <div>
                 <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.25em] block mb-4">Unit Control System</span>
                 <div className="bg-white/5 p-1 rounded-[1.25rem] flex border border-white/5">
                    <button onClick={() => setUnitSystem(UnitSystem.IMPERIAL)} className={`flex-1 py-3 rounded-[1rem] text-[10px] font-black tracking-widest transition-all ${unitSystem === UnitSystem.IMPERIAL ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>IMPERIAL</button>
                    <button onClick={() => setUnitSystem(UnitSystem.METRIC)} className={`flex-1 py-3 rounded-[1rem] text-[10px] font-black tracking-widest transition-all ${unitSystem === UnitSystem.METRIC ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>METRIC</button>
                 </div>
              </div>
              
              <div className="bg-white/5 rounded-[2rem] p-6 border border-white/5">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg"><GaugeCircle size={18} /></div>
                    <h3 className="font-black text-white uppercase tracking-tight text-[11px]">Primary Well Pressures</h3>
                 </div>
                 <div className="space-y-5">
                    <div>
                      <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest block font-mono mb-2">Mud Weight ({fmt.wUnit()})</label>
                      <input type="number" step="0.01" value={fmt.weight(data.currentMudWeight)} onChange={(e) => setData({...data, currentMudWeight: fmt.toImpWeight(e.target.value)})} className="bg-transparent text-white font-mono text-sm border-b border-white/10 outline-none w-full py-2 hover:border-blue-500 transition-colors" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] font-black text-emerald-400 uppercase tracking-widest block font-mono mb-2">SIDPP ({fmt.pUnit()})</label>
                        <input type="number" step="0.1" value={fmt.press(data.sidpp)} onChange={(e) => setData({...data, sidpp: fmt.toImpPress(e.target.value)})} className="bg-transparent text-white font-mono text-sm border-b border-white/10 outline-none w-full py-2 hover:border-emerald-500 transition-colors" />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-emerald-400 uppercase tracking-widest block font-mono mb-2">SICP ({fmt.pUnit()})</label>
                        <input type="number" step="0.1" value={fmt.press(data.sicp)} onChange={(e) => setData({...data, sicp: fmt.toImpPress(e.target.value)})} className="bg-transparent text-white font-mono text-sm border-b border-white/10 outline-none w-full py-2 hover:border-emerald-500 transition-colors" />
                      </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Environmental & Thermal Calculations Panel */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm space-y-8">
           <div>
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-orange-50 text-orange-600 rounded-xl"><ThermometerSun size={18} /></div>
                 <h3 className="font-black text-slate-900 uppercase tracking-tight text-[11px]">Thermal Gradient</h3>
              </div>
              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                   <Tooltip id="surfaceTemp" position="right">
                     <div className="bg-slate-50 rounded-[1.25rem] p-4 border border-slate-100 w-full">
                       <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-2">Surface ({fmt.tUnit()})</label>
                       <input type="number" step="0.1" value={fmt.temp(data.surfaceTemp)} onChange={(e) => setData({...data, surfaceTemp: fmt.toImpTemp(e.target.value)})} className="bg-transparent text-slate-900 font-mono text-sm border-none outline-none w-full" />
                     </div>
                   </Tooltip>
                   <Tooltip id="bottomHoleTemp" position="left">
                     <div className="bg-slate-50 rounded-[1.25rem] p-4 border border-slate-100 w-full">
                       <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-2">BHT ({fmt.tUnit()})</label>
                       <input type="number" step="0.1" value={fmt.temp(data.bottomHoleTemp)} onChange={(e) => setData({...data, bottomHoleTemp: fmt.toImpTemp(e.target.value)})} className="bg-transparent text-slate-900 font-mono text-sm border-none outline-none w-full" />
                     </div>
                   </Tooltip>
                 </div>
              </div>
           </div>

           <div className="pt-8 border-t border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Wind size={18} /></div>
                 <h3 className="font-black text-slate-900 uppercase tracking-tight text-[11px]">Surface Environment</h3>
              </div>
              <div className="space-y-5">
                 <Tooltip id="ambientTemp">
                   <div className="bg-slate-50 rounded-[1.25rem] p-4 border border-slate-100 w-full hover:bg-slate-100/50 transition-colors">
                     <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-2">Ambient Temp ({fmt.tUnit()})</label>
                     <input type="number" step="0.1" value={fmt.temp(data.ambientTemp)} onChange={(e) => setData({...data, ambientTemp: fmt.toImpTemp(e.target.value)})} className="bg-transparent text-slate-900 font-mono text-sm border-none outline-none w-full" />
                   </div>
                 </Tooltip>
                 <Tooltip id="atmPressure">
                   <div className="bg-slate-50 rounded-[1.25rem] p-4 border border-slate-100 w-full hover:bg-slate-100/50 transition-colors">
                     <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-2">Surface Pressure Baseline ({fmt.pUnit()})</label>
                     <input type="number" step="0.1" value={fmt.press(data.atmPressure)} onChange={(e) => setData({...data, atmPressure: fmt.toImpPress(e.target.value)})} className="bg-transparent text-slate-900 font-mono text-sm border-none outline-none w-full" />
                   </div>
                 </Tooltip>
              </div>
           </div>
        </div>

        {/* Dynamic Benchmarks Panel */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm space-y-4">
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Calculator size={18} /></div>
              <h3 className="font-black text-slate-900 uppercase tracking-tight text-[11px]">Operational Benchmarks</h3>
           </div>
           {[
             { id: 'icp', label: 'ICP', val: results.icp, unit: fmt.pUnit(), color: 'text-slate-900' },
             { id: 'fcp', label: 'FCP', val: results.fcp, unit: fmt.pUnit(), color: 'text-slate-900' },
             { id: 'killMudWeight', label: 'KMW', val: results.killMudWeight, unit: fmt.wUnit(), color: 'text-blue-600', isWeight: true },
             { id: 'maasp', label: 'MAASP', val: results.maasp, unit: fmt.pUnit(), color: 'text-red-600' }
           ].map(item => (
             <Tooltip key={item.id} id={item.id} position="right">
              <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0 w-full">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{item.label}</span>
                  <span className={`text-xs font-black font-mono ${item.color}`}>
                    {item.isWeight ? fmt.weight(item.val) : fmt.press(item.val)} <span className="text-[8px] opacity-40">{item.unit}</span>
                  </span>
              </div>
             </Tooltip>
           ))}
        </div>

        {/* Well Geometry Panel */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-white/5 shadow-xl text-white">
           <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-700 text-white rounded-xl"><Target size={18} /></div>
              <h3 className="font-black text-white uppercase tracking-tight text-[11px]">Well Geometry</h3>
           </div>
           <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-2">TVD ({fmt.dUnit()})</label>
                    <input type="number" step="1" value={fmt.depth(data.tvd)} onChange={(e) => setData({...data, tvd: fmt.toImpDepth(e.target.value)})} className="bg-transparent text-white font-mono text-sm border-b border-white/10 outline-none w-full py-1 hover:border-blue-500 transition-colors" />
                 </div>
                 <div>
                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-2">Shoe TVD ({fmt.dUnit()})</label>
                    <input type="number" step="1" value={fmt.depth(data.shoeTVD)} onChange={(e) => setData({...data, shoeTVD: fmt.toImpDepth(e.target.value)})} className="bg-transparent text-white font-mono text-sm border-b border-white/10 outline-none w-full py-1 hover:border-blue-500 transition-colors" />
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Main Operational Console */}
      <div className={`${isAICoachOpen ? 'xl:col-span-6' : 'xl:col-span-9'} flex flex-col gap-8 min-h-0 transition-all duration-700 overflow-y-auto custom-scrollbar pr-2 pb-24`}>
        
        {/* HUD CONTROL BAR */}
        <div className="bg-white rounded-[2.5rem] p-5 border border-slate-200 flex flex-col gap-5 shadow-sm relative shrink-0">
           {isMaaspBreached && (
             <div className="absolute inset-0 bg-red-600/95 backdrop-blur-3xl rounded-[2.5rem] z-[60] flex items-center justify-center animate-in fade-in duration-500">
                <div className="flex flex-col items-center gap-10 relative z-10 text-white text-center">
                   <div className="flex items-center gap-6">
                      <div className="p-8 bg-white rounded-[2.5rem] text-red-600 shadow-[0_0_50px_rgba(255,255,255,0.4)] animate-pulse ring-8 ring-white/20"><Lock size={56} /></div>
                      <div className="text-left">
                         <h2 className="text-5xl font-black tracking-tighter uppercase mb-2 leading-none text-white drop-shadow-xl">ALERT! MAASP BREACH</h2>
                         <p className="text-[14px] font-black uppercase tracking-[0.25em] font-mono opacity-90 text-red-100">SYSTEM INTERLOCK ENGAGED: CRITICAL PRESSURE OVERLOAD</p>
                      </div>
                   </div>
                   
                   <div className="bg-black/40 backdrop-blur-lg border border-white/20 rounded-[2rem] p-8 w-full max-w-2xl flex flex-col gap-6">
                      <div className="flex justify-between items-center pb-4 border-b border-white/10">
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current WHP</span>
                         <span className="text-3xl font-black font-mono text-red-400">{fmt.press(simState.surfacePressure)} {fmt.pUnit()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">MAASP Limit</span>
                         <span className="text-3xl font-black font-mono text-white opacity-60">{fmt.press(results.maasp)} {fmt.pUnit()}</span>
                      </div>
                      
                      <div className="pt-4 flex flex-col gap-3">
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manual Recovery Required</p>
                         <button 
                           onClick={() => dispatch({ type: 'BLEED_PRESSURE', amount: 50 })}
                           className="w-full bg-white text-red-600 hover:bg-slate-100 py-6 rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[12px] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3"
                         >
                            <ShieldX size={20} /> Emergency Recovery Bleed
                         </button>
                      </div>
                   </div>
                </div>
             </div>
           )}
           <div className="flex items-center justify-between px-4">
              <div className="flex gap-4">
                <button disabled={isMaaspBreached} onClick={() => dispatch({ type: 'SET_STATUS', status: 'RUNNING' })} className={`px-10 py-4 rounded-[1.5rem] transition-all flex items-center gap-3 font-black text-[11px] uppercase tracking-[0.2em] ${simState.status === 'RUNNING' ? 'bg-blue-600 text-white shadow-2xl shadow-blue-900/40' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 disabled:opacity-50'}`}><Play size={16} /> Start Lab</button>
                <button disabled={isMaaspBreached} onClick={() => dispatch({ type: 'SET_STATUS', status: 'PAUSED' })} className={`px-10 py-4 rounded-[1.5rem] transition-all flex items-center gap-3 font-black text-[11px] uppercase tracking-[0.2em] ${simState.status === 'PAUSED' ? 'bg-orange-500 text-white shadow-2xl shadow-orange-900/40' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 disabled:opacity-50'}`}><Pause size={16} /> Pause Ops</button>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 bg-slate-50 px-5 py-3 rounded-[1.5rem] border border-slate-100">
                  <Timer size={14} className="text-slate-400" />
                  <span className="text-[10px] font-black text-slate-500 uppercase font-mono tracking-widest">{simState.speed.toFixed(1)}x</span>
                  <input disabled={isMaaspBreached} type="range" min="0.5" max="5" step="0.5" value={simState.speed} onChange={(e) => dispatch({ type: 'SET_SPEED', value: parseFloat(e.target.value) })} className="w-24 h-1.5 accent-blue-600 cursor-pointer disabled:opacity-30" />
                </div>
                <button onClick={() => setIsAICoachOpen(!isAICoachOpen)} className={`px-8 py-4 rounded-[1.5rem] transition-all flex items-center gap-3 font-black text-[11px] uppercase tracking-[0.2em] border ${isAICoachOpen ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-400'}`}><Brain size={18} /> Tutor Mode</button>
              </div>
           </div>
        </div>

        {/* HUD TELEMETRY CARDS */}
        <div className={`grid ${isAICoachOpen ? 'grid-cols-1' : 'grid-cols-3'} gap-8 shrink-0`}>
           {[
             { label: 'Wellhead Pressure', val: simState.surfacePressure, unit: fmt.pUnit(), color: isMaaspBreached ? 'text-red-500' : 'text-white', isPress: true, icon: GaugeCircle },
             { label: simState.mode === SimulationMode.STRIPPING ? 'Hook Load Cell' : 'Influx Volume', val: simState.mode === SimulationMode.STRIPPING ? simState.indicatedWeight : simState.gasVolume, unit: simState.mode === SimulationMode.STRIPPING ? fmt.fUnit() : fmt.vUnit(), color: 'text-blue-400', isWeight: simState.mode === SimulationMode.STRIPPING, isVol: simState.mode !== SimulationMode.STRIPPING, icon: Weight },
             { label: 'Bottom Hole Pressure', val: currentBHP, unit: fmt.pUnit(), color: 'text-indigo-400', isPress: true, icon: HardHat }
           ].map((item, idx) => (
             <div key={idx} className={`rounded-[3rem] p-10 shadow-2xl border transition-all duration-700 overflow-hidden relative group ${isMaaspBreached && item.isPress && !item.label.includes('Bottom') ? 'bg-red-950 border-red-500' : 'bg-[#020617] border-white/5'}`}>
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-all duration-700">
                   <item.icon size={80} />
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] block font-mono mb-6 group-hover:text-blue-400/60 transition-colors">{item.label}</span>
                <div className={`text-6xl font-mono font-black tracking-tighter ${item.color}`}>
                   {item.isPress ? fmt.press(item.val) : item.isWeight ? fmt.force(item.val) : fmt.vol(item.val)}
                   <span className="text-base text-slate-600 font-sans ml-3 opacity-60">{item.unit}</span>
                </div>
             </div>
           ))}
        </div>

        {/* OPERATIONAL VISUALIZER */}
        <div className="flex-1 bg-[#010409] rounded-[4rem] border border-white/5 flex overflow-hidden shadow-2xl min-h-[500px] shrink-0">
           <div className="flex-1 p-12 flex flex-col min-w-0">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.4em] font-mono">Live Pressure Transient Profile</h4>
                <div className="bg-blue-600/10 border border-blue-500/20 px-4 py-1.5 rounded-full text-[9px] font-black text-blue-400 uppercase font-mono tracking-widest flex items-center gap-2">
                   <MonitorCheck size={10} /> {fmt.pUnit()} Scalar Active
                </div>
              </div>
              <div className="flex-1 rounded-[3rem] border border-white/[0.03] p-10 bg-slate-900/30 backdrop-blur-sm relative">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05),transparent)] pointer-events-none"></div>
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={simState.pressureHistory.map(h => ({...h, displayPressure: unitSystem === UnitSystem.METRIC ? h.pressure * CONV.PSI_TO_BAR : h.pressure}))}>
                      <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#1e293b" opacity={0.3} />
                      <XAxis hide />
                      <YAxis hide domain={[0, results.maasp * 1.5 * (unitSystem === UnitSystem.METRIC ? CONV.PSI_TO_BAR : 1)]} />
                      <Area type="monotone" dataKey="displayPressure" stroke="#3b82f6" fill="url(#opGrad)" fillOpacity={0.4} strokeWidth={5} isAnimationActive={false} />
                      <ReferenceLine y={results.maasp * (unitSystem === UnitSystem.METRIC ? CONV.PSI_TO_BAR : 1)} stroke="#ef4444" strokeDasharray="10 5" strokeWidth={2} />
                      <defs><linearGradient id="opGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                   </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>
           <WellboreVisualizer gasDepth={simState.gasDepth} totalDepth={data.tvd} shoeDepth={data.shoeTVD} gasVolume={simState.gasVolume} mode={simState.mode} toolDepth={simState.toolDepth} valves={simState.valves} onToggleValve={(comp) => dispatch({ type: 'TOGGLE_VALVE', component: comp })} onEmergencySequence={() => dispatch({ type: 'EMERGENCY_SEQUENCE' })} />
        </div>

        {/* MISSION TELEMETRY LOG */}
        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all duration-700 shrink-0 mb-6">
           <button onClick={() => setIsHistoryCollapsed(!isHistoryCollapsed)} className="w-full flex items-center justify-between p-8 bg-slate-50/50 hover:bg-slate-100/50 transition-colors border-b border-slate-100 group">
              <div className="flex items-center gap-4">
                 <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-[1rem]"><FileText size={20} /></div>
                 <div>
                    <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest font-sans">Lab Session Telemetry</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">Real-time Event Stream</p>
                 </div>
              </div>
              {isHistoryCollapsed ? <ChevronDown size={22} className="text-slate-300" /> : <ChevronUp size={22} className="text-slate-300" />}
           </button>
           {!isHistoryCollapsed && (
             <div className="flex-1 min-h-[250px] max-h-[400px] overflow-y-auto p-10 space-y-5 custom-scrollbar bg-slate-50/[0.2]">
               {simState.history.map(event => (
                 <div key={event.id} className="pl-8 py-2 border-l-2 relative transition-all" style={{ borderColor: event.severity === 'danger' ? '#ef4444' : event.severity === 'warning' ? '#f97316' : '#3b82f6' }}>
                    <div className="absolute left-[-5px] top-4 w-2 h-2 rounded-full border border-white shadow-sm" style={{ backgroundColor: event.severity === 'danger' ? '#ef4444' : event.severity === 'warning' ? '#f97316' : '#3b82f6' }}></div>
                    <div className="flex items-center gap-3 mb-1.5">
                       <span className="text-[10px] font-mono font-black text-slate-400 opacity-60 tracking-widest">{new Date(event.timestamp).toLocaleTimeString([], { hour12: false })}</span>
                       <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest ${event.severity === 'danger' ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'}`}>{event.type}</span>
                    </div>
                    <p className={`text-[12px] font-semibold leading-relaxed tracking-tight ${event.severity === 'danger' ? 'text-red-700' : 'text-slate-700'}`}>{event.message}</p>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>

      {/* Right Console: Lab Controls */}
      <div className={`xl:col-span-3 flex flex-col gap-8 overflow-y-auto pr-2 custom-scrollbar shrink-0 ${isAICoachOpen ? 'hidden' : 'flex'}`}>
        <div className="bg-white rounded-[3.5rem] p-10 border border-slate-200 shadow-sm flex flex-col">
           <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-[1.25rem]"><Settings2 size={24} /></div>
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-[12px]">Operational Console</h3>
           </div>
           
           <div className="bg-[#020617] rounded-[2.5rem] p-8 mb-8 border border-white/5 shadow-2xl">
              <label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.25em] block font-mono mb-6">Execution Method</label>
              <div className="grid grid-cols-1 gap-3">
                {modeOptions.map(opt => (
                  <button key={opt.value} disabled={isMaaspBreached} onClick={() => dispatch({ type: 'SET_MODE', mode: opt.value as SimulationMode, data })} className={`w-full py-4 px-4 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.15em] transition-all border flex items-center gap-4 ${simState.mode === opt.value ? 'bg-blue-600 border-blue-400 text-white shadow-xl' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300 disabled:opacity-30'}`}>
                    <div className={`w-2 h-2 rounded-full ${simState.mode === opt.value ? 'bg-white animate-pulse shadow-[0_0_8px_white]' : 'bg-slate-700'}`}></div>
                    {opt.label}
                  </button>
                ))}
              </div>
           </div>

           {/* MASTER WELL CONTROL SECTION */}
           <div className="bg-[#020617] rounded-[2.5rem] p-8 mb-8 border border-white/5 shadow-2xl relative overflow-hidden group/shut">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl group-hover/shut:scale-150 transition-transform duration-1000"></div>
              <div className="flex items-center justify-between mb-8 relative z-10">
                 <div className="flex flex-col">
                    <label className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] font-mono">Kill Safety</label>
                    <span className="text-[8px] font-black text-slate-500 uppercase font-mono tracking-widest mt-1">Manual Override Active</span>
                 </div>
                 <ShieldHalf size={20} className="text-red-500/60 animate-pulse" />
              </div>
              <button disabled={isMaaspBreached} onClick={() => dispatch({ type: 'EMERGENCY_SEQUENCE' })} className="w-full py-5 bg-red-600 hover:bg-red-500 text-white rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-red-900/40 transition-all flex items-center justify-center gap-4 relative z-10 active:scale-95 disabled:opacity-30">
                <Flame size={18} className="animate-pulse" /> Emergency Shut-in
              </button>
           </div>

           <div className="bg-[#020617] rounded-[2.5rem] p-10 border border-white/5 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <span className="text-[10px] font-black text-blue-400 uppercase font-mono tracking-[0.25em]">HPU Interface</span>
                <GanttChartSquare size={16} className="text-blue-500/60" />
              </div>
              <div className="relative mb-10">
                <div className="absolute -top-1 left-0 right-0 flex justify-between px-1">
                   <div className="w-px h-1 bg-slate-800"></div>
                   <div className="w-px h-1 bg-slate-800"></div>
                   <div className="w-px h-1 bg-slate-800"></div>
                </div>
                <input disabled={isMaaspBreached} type="range" min="0" max="100" value={simState.mode === SimulationMode.STRIPPING ? simState.winchSpeed : simState.chokePosition} onChange={(e) => simState.mode === SimulationMode.STRIPPING ? dispatch({ type: 'SET_WINCH_SPEED', value: parseInt(e.target.value) }) : dispatch({ type: 'SET_CHOKE_POSITION', value: parseInt(e.target.value) })} className="w-full h-2.5 bg-slate-900 rounded-full appearance-none cursor-pointer accent-blue-600 disabled:opacity-30 shadow-[inset_0_0_5px_rgba(0,0,0,1)]" />
              </div>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <button disabled={isMaaspBreached} onClick={() => dispatch({ type: 'TOGGLE_DRAWWORKS' })} className={`py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-3 border ${simState.winchDirection === 'IN' ? 'bg-emerald-600 border-emerald-400 text-white shadow-xl' : 'bg-white/5 border-white/5 text-slate-500'} disabled:opacity-30`}><MoveDown size={20} /> RIH</button>
                  <button disabled={isMaaspBreached} onClick={() => dispatch({ type: 'SET_WINCH_DIR', direction: simState.winchDirection === 'OUT' ? 'NONE' : 'OUT' })} className={`py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-3 border ${simState.winchDirection === 'OUT' ? 'bg-orange-600 border-orange-400 text-white shadow-xl' : 'bg-white/5 border-white/5 text-slate-500'} disabled:opacity-30`}><MoveUp size={20} /> POOH</button>
                </div>
                <button disabled={isMaaspBreached} onClick={() => dispatch({ type: 'TOGGLE_ROTATION' })} className={`w-full py-5 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.25em] transition-all border flex items-center justify-center gap-4 ${simState.rigFloor.rotaryTable === 'ROTATING' ? 'bg-purple-600 border-purple-400 text-white shadow-xl' : 'bg-white/5 border-white/5 text-slate-500'} disabled:opacity-30`}>
                   <RefreshCw size={18} className={simState.rigFloor.rotaryTable === 'ROTATING' ? 'animate-spin' : ''} /> 
                   {simState.rigFloor.rotaryTable === 'ROTATING' ? 'Lock Table' : 'Active Torque'}
                </button>
              </div>
           </div>
        </div>
      </div>
      
      {isAICoachOpen && (
        <div className="xl:col-span-3 flex flex-col h-full bg-white rounded-[4rem] border border-slate-200 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-right duration-700 shrink-0">
           <AITutor initialPrompt={`Analyzing WellTegra Laboratory Link: BHP ${fmt.press(currentBHP)} ${fmt.pUnit()}, Method: ${simState.mode}. Environment: ${fmt.temp(data.ambientTemp)}${fmt.tUnit()}. Awaiting technical instruction.`} />
        </div>
      )}

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.4);
        }
      `}</style>
      
    </div>
  );
};