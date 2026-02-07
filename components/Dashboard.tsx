import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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

  React.useEffect(() => {
    const loadNews = async () => {
      setLoadingNews(true);
      const news = await fetchNews();
      setTechNews(news.slice(0, 3)); // Only show top 3
      setLoadingNews(false);
    };
    loadNews();

    // Simulate system status updates
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
    fullMark: 10,
  }));

  const SKILL_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#0ea5e9'];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">

      {/* 1. TWIN NEURAL CORE HEADER */}
      <div className="relative overflow-hidden bg-slate-900 rounded-3xl shadow-2xl border border-slate-700/50 p-8">
        {/* Background Animation Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping"></div>
                <div className="relative w-14 h-14 bg-slate-800 rounded-full border border-indigo-500/50 flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full bg-[url('https://cdn.dribbble.com/users/1233499/screenshots/3850691/media/2529267104b28532f7253372c3664d6c.gif')] bg-cover opacity-60 mix-blend-screen"></div>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 border-2 border-slate-900 w-5 h-5 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-check text-[10px] text-slate-900"></i>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">Twin Model Active</h1>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{assessment.level || 'SYNCING'}</span>
                  <span className="text-slate-600 text-[10px]">•</span>
                  <span className="text-xs font-medium text-slate-400 italic">ID: {profile.personalContext.githubUsername || 'GUEST-USER'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest leading-none">{systemStatus}</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium max-w-[200px] text-right leading-relaxed">
              Real-time calibration with market vectors is active.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">

          {/* 2. RISK & PERFORMANCE METRICS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 md:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <i className="fa-solid fa-shield-halved text-amber-500"></i>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Risk Assessment</h3>
                </div>
                <p className="text-lg font-bold text-slate-800 leading-snug">
                  "{assessment.career_risk_assessment || 'Evaluating trajectory...'}"
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-medium text-slate-500 bg-amber-50 rounded-lg p-3 border border-amber-100">
                <i className="fa-solid fa-circle-info text-amber-500"></i>
                Based on current market volatility and skill gaps.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Skill Depth', val: (assessment.skillDepthScore || 0).toFixed(1), color: 'text-indigo-600', bg: 'bg-indigo-50' },
                { label: 'Consistency', val: (assessment.consistencyScore || 0).toFixed(1), color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Readiness', val: (assessment.practicalReadinessScore || 0).toFixed(1), color: 'text-rose-600', bg: 'bg-rose-50' },
                { label: 'Market Match', val: '92%', color: 'text-blue-600', bg: 'bg-blue-50' }
              ].map((m, i) => (
                <div key={i} className={`flex flex-col items-center justify-center p-4 rounded-3xl border border-slate-100 ${m.bg}`}>
                  <p className={`text-2xl font-black ${m.color} tracking-tighter`}>{m.val}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{m.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. SKILL DISTRIBUTION CHART (Bar Chart for better clarity) */}
          <div className="bg-white p-4 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <i className="fa-solid fa-chart-simple text-indigo-600"></i>
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Skill Matrix</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Self-reported proficiency analysis</p>
                </div>
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={skillData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {skillData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SKILL_COLORS[index % SKILL_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#1e293b' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4. MARKET INTEL */}
          {assessment.market_intel && (
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <i className="fa-solid fa-globe text-indigo-400"></i>
                  <h3 className="text-xs font-black text-indigo-200 uppercase tracking-[0.2em]">Global Market Intel</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Salary Band</p>
                    <p className="text-2xl font-black tracking-tight">{assessment.market_intel.salary_range}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Demand Level</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${assessment.market_intel.demand_level === 'HIGH' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-amber-500'}`}></div>
                      <p className="text-xl font-black tracking-tight">{assessment.market_intel.demand_level}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Hottest Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {(assessment.market_intel.top_3_trending_skills || []).map((skill, i) => (
                        <span key={i} className="px-2.5 py-1 bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold text-indigo-100">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-sm text-indigo-100/80 font-medium italic">
                    "{assessment.market_intel.market_sentiment}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 5. TECH NEWS */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Tech Feed</h3>
              <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-500 uppercase">Live</span>
            </div>

            {loadingNews ? (
              <div className="text-center py-10 text-slate-400 text-xs font-medium">Syncing feed...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {techNews.map((article, i) => (
                  <a key={i} href={article.url} target="_blank" rel="noopener noreferrer" className="group block space-y-3 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                    <div className="aspect-video bg-slate-200 rounded-xl overflow-hidden relative">
                      {article.image && (
                        <img src={article.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-indigo-600 uppercase tracking-widest mb-1">{article.source.name}</p>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">{article.title}</h4>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SIDE COLUMN */}
        <div className="lg:col-span-4 space-y-8">

          {/* Priority Actions */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="bg-slate-900 p-6 flex justify-between items-center">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Priority Stack</h3>
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            </div>
            <div className="p-2">
              {(assessment.next_priority_actions || []).slice(0, 4).sort((a, b) => a.order - b.order).map((act, i) => (
                <div key={i} className="group p-4 hover:bg-slate-50 rounded-2xl transition-colors border-b border-dashed border-slate-100 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">#{act.order}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${act.impact === 'HIGH' ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                      {act.impact} IMP
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 leading-snug mb-2">{act.action}</p>
                  <div className="flex items-center gap-2">
                    <i className="fa-regular fa-clock text-[10px] text-slate-400"></i>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{act.timeline}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100">
            <h3 className="text-[9px] font-black text-indigo-900 uppercase tracking-widest mb-4">Manual Override</h3>
            <div className="space-y-2">
              <button onClick={onReset} className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                Reset Twin Data
              </button>
              <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-md shadow-indigo-200">
                Run New Simul
              </button>
            </div>
          </div>

          {/* Agent Message */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative">
            <i className="fa-solid fa-quote-left text-4xl text-slate-100 absolute top-4 left-4 -z-0"></i>
            <div className="relative z-10 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-900 shrink-0 flex items-center justify-center">
                <i className="fa-solid fa-robot text-white text-sm"></i>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-600 italic leading-relaxed">
                  "My analysis indicates a critical need for deeper system design implementation. Your coding speed is excellent, but architectural patterns are lagging."
                </p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-3">- Twin Agent</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
