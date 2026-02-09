
import React, { useState, useEffect, useRef } from 'react';
import { fetchNews, fetchRssFeeds } from '../api/backend';

interface NewsArticle {
  title: string;
  description: string;
  content?: string;
  url?: string;
  image?: string;
  publishedAt?: string;
  source?: {
    name: string;
    url?: string;
  };
}

interface NewsHubProps {
  careerTarget?: string;
}

const NewsHub: React.FC<NewsHubProps> = ({ careerTarget = 'Technology' }) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [headlines, setHeadlines] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [activeTab, setActiveTab] = useState<'articles' | 'headlines' | 'daily' | 'opportunities'>('articles');
  const [dailyArticles, setDailyArticles] = useState<NewsArticle[]>([]);
  const hasLoaded = useRef(false);

  // Mock Job Data Generator
  const getMockJobs = () => [
    { id: 1, title: `Junior ${careerTarget} Developer`, company: 'TechNova', salary: '$70k - $90k', type: 'Remote', logo: 'fa-rocket' },
    { id: 2, title: `${careerTarget} Intern`, company: 'FutureSystems', salary: '$30/hr', type: 'Hybrid', logo: 'fa-robot' },
    { id: 3, title: `Associate ${careerTarget}`, company: 'CloudScale', salary: '$85k - $110k', type: 'On-site', logo: 'fa-cloud' },
    { id: 4, title: 'Growth Engineer', company: 'EduAI Labs', salary: '$90k - $120k', type: 'Remote', logo: 'fa-brain' },
  ];

  const loadDailyNews = async () => {
    setLoading(true);
    try {
      const news = await fetchNews("daily technology updates");
      setDailyArticles(news || []);
    } catch (err) { console.error("Failed to load daily news", err); }
    finally { setLoading(false); }
  };

  const [selectedTopic, setSelectedTopic] = useState('technology');

  const TOPICS = [
    { id: 'technology', label: 'Tech General', icon: 'fa-microchip' },
    { id: 'software engineering', label: 'Software Eng', icon: 'fa-code' },
    { id: 'artificial intelligence', label: 'AI & ML', icon: 'fa-brain' },
    { id: 'tech courses', label: 'Courses', icon: 'fa-graduation-cap' }
  ];

  const loadNews = async (isRetry = false) => {
    if (activeTab === 'daily') { await loadDailyNews(); return; }
    if (loading || (hasLoaded.current && !isRetry && selectedTopic === 'technology')) return;
    setLoading(true);
    setError(null);
    try {
      const newsData = await fetchNews(selectedTopic);
      const headlineData = await fetchRssFeeds();
      setArticles(newsData || []);
      setHeadlines(headlineData || []);
      if (newsData && newsData.length > 0) setSelectedArticle(newsData[0]);
      hasLoaded.current = true;
    } catch (err: any) {
      console.error("News Hub Error:", err);
      setError("Failed to load news updates.");
      const fallbackNews = [
        { title: "AI Skills Demand Surges", description: "Companies seeking professionals with advanced AI expertise.", url: "#", source: { name: "Tech Insider" } },
        { title: "Remote Work Trends", description: "Hybrid models dominating the tech landscape.", url: "#", source: { name: "Career Weekly" } },
        { title: "Emerging Tech Jobs", description: "Quantum computing creating new career paths.", url: "#", source: { name: "Tech News" } }
      ];
      setArticles(fallbackNews);
      if (fallbackNews.length > 0) setSelectedArticle(fallbackNews[0]);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadNews(true); }, [selectedTopic]);

  return (
    <div className="w-full h-full flex flex-col bg-transparent relative overflow-hidden group">

      {/* Header */}
      <div className="bg-white/40 backdrop-blur-md border-b border-white/20 px-6 py-4 z-20 sticky top-0 transition-all duration-300">
        <div className="flex flex-col gap-4 mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
                <i className="fa-solid fa-newspaper text-lg"></i>
              </div>
              <div>
                <h1 className="text-sm font-black text-slate-800 uppercase tracking-wide">News Stream</h1>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
                  </span>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Live Feed</p>
                </div>
              </div>
            </div>

            <button onClick={() => loadNews(true)} disabled={loading} className="w-8 h-8 flex items-center justify-center bg-white/50 border border-slate-200 rounded-full text-slate-400 hover:text-indigo-600 hover:rotate-180 transition-all shadow-sm">
              <i className={`fa-solid fa-rotate-right text-xs ${loading ? 'animate-spin' : ''}`}></i>
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar mask-linear-fade">
              {TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => { setSelectedTopic(topic.id); setActiveTab('articles'); }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${selectedTopic === topic.id ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white/50 text-slate-500 border-transparent hover:bg-white'}`}
                >
                  <i className={`fa-solid ${topic.icon} ${selectedTopic === topic.id ? 'text-indigo-400' : 'text-slate-400'}`}></i>
                  {topic.label}
                </button>
              ))}
            </div>

            <div className="flex bg-slate-100/50 p-1 rounded-xl shadow-inner max-w-fit border border-slate-200/50">
              {['articles', 'headlines', 'daily', 'opportunities'].map(tab => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab as any);
                    if (tab === 'daily' && dailyArticles.length === 0) loadDailyNews();
                  }}
                  className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm scale-105' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'}`}
                >
                  {tab === 'articles' ? 'Feed' : tab === 'headlines' ? 'Headlines' : tab === 'daily' ? 'Daily' : 'Jobs'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative w-full p-4 md:p-6 bg-slate-50/30">
        {activeTab === 'articles' ? (
          <div className="flex h-full gap-6 relative">
            {/* Article List - Mobile: Toggles, Desktop: Sidebar */}
            <div className={`w-full lg:w-[350px] flex-col bg-white/60 backdrop-blur-xl rounded-2xl lg:rounded-3xl border border-white/60 shadow-lg overflow-hidden h-full transition-all ${selectedArticle ? 'hidden lg:flex' : 'flex'}`}>
              <div className="p-4 border-b border-indigo-50/50 bg-white/40 backdrop-blur-md sticky top-0 z-10">
                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span> Latest Updates
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                {loading && articles.length === 0 ? (
                  <div className="p-10 text-center"><i className="fa-solid fa-spinner animate-spin text-indigo-500 text-2xl"></i></div>
                ) : (
                  articles.map((article, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedArticle(article)}
                      className={`w-full text-left p-4 rounded-2xl transition-all duration-300 border border-transparent group relative overflow-hidden ${selectedArticle?.title === article.title ? 'bg-white shadow-lg border-indigo-50 scale-[1.02] ring-1 ring-indigo-50' : 'hover:bg-white/80 hover:shadow-md hover:scale-[1.01]'}`}
                    >
                      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 transition-all duration-300 ${selectedArticle?.title === article.title ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>
                      <p className="text-[8px] font-black text-indigo-400 uppercase tracking-tight mb-1 flex items-center gap-1"><i className="fa-regular fa-newspaper"></i> {article.source?.name}</p>
                      <h4 className={`text-[11px] font-bold leading-relaxed line-clamp-2 ${selectedArticle?.title === article.title ? 'text-indigo-900' : 'text-slate-700'}`}>{article.title}</h4>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Article Detail - Mobile: Toggles, Desktop: Main Content */}
            <div className={`flex-1 bg-white lg:rounded-[2rem] rounded-2xl border border-slate-200/60 shadow-2xl overflow-hidden flex flex-col h-full relative animate-in zoom-in-95 duration-500 ${!selectedArticle ? 'hidden lg:flex' : 'flex'}`}>
              {selectedArticle ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="lg:hidden absolute top-4 left-4 z-20 w-8 h-8 rounded-full bg-slate-900/50 text-white backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg"
                  >
                    <i className="fa-solid fa-arrow-left text-xs"></i>
                  </button>

                  {selectedArticle.image ? (
                    <div className="h-64 md:h-80 w-full relative group">
                      <img src={selectedArticle.image} alt="" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                        <span className="px-2 py-1 bg-indigo-500/80 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest rounded-md border border-white/10 shadow-lg mb-3 inline-block">{selectedArticle.source?.name}</span>
                        <h1 className="text-xl md:text-3xl font-black text-white leading-tight shadow-sm drop-shadow-xl">{selectedArticle.title}</h1>
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 w-full bg-gradient-to-r from-slate-900 to-indigo-900 p-8 flex items-end"><h1 className="text-xl md:text-2xl font-black text-white leading-tight">{selectedArticle.title}</h1></div>
                  )}

                  <div className="p-6 md:p-10 max-w-4xl mx-auto">
                    <p className="text-lg font-serif font-medium text-slate-600 leading-relaxed mb-8 border-l-4 border-indigo-500 pl-6 italic">{selectedArticle.description}</p>
                    {selectedArticle.content && <div className="prose prose-sm prose-slate max-w-none mb-10 prose-headings:font-black prose-a:text-indigo-600"><p>{selectedArticle.content}</p></div>}
                    {selectedArticle.url && (
                      <div className="flex justify-center pb-8">
                        <a href={selectedArticle.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl hover:shadow-indigo-500/30 group">
                          Read Full Story <i className="fa-solid fa-arrow-right-long group-hover:translate-x-1 transition-transform"></i>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50/30">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 animate-bounce"><i className="fa-solid fa-newspaper text-3xl text-slate-300"></i></div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select an article</p>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'opportunities' ? (
          <div className="h-full overflow-y-auto pb-20 custom-scrollbar pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getMockJobs().map((job) => (
                <div key={job.id} className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-16 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-bl-[80px] -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform"></div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm"><i className={`fa-solid ${job.logo} text-indigo-600`}></i></div>
                      <span className="px-2 py-1 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest rounded-md">{job.type}</span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 mb-0.5">{job.title}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">{job.company}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-700">{job.salary}</span>
                      <button className="text-[9px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">Apply <i className="fa-solid fa-arrow-right"></i></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto pb-20 custom-scrollbar pr-2 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(activeTab === 'headlines' ? headlines : dailyArticles).map((item: any, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:shadow-indigo-100/30 hover:scale-[1.01] transition-all duration-300 group cursor-pointer animate-in fade-in slide-in-from-bottom-2 fill-mode-backwards" style={{ animationDelay: `${idx * 50}ms` }}>
                  <div className="flex gap-4">
                    <span className="text-4xl font-black text-slate-100 group-hover:text-indigo-50 transition-colors select-none">0{idx + 1}</span>
                    <div className="relative z-10 pt-1">
                      <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mb-2 flex items-center gap-1"><span className="w-1 h-1 bg-indigo-500 rounded-full"></span> {item.source?.name || 'Trending'}</p>
                      <h3 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-indigo-700 transition-colors line-clamp-3">{typeof item === 'string' ? item : item.title}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsHub;
