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

  // Mock Opportunities Generator if backend empty
  const getMockOpps = (): Opportunity[] => [
    {
      id: '1',
      title: 'Frontend Innovation Intern',
      company: 'NeoSystems',
      location: 'Remote',
      type: 'INTERNSHIP',
      matchScore: 98,
      stipend: '$5k/mo',
      requirements: ['React', 'WebGL', 'Three.js'],
      relevanceReason: 'Directly aligns with your recent 3D portfolio work.',
      url: '#',
      deadline: '2 Days'
    },
    {
      id: '2',
      title: 'AI Product Hackathon',
      company: 'OpenAI x Stanford',
      location: 'Palo Alto',
      type: 'COMPETITION',
      matchScore: 94,
      stipend: '$50k Prize',
      requirements: ['Prompt Eng.', 'Python'],
      relevanceReason: 'Your NLP assessment scores make you a top contender.',
      url: '#',
      deadline: '1 Week'
    },
    {
      id: '3',
      title: 'Junior DevOps Associate',
      company: 'CloudScale',
      location: 'Hybrid',
      type: 'PLACEMENT',
      matchScore: 88,
      stipend: '$120k/yr',
      requirements: ['AWS', 'Docker'],
      relevanceReason: 'Good entry point for your infrastructure interests.',
      url: '#',
      deadline: 'Rolling'
    }
  ];

  const load = async (isRetry = false) => {
    if (loading || (hasLoaded.current && !isRetry)) return;
    setLoading(true);
    setError(null);
    try {
      const [opps, news] = await Promise.all([
        fetchOpportunities(profile),
        fetchRssFeeds()
      ]);
      setOpportunities(opps && opps.length > 0 ? opps : getMockOpps());
      setNewsHeadlines(news || []);
      hasLoaded.current = true;
    } catch (err: any) {
      console.error("Social Hub Error:", err);
      // Fallback to mocks on error
      setOpportunities(getMockOpps());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [profile]);

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
      case 'INTERNSHIP': return { icon: 'fa-user-graduate', color: 'from-blue-500 to-indigo-600', text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' };
      case 'COMPETITION': return { icon: 'fa-trophy', color: 'from-amber-400 to-orange-600', text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' };
      case 'EVENT': return { icon: 'fa-calendar-star', color: 'from-purple-500 to-pink-600', text: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' };
      case 'PLACEMENT': return { icon: 'fa-briefcase', color: 'from-emerald-400 to-teal-600', text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' };
      default: return { icon: 'fa-circle-dot', color: 'from-slate-500 to-slate-700', text: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100' };
    }
  };

  if (loading && opportunities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-pulse">
        <div className="relative w-20 h-20 mb-8">
          <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
          <i className="fa-solid fa-satellite absolute inset-0 flex items-center justify-center text-indigo-600"></i>
        </div>
        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Synchronizing Market Uplink</h3>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700 pb-20 p-6 md:p-8">

      {/* Market Pulse Ticker (Floating Glass) */}
      <div className="bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl overflow-hidden px-6 py-3 flex items-center gap-6 shadow-sm sticky top-0 z-40 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-3 shrink-0 border-r border-slate-200 pr-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Live Pulse</span>
        </div>
        <div className="flex-1 overflow-hidden whitespace-nowrap mask-gradient-x">
          <div className="flex gap-16 animate-marquee inline-block hover:pause-animation">
            {(newsHeadlines.length > 0 ? newsHeadlines : [
              `Edu AI: ${profile.careerTarget.desiredRole} hiring +18%`,
              "Tech Winter Thawing: Big Tech hiring resumption noticed",
              "Skill Pivot: Vector Database expertise demand peaking",
              "Regional Insight: APAC Remote hubs expanding",
              "Competition: Major Hackathon in 14 days"
            ]).map((msg, i) => (
              <span key={i} className="text-[10px] font-bold text-slate-500 uppercase tracking-wider inline-flex items-center gap-2">
                <i className="fa-solid fa-bolt text-indigo-400 text-[8px]"></i> {msg}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Discovery Hero */}
      <div className="max-w-7xl mx-auto relative rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-2xl group min-h-[300px] flex items-center">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse selection:none pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] mix-blend-screen animate-pulse delay-700 selection:none pointer-events-none"></div>

        <div className="relative z-10 w-full p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="space-y-4 max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
              <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">Market Intelligence Synced</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tighter">
              Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Elite</span> Nodes.
            </h1>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
              We've identified <span className="text-white font-bold">{filtered.length}</span> high-velocity opportunities aligned with your specialized path in <span className="text-white font-bold">{profile.careerTarget.desiredRole}</span>.
            </p>
          </div>

          <div className="w-full lg:w-auto flex flex-col gap-4 min-w-[320px]">
            {/* Search Bar */}
            <div className="relative group/search">
              <input
                type="text"
                placeholder="Search by company, role, or stack..."
                className="w-full pl-12 pr-6 py-4 bg-white/10 border border-white/10 rounded-2xl text-white placeholder-slate-400 outline-none focus:bg-white/20 focus:border-indigo-400/50 transition-all font-medium text-sm backdrop-blur-md shadow-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/search:text-indigo-400 transition-colors"></i>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 p-1.5 bg-black/20 rounded-2xl backdrop-blur-md overflow-x-auto no-scrollbar border border-white/5">
              {['ALL', 'INTERNSHIP', 'EVENT', 'COMPETITION'].map(t => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`flex-1 px-4 py-2.5 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all whitespace-nowrap ${filter === t
                    ? 'bg-white text-slate-900 shadow-lg scale-105'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {filtered.length > 0 ? filtered.map((opp, idx) => {
          const styles = getTypeStyles(opp.type);
          const isSaved = savedIds.has(opp.id);

          return (
            <div
              key={opp.id}
              className="group relative flex flex-col bg-white rounded-[2rem] border border-slate-100 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 overflow-hidden animate-in fade-in slide-in-from-bottom-8 fill-mode-backwards"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Type Strip */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${styles.color}`}></div>

              <div className="p-8 flex-1 flex flex-col relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${styles.bg} ${styles.text} shadow-sm group-hover:scale-110 transition-transform duration-500 border-2 border-white`}>
                    <i className={`fa-solid ${styles.icon}`}></i>
                  </div>
                  <button
                    onClick={(e) => toggleSave(opp.id, e)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 ${isSaved ? 'bg-red-50 text-red-500 shadow-inner' : 'bg-slate-50 text-slate-300 hover:text-slate-600'}`}
                  >
                    <i className={`fa-${isSaved ? 'solid' : 'regular'} fa-bookmark`}></i>
                  </button>
                </div>

                <div className="mb-6">
                  <span className={`inline-block px-3 py-1 rounded-lg ${styles.bg} ${styles.text} text-[8px] font-black uppercase tracking-wider mb-3`}>{opp.type}</span>
                  <h3 className="text-xl font-black text-slate-900 leading-tight mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2">{opp.title}</h3>
                  <p className="text-sm font-bold text-slate-500 flex items-center gap-2">
                    {opp.company} <span className="w-1 h-1 rounded-full bg-slate-300"></span> {opp.location}
                  </p>
                </div>

                {/* Metrics */}
                <div className="bg-slate-50/50 rounded-3xl p-5 space-y-4 mb-8 border border-slate-100 group-hover:border-indigo-100 group-hover:bg-indigo-50/10 transition-colors">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Match Score</span>
                      <span className="text-[10px] font-black text-indigo-600">{opp.matchScore}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        style={{ width: `${opp.matchScore}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">Stipend</p>
                      <p className="text-xs font-black text-slate-800">{opp.stipend || 'Unpaid'}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">Closes</p>
                      <p className="text-xs font-black text-slate-800">{opp.deadline || 'Soon'}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-auto">
                  <a href={opp.url} target="_blank" rel="noopener noreferrer" className="block w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-center hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 group/btn relative overflow-hidden">
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      View Details <i className="fa-solid fa-arrow-right group-hover/btn:translate-x-1 transition-transform"></i>
                    </span>
                  </a>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="col-span-full py-20 text-center flex flex-col items-center opacity-60">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <i className="fa-solid fa-ghost text-4xl text-slate-300"></i>
            </div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">No Signals Detected</h3>
            <p className="text-slate-400 text-xs mt-2">Adjust your search parameters to find matching nodes.</p>
            <button
              onClick={() => { setFilter('ALL'); setSearchQuery(''); }}
              className="mt-6 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wide border-b border-indigo-200"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 60s linear infinite;
        }
        .hover\\:pause-animation:hover {
          animation-play-state: paused;
        }
        .mask-gradient-x {
          mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
        }
      `}</style>
    </div>
  );
};

export default SocialHub;
