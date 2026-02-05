
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
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

  React.useEffect(() => {
    const loadNews = async () => {
      setLoadingNews(true);
      const news = await fetchNews();
      setTechNews(news.slice(0, 3)); // Only show top 3
      setLoadingNews(false);
    };
    loadNews();
  }, []);

  const skillData = Object.entries(profile.skillInventory).map(([key, value]) => ({
    name: SKILL_LABELS[key],
    value: value,
  }));

  const performanceData = [
    { name: 'Easy', value: profile.practiceOutput.problemDifficulty.easy, color: '#10b981' },
    { name: 'Medium', value: profile.practiceOutput.problemDifficulty.medium, color: '#f59e0b' },
    { name: 'Hard', value: profile.practiceOutput.problemDifficulty.hard, color: '#f43f5e' },
  ].filter(d => d.value > 0);

  // Ghost data for empty state
  const visualSkillData = skillData.every(d => d.value === 0)
    ? [{ name: 'Pending', value: 1, color: '#e2e8f0' }]
    : skillData;

  const visualPerformanceData = performanceData.length === 0
    ? [{ name: 'No Data', value: 1, color: '#e2e8f0' }]
    : performanceData;

  const SKILL_COLORS = ['#4f46e5', '#10b981', '#0ea5e9', '#f43f5e', '#f59e0b', '#8b5cf6', '#14b8a6'];
  const getSafeVal = (v: any) => typeof v === 'number' ? v : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700">
      {/* Smaller Agent Heartbeat Header */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-slate-900 tracking-tighter italic">Twin Audit</h1>
            <div className="flex items-center gap-2 px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
              <span className="text-[8px] font-black text-indigo-700 uppercase tracking-widest">{assessment.level || 'SYNCING'}</span>
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xl">
            "{assessment.career_risk_assessment || 'Evaluating risks based on current trajectory...'}"
          </p>
        </div>
        <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
          <div className="flex gap-2">
            {profile.personalContext.githubUsername && (
              <a href={`https://github.com/${profile.personalContext.githubUsername}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-900 text-white hover:scale-110 transition-transform" aria-label="GitHub profile">
                <i className="fa-brands fa-github text-sm"></i>
              </a>
            )}
            {profile.personalContext.linkedinUrl && (
              <a href={profile.personalContext.linkedinUrl.startsWith('http') ? profile.personalContext.linkedinUrl : `https://${profile.personalContext.linkedinUrl}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white hover:scale-110 transition-transform" aria-label="LinkedIn profile">
                <i className="fa-brands fa-linkedin-in text-sm"></i>
              </a>
            )}
          </div>
          <button onClick={onReset} className="px-4 py-1.5 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-lg text-[8px] font-black uppercase tracking-[0.2em] transition-all border border-slate-200">
            Re-Sync
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-6">
          {/* Smaller Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Skill Depth', val: getSafeVal(assessment.skillDepthScore), color: 'text-indigo-600', icon: 'fa-brain' },
              { label: 'Consistency', val: getSafeVal(assessment.consistencyScore), color: 'text-emerald-600', icon: 'fa-repeat' },
              { label: 'Readiness', val: getSafeVal(assessment.practicalReadinessScore), color: 'text-amber-600', icon: 'fa-fire' }
            ].map((m, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 text-center shadow-sm group hover:border-indigo-600 transition-colors">
                <i className={`fa-solid ${m.icon} ${m.color} text-base mb-2 opacity-40 group-hover:opacity-100 transition-opacity`}></i>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{m.label}</p>
                <p className={`text-2xl font-black ${m.color} tracking-tighter`}>{m.val.toFixed(1)}</p>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Skill Distribution</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={visualSkillData} innerRadius={45} outerRadius={65} paddingAngle={5} dataKey="value" stroke="none">
                    {visualSkillData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color || SKILL_COLORS[index % SKILL_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '10px' }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontSize: '8px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Market Intelligence Section */}
          {assessment.market_intel && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <i className="fa-solid fa-chart-line text-indigo-600 text-xs"></i>
                <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Market Intelligence (2025-26)</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimated Salary</p>
                  <p className="text-sm font-black text-slate-900">{assessment.market_intel.salary_range}</p>
                </div>
                <div>
                  <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Market Demand</p>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${assessment.market_intel.demand_level === 'HIGH' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                    <p className="text-sm font-black text-slate-900">{assessment.market_intel.demand_level}</p>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Trending Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {(assessment.market_intel.top_3_trending_skills || []).map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[9px] font-bold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-[9px] text-slate-500 italic font-medium">
                  <i className="fa-solid fa-quote-left mr-2 opacity-50"></i>
                  {assessment.market_intel.market_sentiment}
                </p>
              </div>
            </div>
          )}

          {/* Technology News Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <i className="fa-solid fa-newspaper text-indigo-600 text-xs"></i>
              <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Technology Headlines</h3>
            </div>

            {loadingNews ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-2 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-2 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : techNews.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {techNews.map((article, i) => (
                  <a
                    key={i}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block p-4 rounded-2xl bg-slate-50 hover:bg-slate-900 transition-all border border-slate-100 hover:border-slate-900"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[7px] font-black text-indigo-600 group-hover:text-indigo-400 uppercase tracking-widest">
                        {article.source.name}
                      </span>
                      <span className="text-[7px] font-black text-slate-400 group-hover:text-slate-500 uppercase">
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-slate-900 group-hover:text-white leading-snug">
                      {article.title}
                    </h4>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-slate-500 italic font-medium">No recent headlines found.</p>
            )}
          </div>
        </div>

        {/* Priority Stack Side column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 shadow-xl">
            <h3 className="text-[9px] font-black text-indigo-400 mb-6 tracking-[0.3em] uppercase text-center">Priority Stack</h3>
            <div className="space-y-4">
              {(assessment.next_priority_actions || []).slice(0, 3).sort((a, b) => a.order - b.order).map((act, i) => (
                <div key={i} className="group bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[8px] font-black text-slate-500 uppercase">OP-0{act.order}</span>
                    <span className={`text-[7px] px-2 py-0.5 rounded font-black uppercase ${act.impact === 'HIGH' ? 'bg-red-500/10 text-red-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                      {act.impact}
                    </span>
                  </div>
                  <p className="text-xs text-slate-100 font-black leading-snug mb-2">{act.action}</p>
                  <p className="text-[8px] text-slate-500 font-black uppercase">Hz: {act.timeline}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-6 text-center">Agent Insight</h3>
            <div className="flex gap-3">
              <div className="w-1 h-1 rounded-full bg-indigo-600 mt-1.5"></div>
              <p className="text-[10px] text-slate-600 leading-relaxed font-medium italic">"Analysis confirms path alignment with {profile.careerTarget.targetIndustry}."</p>
            </div>
          </div>
        </div>
      </div>

      {/* Identified Gaps Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-black text-slate-900 tracking-[0.2em] uppercase text-[9px]">Deterministic Gap Map</h3>
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Grounding Engine: Active</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-slate-100">
          {(assessment.identified_gaps || []).slice(0, 3).map((gap, i) => (
            <div key={i} className="p-6 hover:bg-slate-50/80 transition-all">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-black text-slate-900 tracking-tight uppercase text-xs">{gap.title}</h4>
                <span className={`px-2 py-0.5 text-[7px] font-black rounded uppercase ${gap.severity === 'CRITICAL' ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                  {gap.severity}
                </span>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] text-slate-700 leading-relaxed font-bold">{gap.quantification}</p>
                <p className="text-[9px] text-slate-500 italic leading-relaxed font-medium">{gap.impact}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
