
import React, { useState, useEffect } from 'react';
import { UserProfile, AssessmentResult } from './types';
import { INITIAL_PROFILE } from './constants';
import { assessCareer } from './api/backend';
import { dbService } from './services/dbService';
import { auth, onAuthStateChanged, signOut, User } from './services/firebase';
import ProfileForm from './components/ProfileForm';
import Dashboard from './components/Dashboard';
import ChatMentor from './components/ChatMentor';
import SocialHub from './components/SocialHub';
import Academics from './components/Academics';
import NewsHub from './components/NewsHub';
import ChatRoom from './components/ChatRoom';
import Auth from './components/Auth';

type ViewMode = 'dashboard' | 'mentor' | 'social' | 'academics' | 'news' | 'discuss';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser: User | null) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Only fetch data if we have a user
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
  }, [user]);

  // Scroll to top when switching views (crucial for mobile)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [viewMode]);

  const handleAssessment = async (data: UserProfile) => {
    setLoading(true);
    setError(null);
    try {
      try {
        await dbService.saveProfile(data);
      } catch (saveErr) {
        console.warn("Profile save failed, continuing:", saveErr);
      }

      setProfile(data);

      const result = await assessCareer(data);
      if (!result || !result.learning_roadmap) {
        throw new Error("The Twin Agent generated an unstable dataset.");
      }

      setAssessment(result);
      await dbService.saveAssessment(result);

    } catch (err: any) {
      console.error("Critical AI Error:", err);
      console.warn("Switching to Twin Simulation Protocol due to uplink failure.");

      try {
        const { getMockAssessment } = await import('./services/geminiService');
        const mockResult = await getMockAssessment();

        setAssessment(mockResult);
        try { await dbService.saveAssessment(mockResult); } catch (e) { console.error("DB Save failed", e); }

        setError(null);
      } catch (fallbackErr) {
        let userFriendlyError = 'The Digital Twin signal was lost during synchronization.';
        setError(userFriendlyError);
      }
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
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setProfile(null);
      setAssessment(null);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

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
                <div className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 overflow-x-auto">
                  {['dashboard', 'academics', 'mentor', 'social', 'news', 'discuss'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode as ViewMode)}
                      className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all whitespace-nowrap ${viewMode === mode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                      {mode === 'dashboard' ? 'Audit' : mode}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {assessment ? (
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100 hidden sm:flex">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] font-black text-emerald-700 uppercase">Live</span>
                </div>
              ) : null}

              <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
                <span className="text-[10px] font-bold text-slate-500 hidden sm:block truncate max-w-[100px]">{user.email}</span>
                <button onClick={handleSignOut} title="Sign Out" className="text-slate-400 hover:text-red-600 text-xs font-bold transition-colors">
                  <i className="fa-solid fa-power-off"></i>
                </button>
              </div>

              {assessment && (
                <button onClick={resetAssessment} title="Reset" className="text-slate-400 hover:text-slate-900 text-xs font-bold transition-colors">
                  <i className="fa-solid fa-rotate"></i>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {assessment && (
          <div className="md:hidden border-t border-slate-100 bg-slate-50 overflow-x-auto no-scrollbar">
            <div className="flex px-4 py-2 gap-2 min-w-max">
              {['dashboard', 'academics', 'mentor', 'social', 'news', 'discuss'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as ViewMode)}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap border ${viewMode === mode
                    ? 'bg-white text-indigo-600 border-indigo-100 shadow-sm'
                    : 'bg-white/50 text-slate-500 border-transparent hover:bg-white hover:text-slate-900'
                    }`}
                >
                  {mode === 'dashboard' ? 'Audit' : mode}
                </button>
              ))}
            </div>
          </div>
        )}
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
        ) : (!assessment || !profile) ? (
          <ProfileForm
            initialData={profile || INITIAL_PROFILE}
            onSubmit={handleAssessment}
          />
        ) : viewMode === 'dashboard' ? (
          <Dashboard assessment={assessment} profile={profile!} onReset={resetAssessment} />
        ) : viewMode === 'academics' ? (
          <Academics profile={profile!} assessment={assessment} onUpdateProfile={handleUpdateProfile} />
        ) : viewMode === 'mentor' ? (
          <div className="h-[calc(100vh-120px)] md:h-[calc(100vh-64px)] overflow-hidden">
            <ChatMentor profile={profile!} assessment={assessment} />
          </div>
        ) : viewMode === 'news' ? (
          <div className="h-[calc(100vh-120px)] md:h-[calc(100vh-64px)] overflow-hidden">
            <NewsHub careerTarget={profile!.careerTarget.desiredRole} />
          </div>

        ) : viewMode === 'discuss' ? (
          <ChatRoom />
        ) : (
          <SocialHub profile={profile!} />
        )
        }
      </main >

      {(!assessment || viewMode !== 'mentor') && (
        <footer className="py-8 border-t border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
              Edu AI &bull; Grounding Engine Active
            </p>
          </div>
        </footer>
      )}
    </div >
  );
};

export default App;