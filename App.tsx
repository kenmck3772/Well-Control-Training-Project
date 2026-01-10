import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { KillSheetCalculator as OperationSimulator } from './components/KillSheetCalculator';
import { LearningCenter } from './components/LearningCenter';
import { Quiz } from './components/Quiz';
import { Dashboard } from './components/Dashboard';
import { ViewState, KillSheetData } from './types';
import { DEFAULT_KILL_SHEET } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [simulatorData, setSimulatorData] = useState<KillSheetData>(DEFAULT_KILL_SHEET);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('welltegra_dark_mode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('welltegra_dark_mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const handleUseFormulaInSimulator = (data?: Partial<KillSheetData>) => {
    if (data) {
      setSimulatorData({ ...DEFAULT_KILL_SHEET, ...data });
    }
    setCurrentView(ViewState.SIMULATOR);
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard setView={setCurrentView} isDarkMode={isDarkMode} />;
      case ViewState.SIMULATOR:
        return (
          <div className={`h-full p-4 xl:p-8 transition-colors duration-500 ${isDarkMode ? 'bg-[#020617]' : 'bg-slate-50/50'}`}>
            <div className="max-w-[1700px] mx-auto h-full">
              <OperationSimulator initialData={simulatorData} />
            </div>
          </div>
        );
      case ViewState.LEARNING_CENTER:
        return (
          <div className="h-full p-4 xl:p-8 max-w-[1600px] mx-auto">
            <LearningCenter onUseFormula={handleUseFormulaInSimulator} isDarkMode={isDarkMode} />
          </div>
        );
      case ViewState.QUIZ:
        return (
          <div className={`h-full p-4 xl:p-8 transition-colors duration-500 ${isDarkMode ? 'bg-[#020617]' : 'bg-slate-50'}`}>
            <Quiz isDarkMode={isDarkMode} />
          </div>
        );
      default:
        return <Dashboard setView={setCurrentView} isDarkMode={isDarkMode} />;
    }
  };

  return (
    <div className={`flex h-screen font-sans overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-[#020617] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Navigation 
        currentView={currentView} 
        setView={setCurrentView} 
        isDarkMode={isDarkMode} 
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
      />
      <main className="flex-1 ml-64 overflow-hidden relative">
        <div key={currentView} className="h-full w-full animate-in fade-in zoom-in-95 duration-500 ease-out">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;