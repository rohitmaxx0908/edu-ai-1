import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import { AssessmentResult, UserProfile } from '../types';
import { SKILL_LABELS } from '../constants';
import { fetchNews, NewsArticle } from '../api/backend';

interface DashboardProps {
  assessment: AssessmentResult;
  profile: UserProfile;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ assessment, profile, onReset }) => {
  const [techNews, setTechNews] = useState<NewsArticle[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [systemStatus, setSystemStatus] = useState('Initializing');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock Trend Data - More points for smoother curve
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
    { name: '00', val: 10 }, { name: '04', val: 25 }, { name: '08', val: 60 },
    { name: '12', val: 70 }, { name: '16', val: 90 }, { name: '20', val: 50 },
  ];

  useEffect(() => {
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

    return () => { clearInterval(interval); clearInterval(timeInterval); };
  }, []);

  const skillData = Object.entries(profile.skillInventory).map(([key, value]) => ({
    name: SKILL_LABELS[key] || key,
    value: value,
  }));

  const SKILL_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#0ea5e9'];

  return (
    <div className="max-w-[1800px] mx-auto space-y-8 animate-in fade-in duration-700 pb-32 p-4 lg:p-8 relative">

      {/* 3D Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px] mix-blend-screen animate-pulse delay-1000"></div>
      </div>

      {/* 1. ULTRA HERO HUD SECTION */}
      <div className="relative group perspective-1000">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-[3rem] blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-700"></div>
        <div className="relative overflow-hidden bg-slate-950/80 backdrop-blur-3xl rounded-[3rem] shadow-2xl border border-white/10 p-8 md:p-12 transition-transform duration-500 hover:scale-[1.005]">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>

          {/* Animated Grid Overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="flex items-center gap-8">
              <div className="relative group/avatar">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-cyan-500 blur-2xl opacity-40 group-hover/avatar:opacity-60 transition-opacity duration-500 rounded-full"></div>
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] bg-slate-900 border border-white/10 flex items-center justify-center relative shadow-2xl overflow-hidden group-hover/avatar:scale-105 transition-transform duration-500 ring-1 ring-white/20">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
                  <i className="fa-solid fa-brain text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-br from-indigo-300 via-white to-cyan-300 filter drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]"></i>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent w-full h-[2px] animate-[scan_3s_ease-in-out_infinite_alternate]"></div>
                </div>
                <div className="absolute -bottom-3 -right-3 bg-slate-950 text-emerald-400 text-[10px] font-black px-4 py-1.5 rounded-full border border-slate-800 shadow-xl flex items-center gap-2 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></span> ONLINE
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-4">
                  <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-none drop-shadow-2xl">
                    TWIN <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">NETWORK</span>
                  </h1>
                  <span className="px-3 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-[10px] font-black text-indigo-300 uppercase tracking-widest backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                    V2.4 BETA
                  </span>
                </div>
                <p className="text-slate-400 text-sm md:text-lg font-medium max-w-xl leading-relaxed flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-indigo-500"></span>
                  Neural interface synchronized. Career trajectory vector optimization is active.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 w-full md:w-auto">
              <div className="flex items-center gap-4 px-6 py-4 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl w-full md:w-auto justify-between md:justify-end group hover:bg-slate-800/60 transition-colors">
                <div className="flex flex-col items-end mr-4">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">System Status</span>
                  <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest group-hover:text-emerald-300 transition-colors shadow-emerald-500/20 drop-shadow-sm">{systemStatus}</span>
                </div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map((_, idx) => (
                    <span key={idx} className={`w-1.5 h-6 rounded-full bg-emerald-500/50 animate-[pulse_1.5s_ease-in-out_infinite]`} style={{ animationDelay: `${idx * 0.15}s` }}></span>
                  ))}
                </div>
              </div>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Session Time: {currentTime.toLocaleTimeString([], { hour12: false })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BENTO GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6">

        {/* Metric Cards - Modern Glass */}
        {[
          { label: 'Skill Depth', val: (assessment.skillDepthScore || 0).toFixed(1), icon: 'fa-layer-group', color: 'from-indigo-500 to-blue-500', trend: '+12%' },
          { label: 'Velocity', val: (assessment.consistencyScore || 0).toFixed(1), icon: 'fa-gauge-high', color: 'from-emerald-500 to-teal-500', trend: '+5%' },
          { label: 'Readiness', val: (assessment.practicalReadinessScore || 0).toFixed(1), icon: 'fa-rocket', color: 'from-rose-500 to-orange-500', trend: '+8%' },
          { label: 'Match Rate', val: '94%', icon: 'fa-bullseye', color: 'from-violet-500 to-fuchsia-500', trend: 'Stable' }
        ].map((m, i) => (
          <div key={i} className="col-span-1 md:col-span-3 lg:col-span-3 bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-6 border border-white/40 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden">
            <div className={`absolute top-0 right-0 p-20 bg-gradient-to-br ${m.color} opacity-0 group-hover:opacity-10 rounded-bl-full transition-opacity duration-500 blur-2xl`}></div>
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 ring-4 ring-white/50`}>
                <i className={`fa-solid ${m.icon} text-white text-lg drop-shadow-md`}></i>
              </div>
              <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 shadow-sm">{m.trend}</span>
            </div>
            <p className="text-4xl font-black text-slate-900 tracking-tighter mb-1 drop-shadow-sm">{m.val}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.label}</p>
          </div>
        ))}

        {/* Global Trend Chart - Wide Span */}
        <div className="col-span-1 md:col-span-6 lg:col-span-8 bg-white/60 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/50 shadow-xl h-[350px] relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none mix-blend-multiply"></div>

          <div className="flex justify-between items-center mb-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner"><i className="fa-solid fa-chart-area"></i></div>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Performance Velocity</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Trajectory Analysis</p>
              </div>
            </div>
            <div className="flex bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/50 backdrop-blur-sm">
              {['1W', '1M', '3M', '1Y'].map((t) => (
                <button key={t} className={`px-4 py-1.5 text-[9px] font-black rounded-lg transition-all ${t === '1W' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'}`}>{t}</button>
              ))}
            </div>
          </div>

          <div className="h-[220px] w-full relative z-10 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient>
                  <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.4} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 800 }} dy={15} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.5)',
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    padding: '12px'
                  }}
                  cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" activeDot={{ r: 6, stroke: 'white', strokeWidth: 3 }} />
                <Area type="monotone" dataKey="efficiency" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorEff)" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Matrix - Pie Chart */}
        <div className="col-span-1 md:col-span-6 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white/80 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/50 shadow-xl flex-1 relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Skill Matrix</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Distribution</p>
              </div>
              <button className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"><i className="fa-solid fa-ellipsis text-slate-400"></i></button>
            </div>

            <div className="h-[220px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={skillData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} cornerRadius={8} dataKey="value" stroke="none">
                    {skillData.map((entry, index) => <Cell key={`cell-${index}`} fill={SKILL_COLORS[index % SKILL_COLORS.length]} stroke="rgba(255,255,255,0.5)" strokeWidth={2} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[50%] text-center pointer-events-none">
                <div className="text-3xl font-black text-slate-900 leading-none drop-shadow-sm">{skillData.length}</div>
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Nodes</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. MARKET INTEL STREAM */}
        <div className="col-span-1 lg:col-span-8 bg-slate-950 rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl text-white group border border-slate-800 hover:border-indigo-500/30 transition-colors duration-500">
          {/* Animated Mesh Background */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-pulse delay-700"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-lg ring-1 ring-white/10"><i className="fa-solid fa-globe text-indigo-400 text-xl"></i></div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wide drop-shadow-md">Global Intelligence</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Real-time Market Data</p>
                </div>
              </div>
              <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5 active:rotate-180 duration-500"><i className="fa-solid fa-arrows-rotate text-white text-xs"></i></button>
            </div>

            {assessment.market_intel && (
              <div className="flex overflow-x-auto snap-x snap-mandatory pb-6 md:pb-0 md:grid md:grid-cols-3 gap-5 mb-10 no-scrollbar">
                {[
                  { l: 'Salary Vector', v: assessment.market_intel.salary_range, i: 'fa-money-bill-wave', c: 'text-emerald-400', bg: 'bg-emerald-500/10', b: 'border-emerald-500/20' },
                  { l: 'Demand Index', v: assessment.market_intel.demand_level, i: 'fa-chart-line', c: 'text-indigo-400', bg: 'bg-indigo-500/10', b: 'border-indigo-500/20' },
                  { l: 'Growth Velocity', v: 'High', i: 'fa-rocket', c: 'text-rose-400', bg: 'bg-rose-500/10', b: 'border-rose-500/20' }
                ].map((item, i) => (
                  <div key={i} className={`min-w-[280px] md:min-w-0 snap-center bg-slate-900/50 backdrop-blur-xl p-6 rounded-[2rem] border ${item.b} hover:bg-slate-800/80 transition-all group/card relative overflow-hidden`}>
                    <div className={`absolute top-0 right-0 p-12 ${item.bg} blur-3xl rounded-full -mt-6 -mr-6`}></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.l}</p>
                      <i className={`fa-solid ${item.i} text-sm ${item.c}`}></i>
                    </div>
                    <p className="text-2xl font-black tracking-tight text-white relative z-10">{item.v}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span> Live Feed Injector</h4>
              {loadingNews ? <div className="py-8 text-center text-slate-500 text-xs font-mono animate-pulse uppercase tracking-widest">Synchronizing Data Streams...</div> : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {techNews.map((article, i) => (
                    <a key={i} href={article.url} target="_blank" rel="noopener noreferrer" className="p-5 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group/news hover:-translate-y-1 block h-full backdrop-blur-sm">
                      <div className="flex justify-between items-start mb-3">
                        <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest truncate bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">{article.source.name}</p>
                        <i className="fa-solid fa-arrow-right -rotate-45 text-[10px] text-slate-600 group-hover/news:text-white transition-colors"></i>
                      </div>
                      <h4 className="text-xs font-bold text-slate-300 line-clamp-3 leading-relaxed group-hover/news:text-white transition-colors">{article.title}</h4>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. PRIORITY ACTIONS */}
        <div className="col-span-1 lg:col-span-4 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col h-full hover:shadow-2xl transition-shadow duration-300 relative">
          <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>

          <div className="p-8 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center backdrop-blur-xl sticky top-0 z-20">
            <div><h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Mission Log</h3><p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Next Objectives</p></div>
            <button onClick={onReset} className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:text-red-500 hover:border-red-200 transition-all shadow-sm active:rotate-180 duration-500"><i className="fa-solid fa-rotate-right text-xs"></i></button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[400px] p-6 space-y-3 custom-scrollbar bg-slate-50/30">
            {(assessment.next_priority_actions || []).sort((a, b) => a.order - b.order).map((act, i) => (
              <div key={i} className="group p-5 rounded-[1.5rem] bg-white hover:bg-indigo-50/50 transition-all border border-slate-100 hover:border-indigo-100 cursor-pointer relative overflow-hidden hover:shadow-lg hover:-translate-y-0.5 duration-300">
                <div className="flex items-center gap-4 mb-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center text-[10px] font-black shadow-inner transition-all">{act.order}</span>
                  <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md border tracking-wide ${act.impact === 'HIGH' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{act.impact} PRIORITY</span>
                </div>
                <p className="text-xs font-bold text-slate-700 leading-relaxed mb-1 group-hover:text-slate-900 transition-colors pl-10 border-l-2 border-slate-100 group-hover:border-indigo-500">{act.action}</p>
              </div>
            ))}
          </div>

          <div className="p-6 bg-white border-t border-slate-50 relative z-10">
            <button className="w-full py-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 active:scale-95 transition-all shadow-2xl hover:shadow-indigo-500/30 flex items-center justify-center gap-3 group/btn relative overflow-hidden">
              <span className="relative z-10">Generate New Protocol</span>
              <i className="fa-solid fa-wand-magic-sparkles relative z-10 group-hover/btn:rotate-12 transition-transform"></i>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 translate-x-[-100%] group-hover/btn:translate-x-0 transition-transform duration-500 ease-out"></div>
            </button>
          </div>
        </div>

      </div>

      <style>{` @keyframes scan { 0% { top: 0%; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } } `}</style>
    </div>
  );
};

export default Dashboard;
