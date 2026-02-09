
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { SKILL_LABELS } from '../constants';

interface ProfileFormProps {
  initialData: UserProfile;
  onSubmit: (data: UserProfile) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ initialData, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<UserProfile>(initialData);
  const [direction, setDirection] = useState(1); // 1 for next, -1 for prev

  const totalSteps = 6;

  const handleInputChange = (section: keyof UserProfile, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }));
  };

  const handleNestedChange = (section: keyof UserProfile, nested: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [nested]: {
          ...(prev[section] as any)[nested],
          [field]: value
        }
      }
    }));
  };

  const nextStep = () => { setDirection(1); setStep(s => Math.min(s + 1, totalSteps)); };
  const prevStep = () => { setDirection(-1); setStep(s => Math.max(s - 1, 1)); };

  const isStepValid = (): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.personalContext?.name?.trim() &&
          formData.personalContext?.institutionName?.trim() &&
          formData.personalContext?.fieldOfStudy?.trim()
        );
      case 2:
        return !!(
          formData.careerTarget?.desiredRole?.trim() &&
          (formData.careerTarget?.targetTimeline || 0) > 0
        );
      case 3:
        return !!(
          (formData.timeConsistency?.hoursPerDay || 0) > 0 &&
          (formData.timeConsistency?.daysPerWeek || 0) > 0
        );
      default:
        return true;
    }
  };

  const steps = [
    { id: 1, label: 'Identity', icon: 'fa-id-card' },
    { id: 2, label: 'Objective', icon: 'fa-crosshairs' },
    { id: 3, label: 'Availability', icon: 'fa-clock' },
    { id: 4, label: 'Inventory', icon: 'fa-layer-group' },
    { id: 5, label: 'Metrics', icon: 'fa-chart-line' },
    { id: 6, label: 'History', icon: 'fa-history' }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto min-h-[650px] flex flex-col md:flex-row bg-slate-900/80 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-white/10 relative my-8 animate-in zoom-in-95 duration-700">
      {/* Ambient Backlighting */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse delay-700 mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* Left Sidebar (Progress) */}
      <div className="md:w-72 bg-slate-950/60 backdrop-blur-xl border-r border-white/5 p-8 relative z-10 flex flex-col justify-between">
        <div>
          <div className="mb-10 flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <i className="fa-solid fa-fingerprint text-white text-xl"></i>
            </div>
            <div>
              <h2 className="text-white font-black text-xl leading-none tracking-tight">Agent Setup</h2>
              <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-1">Config v2.4</p>
            </div>
          </div>

          <div className="space-y-6 relative pl-2">
            {/* Connector Line */}
            <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-800 -z-10">
              <div className="w-full bg-indigo-500 transition-all duration-500 ease-out" style={{ height: `${((step - 1) / (totalSteps - 1)) * 100}%` }}></div>
            </div>

            {steps.map((s) => (
              <div key={s.id} className={`flex items-center gap-4 transition-all duration-300 ${step === s.id ? 'opacity-100 translate-x-1' : step > s.id ? 'opacity-50' : 'opacity-30'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-[2px] transition-all duration-500 ${step === s.id ? 'bg-indigo-600 border-indigo-600 shadow-[0_0_20px_rgba(99,102,241,0.6)] scale-110' : step > s.id ? 'bg-slate-900 border-indigo-500/50 text-indigo-400' : 'bg-slate-950 border-slate-800 text-slate-700'}`}>
                  {step > s.id ? <i className="fa-solid fa-check text-[10px]"></i> : <i className={`fa-solid ${s.icon} text-[10px]`}></i>}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${step === s.id ? 'text-white' : 'text-slate-400'}`}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 text-center">
          <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Session ID</p>
          <p className="text-xs font-mono text-indigo-400">8xF-{Math.floor(Math.random() * 9000) + 1000}</p>
        </div>
      </div>

      {/* Main Form Area */}
      <div className="flex-1 p-8 md:p-12 relative z-10 flex flex-col bg-gradient-to-br from-white/[0.02] to-transparent overflow-hidden">

        {/* Step Header */}
        <div className="mb-8 flex justify-between items-end border-b border-white/5 pb-6">
          <div>
            <h3 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter animate-in slide-in-from-left-4 fade-in duration-500 key={step}">{steps[step - 1].label}</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              Step {step} of {totalSteps} • Initialize Variables
            </p>
          </div>
          <div className="text-right hidden md:block opacity-50">
            <i className={`fa-solid ${steps[step - 1].icon} text-4xl text-white/10`}></i>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 relative">
          {/* Step 1: Identity */}
          {step === 1 && (
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-${direction > 0 ? 'right' : 'left'}-8 duration-500`}>
              <div className="col-span-2 group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-indigo-400 transition-colors">Full Name</label>
                <input
                  type="text" placeholder="e.g. Alex Chen"
                  className="w-full bg-slate-800/50 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-lg"
                  value={formData.personalContext.name || ''}
                  onChange={e => handleInputChange('personalContext', 'name', e.target.value)}
                  autoFocus
                />
              </div>
              <div className="col-span-2 md:col-span-1 group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-indigo-400 transition-colors">Institution</label>
                <input
                  type="text" placeholder="University / Org"
                  className="w-full bg-slate-800/50 border border-white/10 rounded-2xl px-5 py-3 text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:bg-slate-800 transition-all font-medium"
                  value={formData.personalContext.institutionName || ''}
                  onChange={e => handleInputChange('personalContext', 'institutionName', e.target.value)}
                />
              </div>
              <div className="col-span-2 md:col-span-1 group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-indigo-400 transition-colors">Major / Field</label>
                <input
                  type="text" placeholder="Computer Science"
                  className="w-full bg-slate-800/50 border border-white/10 rounded-2xl px-5 py-3 text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:bg-slate-800 transition-all font-medium"
                  value={formData.personalContext.fieldOfStudy || ''}
                  onChange={e => handleInputChange('personalContext', 'fieldOfStudy', e.target.value)}
                />
              </div>
              <div className="col-span-2 md:col-span-2 group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-indigo-400 transition-colors">Social Uplink (GitHub)</label>
                <div className="relative">
                  <i className="fa-brands fa-github absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors text-lg"></i>
                  <input
                    type="text" placeholder="GitHub Username"
                    className="w-full pl-12 bg-slate-800/30 border border-white/10 rounded-2xl px-5 py-4 text-white font-mono text-sm outline-none focus:border-indigo-500 focus:bg-slate-800/60 transition-all"
                    value={formData.personalContext.githubUsername || ''}
                    onChange={e => handleInputChange('personalContext', 'githubUsername', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Objective */}
          {step === 2 && (
            <div className={`space-y-8 animate-in fade-in slide-in-from-${direction > 0 ? 'right' : 'left'}-8 duration-500`}>
              <div className="group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-indigo-400 transition-colors">Target Role</label>
                <input
                  type="text" placeholder="e.g. Full Stack Developer"
                  className="w-full bg-slate-800/50 border border-white/10 rounded-2xl px-8 py-6 text-2xl md:text-3xl text-white placeholder-slate-700 outline-none focus:border-indigo-500 focus:bg-slate-800 hover:bg-slate-800/30 transition-all font-black"
                  value={formData.careerTarget.desiredRole || ''}
                  onChange={e => handleInputChange('careerTarget', 'desiredRole', e.target.value)}
                  autoFocus
                />
              </div>
              <div className="group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-indigo-400 transition-colors">Timeline Horizon</label>
                <div className="relative max-w-xs">
                  <input
                    type="number"
                    className="w-full bg-slate-800/50 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:bg-slate-800 transition-all font-black text-xl"
                    value={formData.careerTarget.targetTimeline}
                    onChange={e => handleInputChange('careerTarget', 'targetTimeline', parseInt(e.target.value) || 0)}
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 font-bold uppercase text-xs pointer-events-none tracking-widest">Months</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Availability */}
          {step === 3 && (
            <div className={`grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-${direction > 0 ? 'right' : 'left'}-8 duration-500`}>
              <div className="bg-slate-800/40 p-8 rounded-[2rem] border border-white/5 hover:border-indigo-500/50 hover:bg-slate-800/60 transition-all group flex flex-col items-center justify-center text-center cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg ring-1 ring-white/10">
                  <i className="fa-regular fa-clock text-indigo-400 text-2xl"></i>
                </div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Daily Commitment</label>
                <div className="flex items-baseline gap-2 relative z-10">
                  <input
                    type="number"
                    className="w-24 bg-transparent border-b-2 border-slate-600 text-4xl font-black text-white outline-none focus:border-indigo-500 transition-colors text-center p-2"
                    value={formData.timeConsistency.hoursPerDay}
                    onChange={e => handleInputChange('timeConsistency', 'hoursPerDay', parseInt(e.target.value) || 0)}
                    autoFocus
                  />
                  <span className="text-xs font-bold text-slate-500 uppercase">Hrs</span>
                </div>
              </div>
              <div className="bg-slate-800/40 p-8 rounded-[2rem] border border-white/5 hover:border-purple-500/50 hover:bg-slate-800/60 transition-all group flex flex-col items-center justify-center text-center cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg ring-1 ring-white/10">
                  <i className="fa-solid fa-calendar-day text-purple-400 text-2xl"></i>
                </div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Weekly Frequency</label>
                <div className="flex items-baseline gap-2 relative z-10">
                  <input
                    type="number" max="7"
                    className="w-24 bg-transparent border-b-2 border-slate-600 text-4xl font-black text-white outline-none focus:border-purple-500 transition-colors text-center p-2"
                    value={formData.timeConsistency.daysPerWeek}
                    onChange={e => handleInputChange('timeConsistency', 'daysPerWeek', parseInt(e.target.value) || 0)}
                  />
                  <span className="text-xs font-bold text-slate-500 uppercase">Days</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Inventory */}
          {step === 4 && (
            <div className={`space-y-4 animate-in fade-in slide-in-from-${direction > 0 ? 'right' : 'left'}-8 duration-500`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(SKILL_LABELS).map(([key, label]) => (
                  <div key={key} className="bg-slate-800/30 p-5 rounded-2xl border border-white/5 hover:bg-slate-800/50 transition-colors group">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{label}</span>
                      <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${(formData.skillInventory as any)[key] > 3 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                        {(formData.skillInventory as any)[key]} / 5
                      </span>
                    </div>
                    <input
                      type="range" min="0" max="5"
                      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
                      value={(formData.skillInventory as any)[key]}
                      onChange={e => handleInputChange('skillInventory', key, parseInt(e.target.value))}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Metrics */}
          {step === 5 && (
            <div className={`space-y-8 animate-in fade-in slide-in-from-${direction > 0 ? 'right' : 'left'}-8 duration-500`}>
              <div className="bg-slate-800/30 p-6 rounded-3xl border border-white/5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 text-center">Problem Solving Intensity</label>
                <div className="grid grid-cols-3 gap-4 md:gap-8">
                  {['easy', 'medium', 'hard'].map((diff) => (
                    <div key={diff} className="text-center group">
                      <div className={`text-[9px] font-black uppercase tracking-widest mb-3 ${diff === 'easy' ? 'text-emerald-500' : diff === 'medium' ? 'text-amber-500' : 'text-rose-500'}`}>{diff}</div>
                      <div className="relative bg-slate-900 rounded-2xl p-2 border border-slate-700 group-focus-within:border-white/20 transition-colors">
                        <input
                          type="number" className="w-full bg-transparent text-center text-2xl font-black text-white outline-none"
                          placeholder="0"
                          value={(formData.practiceOutput.problemDifficulty as any)[diff]}
                          onChange={e => handleNestedChange('practiceOutput', 'problemDifficulty', diff, parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-indigo-400 transition-colors">Commits (30d)</label>
                  <input
                    type="number" className="w-full bg-slate-800/50 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 font-bold text-lg"
                    value={formData.practiceOutput.commitsLast30Days}
                    onChange={e => handleInputChange('practiceOutput', 'commitsLast30Days', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-indigo-400 transition-colors">Projects Built</label>
                  <input
                    type="number" className="w-full bg-slate-800/50 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 font-bold text-lg"
                    value={formData.practiceOutput.projects.independent}
                    onChange={e => handleNestedChange('practiceOutput', 'projects', 'independent', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 6: History - Final */}
          {step === 6 && (
            <div className={`space-y-8 animate-in fade-in slide-in-from-${direction > 0 ? 'right' : 'left'}-8 duration-500 text-center flex flex-col items-center justify-center h-full`}>
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-[50px] opacity-20 animate-pulse"></div>
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/50 relative z-10 ring-1 ring-white/20">
                  <i className="fa-solid fa-rocket text-4xl text-white"></i>
                </div>
              </div>

              <div className="max-w-md space-y-2">
                <h3 className="text-3xl font-black text-white uppercase tracking-tight">Ready for Uplink</h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                  We will now define your Career Vector and establish your Twin Agent using the synchronized data.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full max-w-sm mt-4">
                <div className="bg-slate-800/30 p-5 rounded-2xl border border-white/5 hover:bg-slate-800/50 transition-colors">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Courses Done</p>
                  <input
                    type="number"
                    className="bg-transparent text-center w-full text-white font-black text-2xl outline-none"
                    value={formData.learningSources.coursesCompleted}
                    onChange={e => handleInputChange('learningSources', 'coursesCompleted', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="bg-slate-800/30 p-5 rounded-2xl border border-white/5 hover:bg-slate-800/50 transition-colors">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">In Progress</p>
                  <input
                    type="number"
                    className="bg-transparent text-center w-full text-white font-black text-2xl outline-none"
                    value={formData.learningSources.coursesInProgress}
                    onChange={e => handleInputChange('learningSources', 'coursesInProgress', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Navigation Footer */}
        <div className="mt-8 flex justify-between items-center pt-8 border-t border-white/5 relative z-20">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className="px-6 py-3 text-slate-400 font-bold hover:text-white disabled:opacity-0 transition-colors uppercase tracking-widest text-[10px] flex items-center gap-2"
          >
            <i className="fa-solid fa-arrow-left"></i> Back
          </button>

          {step < totalSteps ? (
            <button
              onClick={nextStep}
              disabled={!isStepValid()}
              className="group relative px-8 py-3 bg-white text-slate-950 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-0.5"
            >
              <span className="relative z-10 flex items-center gap-2">Next Sequence <i className="fa-solid fa-chevron-right text-[9px]"></i></span>
            </button>
          ) : (
            <button
              onClick={() => {
                const total = formData.practiceOutput.problemDifficulty.easy +
                  formData.practiceOutput.problemDifficulty.medium +
                  formData.practiceOutput.problemDifficulty.hard;
                const updated = { ...formData, practiceOutput: { ...formData.practiceOutput, problemsSolved: total } };
                onSubmit(updated);
              }}
              className="group relative px-10 py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-indigo-500/40 hover:bg-indigo-500 hover:shadow-indigo-500/60 hover:-translate-y-1 transition-all overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">Initialize Twin Model <i className="fa-solid fa-bolt animate-pulse"></i></span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
