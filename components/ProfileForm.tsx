
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

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-4 md:p-8 border border-slate-200">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-800">Agent Decision Setup</h2>
          <span className="text-sm font-medium text-slate-500">Analysis Data Point {step} / {totalSteps}</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <div className="min-h-[400px]">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-lg font-semibold text-slate-700">Personal & Academic Context</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
                <input
                  type="text" placeholder="John Doe"
                  className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.personalContext.name || ''}
                  onChange={e => handleInputChange('personalContext', 'name', e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-600 mb-1">Institution / University</label>
                <input
                  type="text" placeholder="e.g. Stanford University"
                  className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.personalContext.institutionName || ''}
                  onChange={e => handleInputChange('personalContext', 'institutionName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Current GPA / Grade</label>
                <input
                  type="text" placeholder="e.g. 3.8 or 8.5"
                  className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.personalContext.currentGPA || ''}
                  onChange={e => handleInputChange('personalContext', 'currentGPA', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Field of Study</label>
                <input
                  type="text" placeholder="e.g. Computer Science"
                  className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.personalContext.fieldOfStudy || ''}
                  onChange={e => handleInputChange('personalContext', 'fieldOfStudy', e.target.value)}
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-600 mb-1">GitHub Username</label>
                <div className="relative">
                  <i className="fa-brands fa-github absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input
                    type="text" placeholder="username"
                    className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.personalContext.githubUsername || ''}
                    onChange={e => handleInputChange('personalContext', 'githubUsername', e.target.value)}
                  />
                </div>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-600 mb-1">LinkedIn Profile URL</label>
                <div className="relative">
                  <i className="fa-brands fa-linkedin absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input
                    type="text" placeholder="linkedin.com/in/..."
                    className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.personalContext.linkedinUrl || ''}
                    onChange={e => handleInputChange('personalContext', 'linkedinUrl', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-lg font-semibold text-slate-700">Career Target</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-600 mb-1">Desired Role</label>
                <input
                  type="text" placeholder="e.g. Backend Developer"
                  className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.careerTarget.desiredRole || ''}
                  onChange={e => handleInputChange('careerTarget', 'desiredRole', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Timeline (Months)</label>
                <input
                  type="number"
                  className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.careerTarget.targetTimeline}
                  onChange={e => handleInputChange('careerTarget', 'targetTimeline', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-lg font-semibold text-slate-700">Time Availability</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Hours / Day</label>
                <input
                  type="number"
                  className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.timeConsistency.hoursPerDay}
                  onChange={e => handleInputChange('timeConsistency', 'hoursPerDay', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Days / Week</label>
                <input
                  type="number" max="7"
                  className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.timeConsistency.daysPerWeek}
                  onChange={e => handleInputChange('timeConsistency', 'daysPerWeek', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-lg font-semibold text-slate-700">Skill Inventory</h3>
            <div className="grid grid-cols-1 gap-4">
              {Object.entries(SKILL_LABELS).map(([key, label]) => (
                <div key={key}>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>{label}</span>
                    <span className="text-indigo-600">{(formData.skillInventory as any)[key]} / 5</span>
                  </div>
                  <input
                    type="range" min="0" max="5"
                    className="w-full accent-indigo-600"
                    value={(formData.skillInventory as any)[key]}
                    onChange={e => handleInputChange('skillInventory', key, parseInt(e.target.value))}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-lg font-semibold text-slate-700">Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl">
              <div className="col-span-full font-bold text-slate-500 text-xs uppercase">Problem Difficulty Breakdown</div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Easy</label>
                <input
                  type="number" className="w-full p-2 border border-slate-300 rounded-lg"
                  value={formData.practiceOutput.problemDifficulty.easy}
                  onChange={e => handleNestedChange('practiceOutput', 'problemDifficulty', 'easy', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Medium</label>
                <input
                  type="number" className="w-full p-2 border border-slate-300 rounded-lg"
                  value={formData.practiceOutput.problemDifficulty.medium}
                  onChange={e => handleNestedChange('practiceOutput', 'problemDifficulty', 'medium', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Hard</label>
                <input
                  type="number" className="w-full p-2 border border-slate-300 rounded-lg"
                  value={formData.practiceOutput.problemDifficulty.hard}
                  onChange={e => handleNestedChange('practiceOutput', 'problemDifficulty', 'hard', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Independent Projects</label>
                <input
                  type="number" className="w-full p-3 border border-slate-300 rounded-lg"
                  value={formData.practiceOutput.projects.independent}
                  onChange={e => handleNestedChange('practiceOutput', 'projects', 'independent', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Guided Projects</label>
                <input
                  type="number" className="w-full p-3 border border-slate-300 rounded-lg"
                  value={formData.practiceOutput.projects.guided}
                  onChange={e => handleNestedChange('practiceOutput', 'projects', 'guided', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">GitHub Commits (Last 30d)</label>
                <input
                  type="number" className="w-full p-3 border border-slate-300 rounded-lg"
                  value={formData.practiceOutput.commitsLast30Days}
                  onChange={e => handleInputChange('practiceOutput', 'commitsLast30Days', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Last Active (Days Ago)</label>
                <input
                  type="number" className="w-full p-3 border border-slate-300 rounded-lg"
                  value={formData.practiceOutput.lastActiveDaysAgo}
                  onChange={e => handleInputChange('practiceOutput', 'lastActiveDaysAgo', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox" id="gh"
                checked={formData.practiceOutput.githubActivity}
                onChange={e => handleInputChange('practiceOutput', 'githubActivity', e.target.checked)}
              />
              <label htmlFor="gh" className="text-sm font-medium text-slate-600 cursor-pointer">Has GitHub Account?</label>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-lg font-semibold text-slate-700">Course & Platform Activity</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Courses Completed</label>
                <input
                  type="number" className="w-full p-3 border border-slate-300 rounded-lg"
                  value={formData.learningSources.coursesCompleted}
                  onChange={e => handleInputChange('learningSources', 'coursesCompleted', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Courses In Progress</label>
                <input
                  type="number" className="w-full p-3 border border-slate-300 rounded-lg"
                  value={formData.learningSources.coursesInProgress}
                  onChange={e => handleInputChange('learningSources', 'coursesInProgress', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            <p className="text-xs text-slate-400 font-medium">Deterministic Analysis will commence upon submission based on your unique data points.</p>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-12 border-t pt-6">
        <button
          onClick={prevStep}
          disabled={step === 1}
          className="px-6 py-2 text-slate-600 font-bold hover:text-indigo-600 disabled:opacity-0 transition-colors"
        >
          Back
        </button>
        {step < totalSteps ? (
          <button
            onClick={nextStep}
            disabled={!isStepValid()}
            className="px-8 py-2 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none transition-all"
          >
            Next
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
            className="px-10 py-3 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-lg shadow-xl hover:bg-indigo-700 transition-all"
          >
            Run Agent Analysis
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileForm;
