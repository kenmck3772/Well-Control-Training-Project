import React from 'react';
import { ViewState } from '../types';
import { 
  BookOpen, 
  GraduationCap, 
  LayoutDashboard,
  Box,
  BrainCircuit,
  Moon,
  Sun,
  ShieldCheck,
  Zap,
  ChevronRight
} from 'lucide-react';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView, isDarkMode, toggleDarkMode }) => {
  const navItems = [
    { id: ViewState.DASHBOARD, label: 'Course Hub', icon: LayoutDashboard },
    { id: ViewState.LEARNING_CENTER, label: 'Learning Center', icon: BookOpen },
    { id: ViewState.SIMULATOR, label: 'Operational Lab', icon: Box },
    { id: ViewState.QUIZ, label: 'Certifications', icon: GraduationCap },
  ];

  return (
    <nav className={`w-64 flex flex-col h-screen fixed left-0 top-0 z-50 border-r transition-all duration-700 shadow-2xl ${
      isDarkMode ? 'bg-[#020617] text-slate-100 border-white/5' : 'bg-[#0f172a] text-white border-white/10'
    }`}>
      {/* BRAND HEADER */}
      <div className="p-8 border-b border-white/5 flex items-center gap-4 group cursor-pointer" onClick={() => setView(ViewState.DASHBOARD)}>
        <div className="relative">
          <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-900/40 relative z-10 transition-transform duration-500 group-hover:scale-110">
            <BrainCircuit className="text-white h-6 w-6" />
          </div>
          <div className="absolute inset-0 bg-blue-400 blur-xl opacity-40 scale-150 animate-pulse"></div>
        </div>
        <div>
          <h1 className="font-black text-2xl tracking-tighter leading-none uppercase text-white font-sans">WellTegra</h1>
          <span className="text-[7px] text-blue-400 font-black uppercase tracking-[0.4em] mt-1.5 block opacity-80">Precision Control</span>
        </div>
      </div>
      
      <div className="flex-1 py-10 px-4 space-y-2">
        <p className="px-6 text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 font-mono opacity-50">Operational Scope</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center justify-between px-6 py-4 rounded-[1.5rem] transition-all duration-500 group relative overflow-hidden ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-2xl shadow-blue-900/50' 
                  : 'text-slate-400 hover:bg-white/[0.03] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-4 relative z-10">
                <Icon size={18} className={`${isActive ? 'text-white scale-110' : 'text-slate-500 group-hover:text-blue-400'} transition-all duration-500`} />
                <span className={`font-black text-[11px] uppercase tracking-[0.15em] ${isActive ? 'translate-x-0.5' : ''} transition-transform`}>
                  {item.label}
                </span>
              </div>
              {isActive && <ChevronRight size={14} className="opacity-50" />}
            </button>
          );
        })}
      </div>

      {/* FOOTER ACTION AREA */}
      <div className={`p-6 border-t space-y-6 transition-colors duration-700 ${isDarkMode ? 'bg-[#010409] border-white/5' : 'bg-[#0a0f1e] border-white/10'}`}>
        <div className="px-2">
           <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={12} className="text-emerald-500" />
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Integrity Active</span>
           </div>
           <p className="text-[8px] font-bold text-slate-400 leading-relaxed italic opacity-70">
             "Standardizing individual expertise through digital simulation."
           </p>
        </div>

        <button 
          onClick={toggleDarkMode}
          className="w-full flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-[1.5rem] hover:bg-white/[0.07] transition-all group relative overflow-hidden"
        >
          <div className="flex items-center gap-3 relative z-10">
            <div className={`p-2 rounded-xl transition-all duration-700 ${isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
              {isDarkMode ? <Moon size={14} /> : <Sun size={14} />}
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest font-mono">Theme</span>
              <span className="text-[9px] font-black uppercase tracking-[0.1em] text-white">
                {isDarkMode ? 'Night Ops' : 'Day Ops'}
              </span>
            </div>
          </div>
          <div className={`w-8 h-4 rounded-full p-1 flex items-center transition-colors duration-500 ${isDarkMode ? 'bg-blue-600' : 'bg-slate-700'}`}>
            <div className={`w-2 h-2.5 rounded-full bg-white transition-all duration-500 ${isDarkMode ? 'translate-x-3.5' : 'translate-x-0'}`} />
          </div>
        </button>

        <div className="bg-white/[0.02] rounded-[1.5rem] p-5 border border-white/5">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Process Load</span>
            <Zap size={10} className="text-blue-400 animate-pulse" />
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 h-full w-[62%] rounded-full"></div>
          </div>
        </div>
      </div>
    </nav>
  );
};