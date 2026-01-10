import React, { useState, useMemo, useEffect } from 'react';
import { LEARNING_MODULES, TECHNICAL_FORMULAS, WELL_CONTROL_GLOSSARY } from '../constants';
import { LearningModule, GlossaryTerm, KillSheetData } from '../types';
import { AITutor } from './AITutor';
import { 
  Award, 
  Clock, 
  Search, 
  ChevronRight, 
  Info, 
  ChevronDown, 
  Library, 
  Zap, 
  Sparkles, 
  Play, 
  Filter, 
  ShieldHalf, 
  ArrowUpCircle, 
  Radio, 
  BookMarked, 
  ArrowRightCircle, 
  XCircle, 
  FlaskConical, 
  Binary, 
  CheckCircle,
  ArrowLeft,
  X
} from 'lucide-react';

interface LearningCenterProps {
  onUseFormula?: (data?: Partial<KillSheetData>) => void;
  isDarkMode?: boolean;
}

const STORAGE_KEY = 'welltegra_completed_modules';

const GlossaryItem: React.FC<{ item: GlossaryTerm; isDarkMode?: boolean }> = ({ item, isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`border-b last:border-0 overflow-hidden ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between py-4 transition-all text-left group px-2 rounded-xl ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-400 group-hover:bg-blue-500/20 group-hover:text-blue-400' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600'}`}>
            <Info size={14} />
          </div>
          <span className={`font-bold text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{item.term}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-widest ${
            item.category === 'Equipment' ? 'bg-blue-500/10 text-blue-400' :
            item.category === 'Physics' ? 'bg-orange-500/10 text-orange-400' :
            'bg-emerald-500/10 text-emerald-400'
          }`}>{item.category}</span>
          <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {isOpen && (
        <div className="pb-4 pt-1 px-11 animate-in slide-in-from-top-2 duration-300">
          <p className={`text-sm leading-relaxed font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {item.definition}
          </p>
        </div>
      )}
    </div>
  );
};

export const LearningCenter: React.FC<LearningCenterProps> = ({ onUseFormula, isDarkMode }) => {
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [isBriefingMode, setIsBriefingMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'modules' | 'glossary' | 'formulas'>('modules');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [completedModules, setCompletedModules] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setCompletedModules(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completedModules));
  }, [completedModules]);

  const moduleCategories = ['All', 'Fundamentals', 'Calculations', 'Equipment', 'Operations', 'Intervention'];
  const glossaryCategories = ['All', 'Equipment', 'Physics', 'Operations'];
  const currentCategories = activeTab === 'glossary' ? glossaryCategories : moduleCategories;

  useEffect(() => { setSelectedCategory('All'); }, [activeTab]);

  const toggleModuleCompletion = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCompletedModules(prev => 
      prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
    );
  };

  const filteredModules = useMemo(() => {
    return LEARNING_MODULES.filter(m => {
      const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            m.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const filteredGlossary = useMemo(() => {
    return WELL_CONTROL_GLOSSARY.filter(item => {
      const matchesSearch = item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.definition.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const initiateBriefing = (module: LearningModule) => {
    setSelectedModule(module);
    setIsBriefingMode(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (selectedModule) {
    const isCompleted = completedModules.includes(selectedModule.id);
    return (
      <div className={`h-full flex flex-col rounded-[3rem] shadow-sm border overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-[#0f172a] border-white/5' : 'bg-white border-slate-200'}`}>
        <div className={`p-6 border-b flex items-center justify-between ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50/50 border-slate-100'}`}>
          <button onClick={() => { setSelectedModule(null); setIsBriefingMode(false); }} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-black text-[10px] uppercase tracking-widest">
            <ArrowLeft size={16} /> Back to Library
          </button>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => toggleModuleCompletion(selectedModule.id)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
              }`}
            >
              <CheckCircle size={14} /> {isCompleted ? 'Module Completed' : 'Mark as Complete'}
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className={`flex-1 overflow-y-auto p-12 custom-scrollbar transition-all duration-700 ${isBriefingMode ? 'bg-slate-900 border-r border-white/5' : ''}`}>
            {isBriefingMode ? (
              <div className="max-w-3xl animate-in fade-in slide-in-from-left duration-1000">
                <div className="flex items-center gap-3 text-emerald-400 mb-6">
                  <ShieldHalf size={32} />
                  <span className="font-black text-[12px] uppercase tracking-[0.3em]">Operational Technical Briefing</span>
                </div>
                <h1 className="text-5xl font-black text-white tracking-tighter mb-8 leading-tight">{selectedModule.title}</h1>
                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-md mb-12">
                   <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-6 flex items-center gap-2"><ArrowUpCircle size={16} /> Briefing Objectives</h4>
                   <div className="space-y-4">
                     {selectedModule.objectives.map((obj, i) => (
                       <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-[10px] font-black">{i+1}</div>
                          <p className="text-sm font-medium text-slate-300">{obj}</p>
                       </div>
                     ))}
                   </div>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                <h1 className={`text-4xl font-black tracking-tight mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{selectedModule.title}</h1>
                <p className={`text-lg font-medium leading-relaxed mb-10 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{selectedModule.description}</p>
                <button onClick={() => setIsBriefingMode(true)} className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-xl transition-all flex items-center gap-3">
                  <Play size={18} /> Start Technical Session
                </button>
              </div>
            )}
          </div>
          <div className={`${isBriefingMode ? 'w-[450px]' : 'w-[400px]'} border-l ${isDarkMode ? 'border-white/5' : 'border-slate-200'} h-full`}>
            <AITutor initialPrompt={isBriefingMode ? selectedModule.lessonPrompt : undefined} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col gap-8 pb-20 overflow-y-auto custom-scrollbar transition-colors duration-500 ${isDarkMode ? 'bg-[#020617]' : 'bg-transparent'}`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 animate-in fade-in slide-in-from-top duration-700">
        <div>
          <h1 className={`text-5xl font-black tracking-tighter leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>TRAINING HUB</h1>
          <p className="text-slate-500 mt-4 text-lg font-medium">Standardized IWCF technical curriculum.</p>
        </div>
        <div className={`flex items-center gap-6 p-6 rounded-[2.5rem] border shadow-sm transition-colors duration-500 ${isDarkMode ? 'bg-[#0f172a] border-white/5' : 'bg-white border-slate-200'}`}>
           <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Completed</span>
              <span className="text-xl font-black text-emerald-600">{completedModules.length} Modules</span>
           </div>
        </div>
      </div>

      <div className={`flex p-2 rounded-2xl shadow-sm border self-start mb-2 transition-colors duration-500 ${isDarkMode ? 'bg-[#0f172a] border-white/5' : 'bg-white border-slate-200'}`}>
        {(['modules', 'glossary', 'formulas'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-10 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? (isDarkMode ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900 text-white shadow-lg') : 'text-slate-400 hover:text-slate-600'}`}>{tab}</button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
        <div className="w-full lg:w-80 flex flex-col gap-6">
          {/* REFINED SEARCH & FILTER SIDEBAR */}
          <div className={`p-8 rounded-[2.5rem] border shadow-sm transition-colors duration-500 space-y-8 ${isDarkMode ? 'bg-[#0f172a] border-white/5' : 'bg-white border-slate-200'}`}>
            
            {/* Search Input Section */}
            <div>
              <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                <Search size={18} className="text-blue-600" /> Technical Search
              </h3>
              <div className={`relative group transition-all duration-300 rounded-2xl border ${isDarkMode ? 'bg-white/[0.03] border-white/10 focus-within:border-blue-500/50' : 'bg-slate-50 border-slate-200 focus-within:border-blue-400'}`}>
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${activeTab}...`}
                  className={`w-full bg-transparent px-4 py-3.5 text-xs font-bold outline-none placeholder:text-slate-500 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-white/10 text-slate-400 transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Section */}
            <div>
              <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                <Filter size={18} className="text-emerald-500" /> Category Filter
              </h3>
              <div className="space-y-1.5">
                {currentCategories.map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setSelectedCategory(cat)} 
                    className={`w-full flex items-center justify-between px-5 py-3 rounded-xl transition-all ${
                      selectedCategory === cat 
                        ? (isDarkMode ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-blue-50 text-blue-600 border border-blue-100') 
                        : (isDarkMode ? 'text-slate-500 hover:bg-white/5 border border-transparent' : 'text-slate-500 hover:bg-slate-50 border border-transparent')
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">{cat}</span>
                    {selectedCategory === cat && <ArrowRightCircle size={14} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 pb-10">
          {activeTab === 'modules' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredModules.length > 0 ? (
                filteredModules.map(module => (
                  <div key={module.id} className={`rounded-[2.5rem] border p-8 shadow-sm hover:shadow-xl transition-all flex flex-col ${isDarkMode ? 'bg-[#0f172a] border-white/5 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                        {module.category}
                      </span>
                      {completedModules.includes(module.id) && <CheckCircle size={16} className="text-emerald-500" />}
                    </div>
                    <h3 className="text-xl font-black mb-2">{module.title}</h3>
                    <p className={`text-sm font-medium leading-relaxed mb-8 flex-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{module.description}</p>
                    <div className="flex gap-3">
                      <button onClick={() => setSelectedModule(module)} className={`flex-1 rounded-xl py-3.5 text-[10px] font-black uppercase tracking-widest transition-all ${isDarkMode ? 'bg-white text-slate-900 hover:bg-blue-50' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>Details</button>
                      <button onClick={() => initiateBriefing(module)} className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-5 py-3.5 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg">Briefing</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center">
                   <div className="bg-white/5 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-slate-400">
                      <XCircle size={32} />
                   </div>
                   <h3 className="text-xl font-black text-slate-500 uppercase tracking-tighter">No Technical Modules Found</h3>
                   <p className="text-slate-500 mt-2 text-sm font-medium">Try adjusting your search query or category filters.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'glossary' && (
            <div className={`rounded-[2.5rem] border p-8 shadow-sm transition-colors duration-500 ${isDarkMode ? 'bg-[#0f172a] border-white/5' : 'bg-white border-slate-200'}`}>
              {filteredGlossary.length > 0 ? (
                filteredGlossary.map((item, idx) => (<GlossaryItem key={idx} item={item} isDarkMode={isDarkMode} />))
              ) : (
                <div className="py-20 text-center">
                   <h3 className="text-xl font-black text-slate-500 uppercase tracking-tighter">No Glossary Terms Found</h3>
                   <p className="text-slate-500 mt-2 text-sm font-medium">Refine your search for better results.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'formulas' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {TECHNICAL_FORMULAS.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).map((f, idx) => (
                 <div key={idx} className={`p-8 rounded-[2.5rem] border shadow-sm transition-all group ${isDarkMode ? 'bg-[#0f172a] border-white/5 hover:bg-white/[0.04]' : 'bg-white border-slate-200 hover:shadow-lg'}`}>
                    <div className="flex items-center gap-3 mb-4">
                       <div className="p-2 bg-blue-600/10 text-blue-500 rounded-lg"><Binary size={18} /></div>
                       <h3 className={`text-sm font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{f.name}</h3>
                    </div>
                    <div className={`p-4 rounded-xl border mb-4 font-mono text-xs ${isDarkMode ? 'bg-black/40 border-white/5 text-blue-400' : 'bg-slate-50 border-slate-100 text-blue-700'}`}>
                       {f.formula}
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Output: {f.unit}</span>
                       {onUseFormula && (
                         <button 
                           onClick={() => onUseFormula()}
                           className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors"
                         >
                           Use in Lab <ChevronRight size={14} />
                         </button>
                       )}
                    </div>
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};