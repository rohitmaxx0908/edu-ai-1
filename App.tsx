
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
import UpdateModal from './components/UpdateModal';
import { checkForUpdates } from './services/updateService';
import { Capacitor } from '@capacitor/core';

type ViewMode = 'dashboard' | 'mentor' | 'social' | 'academics' | 'news' | 'discuss';

const NAV_ITEMS: { id: ViewMode; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Audit', icon: 'fa-chart-pie' },
  { id: 'academics', label: 'Academics', icon: 'fa-graduation-cap' },
  { id: 'mentor', label: 'Mentor', icon: 'fa-robot' },
  { id: 'social', label: 'Social', icon: 'fa-users' },
  { id: 'news', label: 'News', icon: 'fa-newspaper' },
  { id: 'discuss', label: 'Discuss', icon: 'fa-comments' },
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const [updateInfo, setUpdateInfo] = useState<{
    updateUrl: string;
    latestVersion: string;
    forceUpdate: boolean;
    releaseNotes?: string;
  } | null>(null);

  // App Version - MUST MATCH android/app/build.gradle versionName
  const APP_VERSION = "1.0";

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    const checkUpdate = async () => {
      if (Capacitor.isNativePlatform()) {
        const update = await checkForUpdates(APP_VERSION);
        if (update) setUpdateInfo(update);
      }
    };
    checkUpdate();
  }, [APP_VERSION]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser: User | null) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
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

  useEffect(() => {
    if (viewMode !== 'social') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [viewMode]);

  const handleAssessment = async (data: UserProfile) => {
    setLoading(true);
    setError(null);
    try {
      try { await dbService.saveProfile(data); } catch (e) { console.warn("Profile save warning:", e); }

      setProfile(data);
      const result = await assessCareer(data);
      if (!result || !result.learning_roadmap) throw new Error("The Twin Agent generated an unstable dataset.");

      setAssessment(result);
      await dbService.saveAssessment(result);
    } catch (err: any) {
      console.error("Critical AI Error:", err);
      console.warn("Switching to Twin Simulation Protocol.");
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { getMockAssessment } = await import('./services/geminiService');
        const mockResult = await getMockAssessment();
        setAssessment(mockResult);
        try { await dbService.saveAssessment(mockResult); } catch (e) { console.error("DB Save failed", e); }
        setError(null);
      } catch (fallbackErr) {
        setError('The Digital Twin signal was lost during synchronization.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    try { await dbService.saveProfile(newProfile); } catch (e) { console.error("Sync failed", e); }
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
    } catch (error) { console.error("Error signing out", error); }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#050b14] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="w-16 h-16 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin z-10 shadow-[0_0_30px_rgba(99,102,241,0.5)]"></div>
      </div>
    );
  }

  if (!user) return <Auth />;

  // Render Logic
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in zoom-in-95 duration-700">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse"></div>
            <div className="w-20 h-20 border-4 border-slate-200/50 border-t-indigo-600 rounded-full animate-spin relative z-10"></div>
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <i className="fa-solid fa-bolt text-indigo-500 animate-pulse"></i>
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">Syncing Digital Twin</h3>
          <p className="text-slate-400 mt-2 text-xs font-bold uppercase tracking-[0.2em] animate-pulse">Establishing Uplink...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="max-w-md w-full bg-white/50 backdrop-blur-xl border border-red-100 p-10 rounded-[2.5rem] text-center shadow-2xl shadow-red-500/5 hover:scale-[1.02] transition-transform duration-500">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-red-50">
              <i className="fa-solid fa-triangle-exclamation text-3xl animate-pulse"></i>
            </div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">Signal Lost</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">{error}</p>
            <button
              onClick={() => { setError(null); setAssessment(null); }}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl hover:bg-red-600 transition-all font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-900/20 hover:shadow-red-600/30 hover:-translate-y-1 relative overflow-hidden group"
            >
              <span className="relative z-10">Retry Uplink</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>
          </div>
        </div>
      );
    }

    if (!assessment || !profile) return <ProfileForm initialData={profile || INITIAL_PROFILE} onSubmit={handleAssessment} />;

    const components: Record<ViewMode, React.ReactElement> = {
      dashboard: <Dashboard assessment={assessment} profile={profile} onReset={resetAssessment} />,
      academics: <Academics profile={profile} assessment={assessment} onUpdateProfile={handleUpdateProfile} />,
      mentor: <ChatMentor profile={profile} assessment={assessment} />,
      social: <SocialHub profile={profile} />,
      news: <NewsHub careerTarget={profile.careerTarget.desiredRole} />,
      discuss: <ChatRoom />
    };

    // Wrap interactive views for desktop consistency
    if (['mentor', 'news', 'discuss'].includes(viewMode)) {
      return (
        <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-90px)] overflow-hidden rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 bg-white/80 backdrop-blur-3xl relative animate-in fade-in zoom-in-95 duration-500 ring-1 ring-white/60">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>
          {components[viewMode]}
        </div>
      );
    }

    return components[viewMode] || components.dashboard;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-['Outfit'] selection:bg-indigo-500/30 overflow-x-hidden relative">

      {/* Global Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-500/5 rounded-full blur-[120px] mix-blend-multiply animate-[pulse_10s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-cyan-500/5 rounded-full blur-[100px] mix-blend-multiply animate-[pulse_12s_ease-in-out_infinite_reverse]"></div>
      </div>

      {/* Desktop Header */}
      {assessment && (
        <nav className="sticky top-0 z-[100] px-6 py-4 transition-all duration-300">
          <div className="max-w-[1600px] mx-auto bg-white/70 backdrop-blur-2xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] px-6 py-3 flex justify-between items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/50 via-white/20 to-transparent pointer-events-none"></div>

            <div className="flex items-center gap-8 relative z-10">
              <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setViewMode('dashboard')}>
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform group-hover:rotate-6">
                  <i className="fa-solid fa-bolt-lightning text-sm"></i>
                </div>
                <div>
                  <h1 className="text-lg font-black text-slate-900 leading-none tracking-tight group-hover:text-indigo-600 transition-colors">EDU AI</h1>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Pilot v{APP_VERSION}</p>
                </div>
              </div>

              {/* Desktop Nav Pills */}
              <div className="hidden lg:flex items-center bg-slate-100/50 p-1 rounded-2xl border border-slate-200/50">
                {NAV_ITEMS.map((item) => {
                  const isActive = viewMode === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setViewMode(item.id)}
                      className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${isActive ? 'bg-white text-slate-900 shadow-sm scale-105' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'}`}
                    >
                      <i className={`fa-solid ${item.icon} ${isActive ? 'text-indigo-500' : 'opacity-70'}`}></i>
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-4 relative z-10">
              {/* Status Indicator */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Online</span>
              </div>

              <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

              <div className="flex items-center gap-3 group cursor-pointer" onClick={handleSignOut}>
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-900">{user.displayName || 'Agent'}</p>
                  <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest group-hover:text-red-500 transition-colors">Disconnect</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 border-2 border-white shadow-md flex items-center justify-center text-indigo-700 font-black text-sm">
                  {user.displayName ? user.displayName[0].toUpperCase() : 'A'}
                </div>
              </div>
            </div>
          </div>
        </nav>
      )}

      <UpdateModal
        isOpen={!!updateInfo}
        onClose={() => setUpdateInfo(null)}
        updateUrl={updateInfo?.updateUrl || ''}
        latestVersion={updateInfo?.latestVersion || ''}
        forceUpdate={updateInfo?.forceUpdate || false}
        releaseNotes={updateInfo?.releaseNotes}
      />

      <main className={`flex-1 relative z-10 transition-all duration-500 pb-32 lg:pb-8 ${viewMode === 'dashboard' ? 'px-4 lg:px-8' : 'px-4 lg:px-8 pt-4'}`}>
        {renderContent()}
      </main>

      {/* Mobile Floating Island Ecosystem */}
      {assessment && (
        <div className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 w-auto min-w-[320px] z-[1000]">
          {/* Glass Dock */}
          <div className="bg-slate-950/80 backdrop-blur-3xl border border-white/10 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] rounded-[2.5rem] p-2 flex items-center justify-between relative overflow-hidden ring-1 ring-white/5 mx-4">

            {/* Ambient inner glow */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-indigo-500/10 to-transparent pointer-events-none"></div>

            {NAV_ITEMS.map((item) => {
              const isActive = viewMode === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setViewMode(item.id);
                    // Haptic feedback pattern if available (omitted for web)
                  }}
                  className={`relative w-12 h-12 flex items-center justify-center rounded-full transition-all duration-500 ${isActive ? 'scale-110' : 'hover:bg-white/5 active:scale-95'}`}
                >
                  {/* Active Pill Background */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.5)] animate-in zoom-in-50 duration-300">
                      {/* Inner spark */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.4),transparent_70%)] rounded-full"></div>
                    </div>
                  )}

                  {/* Icon */}
                  <i className={`fa-solid ${item.icon} relative z-10 text-lg transition-all duration-300 ${isActive ? 'text-white drop-shadow-sm' : 'text-slate-500 group-hover:text-slate-300'}`}></i>

                  {/* Active Dot Indicator */}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_5px_white]"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;