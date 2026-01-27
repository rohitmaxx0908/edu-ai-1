
import React, { useState, useMemo } from 'react';
import { UserProfile, AssessmentResult, LearningStep } from '../types';

interface AcademicsProps {
  profile: UserProfile;
  assessment: AssessmentResult;
  onUpdateProfile: (newProfile: UserProfile) => void;
}

const Academics: React.FC<AcademicsProps> = ({ profile, assessment, onUpdateProfile }) => {
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isSyncing, setIsSyncing] = useState(false);

  const completedCount = profile.academicProgress?.completedSteps?.length || 0;
  const totalSteps = assessment.learning_roadmap.length;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  const toggleStep = (stepId: string) => {
    setIsSyncing(true);
    const currentCompleted = profile.academicProgress?.completedSteps || [];
    const newCompleted = currentCompleted.includes(stepId)
      ? currentCompleted.filter(id => id !== stepId)
      : [...currentCompleted, stepId];

    onUpdateProfile({
      ...profile,
      academicProgress: {
        ...profile.academicProgress,
        currentSemester: profile.academicProgress?.currentSemester || 1,
        completedSteps: newCompleted
      }
    });

    setTimeout(() => setIsSyncing(false), 800);
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'VIDEO': return 'bg-red-50 text-red-700 border-red-100';
      case 'COURSE': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'QUIZ': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'PRACTICE': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, dateStr: null });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ day: i, dateStr });
    }
    return days;
  }, [currentDate]);

  const roadmapByDate = useMemo(() => {
    const map: Record<string, LearningStep[]> = {};
    assessment.learning_roadmap.forEach(step => {
      if (!profile.academicProgress?.completedSteps?.includes(step.id)) {
        if (!map[step.scheduledDate]) map[step.scheduledDate] = [];
        map[step.scheduledDate].push(step);
      }
    });
    return map;
  }, [assessment.learning_roadmap, profile.academicProgress?.completedSteps]);

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-1000">
      {/* Dashboard View */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group border border-slate-800 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Node Status: Active</span>
              </div>
              <h2 className="text-4xl font-black tracking-tighter italic">Academics <span className="text-indigo-400">Grid</span></h2>
              <p className="text-slate-400 text-sm max-w-sm font-medium leading-relaxed opacity-80">
                Synchronizing {assessment.learning_roadmap.length} critical knowledge assets for your {profile.careerTarget.desiredRole} horizon.
              </p>
            </div>
            <div className="flex items-center gap-8">
               <div className="text-center">
                  <span className="block text-5xl font-black text-white tracking-tighter">{progressPercent}%</span>
                  <p className="text-[9px] font-black uppercase text-indigo-400 tracking-widest mt-2">Saturation</p>
               </div>
               <div className="w-px h-16 bg-white/10 hidden md:block"></div>
               <div className="text-center">
                  <span className="block text-5xl font-black text-white tracking-tighter">{completedCount}</span>
                  <p className="text-[9px] font-black uppercase text-indigo-400 tracking-widest mt-2">Nodes Locked</p>
               </div>
            </div>
          </div>
          <div className="mt-12 h-2 bg-white/5 rounded-full overflow-hidden relative">
             <div className="absolute left-0 top-0 h-full bg-indigo-500 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(99,102,241,0.5)]" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
      </div>

      {/* Execution Chain */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-4">
           <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-10">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.4em] flex items-center gap-4">
                    <span className="w-10 h-[2px] bg-indigo-600"></span>
                    Module Sequence
                 </h3>
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sorting by Grounding Priority</span>
                 </div>
              </div>

              <div className="space-y-3">
                 {assessment.learning_roadmap.map((step, idx) => {
                   const isCompleted = profile.academicProgress?.completedSteps?.includes(step.id);
                   const isActive = activeStep === step.id;
                   
                   return (
                     <div 
                       key={step.id} 
                       className={`group rounded-2xl border transition-all duration-300 ${
                         isCompleted ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200 hover:border-indigo-600 shadow-sm'
                       }`}
                     >
                        <div className="p-5 flex items-center gap-5">
                           <div className="text-[10px] font-black text-slate-300 w-8">0{idx + 1}</div>
                           <button 
                             onClick={() => toggleStep(step.id)}
                             className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
                               isCompleted ? 'bg-emerald-500 border-emerald-500 text-white shadow-xl shadow-emerald-500/20' : 'bg-white border-slate-200 group-hover:border-indigo-600'
                             }`}
                           >
                             {isCompleted ? <i className="fa-solid fa-check text-[10px]"></i> : <i className="fa-solid fa-plus text-[10px] text-slate-200 group-hover:text-indigo-600"></i>}
                           </button>
                           <div className="flex-1 cursor-pointer" onClick={() => setActiveStep(isActive ? null : step.id)}>
                             <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className={`text-[8px] font-black px-2 py-0.5 rounded tracking-widest uppercase ${getTypeStyle(step.type)}`}>
                                  {step.type}
                                </span>
                                <h4 className={`text-sm font-black ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{step.title}</h4>
                             </div>
                             <div className="flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                               <span>{step.provider}</span>
                               <span className="text-indigo-500/50">{step.duration}</span>
                             </div>
                           </div>
                           <button onClick={() => setActiveStep(isActive ? null : step.id)} className="text-slate-200 hover:text-slate-900 transition-colors px-2">
                             <i className={`fa-solid fa-chevron-${isActive ? 'up' : 'down'} text-[10px]`}></i>
                           </button>
                        </div>
                        
                        {isActive && (
                          <div className="px-5 pb-5 ml-12 animate-in slide-in-from-top-2 duration-300">
                             <div className="bg-slate-900 rounded-2xl p-6 text-white">
                                <p className="text-[11px] text-slate-400 leading-relaxed font-medium mb-6 italic">"{step.description}"</p>
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                   <div className="flex gap-6">
                                      <div className="flex flex-col">
                                         <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Concept</span>
                                         <span className="text-[10px] font-black uppercase text-white">{step.topic}</span>
                                      </div>
                                   </div>
                                   <a 
                                     href={step.url} 
                                     target="_blank" 
                                     className="px-6 py-2.5 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
                                   >
                                     Access Module
                                   </a>
                                </div>
                             </div>
                          </div>
                        )}
                     </div>
                   );
                 })}
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 text-center">Calendar Projection</h3>
              <div className="flex justify-between items-center mb-6 px-2">
                 <span className="text-[10px] font-black text-slate-900 uppercase">{currentDate.toLocaleString('default', { month: 'short' })}</span>
                 <div className="flex gap-2">
                    <button onClick={() => changeMonth(-1)} className="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors"><i className="fa-solid fa-chevron-left text-[8px]"></i></button>
                    <button onClick={() => changeMonth(1)} className="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors"><i className="fa-solid fa-chevron-right text-[8px]"></i></button>
                 </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center mb-4">
                 {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-[7px] font-black text-slate-300 uppercase">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                 {calendarData.map((d, i) => {
                   const daySteps = d.dateStr ? roadmapByDate[d.dateStr] : [];
                   const hasTasks = daySteps && daySteps.length > 0;
                   return (
                     <div key={i} className={`aspect-square flex items-center justify-center rounded-lg text-[9px] font-bold ${d.day ? 'bg-slate-50' : 'opacity-0'} ${hasTasks ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400'}`}>
                       {d.day}
                     </div>
                   );
                 })}
              </div>
           </div>

           <div className="bg-indigo-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                 <i className="fa-solid fa-shield-halved text-8xl"></i>
              </div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-6">Twin Prediction</h4>
              <p className="text-xs font-medium leading-relaxed opacity-80 mb-8">
                Current execution velocity indicates 100% path coverage by <span className="text-white font-black underline decoration-indigo-400 underline-offset-4">Q4 2025</span>. 
              </p>
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[10px]"><i className="fa-solid fa-fire"></i></div>
                    <span className="text-[9px] font-black uppercase tracking-widest">Streak: {completedCount} Nodes</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Academics;
