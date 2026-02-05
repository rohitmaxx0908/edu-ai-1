
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Opportunity } from '../types';
import { fetchOpportunities, fetchRssFeeds } from '../api/backend';

interface SocialHubProps {
  profile: UserProfile;
}

const SocialHub: React.FC<SocialHubProps> = ({ profile }) => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [newsHeadlines, setNewsHeadlines] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const hasLoaded = useRef(false);

  const load = async (isRetry = false) => {
    if (loading || (hasLoaded.current && !isRetry)) return;
    setLoading(true);
    setError(null);
    try {
      const [opps, news] = await Promise.all([
        fetchOpportunities(profile),
        fetchRssFeeds()
      ]);
      setOpportunities(opps || []);
      setNewsHeadlines(news || []);
      hasLoaded.current = true;
    } catch (err: any) {
      console.error("Social Hub Error:", err);
      const msg = err?.message?.includes('429') || err?.status === 429
        ? "Grounding Engine capacity reached. Retrying..."
        : "Failed to sync market opportunities.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [profile]);

  const toggleSave = (id: string) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = opportunities.filter(o => {
    const oppType = (o.type || '').toUpperCase().trim();
    const currentFilter = filter.toUpperCase();
    const matchesFilter = currentFilter === 'ALL' || oppType === currentFilter;
    const matchesSearch = (o.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (o.company?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getTypeStyles = (type: string) => {
    const t = (type || '').toUpperCase().trim();
    switch (t) {
      case 'INTERNSHIP': return { icon: 'fa-user-graduate', color: 'bg-blue-600', light: 'bg-blue-50', text: 'text-blue-600' };
      case 'COMPETITION': return { icon: 'fa-trophy', color: 'bg-amber-600', light: 'bg-amber-50', text: 'text-amber-600' };
      case 'EVENT': return { icon: 'fa-calendar-star', color: 'bg-purple-600', light: 'bg-purple-50', text: 'text-purple-600' };
      case 'PLACEMENT': return { icon: 'fa-briefcase', color: 'bg-emerald-600', light: 'bg-emerald-50', text: 'text-emerald-600' };
      default: return { icon: 'fa-circle-dot', color: 'bg-slate-600', light: 'bg-slate-50', text: 'text-slate-600' };
    }
  };

  if (loading && opportunities.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-32 flex flex-col items-center animate-pulse">
        <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Synchronizing Edu AI Feed</h3>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-2 space-y-6 animate-in fade-in duration-1000">

      {/* Market Pulse Ticker */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden px-4 py-2 flex items-center gap-6 shadow-sm">
        <div className="flex items-center gap-2 shrink-0 border-r border-slate-100 pr-4">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-900">Vitals</span>
        </div>
        <div className="flex-1 overflow-hidden whitespace-nowrap">
          <div className="flex gap-12 animate-marquee inline-block" role="marquee" aria-live="off">
            {(newsHeadlines.length > 0 ? newsHeadlines : [
              `Edu AI: ${profile.careerTarget.desiredRole} hiring +18%`,
              "Tech Winter Thawing: Big Tech hiring resumption noticed",
              "Skill Pivot: Vector Database expertise demand peaking",
              "Regional Insight: APAC Remote hubs expanding",
              "Competition: Major Hackathon in 14 days"
            ]).map((msg, i) => (
              <span key={i} className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">
                <span className="text-indigo-600 mr-2">●</span> {msg}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Discover Hero: Decreased length, Increased breath */}
      <div className="relative bg-slate-900 rounded-3xl p-6 lg:p-8 overflow-hidden shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="space-y-1 w-full lg:w-auto">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-indigo-500 text-white text-[7px] font-black uppercase tracking-widest rounded-sm shadow-lg shadow-indigo-500/20">Market Prime</span>
              <span className="text-[8px] font-bold text-slate-500 uppercase">Profile-Synced Agentic Discovery</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-white leading-none tracking-tighter">
              Discover <span className="text-indigo-400">Elite</span> Nodes.
            </h1>
            <p className="text-slate-400 text-[10px] font-medium max-w-sm leading-relaxed opacity-70">
              High-fidelity career opportunities grounded for <span className="text-white font-bold underline decoration-indigo-500/50 underline-offset-4">{profile.careerTarget.desiredRole}</span> trajectories.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-3/5">
            <div className="relative flex-1 group">
              <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 text-xs"></i>
              <input
                type="text"
                placeholder="Query market index..."
                className="w-full pl-12 pr-6 py-4 bg-white/5 border border-slate-700/50 rounded-2xl text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-bold text-xs backdrop-blur-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-slate-700/50 backdrop-blur-md overflow-x-auto no-scrollbar">
              {['ALL', 'INTERNSHIP', 'EVENT', 'COMPETITION'].map(t => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-6 py-2.5 text-[8px] font-black uppercase tracking-[0.2em] rounded-xl transition-all whitespace-nowrap ${filter === t
                      ? 'bg-white text-slate-900 shadow-xl'
                      : 'text-slate-500 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-red-100 shadow-sm">
          <i className="fa-solid fa-triangle-exclamation text-red-500 text-3xl mb-4"></i>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{error}</h3>
          <button onClick={() => load(true)} className="mt-6 px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all">Re-establish Sync</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length > 0 ? filtered.map((opp, idx) => {
            const styles = getTypeStyles(opp.type);
            const isSaved = savedIds.has(opp.id);

            return (
              <div
                key={opp.id}
                className="group relative flex flex-col bg-white border border-slate-200 rounded-[2rem] transition-all duration-500 hover:shadow-2xl hover:border-indigo-600/30 animate-in fade-in slide-in-from-bottom-8 overflow-hidden"
                data-testid={`opportunity-${opp.id}`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="p-8 pb-0 flex-1">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${styles.light} ${styles.text} shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                        <i className={`fa-solid ${styles.icon}`}></i>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">{opp.type}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-black text-slate-900">{opp.company}</span>
                          <span className="text-[10px] font-bold text-slate-400">{opp.location || 'Distributed'}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSave(opp.id)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isSaved ? 'bg-rose-50 text-rose-500 shadow-sm' : 'text-slate-200 hover:text-slate-900 hover:bg-slate-50'}`}
                      aria-label={isSaved ? 'Remove bookmark' : 'Bookmark opportunity'}
                    >
                      <i className={`fa-${isSaved ? 'solid' : 'regular'} fa-bookmark text-sm`}></i>
                    </button>
                  </div>

                  <div className="space-y-5">
                    <h3 className="text-lg font-black text-slate-900 leading-[1.2] group-hover:text-indigo-600 transition-colors">
                      {opp.title}
                    </h3>

                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                      <div className="space-y-1">
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Match Compatibility</span>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                              className="h-full bg-indigo-500 transition-all duration-1000 delay-300" 
                              data-testid="match-score-bar"
                              role="progressbar"
                              aria-label="Match score"
                              data-value={Math.round(opp.matchScore)}
                              data-min="0"
                              data-max="100"
                              style={{ width: `${opp.matchScore}%` }}
                            ></div>
                          </div>
                          <span className="text-[11px] font-black text-indigo-600">{opp.matchScore}%</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Compensation</span>
                        <span className="block text-[11px] font-black text-slate-800">{opp.stipend || 'Competitive'}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 group-hover:bg-indigo-50/30 transition-all">
                      <p className="text-[10px] text-slate-600 leading-relaxed font-medium italic">
                        "{opp.relevanceReason}"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-8 pt-6 mt-auto bg-white">
                  <div className="flex flex-wrap gap-2 mb-6">
                    {opp.requirements?.slice(0, 3).map((req, i) => (
                      <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[8px] font-black text-slate-500 uppercase tracking-tight">
                        {req}
                      </span>
                    ))}
                  </div>

                  <a
                    href={opp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 hover:translate-y-[-2px] hover:shadow-2xl active:scale-95 transition-all duration-300"
                  >
                    <span>Analyze Module</span>
                    <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
                  </a>

                  <div className="flex justify-between items-center mt-6">
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                      Closes: {opp.deadline || 'Rolling'}
                    </span>
                    <div className="flex gap-2">
                      <i className="fa-brands fa-linkedin text-slate-300 hover:text-blue-600 cursor-pointer text-xs"></i>
                      <i className="fa-brands fa-x-twitter text-slate-300 hover:text-slate-900 cursor-pointer text-xs"></i>
                    </div>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="col-span-full py-32 text-center bg-white border border-slate-200 rounded-[3rem] shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 text-slate-200">
                <i className="fa-solid fa-satellite text-3xl"></i>
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">Index Synchronization Failed</h3>
              <p className="text-slate-400 mt-3 max-w-sm mx-auto text-[11px] font-medium leading-relaxed">The grounding agent could not find deterministic matches. Adjust your career horizon and deep-scan again.</p>
              <button
                onClick={() => { setFilter('ALL'); setSearchQuery(''); load(true); }}
                className="mt-10 px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/20"
              >
                Execute Deep Signal Scan
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(20%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
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

export default SocialHub;
