
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

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

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
    <div className="w-full max-w-4xl mx-auto min-h-[600px] flex flex-col md:flex-row bg-slate-900 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10 relative">
      {/* Ambient Backlighting */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] animate-pulse delay-700"></div>
      </div>

      {/* Left Sidebar (Progress) */}
      <div className="md:w-64 bg-slate-950/50 backdrop-blur-xl border-r border-white/5 p-8 relative z-10 flex flex-col">
        <div className="mb-10">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
            <i className="fa-solid fa-fingerprint text-white text-lg"></i>
          </div>
          <h2 className="text-white font-black text-xl leading-none">Agent Setup</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">Configuration Sequence</p>
        </div>

        <div className="flex-1 space-y-6 relative">
          {/* Connector Line */}
          <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-800 -z-10"></div>

          {steps.map((s) => (
            <div key={s.id} className={`flex items-center gap-4 transition-all duration-500 ${step === s.id ? 'opacity-100 scale-105' : step > s.id ? 'opacity-50' : 'opacity-30'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border-[2px] transition-all ${step === s.id ? 'bg-indigo-600 border-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)]' : step > s.id ? 'bg-slate-800 border-slate-800' : 'bg-slate-900 border-slate-700'}`}>
                {step > s.id ? <i className="fa-solid fa-check text-[10px] text-white"></i> : <span className="text-[10px] font-bold text-white">{s.id}</span>}
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${step === s.id ? 'text-white' : 'text-slate-400'}`}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Form Area */}
      <div className="flex-1 p-8 md:p-12 relative z-10 flex flex-col bg-gradient-to-br from-white/[0.02] to-transparent">
        <div className="flex-1">
          <h3 className="text-2xl font-black text-white mb-1 uppercase tracking-tight">{steps[step - 1].label}</h3>
          <div className="h-1 w-20 bg-indigo-500 rounded-full mb-8"></div>

          {/* Step 1: Identity */}
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="col-span-2 group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-indigo-400 transition-colors">Full Name</label>
                <input
                  type="text" placeholder="e.g. Alex Chen"
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:bg-slate-800 transition-all font-medium"
                  value={formData.personalContext.name || ''}
                  onChange={e => handleInputChange('personalContext', 'name', e.target.value)}
                />
              </div>
              <div className="col-span-2 md:col-span-1 group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-indigo-400 transition-colors">Institution</label>
                <input
                  type="text" placeholder="University / Organization"
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:bg-slate-800 transition-all font-medium"
                  value={formData.personalContext.institutionName || ''}
                  onChange={e => handleInputChange('personalContext', 'institutionName', e.target.value)}
                />
              </div>
              <div className="col-span-2 md:col-span-1 group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-indigo-400 transition-colors">Major / Field</label>
                <input
                  type="text" placeholder="Computer Science"
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:bg-slate-800 transition-all font-medium"
                  value={formData.personalContext.fieldOfStudy || ''}
                  onChange={e => handleInputChange('personalContext', 'fieldOfStudy', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-indigo-400 transition-colors">Grade / GPA</label>
                <input
                  type="text" placeholder="3.8"
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:bg-slate-800 transition-all font-medium"
                  value={formData.personalContext.currentGPA || ''}
                  onChange={e => handleInputChange('personalContext', 'currentGPA', e.target.value)}
                />
              </div>

              {/* Social Links */}
              <div className="col-span-2 grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div className="relative group">
                  <i className="fa-brands fa-github absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors"></i>
                  <input
                    type="text" placeholder="GitHub Username"
                    className="w-full pl-10 bg-slate-800/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 transition-all"
                    value={formData.personalContext.githubUsername || ''}
                    onChange={e => handleInputChange('personalContext', 'githubUsername', e.target.value)}
                  />
                </div>
                <div className="relative group">
                  <i className="fa-brands fa-linkedin absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors"></i>
                  <input
                    type="text" placeholder="LinkedIn URL"
                    className="w-full pl-10 bg-slate-800/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 transition-all"
                    value={formData.personalContext.linkedinUrl || ''}
                    onChange={e => handleInputChange('personalContext', 'linkedinUrl', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Objective */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-indigo-400 transition-colors">Target Role</label>
                <input
                  type="text" placeholder="e.g. Full Stack Developer, Data Scientist"
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-6 py-4 text-xl text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:bg-slate-800 transition-all font-bold"
                  value={formData.careerTarget.desiredRole || ''}
                  onChange={e => handleInputChange('careerTarget', 'desiredRole', e.target.value)}
                />
              </div>
              <div className="group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-indigo-400 transition-colors">Timeline Horizon (Months)</label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-6 py-4 text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:bg-slate-800 transition-all font-bold text-lg"
                    value={formData.careerTarget.targetTimeline}
                    onChange={e => handleInputChange('careerTarget', 'targetTimeline', parseInt(e.target.value) || 0)}
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 font-bold uppercase text-xs pointer-events-none">Months</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Availability */}
          {step === 3 && (
            <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="bg-slate-800/30 p-6 rounded-2xl border border-white/5 hover:border-indigo-500/50 transition-colors group">
                <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <i className="fa-regular fa-clock text-indigo-400 text-xl"></i>
                </div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Daily Commitment</label>
                <div className="flex items-baseline gap-2">
                  <input
                    type="number"
                    className="w-20 bg-transparent border-b-2 border-slate-600 text-3xl font-black text-white outline-none focus:border-indigo-500 transition-colors text-center"
                    value={formData.timeConsistency.hoursPerDay}
                    onChange={e => handleInputChange('timeConsistency', 'hoursPerDay', parseInt(e.target.value) || 0)}
                  />
                  <span className="text-sm font-bold text-slate-500 uppercase">Hours</span>
                </div>
              </div>
              <div className="bg-slate-800/30 p-6 rounded-2xl border border-white/5 hover:border-indigo-500/50 transition-colors group">
                <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-calendar-day text-purple-400 text-xl"></i>
                </div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Weekly Frequency</label>
                <div className="flex items-baseline gap-2">
                  <input
                    type="number" max="7"
                    className="w-20 bg-transparent border-b-2 border-slate-600 text-3xl font-black text-white outline-none focus:border-indigo-500 transition-colors text-center"
                    value={formData.timeConsistency.daysPerWeek}
                    onChange={e => handleInputChange('timeConsistency', 'daysPerWeek', parseInt(e.target.value) || 0)}
                  />
                  <span className="text-sm font-bold text-slate-500 uppercase">Days</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Inventory */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {Object.entries(SKILL_LABELS).map(([key, label]) => (
                <div key={key} className="bg-slate-800/30 p-4 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-slate-200">{label}</span>
                    <span className="text-xs font-black text-indigo-400 px-2 py-1 bg-indigo-500/10 rounded-lg">{(formData.skillInventory as any)[key]} / 5</span>
                  </div>
                  <input
                    type="range" min="0" max="5"
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    value={(formData.skillInventory as any)[key]}
                    onChange={e => handleInputChange('skillInventory', key, parseInt(e.target.value))}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Step 5: Metrics */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="grid grid-cols-3 gap-4">
                {['easy', 'medium', 'hard'].map((diff) => (
                  <div key={diff} className="bg-slate-800/30 p-4 rounded-xl border border-white/5 text-center">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{diff}</label>
                    <input
                      type="number" className="w-full bg-transparent text-center text-xl font-bold text-white outline-none"
                      placeholder="0"
                      value={(formData.practiceOutput.problemDifficulty as any)[diff]}
                      onChange={e => handleNestedChange('practiceOutput', 'problemDifficulty', diff, parseInt(e.target.value) || 0)}
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-indigo-400 transition-colors">GitHub Commits (30d)</label>
                  <input
                    type="number" className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 font-bold"
                    value={formData.practiceOutput.commitsLast30Days}
                    onChange={e => handleInputChange('practiceOutput', 'commitsLast30Days', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-indigo-400 transition-colors">Projects Built</label>
                  <input
                    type="number" className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 font-bold"
                    value={formData.practiceOutput.projects.independent}
                    onChange={e => handleNestedChange('practiceOutput', 'projects', 'independent', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 6: History - Final */}
          {step === 6 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500 text-center">
              <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/50 animate-bounce">
                <i className="fa-solid fa-flag-checkered text-3xl text-white"></i>
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">Ready for Synchronization?</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Your digital twin requires this data to initialize the grounding engine. Ensure all metrics are accurate.
              </p>

              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mt-8">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Courses Done</p>
                  <input
                    type="number"
                    className="bg-transparent text-center w-full text-white font-bold text-lg outline-none"
                    value={formData.learningSources.coursesCompleted}
                    onChange={e => handleInputChange('learningSources', 'coursesCompleted', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">In Progress</p>
                  <input
                    type="number"
                    className="bg-transparent text-center w-full text-white font-bold text-lg outline-none"
                    value={formData.learningSources.coursesInProgress}
                    onChange={e => handleInputChange('learningSources', 'coursesInProgress', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Navigation Footer */}
        <div className="mt-10 flex justify-between items-center pt-8 border-t border-white/10">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className="px-6 py-2 text-slate-400 font-bold hover:text-white disabled:opacity-0 transition-colors uppercase tracking-widest text-xs"
          >
            Back
          </button>

          {step < totalSteps ? (
            <button
              onClick={nextStep}
              disabled={!isStepValid()}
              className="group relative px-8 py-3 bg-white text-slate-900 font-black uppercase tracking-widest text-xs rounded-xl hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">Next Step <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i></span>
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
              <span className="relative z-10 flex items-center gap-2">Initialize Agent <i className="fa-solid fa-bolt"></i></span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
