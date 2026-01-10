import React from 'react';
import { ViewState } from '../types';
import { 
  Activity, 
  Cable, 
  ShieldCheck, 
  Zap, 
  Map as MapIcon, 
  HardHat, 
  Layers, 
  ArrowRight, 
  TrendingUp, 
  Trophy, 
  FlaskConical,
  ChevronRight 
} from 'lucide-react';

interface DashboardProps {
  setView: (view: ViewState) => void;
  isDarkMode?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ setView, isDarkMode }) => {
  const tracks = [
    { id: 'drilling', title: 'Drilling Well Control', progress: 65, icon: HardHat, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { id: 'intervention', title: 'Well Intervention', progress: 42, icon: Cable, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'completions', title: 'Completions Lab', progress: 10, icon: Layers, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  const recentActivities = [
    { id: 1, type: 'simulation', title: 'Slickline RIH Success', detail: 'Held 3500 PSI test', time: '2h ago', status: 'success' },
    { id: 2, type: 'quiz', title: 'Barrier Philosophy', detail: 'Score: 92%', time: '5h ago', status: 'success' },
    { id: 3, type: 'simulation', title: 'BOP Emergency Drill', detail: 'Interrupted: Fast expansion', time: '1d ago', status: 'warning' },
  ];

  return (
    <div className={`p-10 max-w-[1600px] mx-auto overflow-y-auto h-full custom-scrollbar pb-32 space-y-12 transition-colors duration-700 ${isDarkMode ? 'bg-[#020617]' : 'bg-transparent'}`}>
      
      {/* WELLTEGRA BRAND HERO */}
      <div className={`rounded-[3.5rem] p-20 text-white relative overflow-hidden shadow-2xl border ${isDarkMode ? 'bg-[#0f172a] border-white/5' : 'bg-[#020617] border-white/5'}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent)] pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 p-16 opacity-[0.03] pointer-events-none rotate-12 scale-150">
          <FlaskConical size={600} className="text-blue-500" />
        </div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-4 mb-10">
              <span className="bg-blue-600 text-white text-[10px] font-black px-6 py-2.5 rounded-full uppercase tracking-[0.3em] shadow-2xl shadow-blue-900/50 border border-white/10">WellTegra Specialist System</span>
              <div className="flex items-center gap-2.5 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Network Active
              </div>
            </div>
            
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] mb-12 uppercase">
              The Digital<br/><span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-blue-700">Barrier Lab</span>
            </h1>
            
            <p className="text-2xl text-slate-400 font-medium leading-relaxed max-w-2xl mb-14 opacity-90">
              Standardizing technical expertise through high-fidelity digital simulation and physics-based instruction.
            </p>
            
            <button 
              onClick={() => setView(ViewState.SIMULATOR)}
              className="group bg-white text-slate-900 px-14 py-7 rounded-[2rem] font-black text-[14px] uppercase tracking-[0.25em] hover:bg-blue-50 transition-all flex items-center gap-6 shadow-2xl hover:scale-105 active:scale-95"
            >
              Initialize Lab Station <ChevronRight size={20} className="text-blue-600 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="lg:col-span-4 hidden lg:flex flex-col gap-6">
             <div className="bg-white/[0.04] border border-white/5 rounded-[3rem] p-12 backdrop-blur-3xl group hover:border-white/10 transition-all duration-700">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[11px] font-black text-blue-400 uppercase tracking-[0.25em]">Expert Matrix</span>
                  <Trophy size={20} className="text-orange-500 group-hover:scale-125 transition-transform duration-700" />
                </div>
                <div className="text-5xl font-black text-white mb-6 tracking-tighter">ELITE</div>
                <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden shadow-inner">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-400 h-full w-[88%] shadow-[0_0_20px_rgba(59,130,246,0.6)]"></div>
                </div>
                <p className="mt-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Lvl 4 Practitioner</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        <div className="xl:col-span-8 flex flex-col gap-10">
          <div className={`rounded-[3rem] p-16 border shadow-sm relative overflow-hidden group transition-all duration-700 ${isDarkMode ? 'bg-[#0f172a] border-white/5' : 'bg-white border-slate-200'}`}>
            <div className="absolute top-0 right-0 p-16 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-1000 rotate-12 scale-150">
              <MapIcon size={300} />
            </div>
            <div className="flex items-center justify-between mb-16">
              <div className="flex items-center gap-6">
                <div className={`p-5 rounded-[1.75rem] shadow-sm ${isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}><TrendingUp size={32} /></div>
                <div>
                  <h2 className={`text-4xl font-black tracking-tighter uppercase ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Certification Tracks</h2>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-2">Active Progression Map</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {tracks.map(track => (
                <div key={track.id} className={`p-10 border rounded-[2.5rem] transition-all group/card cursor-pointer hover:-translate-y-2 duration-500 ${isDarkMode ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]' : 'bg-slate-50 border-slate-100 hover:shadow-2xl'}`}>
                  <div className={`w-20 h-20 ${track.bg} ${track.color} rounded-[2rem] flex items-center justify-center mb-10 transition-all duration-700 group-hover/card:scale-110 shadow-sm`}>
                    <track.icon size={40} />
                  </div>
                  <h3 className={`font-black text-2xl leading-tight mb-4 tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{track.title}</h3>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Mastery</span>
                    <span className={`text-sm font-black ${track.color}`}>{track.progress}%</span>
                  </div>
                  <div className={`w-full h-3 rounded-full overflow-hidden shadow-inner ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                    <div className={`h-full bg-current transition-all duration-1000 ${track.color}`} style={{ width: `${track.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 flex flex-col gap-10">
          <div className={`rounded-[3rem] p-12 border shadow-sm flex-1 flex flex-col relative overflow-hidden transition-all duration-700 ${isDarkMode ? 'bg-[#0f172a] border-white/5' : 'bg-white border-slate-200'}`}>
            <h3 className={`text-[13px] font-black uppercase tracking-[0.3em] mb-12 flex items-center gap-5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <Activity size={24} className="text-blue-600" /> Recent Operations
            </h3>
            <div className="flex-1 space-y-6">
              {recentActivities.map(act => (
                <div key={act.id} className={`p-8 rounded-[2rem] border transition-all flex items-start gap-6 group/item ${isDarkMode ? 'bg-white/[0.02] border-white/5 hover:border-blue-500/30' : 'bg-slate-50 border-slate-100 hover:border-blue-200'}`}>
                  <div className={`mt-1.5 p-4 rounded-[1.5rem] transition-all duration-500 group-hover/item:scale-110 ${act.status === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                    {act.type === 'simulation' ? <Zap size={24} /> : <ShieldCheck size={24} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className={`font-black text-[15px] uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{act.title}</h4>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{act.time}</span>
                    </div>
                    <p className="text-[12px] font-bold text-slate-500 uppercase tracking-tight opacity-70">{act.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-10 w-full py-5 rounded-[1.5rem] border border-slate-200 text-slate-400 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors">View All Logs</button>
          </div>
        </div>
      </div>
    </div>
  );
};