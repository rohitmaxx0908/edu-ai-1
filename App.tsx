
import React, { useState, useEffect } from 'react';
import { UserProfile, AssessmentResult } from './types';
import { INITIAL_PROFILE } from './constants';
import { assessCareerProfile } from './services/geminiService';
import { dbService } from './services/dbService';
import ProfileForm from './components/ProfileForm';
import Dashboard from './components/Dashboard';
import ChatMentor from './components/ChatMentor';
import SocialHub from './components/SocialHub';
import Academics from './components/Academics';

type ViewMode = 'dashboard' | 'mentor' | 'social' | 'academics';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [loading, setLoading] = useState(true); // Start loading true
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { profile, assessment } = await dbService.getUserData();
        if (profile) setProfile(profile);
        if (assessment) setAssessment(assessment);
      } catch (err) {
        console.error("Failed to load user data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAssessment = async (data: UserProfile) => {
    setLoading(true);
    setError(null);
    try {
      // First save the profile to DB
      await dbService.saveProfile(data);

      const result = await assessCareerProfile(data);
      if (!result || !result.learning_roadmap) {
        throw new Error("The Twin Agent generated an unstable dataset.");
      }

      setProfile(data);
      setAssessment(result);

      // Save assessment to DB
      await dbService.saveAssessment(result);

    } catch (err: any) {
      console.error("Assessment handling error:", err);
      let userFriendlyError = 'The Digital Twin signal was lost during synchronization.';
      if (err.message?.includes('429') || err.status === 429) {
        userFriendlyError = "Quota Exhausted: The AI is busy processing many requests. Please wait 60 seconds and try again.";
      } else if (err.message?.includes('syntax')) {
        userFriendlyError = "Twin Uplink Jammed: Data overflow. Try refining your profile fields.";
      }
      setError(userFriendlyError);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    try {
      await dbService.saveProfile(newProfile);
    } catch (err) {
      console.error("Background sync failed", err);
    }
  };

  const resetAssessment = async () => {
    if (window.confirm('Reset Twin Assessment?')) {
      setAssessment(null);
      setProfile(null);
      setViewMode('dashboard');
      setError(null);
      // Optional: Clear DB or just local state? For now just local state to allow re-assessment.
      // If we wanted to clear DB: await dbService.clearData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="bg-slate-900 p-1.5 rounded flex items-center justify-center">
                  <i className="fa-solid fa-bolt-lightning text-white text-sm"></i>
                </div>
                <span className="text-lg font-black text-slate-900 tracking-tighter">EDU AI</span>
              </div>

              {assessment && (
                <div className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                  {['dashboard', 'academics', 'mentor', 'social'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode as ViewMode)}
                      className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${viewMode === mode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                      {mode === 'dashboard' ? 'Audit' : mode}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {assessment && (
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] font-black text-emerald-700 uppercase">Live</span>
                </div>
              )}
              <button onClick={resetAssessment} title="Reset" className="text-slate-400 hover:text-slate-900 text-xs font-bold transition-colors">
                <i className="fa-solid fa-rotate"></i>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className={`flex-1 ${viewMode === 'mentor' ? 'p-0' : 'py-8 px-4 sm:px-6 lg:px-8'}`}>
        {!assessment && !loading && (
          <div className="max-w-2xl mx-auto text-center mb-8 animate-in fade-in duration-500">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Career Engine</h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              Ground your career trajectory with deterministic market logic.
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] animate-in fade-in">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-8"></div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Syncing Digital Twin</h3>
            <p className="text-slate-50 mt-2 text-sm font-medium italic">Grounding against industry datasets...</p>
          </div>
        ) : error ? (
          <div className="max-w-xl mx-auto bg-white border border-red-100 p-8 rounded-3xl text-center shadow-xl">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-triangle-exclamation text-xl"></i>
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Twin Sync Failure</h3>
            <p className="text-slate-50 text-sm mt-3 mb-8 leading-relaxed font-medium bg-red-500 p-4 rounded-xl">{error}</p>
            <button
              onClick={() => { setError(null); setAssessment(null); }}
              className="px-8 py-3 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 transition-all font-black uppercase tracking-widest text-[10px]"
            >
              Retry Uplink
            </button>
          </div>
        ) : !assessment ? (
          <ProfileForm
            initialData={profile || INITIAL_PROFILE}
            onSubmit={handleAssessment}
          />
        ) : viewMode === 'dashboard' ? (
          <Dashboard assessment={assessment} profile={profile!} onReset={resetAssessment} />
        ) : viewMode === 'academics' ? (
          <Academics profile={profile!} assessment={assessment} onUpdateProfile={handleUpdateProfile} />
        ) : viewMode === 'mentor' ? (
          <div className="h-[calc(100vh-64px)] overflow-hidden">
            <ChatMentor profile={profile!} assessment={assessment} />
          </div>
        ) : (
          <SocialHub profile={profile!} />
        )}
      </main>

      {(!assessment || viewMode !== 'mentor') && (
        <footer className="py-8 border-t border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
              Edu AI &bull; Grounding Engine Active
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;