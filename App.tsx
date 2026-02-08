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

    // Check for updates on mount
    const checkUpdate = async () => {
      if (Capacitor.isNativePlatform()) {
        const update = await checkForUpdates(APP_VERSION);
        if (update) {
          setUpdateInfo(update);
        }
      }
    };
    checkUpdate();
  }, [APP_VERSION]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
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
    if (viewMode !== 'social') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { getMockAssessment } = await import('./services/geminiService');
        const mockResult = await getMockAssessment();

        setAssessment(mockResult);
        try { await dbService.saveAssessment(mockResult); } catch (e) { console.error("DB Save failed", e); }

        setError(null);
      } catch (fallbackErr) {
        const userFriendlyError = 'The Digital Twin signal was lost during synchronization.';
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

  // Render Content based on viewMode
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-indigo-100 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest mt-8">Syncing Digital Twin</h3>
          <p className="text-slate-400 mt-2 text-sm font-bold uppercase tracking-widest">Grounding against industry datasets...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="max-w-xl mx-auto mt-20 bg-white border border-red-100 p-8 rounded-[2rem] text-center shadow-xl">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <i className="fa-solid fa-triangle-exclamation text-2xl"></i>
          </div>
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Twin Sync Failure</h3>
          <p className="text-slate-600 text-sm mt-4 mb-8 leading-relaxed font-medium bg-red-50 p-6 rounded-2xl border border-red-100">{error}</p>
          <button
            onClick={() => { setError(null); setAssessment(null); }}
            className="px-8 py-4 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 transition-all font-black uppercase tracking-widest text-[10px] shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-1"
          >
            Retry Uplink
          </button>
        </div>
      );
    }

    if (!assessment || !profile) {
      return (
        <ProfileForm
          initialData={profile || INITIAL_PROFILE}
          onSubmit={handleAssessment}
        />
      );
    }

    switch (viewMode) {
      case 'dashboard':
        return <Dashboard assessment={assessment} profile={profile} onReset={resetAssessment} />;
      case 'academics':
        return <Academics profile={profile} assessment={assessment} onUpdateProfile={handleUpdateProfile} />;
      case 'mentor':
        return (
          <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-85px)] overflow-hidden rounded-[2rem] border border-slate-200 shadow-sm bg-white">
            <ChatMentor profile={profile} assessment={assessment} />
          </div>
        );
      case 'news':
        return (
          <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-85px)] overflow-hidden rounded-[2rem] border border-slate-200 shadow-sm bg-white">
            <NewsHub careerTarget={profile.careerTarget.desiredRole} />
          </div>
        );
      case 'discuss':
        return (
          <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-85px)] overflow-hidden rounded-[2rem] border border-slate-200 shadow-sm bg-white">
            <ChatRoom />
          </div>
        );
      case 'social':
        return <SocialHub profile={profile} />;
      default:
        return <Dashboard assessment={assessment} profile={profile} onReset={resetAssessment} />;
    }
  };

  const navClass = "sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm transition-all duration-300";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Outfit'] selection:bg-indigo-500/30">
      {/* Premium Glass Header */}
      <nav className={navClass}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo Section */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setViewMode('dashboard')}>
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <div className="bg-slate-900 p-2.5 rounded-xl flex items-center justify-center relative border border-slate-800 shadow-lg group-hover:scale-105 transition-transform group-active:scale-95">
                    <i className="fa-solid fa-bolt-lightning text-white text-sm"></i>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">EDU AI</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none mt-0.5">Career Engine</span>
                </div>
              </div>

              {/* Desktop Navigation */}
              {assessment && (
                <div className="hidden md:flex items-center gap-1 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50 ml-4">
                  {NAV_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setViewMode(item.id)}
                      className={`relative px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center gap-2 ${viewMode === item.id
                        ? 'bg-white text-slate-900 shadow-md scale-105 ring-1 ring-black/5'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                        }`}
                    >
                      <i className={`fa-solid ${item.icon} ${viewMode === item.id ? 'text-indigo-500' : 'text-slate-400 group-hover:text-slate-600'}`}></i>
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              {assessment && (
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-widest">Live Uplink</span>
                </div>
              )}

              {deferredPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95"
                >
                  <i className="fa-solid fa-download"></i> <span className="">Install App</span>
                </button>
              )}

              <div className="flex items-center gap-3 pl-6 border-l border-slate-200 ml-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 border-2 border-white shadow-md flex items-center justify-center group cursor-pointer hover:border-indigo-100 transition-all">
                  <span className="text-sm font-black text-indigo-600 group-hover:scale-110 transition-transform">
                    {user.displayName ? user.displayName[0].toUpperCase() : user.email?.[0].toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-[11px] font-bold text-slate-900 truncate max-w-[100px] leading-tight">
                    {user.displayName || 'User'}
                  </span>
                  <button onClick={handleSignOut} className="text-[9px] text-slate-400 hover:text-red-500 font-bold transition-colors text-left uppercase tracking-wider mt-0.5">
                    Sign Out
                  </button>
                </div>
                <button onClick={handleSignOut} className="sm:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                  <i className="fa-solid fa-power-off text-sm"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Floating Dock (Replaces Scrollbar) */}
        {assessment && (
          <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-auto max-w-[95%] z-[100]">
            <div className="flex items-center gap-1 bg-slate-900/95 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl shadow-slate-900/50 ring-1 ring-white/10 overflow-x-auto no-scrollbar">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setViewMode(item.id)}
                  className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl shrink-0 transition-all duration-300 ${viewMode === item.id
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg scale-110 -translate-y-2 ring-2 ring-white/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/10 active:scale-95'
                    }`}
                >
                  <i className={`text-lg mb-0.5 fa-solid ${item.icon}`}></i>
                  <span className="text-[8px] font-bold uppercase tracking-tighter scale-75 origin-top">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      <UpdateModal
        isOpen={!!updateInfo}
        onClose={() => setUpdateInfo(null)}
        updateUrl={updateInfo?.updateUrl || ''}
        latestVersion={updateInfo?.latestVersion || ''}
        forceUpdate={updateInfo?.forceUpdate || false}
        releaseNotes={updateInfo?.releaseNotes}
      />

      <main className={`flex-1 transition-all duration-500 ${viewMode === 'mentor' || viewMode === 'news' || viewMode === 'discuss' ? 'p-4 sm:p-6 lg:p-8 sm:pb-0 lg:pb-0' : 'py-8 px-4 sm:px-6 lg:px-8'}`}>
        {renderContent()}
      </main>

      {(!assessment || (viewMode !== 'mentor' && viewMode !== 'news' && viewMode !== 'discuss')) && (
        <footer className="py-12 border-t border-slate-200 bg-white relative overflow-hidden mt-auto">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 opacity-20"></div>
          <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              <i className="fa-solid fa-bolt-lightning text-slate-400"></i>
              <span className="text-lg font-black text-slate-300">EDU AI</span>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
              Edu AI &bull; Grounding Engine v{APP_VERSION}
            </p>
          </div>
        </footer>
      )
      }

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

export default App;