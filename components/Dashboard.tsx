import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { AssessmentResult, UserProfile } from '../types';
import { SKILL_LABELS } from '../constants';
import { fetchNews, NewsArticle } from '../api/backend';

interface DashboardProps {
  assessment: AssessmentResult;
  profile: UserProfile;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ assessment, profile, onReset }) => {

  const [techNews, setTechNews] = React.useState<NewsArticle[]>([]);
  const [loadingNews, setLoadingNews] = React.useState(true);
  const [systemStatus, setSystemStatus] = React.useState('Monitoring');

  // Mock Trend Data for Area Chart
  const trendData = [
    { name: 'W1', score: 65 }, { name: 'W2', score: 68 },
    { name: 'W3', score: 75 }, { name: 'W4', score: 72 },
    { name: 'W5', score: 82 }, { name: 'W6', score: 85 },
  ];

  React.useEffect(() => {
    const loadNews = async () => {
      setLoadingNews(true);
      const news = await fetchNews();
      setTechNews(news && news.length > 0 ? news.slice(0, 3) : []);
      setLoadingNews(false);
    };
    loadNews();

    const statuses = ['Analyzing Habits', 'Predicting Trends', 'Indexing Market Data', 'Optimizing Paths', 'Monitoring'];
    let i = 0;
    const interval = setInterval(() => {
      setSystemStatus(statuses[i]);
      i = (i + 1) % statuses.length;
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const skillData = Object.entries(profile.skillInventory).map(([key, value]) => ({
    name: SKILL_LABELS[key] || key,
    value: value,
  }));

  const SKILL_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#0ea5e9'];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700 pb-24">

      {/* 1. HERO HUD SECTION */}
      <div className="relative overflow-hidden bg-[#0f172a] rounded-[2.5rem] shadow-2xl border border-slate-800 p-8 md:p-12 group">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/30 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px]"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/30 blur-xl rounded-full"></div>
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 flex items-center justify-center relative shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent"></div>
                <i className="fa-solid fa-brain text-3xl text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-purple-400"></i>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-slate-900 shadow-lg">
                ONLINE
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Twin Network</h1>
                <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/5 text-[10px] font-bold text-indigo-300 uppercase tracking-widest backdrop-blur-md">
                  v2.4
                </span>
              </div>
              <p className="text-slate-400 text-sm font-medium max-w-md leading-relaxed">
                Neural interface synced. Real-time career trajectory optimization active.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/80 backdrop-blur-md rounded-xl border border-slate-700/50 shadow-lg">
              <div className="flex gap-1">
                <span className="w-1 h-3 rounded-full bg-emerald-500 animate-[pulse_1s_ease-in-out_infinite]"></span>
                <span className="w-1 h-3 rounded-full bg-emerald-500 animate-[pulse_1.2s_ease-in-out_infinite]"></span>
                <span className="w-1 h-3 rounded-full bg-emerald-500 animate-[pulse_0.8s_ease-in-out_infinite]"></span>
              </div>
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">{systemStatus}</span>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5">Context ID</p>
              <p className="text-xs font-bold text-indigo-400 font-mono">{profile.personalContext.githubUsername || 'GUEST_NODE'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BENTO GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">

        {/* Metric Cards (Span 8) */}
        <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Skill Depth', val: (assessment.skillDepthScore || 0).toFixed(1), icon: 'fa-layer-group', color: 'from-indigo-500 to-blue-500' },
            { label: 'Velocity', val: (assessment.consistencyScore || 0).toFixed(1), icon: 'fa-gauge-high', color: 'from-emerald-500 to-teal-500' },
            { label: 'Readiness', val: (assessment.practicalReadinessScore || 0).toFixed(1), icon: 'fa-rocket', color: 'from-rose-500 to-orange-500' },
            { label: 'Match Rate', val: '94%', icon: 'fa-bullseye', color: 'from-violet-500 to-fuchsia-500' }
          ].map((m, i) => (
            <div key={i} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              <div className={`absolute top-0 right-0 p-16 bg-gradient-to-br ${m.color} opacity-5 rounded-bl-full group-hover:scale-110 transition-transform`}></div>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform`}>
                <i className={`fa-solid ${m.icon} text-white text-sm`}></i>
              </div>
              <p className="text-2xl font-black text-slate-900 tracking-tight mb-1">{m.val}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m.label}</p>
            </div>
          ))}

          {/* Trend Chart (Span 4 of 8 -> Full width of metric section) */}
          <div className="col-span-2 md:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm h-64 relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Performance Velocity</h3>
                <p className="text-[10px] font-medium text-slate-400">6-Week Trajectory Analysis</p>
              </div>
              <select className="bg-slate-50 border-none text-[10px] font-bold text-slate-500 uppercase tracking-wider rounded-lg py-1 px-3 outline-none cursor-pointer hover:bg-slate-100">
                <option>Last 6 Weeks</option>
                <option>Last Quarter</option>
              </select>
            </div>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Radar/Pie Chart (Span 4) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Skill Distribution</h3>
            <p className="text-[10px] font-medium text-slate-400">Visualizing proficiency balance</p>
          </div>
          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={skillData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {skillData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SKILL_COLORS[index % SKILL_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Metric */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
              <p className="text-2xl font-black text-slate-900">{skillData.length}</p>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Domains</p>
            </div>
          </div>
        </div>

        {/* 3. MARKET INTEL & NEWS */}
        <div className="lg:col-span-8 bg-slate-900 rounded-3xl p-8 relative overflow-hidden shadow-xl text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                <i className="fa-solid fa-globe text-indigo-400 text-sm"></i>
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Market Intelligence</h3>
            </div>

            {assessment.market_intel && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 border-b border-white/10 pb-8">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Projected Salary</p>
                  <p className="text-2xl font-black tracking-tight">{assessment.market_intel.salary_range}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Role Demand</p>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${assessment.market_intel.demand_level === 'HIGH' ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-amber-400'}`}></span>
                    <p className="text-xl font-black">{assessment.market_intel.demand_level}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Top Trending</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(assessment.market_intel.top_3_trending_skills || []).map((s, i) => (
                      <span key={i} className="text-[10px] font-bold bg-white/10 px-2 py-1 rounded-md border border-white/5">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loadingNews ? (
                <div className="col-span-full py-8 text-center text-slate-500 text-xs font-mono">Syncing global news feed...</div>
              ) : (
                techNews.map((article, i) => (
                  <a key={i} href={article.url} target="_blank" rel="noopener noreferrer" className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                    <div className="w-16 h-16 rounded-lg bg-slate-800 shrink-0 overflow-hidden relative">
                      {article.image && <img src={article.image} alt="" className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1 truncate">{article.source.name}</p>
                      <h4 className="text-xs font-bold text-white line-clamp-2 leading-relaxed group-hover:text-indigo-300 transition-colors">{article.title}</h4>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 4. PRIORITY ACTIONS LIST */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Strategic Priorities</h3>
            <button onClick={onReset} className="text-[9px] font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-wider">
              Reset Data
            </button>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[400px] p-2">
            {(assessment.next_priority_actions || []).sort((a, b) => a.order - b.order).map((act, i) => (
              <div key={i} className="group p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 mb-1">
                <div className="flex justify-between items-start mb-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black shadow-sm group-hover:bg-indigo-600 transition-colors">
                    {act.order}
                  </span>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${act.impact === 'HIGH' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                    {act.impact} IMP
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800 leading-relaxed mb-3">{act.action}</p>
                <div className="flex items-center gap-2 opacity-60">
                  <i className="fa-regular fa-clock text-[10px]"></i>
                  <p className="text-[9px] font-bold uppercase tracking-wider">{act.timeline}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100">
            <button className="w-full py-3 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 active:scale-95 transition-all shadow-lg shadow-slate-900/20">
              Generate New Plan
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
