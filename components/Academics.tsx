
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
      case 'VIDEO': return 'bg-red-50 text-red-600 border-red-100 shadow-red-200/50';
      case 'COURSE': return 'bg-blue-50 text-blue-600 border-blue-100 shadow-blue-200/50';
      case 'QUIZ': return 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-200/50';
      case 'PRACTICE': return 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-200/50';
      default: return 'bg-slate-50 text-slate-600 border-slate-100 shadow-slate-200/50';
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
      {/* Dashboard HERO View */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-slate-900 rounded-[3rem] p-10 md:p-14 text-white relative overflow-hidden group border border-slate-800 shadow-2xl transition-all duration-500 hover:shadow-indigo-900/20">
          {/* Dynamic Backgrounds */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/30 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-pulse delay-1000"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between gap-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-md shadow-lg">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Neural Lattice Active</span>
              </div>
              <div className="max-w-2xl">
                <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-white mb-4 drop-shadow-lg">
                  Academics <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Prime</span>
                </h2>
                <p className="text-slate-300 text-sm md:text-base font-medium leading-relaxed opacity-90 max-w-xl">
                  Synchronizing <span className="text-white font-bold">{assessment.learning_roadmap.length} critical knowledge nodes</span> for your <span className="text-white font-bold border-b border-indigo-500/50 pb-0.5">{profile.careerTarget.desiredRole}</span> mastery path.
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-12 bg-white/5 p-8 rounded-[2rem] border border-white/10 backdrop-blur-md shadow-2xl relative overflow-hidden group/stats">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover/stats:opacity-100 transition-opacity duration-500"></div>

              <div className="text-center relative z-10">
                <span className="block text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{progressPercent}%</span>
                <p className="text-[10px] font-black uppercase text-indigo-300 tracking-[0.2em] mt-2">Saturation</p>
              </div>
              <div className="w-px h-20 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
              <div className="text-center relative z-10">
                <span className="block text-6xl font-black text-white tracking-tighter">{completedCount}</span>
                <p className="text-[10px] font-black uppercase text-indigo-300 tracking-[0.2em] mt-2">Nodes Locked</p>
              </div>
            </div>
          </div>

          <div className="mt-16 h-3 bg-white/10 rounded-full overflow-hidden relative shadow-inner">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(99,102,241,0.8)] relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-0 h-full w-2 bg-white/80 blur-[2px]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {[
          { label: 'Total Modules', val: totalSteps, icon: 'fa-layer-group', color: 'indigo' },
          { label: 'Est. Duration', val: `${(totalSteps * 2.5).toFixed(0)}h`, icon: 'fa-clock', color: 'purple' },
          { label: 'Velocity', val: 'High', icon: 'fa-chart-line', color: 'emerald' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-100/30 transition-all duration-300 group hover:-translate-y-1">
            <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
              <i className={`fa-solid ${stat.icon} text-${stat.color}-600 text-lg`}></i>
            </div>
            <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">{stat.label}</div>
            <div className={`text-3xl font-black text-slate-900 group-hover:text-${stat.color}-600 transition-colors`}>{stat.val}</div>
          </div>
        ))}

        <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-sm text-white flex flex-col justify-center relative overflow-hidden group hover:shadow-indigo-500/20 transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="text-[9px] font-black uppercase text-indigo-400 tracking-widest mb-3">Target Horizon</div>
            <div className="text-lg font-bold leading-tight">{profile.careerTarget.desiredRole}</div>
            <div className="mt-3 h-1.5 w-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Execution Chain */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 md:p-10 relative overflow-hidden min-h-[600px]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 relative z-10 border-b border-slate-100 pb-8">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-4">
                <span className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm shadow-xl shadow-slate-900/20 ring-4 ring-slate-100"><i className="fa-solid fa-list-check"></i></span>
                Module Sequence
              </h3>

              {/* Filters */}
              <div className="flex p-1.5 bg-slate-100 rounded-2xl overflow-x-auto max-w-full no-scrollbar">
                {['ALL', 'VIDEO', 'COURSE', 'PRACTICE'].map(filterOption => (
                  <button
                    key={filterOption}
                    onClick={() => setFilter(filterOption)}
                    className={`px-6 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${filter === filterOption ? 'bg-white text-slate-900 shadow-lg scale-105' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'
                      }`}
                  >
                    {filterOption}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative space-y-3 pb-8">
              {/* Vertical Line Guide */}
              <div className="absolute left-[29px] top-6 bottom-6 w-0.5 bg-slate-100 -z-0"></div>

              {filteredSteps.map((step, idx) => {
                const isCompleted = profile.academicProgress?.completedSteps?.includes(step.id);
                const isActive = activeStep === step.id;

                return (
                  <div
                    key={step.id}
                    className={`group relative z-10 transition-all duration-500 rounded-[2rem] ${isActive ? 'bg-slate-50 my-8 scale-[1.02] shadow-2xl shadow-slate-200/50 border border-slate-200 py-2' : 'bg-white hover:bg-slate-50 border border-transparent hover:border-slate-100 hover:shadow-lg hover:shadow-slate-100/50 hover:translate-x-2'}`}
                  >
                    <div className="p-4 flex items-center gap-6">
                      <button
                        onClick={() => toggleStep(step.id)}
                        className={`w-16 h-16 shrink-0 rounded-2xl border flex items-center justify-center transition-all duration-300 relative z-20 ${isCompleted
                          ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/30 rotate-3'
                          : 'bg-white border-slate-200 text-slate-300 group-hover:border-indigo-500 group-hover:text-indigo-500 group-hover:shadow-lg group-hover:shadow-indigo-500/10 group-hover:scale-110'
                          }`}
                      >
                        {isCompleted ? <i className="fa-solid fa-check text-xl"></i> : <i className="fa-solid fa-play text-lg ml-1"></i>}
                      </button>

                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setActiveStep(isActive ? null : step.id)}>
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <span className={`text-[8px] font-black px-2.5 py-1 rounded-lg tracking-widest uppercase border ${getTypeStyle(step.type)}`}>
                            {step.type}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">#MOD-{step.id}</span>
                        </div>
                        <h4 className={`text-lg font-bold truncate transition-colors ${isCompleted ? 'text-slate-400 line-through decoration-slate-300 decoration-2' : 'text-slate-900 group-hover:text-indigo-700'}`}>{step.title}</h4>
                      </div>

                      <button
                        onClick={() => setActiveStep(isActive ? null : step.id)}
                        className={`w-12 h-12 shrink-0 flex items-center justify-center rounded-2xl transition-all ${isActive ? 'bg-slate-200 text-slate-900 rotate-180' : 'text-slate-300 hover:text-indigo-600 hover:bg-slate-100 hover:scale-110'}`}
                      >
                        <i className="fa-solid fa-chevron-down text-sm"></i>
                      </button>
                    </div>

                    {isActive && (
                      <div className="px-4 pb-4 animate-in slide-in-from-top-4 duration-500">
                        <div className="ml-[5.5rem] bg-slate-900 rounded-[1.5rem] p-8 text-white relative overflow-hidden ring-1 ring-white/10 shadow-inner">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none mix-blend-screen"></div>

                          <div className="relative z-10">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span> Context Data
                            </h5>
                            <p className="text-base text-slate-300 leading-relaxed font-medium mb-8 max-w-2xl">
                              {step.description}
                            </p>

                            <div className="flex flex-wrap gap-4 justify-between items-end border-t border-white/10 pt-6">
                              <div className="space-y-3">
                                <div className="flex items-center gap-3 text-xs font-bold text-slate-400 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                                  <i className="fa-solid fa-building-columns text-indigo-400"></i> {step.provider}
                                </div>
                                <div className="flex items-center gap-3 text-xs font-bold text-slate-400 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                                  <i className="fa-regular fa-clock text-indigo-400"></i> {step.duration}
                                </div>
                              </div>

                              <a
                                href={step.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-8 py-4 bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-2 group/btn relative overflow-hidden"
                              >
                                <span className="relative z-10">Initialize Module</span>
                                <i className="fa-solid fa-arrow-up-right-from-square relative z-10 group-hover/btn:translate-x-1 transition-transform"></i>
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-white opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
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
                <div className="py-24 text-center opacity-50 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                    <i className="fa-solid fa-filter-circle-xmark text-3xl text-slate-300"></i>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">No Signals Found</h3>
                  <p className="text-xs text-slate-400 mt-2">Adjust filter parameters to detect modules.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 group">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Temporal Grid</h3>
              <div className="flex gap-1 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                <button onClick={() => changeMonth(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-all"><i className="fa-solid fa-chevron-left text-[10px]"></i></button>
                <div className="px-4 flex items-center text-[10px] font-black uppercase text-slate-900 min-w-[80px] justify-center">{currentDate.toLocaleString('default', { month: 'short', year: 'numeric' })}</div>
                <button onClick={() => changeMonth(1)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-all"><i className="fa-solid fa-chevron-right text-[10px]"></i></button>
              </div>
            </div>

            <div className="bg-slate-50/50 rounded-[1.5rem] p-6 border border-slate-100">
              <div className="grid grid-cols-7 gap-3 text-center mb-4">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="text-[8px] font-black text-slate-300 uppercase">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-3">
                {calendarData.map((d, i) => {
                  if (!d.day) return <div key={i}></div>;
                  const hasTasks = d.dateStr && roadmapByDate[d.dateStr] && roadmapByDate[d.dateStr].length > 0;
                  return (
                    <div key={i} className={`aspect-square flex items-center justify-center rounded-xl text-[10px] font-bold transition-all duration-300 cursor-default ${hasTasks ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-110 ring-2 ring-indigo-100 relative z-10' : 'bg-white text-slate-400 hover:bg-slate-200 shadow-sm'}`}>
                      {d.day}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-950 to-slate-950 rounded-[2.5rem] p-10 text-white relative overflow-hidden group shadow-2xl border border-white/5">
            <div className="absolute -right-12 -bottom-12 text-white/[0.03] group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 ease-in-out">
              <i className="fa-solid fa-microchip text-9xl"></i>
            </div>

            {/* Particles */}
            <div className="absolute top-10 right-10 w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
            <div className="absolute bottom-20 left-10 w-1 h-1 bg-cyan-500 rounded-full animate-ping delay-700"></div>

            <div className="relative z-10">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-6 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse ring-4 ring-indigo-500/20"></span> Neural Projection
              </h4>
              <p className="text-sm font-medium leading-relaxed opacity-80 mb-8 border-l-2 border-indigo-500 pl-5">
                Current velocity indicates <span className="text-white font-bold">100% path coverage</span> by <span className="text-white font-black underline decoration-indigo-400 underline-offset-4 decoration-2">Q4 2025</span>.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-5 p-5 bg-white/5 rounded-[1.5rem] border border-white/5 backdrop-blur-md hover:bg-white/10 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm text-white shadow-lg shadow-indigo-500/30"><i className="fa-solid fa-fire"></i></div>
                  <div>
                    <div className="text-[8px] font-black uppercase tracking-widest text-indigo-200 mb-1">Current Streak</div>
                    <div className="text-lg font-black text-white">{completedCount} Modules</div>
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
