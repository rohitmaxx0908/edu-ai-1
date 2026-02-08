

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isSyncing, setIsSyncing] = useState(false);
  const [filter, setFilter] = useState('ALL');

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
      days.push({ day: null, dateStr: '' });
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
      // Use a mock date logic if scheduledDate is missing, spreading tasks over the month
      const date = step.scheduledDate || `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String((parseInt(step.id) % 28) + 1).padStart(2, '0')}`;

      if (!profile.academicProgress?.completedSteps?.includes(step.id)) {
        if (!map[date]) map[date] = [];
        map[date].push(step);
      }
    });
    return map;
  }, [assessment.learning_roadmap, profile.academicProgress?.completedSteps, currentDate]);

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  // Filter Logic
  const filteredSteps = assessment.learning_roadmap.filter(step => {
    if (filter === 'ALL') return true;
    return step.type === filter;
  });

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-1000 p-6">
      {/* Dashboard View */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden group border border-slate-800 shadow-2xl">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between gap-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Neural Lattice Active</span>
              </div>
              <div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-2">Academics <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Prime</span></h2>
                <p className="text-slate-400 text-sm max-w-md font-medium leading-relaxed opacity-80">
                  Synchronizing {assessment.learning_roadmap.length} critical knowledge nodes for your <span className="text-white font-bold">{profile.careerTarget.desiredRole}</span> mastery path.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-8 md:gap-12 bg-white/5 p-6 rounded-3xl border border-white/5 backdrop-blur-sm">
              <div className="text-center">
                <span className="block text-5xl md:text-6xl font-black text-white tracking-tighter">{progressPercent}%</span>
                <p className="text-[9px] font-black uppercase text-indigo-400 tracking-widest mt-2">Saturation</p>
              </div>
              <div className="w-px h-16 bg-white/10 hidden md:block"></div>
              <div className="text-center">
                <span className="block text-5xl md:text-6xl font-black text-white tracking-tighter">{completedCount}</span>
                <p className="text-[9px] font-black uppercase text-indigo-400 tracking-widest mt-2">Nodes Locked</p>
              </div>
            </div>
          </div>

          <div className="mt-14 h-3 bg-white/5 rounded-full overflow-hidden relative">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-600 to-cyan-500 transition-all duration-1000 ease-out shadow-[0_0_30px_rgba(99,102,241,0.6)]"
              role="progressbar"
              aria-label="Learning progress"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-full bg-white/50"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <i className="fa-solid fa-layer-group text-indigo-600"></i>
          </div>
          <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Modules</div>
          <div className="text-2xl font-black text-slate-900">{totalSteps}</div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <i className="fa-regular fa-clock text-purple-600"></i>
          </div>
          <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Est. Duration</div>
          <div className="text-2xl font-black text-indigo-600">{(totalSteps * 2.5).toFixed(0)}h</div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <i className="fa-solid fa-chart-line text-emerald-600"></i>
          </div>
          <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Velocity</div>
          <div className="text-2xl font-black text-emerald-500">High</div>
        </div>
        <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-sm text-white flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="text-[9px] font-black uppercase text-indigo-400 tracking-widest mb-2">Target Horizon</div>
            <div className="text-lg font-bold leading-tight">{profile.careerTarget.desiredRole}</div>
            <div className="mt-2 h-1 w-12 bg-indigo-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Execution Chain */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 md:p-10 relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 relative z-10">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-4">
                <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs shadow-lg shadow-slate-900/20"><i className="fa-solid fa-list-check"></i></span>
                Module Sequence
              </h3>

              {/* Filters */}
              <div className="flex p-1.5 bg-slate-100 rounded-2xl overflow-x-auto max-w-full no-scrollbar">
                {['ALL', 'VIDEO', 'COURSE', 'PRACTICE'].map(filterOption => (
                  <button
                    key={filterOption}
                    onClick={() => setFilter(filterOption)}
                    className={`px-5 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${filter === filterOption ? 'bg-white text-slate-900 shadow-md scale-105' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'
                      }`}
                  >
                    {filterOption}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative space-y-4">
              {/* Vertical Line Guide */}
              <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-slate-100 -z-0"></div>

              {filteredSteps.map((step, idx) => {
                const isCompleted = profile.academicProgress?.completedSteps?.includes(step.id);
                const isActive = activeStep === step.id;

                return (
                  <div
                    key={step.id}
                    className={`group relative z-10 transition-all duration-500 rounded-3xl ${isActive ? 'bg-slate-50 my-6 scale-[1.02] shadow-xl shadow-slate-200/50 border border-slate-200' : 'bg-white hover:bg-slate-50/50 border border-transparent'}`}
                  >
                    <div className="p-4 flex items-center gap-6">
                      <button
                        onClick={() => toggleStep(step.id)}
                        className={`w-14 h-14 shrink-0 rounded-2xl border flex items-center justify-center transition-all duration-300 relative z-20 ${isCompleted
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                          : 'bg-white border-slate-200 text-slate-300 group-hover:border-indigo-500 group-hover:text-indigo-500 group-hover:shadow-lg group-hover:shadow-indigo-500/10'
                          }`}
                      >
                        {isCompleted ? <i className="fa-solid fa-check text-lg"></i> : <i className="fa-solid fa-play text-sm ml-0.5"></i>}
                      </button>

                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setActiveStep(isActive ? null : step.id)}>
                        <div className="flex flex-wrap items-center gap-3 mb-1.5">
                          <span className={`text-[8px] font-black px-2 py-1 rounded-md tracking-widest uppercase border ${getTypeStyle(step.type)}`}>
                            {step.type}
                          </span>
                          <span className="text-[10px] font-bold text-slate-300">MOD-{step.id}</span>
                        </div>
                        <h4 className={`text-base font-bold truncate transition-colors ${isCompleted ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-900 group-hover:text-indigo-700'}`}>{step.title}</h4>
                      </div>

                      <button
                        onClick={() => setActiveStep(isActive ? null : step.id)}
                        className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-full transition-all ${isActive ? 'bg-slate-200 text-slate-900 rotate-180' : 'text-slate-300 hover:text-indigo-600 hover:bg-slate-100'}`}
                      >
                        <i className="fa-solid fa-chevron-down text-xs"></i>
                      </button>
                    </div>

                    {isActive && (
                      <div className="px-4 pb-4 animate-in slide-in-from-top-4 duration-500">
                        <div className="ml-[4.5rem] bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden ring-1 ring-white/10">
                          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-[60px] pointer-events-none"></div>

                          <div className="relative z-10">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-3">Module Context</h5>
                            <p className="text-sm text-slate-300 leading-relaxed font-medium mb-6">
                              {step.description}
                            </p>

                            <div className="flex flex-wrap gap-4 justify-between items-end border-t border-white/10 pt-6">
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                  <i className="fa-solid fa-building-columns text-indigo-500"></i> {step.provider}
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                  <i className="fa-regular fa-clock text-indigo-500"></i> {step.duration}
                                </div>
                              </div>

                              <a
                                href={step.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3 bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-2"
                              >
                                Take Module <i className="fa-solid fa-arrow-up-right-from-square"></i>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredSteps.length === 0 && (
                <div className="py-20 text-center opacity-50">
                  <i className="fa-solid fa-filter-circle-xmark text-4xl text-slate-300 mb-4"></i>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No modules match filter</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Temporal Grid</h3>
              <div className="flex gap-1 bg-slate-50 p-1 rounded-lg">
                <button onClick={() => changeMonth(-1)} className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-slate-900 transition-all"><i className="fa-solid fa-chevron-left text-[9px]"></i></button>
                <div className="px-3 flex items-center text-[9px] font-black uppercase text-slate-900">{currentDate.toLocaleString('default', { month: 'short', year: 'numeric' })}</div>
                <button onClick={() => changeMonth(1)} className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-slate-900 transition-all"><i className="fa-solid fa-chevron-right text-[9px]"></i></button>
              </div>
            </div>

            <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
              <div className="grid grid-cols-7 gap-2 text-center mb-3">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="text-[8px] font-black text-slate-300 uppercase">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {calendarData.map((d, i) => {
                  // Ensure we don't render empty divs that break grid alignment
                  if (!d.day) return <div key={i}></div>;

                  const hasTasks = d.dateStr && roadmapByDate[d.dateStr] && roadmapByDate[d.dateStr].length > 0;
                  return (
                    <div key={i} className={`aspect-square flex items-center justify-center rounded-lg text-[9px] font-bold transition-all duration-300 ${hasTasks ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-110 ring-2 ring-indigo-100 relative z-10' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                      {d.day}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-950 to-slate-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl border border-white/5">
            <div className="absolute -right-10 -bottom-10 text-white/[0.03] group-hover:scale-110 transition-transform duration-700 rotate-12">
              <i className="fa-solid fa-microchip text-9xl"></i>
            </div>
            <div className="relative z-10">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span> Neural Projection
              </h4>
              <p className="text-xs font-medium leading-relaxed opacity-80 mb-8 border-l-2 border-indigo-500 pl-4">
                Current velocity indicates <span className="text-white font-bold">100% path coverage</span> by <span className="text-white font-black underline decoration-indigo-400 underline-offset-4">Q4 2025</span>.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs text-white shadow-lg"><i className="fa-solid fa-fire"></i></div>
                  <div>
                    <div className="text-[8px] font-black uppercase tracking-widest text-indigo-200 mb-0.5">Current Streak</div>
                    <div className="text-base font-bold text-white">{completedCount} Modules</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
         .no-scrollbar::-webkit-scrollbar {
           display: none;
         }
         .no-scrollbar {
           -ms-overflow-style: none;
           scrollbar-width: none;
         }
      `}</style>
    </div>
  );
};
export default Academics;
