
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
  const [filter, setFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [mousePos, setMousePos] = useState<Record<string, { x: number, y: number }>>({});
  const hasLoaded = useRef(false);

  // Mock Opportunities Generator
  const getMockOpps = (): Opportunity[] => [
    {
      id: '1', title: 'Frontend Innovation Intern', company: 'NeoSystems', location: 'Remote',
      type: 'INTERNSHIP', matchScore: 98, stipend: '$5k/mo', requirements: ['React', 'WebGL'],
      relevanceReason: 'Directly aligns with your recent 3D portfolio work.', url: '#', deadline: '2 Days'
    },
    {
      id: '2', title: 'AI Product Hackathon', company: 'OpenAI x Stanford', location: 'Palo Alto',
      type: 'COMPETITION', matchScore: 94, stipend: '$50k Prize', requirements: ['Prompt Eng.', 'Python'],
      relevanceReason: 'Your NLP assessment scores make you a top contender.', url: '#', deadline: '1 Week'
    },
    {
      id: '3', title: 'Junior DevOps Associate', company: 'CloudScale', location: 'Hybrid',
      type: 'PLACEMENT', matchScore: 88, stipend: '$120k/yr', requirements: ['AWS', 'Docker'],
      relevanceReason: 'Good entry point for infrastructure interests.', url: '#', deadline: 'Rolling'
    }
  ];

  const load = async () => {
    if (loading || hasLoaded.current) return;
    setLoading(true);
    try {
      const [opps, news] = await Promise.all([fetchOpportunities(profile), fetchRssFeeds()]);
      setOpportunities(opps && opps.length > 0 ? opps : getMockOpps());
      setNewsHeadlines(news || []);
      hasLoaded.current = true;
    } catch (err) {
      console.error(err);
      setOpportunities(getMockOpps());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [profile]);

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
    const matchesFilter = filter === 'ALL' || (o.type || '').toUpperCase() === filter;
    const matchesSearch = (o.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (o.company?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getTypeStyles = (type: string) => {
    switch ((type || '').toUpperCase()) {
      case 'INTERNSHIP': return { icon: 'fa-user-graduate', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', gradient: 'from-blue-500 to-indigo-600' };
      case 'COMPETITION': return { icon: 'fa-trophy', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', gradient: 'from-amber-400 to-orange-600' };
      case 'PLACEMENT': return { icon: 'fa-briefcase', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', gradient: 'from-emerald-400 to-teal-600' };
      default: return { icon: 'fa-circle-dot', bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100', gradient: 'from-slate-500 to-slate-700' };
    }
  };

  const handleMouseMove = (e: React.MouseEvent, id: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos(prev => ({ ...prev, [id]: { x, y } }));
  };

  if (loading) {
    return (
      <div className="max-w-[1600px] mx-auto p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-white rounded-[2rem] h-[400px] animate-pulse border border-slate-100 p-8 flex flex-col gap-4">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl"></div>
            <div className="h-4 bg-slate-100 rounded w-1/3"></div>
            <div className="h-8 bg-slate-100 rounded w-3/4"></div>
            <div className="h-4 bg-slate-100 rounded w-1/2"></div>
            <div className="flex-1"></div>
            <div className="h-12 bg-slate-100 rounded-2xl w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700 pb-24 p-6 md:p-8">

      {/* Ticker */}
      <div className="bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl overflow-hidden px-6 py-3 flex items-center gap-6 shadow-sm sticky top-0 z-40 w-full max-w-7xl mx-auto ring-1 ring-black/5">
        <div className="flex items-center gap-3 shrink-0 border-r border-slate-200 pr-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Live Pulse</span>
        </div>
        <div className="flex-1 overflow-hidden whitespace-nowrap mask-gradient-x">
          <div className="flex gap-16 animate-marquee inline-block hover:pause-animation">
            {(newsHeadlines.length > 0 ? newsHeadlines : [
              `Edu AI: ${profile.careerTarget.desiredRole} hiring +18%`,
              "Tech Winter Thawing: Big Tech hiring resumption noticed",
              "Skill Pivot: Vector Database expertise demand peaking"
            ]).map((msg, i) => (
              <span key={i} className="text-[10px] font-bold text-slate-500 uppercase tracking-wider inline-flex items-center gap-2">
                <i className="fa-solid fa-bolt text-indigo-400 text-[8px]"></i> {msg}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Discovery Hero */}
      <div className="max-w-7xl mx-auto relative rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-2xl group min-h-[300px] flex items-center border border-slate-800">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] mix-blend-screen animate-pulse delay-700 pointer-events-none"></div>

        <div className="relative z-10 w-full p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="space-y-4 max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
              <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">Market Intelligence Synced</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-none tracking-tighter drop-shadow-lg">
              Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Elite</span> Nodes
            </h1>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
              <span className="text-white font-bold">{filtered.length}</span> high-velocity opportunities aligned with your specialized path in <span className="text-white font-bold border-b border-indigo-500/30 pb-0.5">{profile.careerTarget.desiredRole}</span>.
            </p>
          </div>

          <div className="w-full lg:w-auto flex flex-col gap-4 min-w-[320px]">
            <div className="relative group/search">
              <input
                type="text"
                placeholder="Search matrix..."
                className="w-full pl-12 pr-6 py-4 bg-white/10 border border-white/10 rounded-2xl text-white placeholder-slate-400 outline-none focus:bg-white/20 focus:border-indigo-400/50 transition-all font-medium text-sm backdrop-blur-md shadow-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/search:text-indigo-400 transition-colors"></i>
            </div>
            <div className="flex gap-2 p-1.5 bg-black/20 rounded-2xl backdrop-blur-md overflow-x-auto no-scrollbar border border-white/5">
              {['ALL', 'INTERNSHIP', 'COMPETITION', 'PLACEMENT'].map(t => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`flex-1 px-4 py-2.5 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all whitespace-nowrap ${filter === t ? 'bg-white text-slate-900 shadow-lg scale-105' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((opp, idx) => {
          const styles = getTypeStyles(opp.type);
          const isSaved = savedIds.has(opp.id);
          const { x, y } = mousePos[opp.id] || { x: 0, y: 0 };

          return (
            <div
              key={opp.id}
              onMouseMove={(e) => handleMouseMove(e, opp.id)}
              className="group relative flex flex-col bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 fill-mode-backwards hover:shadow-2xl hover:shadow-indigo-500/10 transition-shadow duration-500"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Radial Gradient Hover Effect */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `radial-gradient(600px circle at ${x}px ${y}px, rgba(99,102,241,0.03), transparent 40%)` }}
              ></div>

              <div className={`h-1.5 w-full bg-gradient-to-r ${styles.gradient}`}></div>

              <div className="p-8 flex-1 flex flex-col relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${styles.bg} ${styles.text} shadow-sm group-hover:scale-110 transition-transform duration-500 border-2 border-white ring-1 ring-slate-100`}>
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
                  <span className={`inline-block px-3 py-1 rounded-lg ${styles.bg} ${styles.text} text-[8px] font-black uppercase tracking-wider mb-3 border ${styles.border}`}>{opp.type}</span>
                  <h3 className="text-xl font-black text-slate-900 leading-tight mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">{opp.title}</h3>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1.5"><i className="fa-solid fa-building text-slate-300"></i> {opp.company}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="flex items-center gap-1.5"><i className="fa-solid fa-location-dot text-slate-300"></i> {opp.location}</span>
                  </div>
                </div>

                {/* Info Pills */}
                <div className="bg-slate-50/80 rounded-3xl p-5 mb-8 border border-slate-100 group-hover:border-indigo-100 group-hover:bg-indigo-50/5 transition-colors">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Match Score</p>
                      <p className="text-2xl font-black text-slate-900">{opp.matchScore}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Deadline</p>
                      <p className="text-xs font-black text-red-500">{opp.deadline || 'Soon'}</p>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full relative" style={{ width: `${opp.matchScore}%` }}>
                      <div className="absolute top-0 right-0 h-full w-2 bg-white/50 blur-[2px] animate-pulse"></div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto">
                  <a href={opp.url} target="_blank" rel="noopener noreferrer" className="block w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-center hover:bg-indigo-600 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 group/btn relative overflow-hidden">
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Apply Node <i className="fa-solid fa-arrow-right group-hover/btn:translate-x-1 transition-transform"></i>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .mask-gradient-x {
          mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
        }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 40s linear infinite; }
        .hover\\:pause-animation:hover { animation-play-state: paused; }
      `}</style>
    </div>
  );
};

export default SocialHub;
