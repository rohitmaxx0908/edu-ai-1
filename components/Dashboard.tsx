
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, XAxis, CartesianGrid, BarChart, Bar } from 'recharts';
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
  const [systemStatus, setSystemStatus] = React.useState('Initializing');
  const [currentTime, setCurrentTime] = React.useState(new Date());

  // Mock Trend Data for Area Chart with more granular data points
  const trendData = [
    { name: 'Mon', score: 65, efficiency: 40 },
    { name: 'Tue', score: 68, efficiency: 45 },
    { name: 'Wed', score: 75, efficiency: 55 },
    { name: 'Thu', score: 72, efficiency: 60 },
    { name: 'Fri', score: 82, efficiency: 75 },
    { name: 'Sat', score: 85, efficiency: 80 },
    { name: 'Sun', score: 88, efficiency: 85 },
  ];

  const activityData = [
    { name: '00', val: 10 }, { name: '04', val: 5 }, { name: '08', val: 30 },
    { name: '12', val: 70 }, { name: '16', val: 90 }, { name: '20', val: 50 },
  ];

  React.useEffect(() => {
    const loadNews = async () => {
      setLoadingNews(true);
      const news = await fetchNews();
      setTechNews(news && news.length > 0 ? news.slice(0, 3) : []);
      setLoadingNews(false);
    };
    loadNews();

    const statuses = ['Neural Sync', 'Pattern Recognition', 'Optimizing Vector Paths', 'Live Monitoring'];
    let i = 0;
    const interval = setInterval(() => {
      setSystemStatus(statuses[i]);
      i = (i + 1) % statuses.length;
    }, 4000);

    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  const skillData = Object.entries(profile.skillInventory).map(([key, value]) => ({
    name: SKILL_LABELS[key] || key,
    value: value,
  }));

  const SKILL_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#0ea5e9'];

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-700 pb-24 p-6">

      {/* 1. HERO HUD SECTION */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-800 p-8 md:p-12 group transition-all duration-500 hover:shadow-indigo-500/10">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>

        {/* Floating Particles/Grid Effect */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="flex items-start gap-6">
            <div className="relative group/avatar">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 blur-xl opacity-40 group-hover/avatar:opacity-60 transition-opacity duration-500 rounded-full"></div>
              <div className="w-24 h-24 rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center relative shadow-2xl overflow-hidden group-hover/avatar:scale-105 transition-transform duration-500 ring-4 ring-slate-900/50">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent"></div>
                <i className="fa-solid fa-brain text-4xl text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-purple-400 filter drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]"></i>

                {/* Scanning Line Animation */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent w-full h-[2px] animate-[scan_3s_ease-in-out_infinite_alternate]"></div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-slate-900 text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full border border-slate-800 shadow-xl flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> ONLINE
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
                  Twin <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Network</span>
                </h1>
                <span className="px-2 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-bold text-indigo-300 uppercase tracking-widest backdrop-blur-md">
                  Beta 2.4
                </span>
              </div>
              <p className="text-slate-400 text-sm font-medium max-w-lg leading-relaxed flex items-center gap-2">
                <i className="fa-solid fa-terminal text-xs text-indigo-500"></i>
                Neural interface synced. Real-time career trajectory optimization active.
              </p>

              <div className="flex items-center gap-4 mt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] text-slate-500 font-bold">
                      <i className="fa-solid fa-user"></i>
                    </div>
                  ))}
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Connected to Global Grid
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 w-full md:w-auto">
            <div className="flex items-center gap-4 px-5 py-3 bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-lg w-full md:w-auto justify-between md:justify-end group/status hover:bg-slate-800/80 transition-colors">
              <div className="flex flex-col items-end mr-2">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">System Status</span>
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest group-hover/status:text-emerald-300 transition-colors">{systemStatus}</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3].map((_, idx) => (
                  <span key={idx} className={`w-1 h-4 rounded-full bg-emerald-500 animate-[pulse_1s_ease-in-out_infinite]`} style={{ animationDelay: `${idx * 0.2}s` }}></span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-6 px-4">
              <div className="text-right hidden md:block">
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Session Time</p>
                <p className="text-xl font-black text-white">{currentTime.toLocaleTimeString([], { hour12: false })}</p>
              </div>
              <div className="h-8 w-px bg-slate-800 hidden md:block"></div>
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Identify Context</p>
                <p className="text-sm font-bold text-indigo-400 font-mono tracking-wide">{profile.personalContext.githubUsername || 'GUEST_NODE'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BENTO GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">

        {/* Metric Cards (Span 8) */}
        <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Skill Depth', val: (assessment.skillDepthScore || 0).toFixed(1), icon: 'fa-layer-group', color: 'from-indigo-500 to-blue-500', trend: '+12%' },
            { label: 'Velocity', val: (assessment.consistencyScore || 0).toFixed(1), icon: 'fa-gauge-high', color: 'from-emerald-500 to-teal-500', trend: '+5%' },
            { label: 'Readiness', val: (assessment.practicalReadinessScore || 0).toFixed(1), icon: 'fa-rocket', color: 'from-rose-500 to-orange-500', trend: '+8%' },
            { label: 'Match Rate', val: '94%', icon: 'fa-bullseye', color: 'from-violet-500 to-fuchsia-500', trend: 'Stable' }
          ].map((m, i) => (
            <div key={i} className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-100/40 transition-all duration-300 group relative overflow-hidden hover:-translate-y-1">
              <div className={`absolute top-0 right-0 p-20 bg-gradient-to-br ${m.color} opacity-0 group-hover:opacity-5 rounded-bl-full transition-opacity duration-500`}></div>

              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <i className={`fa-solid ${m.icon} text-white text-lg`}></i>
                </div>
                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{m.trend}</span>
              </div>

              <p className="text-3xl font-black text-slate-900 tracking-tighter mb-1">{m.val}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m.label}</p>
            </div>
          ))}

          {/* Trend Chart (Span 4 of 8 -> Full width of metric section) */}
          <div className="col-span-2 md:col-span-4 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm h-[340px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[80px] opacity-0 group-hover:opacity-50 transition-opacity pointer-events-none"></div>

            <div className="flex justify-between items-center mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                  <i className="fa-solid fa-chart-area text-slate-400"></i>
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Performance Velocity</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">Real-time Trajectory Analysis</p>
                </div>
              </div>

              <div className="flex bg-slate-50 rounded-xl p-1 border border-slate-100">
                {['1W', '1M', '3M'].map((t) => (
                  <button key={t} className={`px-3 py-1 text-[9px] font-black rounded-lg transition-all ${t === '1W' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[220px] w-full relative z-10 -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }}
                    dy={10}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', padding: '12px' }}
                    itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
                  <Area type="monotone" dataKey="efficiency" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorEff)" strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Radar/Pie Chart (Span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">

          {/* Skill Distribution */}
          <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm flex-1 relative overflow-hidden group hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300">
            <div className="mb-2">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Skill Distribution</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-1">Proficiency visualizer</p>
            </div>
            <div className="h-[250px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={skillData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    cornerRadius={6}
                    dataKey="value"
                    stroke="none"
                  >
                    {skillData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SKILL_COLORS[index % SKILL_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Metric */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[50%] text-center pointer-events-none">
                <div className="text-3xl font-black text-slate-900 leading-none">{skillData.length}</div>
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Domains</div>
              </div>
            </div>
          </div>

          {/* Activity Mini Chart */}
          <div className="bg-slate-900 rounded-[2.5rem] p-6 shadow-xl border border-slate-800 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Daily Activity</h3>
              <i className="fa-solid fa-bolt text-indigo-400 animate-pulse"></i>
            </div>

            <div className="h-[100px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <Bar dataKey="val" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 3. MARKET INTEL & NEWS */}
        <div className="lg:col-span-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-2xl text-white group">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none mix-blend-screen"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-600/10 rounded-full blur-[80px] -ml-10 -mb-10 pointer-events-none mix-blend-screen"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-lg">
                  <i className="fa-solid fa-globe text-indigo-400 text-lg"></i>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wide">Market Intelligence</h3>
                  <p className="text-xs text-slate-400 font-medium">Scraping global opportunities</p>
                </div>
              </div>
              <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5">
                <i className="fa-solid fa-arrows-rotate text-white text-xs"></i>
              </button>
            </div>

            {assessment.market_intel && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/5 backdrop-blur-sm p-5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors group/card">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 group-hover/card:text-indigo-300">Projected Salary</p>
                  <p className="text-2xl font-black tracking-tight">{assessment.market_intel.salary_range}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm p-5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors group/card">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 group-hover/card:text-indigo-300">Role Demand</p>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${assessment.market_intel.demand_level === 'HIGH' ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-amber-400'}`}></span>
                    <p className="text-xl font-black">{assessment.market_intel.demand_level}</p>
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm p-5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors group/card">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 group-hover/card:text-indigo-300">Hiring Velocity</p>
                  <div className="w-full bg-white/10 rounded-full h-2 mt-2 overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full w-[85%] animate-[progress_2s_ease-out]"></div>
                  </div>
                  <p className="text-right text-[10px] font-bold mt-1 text-indigo-300">85%</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-white"></span> Live Feed
              </h4>
              {loadingNews ? (
                <div className="col-span-full py-8 text-center text-slate-500 text-xs font-mono animate-pulse">Syncing global news feed...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {techNews.map((article, i) => (
                    <a key={i} href={article.url} target="_blank" rel="noopener noreferrer" className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group/news hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20">
                      <div className="w-16 h-16 rounded-xl bg-slate-800 shrink-0 overflow-hidden relative border border-white/10">
                        {article.image && <img src={article.image} alt="" className="w-full h-full object-cover opacity-80 group-hover/news:scale-110 transition-transform duration-500" />}
                      </div>
                      <div className="min-w-0 flex-1 flex flex-col justify-center">
                        <div className="flex justify-between items-start">
                          <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1 truncate">{article.source.name}</p>
                          <i className="fa-solid fa-arrow-right -rotate-45 text-[10px] text-slate-500 group-hover/news:text-white transition-colors"></i>
                        </div>
                        <h4 className="text-xs font-bold text-slate-200 line-clamp-2 leading-relaxed group-hover/news:text-white transition-colors">{article.title}</h4>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. PRIORITY ACTIONS LIST */}
        <div className="lg:col-span-4 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-xl transition-shadow duration-300">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center backdrop-blur-sm">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Strategic Priorities</h3>
              <p className="text-[9px] font-bold text-slate-400 w-full mt-0.5">AI-Generated Tasks</p>
            </div>

            <button onClick={onReset} className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:text-red-500 hover:border-red-200 transition-all shadow-sm">
              <i className="fa-solid fa-rotate-right text-xs"></i>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[400px] p-4 space-y-2 custom-scrollbar">
            {(assessment.next_priority_actions || []).sort((a, b) => a.order - b.order).map((act, i) => (
              <div key={i} className="group p-5 rounded-[1.5rem] hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 cursor-pointer relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center text-[10px] font-black shadow-sm transition-all duration-300">
                      {act.order}
                    </span>
                    <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md border ${act.impact === 'HIGH' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                      {act.impact} Priority
                    </span>
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-700 leading-relaxed mb-3 group-hover:text-slate-900 transition-colors pl-9">{act.action}</p>
                <div className="flex items-center gap-2 opacity-60 pl-9">
                  <i className="fa-regular fa-clock text-[10px] text-indigo-500"></i>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{act.timeline}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 bg-white border-t border-slate-50">
            <button className="w-full py-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 active:scale-95 transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center gap-2 group/btn relative overflow-hidden">
              <span className="relative z-10">Generate New Plan</span>
              <i className="fa-solid fa-wand-magic-sparkles relative z-10 group-hover/btn:rotate-12 transition-transform"></i>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
            </button>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes scan {
            0% { top: 0%; opacity: 0; }
            50% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
