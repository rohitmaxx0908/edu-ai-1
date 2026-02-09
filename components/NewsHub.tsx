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
    } catch (err) {
      console.error("Failed to load daily news", err);
    } finally {
      setLoading(false);
    }
  };

  const [selectedTopic, setSelectedTopic] = useState('technology');

  const TOPICS = [
    { id: 'technology', label: 'Tech General', icon: 'fa-microchip' },
    { id: 'software engineering', label: 'Software Eng', icon: 'fa-code' },
    { id: 'artificial intelligence', label: 'AI & ML', icon: 'fa-brain' },
    { id: 'tech courses', label: 'Courses', icon: 'fa-graduation-cap' }
  ];

  const loadNews = async (isRetry = false) => {
    if (activeTab === 'daily') {
      await loadDailyNews();
      return;
    }

    if (loading || (hasLoaded.current && !isRetry && selectedTopic === 'technology')) return;
    setLoading(true);
    setError(null);
    try {
      // Fetch news for the selected topic
      const newsData = await fetchNews(selectedTopic);
      // Always fetch headlines (RSS) as they are general tech
      const headlineData = await fetchRssFeeds();

      setArticles(newsData || []);
      setHeadlines(headlineData || []);

      if (newsData && newsData.length > 0) {
        setSelectedArticle(newsData[0]);
      }
      hasLoaded.current = true;
    } catch (err: any) {
      console.error("News Hub Error:", err);
      setError("Failed to load news updates. Check your connection.");

      // Fallback demo news
      const fallbackNews = [
        {
          title: "AI Skills Demand Surges in 2026",
          description: "Companies across industries are seeking professionals with advanced AI and ML expertise.",
          url: "#",
          source: { name: "Tech Insider" }
        },
        {
          title: "Remote Work Trends Evolve",
          description: "New research shows hybrid models dominating the tech industry landscape.",
          url: "#",
          source: { name: "Career Weekly" }
        },
        {
          title: "Emerging Technologies Shape Job Market",
          description: "Quantum computing and edge AI creating unprecedented career opportunities.",
          url: "#",
          source: { name: "Tech News" }
        }
      ];
      setArticles(fallbackNews);
      if (fallbackNews.length > 0) setSelectedArticle(fallbackNews[0]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews(true); // Always reload on topic change
  }, [selectedTopic]);

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-2xl border-b border-indigo-50/50 px-6 py-5 z-20 sticky top-0 shadow-sm transition-all duration-300">
        <div className="flex flex-col gap-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-2xl transition-transform hover:scale-105 ring-1 ring-white/20">
                  <i className="fa-solid fa-newspaper text-white text-lg"></i>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">News Hub</h1>
                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md inline-block mt-0.5">Global Intelligence Stream</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => loadNews(true)}
                disabled={loading}
                className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:rotate-180 transition-all duration-500 shadow-sm hover:shadow-md"
                title="Refresh Stream"
              >
                <i className={`fa-solid fa-rotate-right text-sm ${loading ? 'animate-spin' : ''}`}></i>
              </button>
            </div>
          </div>

          {/* Topics & Tabs Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Topics */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar mask-linear-fade">
              {TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => {
                    setSelectedTopic(topic.id);
                    setActiveTab('articles');
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-b-2 ${selectedTopic === topic.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20 translate-y-[-1px]'
                    : 'bg-white text-slate-500 border-transparent hover:border-slate-200 hover:bg-slate-50'
                    }`}
                >
                  <i className={`fa-solid ${topic.icon} ${selectedTopic === topic.id ? 'text-indigo-400' : 'text-slate-400'}`}></i>
                  {topic.label}
                </button>
              ))}
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner max-w-fit">
              {['articles', 'headlines', 'daily', 'opportunities'].map(tab => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab as any);
                    if (tab === 'daily' && dailyArticles.length === 0) {
                      loadDailyNews();
                    }
                  }}
                  className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab
                    ? 'bg-white text-indigo-600 shadow-sm transform scale-105'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'
                    }`}
                >
                  {tab === 'articles' ? 'Feed' :
                    tab === 'headlines' ? 'Headlines' :
                      tab === 'daily' ? 'Daily' : 'Jobs'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative max-w-7xl mx-auto w-full p-4 md:p-6">

        {activeTab === 'articles' ? (
          <div className="flex h-full gap-6">
            {/* Article Sidebar list */}
            <div className="w-[380px] hidden lg:flex flex-col bg-white/70 backdrop-blur-2xl rounded-[2rem] border border-white/50 shadow-xl shadow-slate-200/40 overflow-hidden h-full">
              <div className="p-5 border-b border-indigo-50/50 bg-white/60 backdrop-blur-md sticky top-0 z-10">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                  Latest Updates
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {loading && articles.length === 0 ? (
                  <div className="p-10 text-center"><i className="fa-solid fa-spinner animate-spin text-indigo-500 text-2xl"></i></div>
                ) : (
                  articles.map((article, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedArticle(article)}
                      className={`w-full text-left p-5 rounded-3xl transition-all duration-300 border border-transparent group relative overflow-hidden ${selectedArticle?.title === article.title
                        ? 'bg-white shadow-xl shadow-indigo-100/50 border-indigo-50 scale-[1.02] ring-1 ring-indigo-100'
                        : 'hover:bg-white hover:shadow-lg hover:shadow-slate-100 hover:scale-[1.01]'
                        }`}
                    >
                      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 transition-all duration-300 ${selectedArticle?.title === article.title ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>
                      <p className="text-[9px] font-black text-indigo-400 uppercase tracking-tight mb-2 flex items-center gap-2">
                        <i className="fa-regular fa-newspaper"></i> {article.source?.name}
                      </p>
                      <h4 className={`text-xs font-bold leading-relaxed transition-colors ${selectedArticle?.title === article.title ? 'text-indigo-900' : 'text-slate-700 group-hover:text-slate-900'}`}>
                        {article.title}
                      </h4>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-[9px] text-slate-400 font-medium">{new Date(article.publishedAt || Date.now()).toLocaleDateString()}</p>
                        <i className="fa-solid fa-chevron-right text-[10px] text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all"></i>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Selected Article Reading Pane */}
            <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200/50 shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col h-full relative animate-in zoom-in-95 duration-500">
              {selectedArticle ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                  {selectedArticle.image ? (
                    <div className="h-80 md:h-96 w-full relative group">
                      <img src={selectedArticle.image} alt="" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
                        <div className="flex items-center gap-3 mb-4 animate-in slide-in-from-bottom-4 delay-100">
                          <span className="px-3 py-1 bg-indigo-500/80 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-lg border border-white/10 shadow-lg">
                            {selectedArticle.source?.name}
                          </span>
                          <span className="px-3 py-1 bg-white/10 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-lg border border-white/10">
                            Top Story
                          </span>
                        </div>
                        <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-white leading-tight shadow-sm drop-shadow-xl animate-in slide-in-from-bottom-6 delay-200">
                          {selectedArticle.title}
                        </h1>
                      </div>
                    </div>
                  ) : (
                    <div className="h-40 w-full bg-gradient-to-r from-slate-900 to-indigo-900 p-8 md:p-12 flex items-end">
                      <h1 className="text-2xl md:text-4xl font-black text-white leading-tight animate-in slide-in-from-bottom-4">
                        {selectedArticle.title}
                      </h1>
                    </div>
                  )}

                  <div className="p-8 md:p-12 max-w-4xl mx-auto">

                    <p className="text-xl md:text-2xl font-serif font-medium text-slate-600 leading-relaxed mb-10 border-l-4 border-indigo-500 pl-8 italic animate-in slide-in-from-bottom-8 delay-300">
                      {selectedArticle.description}
                    </p>

                    {selectedArticle.content && (
                      <div className="prose prose-lg prose-slate max-w-none mb-12 prose-headings:font-black prose-a:text-indigo-600 animate-in slide-in-from-bottom-10 delay-500">
                        <p>{selectedArticle.content}</p>
                      </div>
                    )}

                    {selectedArticle.url && (
                      <div className="flex justify-center pb-12 animate-in slide-in-from-bottom-12 delay-700">
                        <a href={selectedArticle.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-4 px-10 py-5 bg-slate-900 text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl hover:shadow-indigo-500/30 group transform hover:-translate-y-1">
                          Read Full Story
                          <i className="fa-solid fa-arrow-right-long group-hover:translate-x-2 transition-transform"></i>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50/30">
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <i className="fa-solid fa-newspaper text-5xl text-slate-300"></i>
                  </div>
                  <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest">Select an article</h3>
                  <p className="text-xs text-slate-400 mt-2">Choose from the latest updates to begin reading</p>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'opportunities' ? (
          <div className="h-full overflow-y-auto pb-20 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getMockJobs().map((job) => (
                <div key={job.id} className="group bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-20 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-bl-[100px] -mr-10 -mt-10 opacity-50 group-hover:scale-110 transition-transform"></div>

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                        <i className={`fa-solid ${job.logo} text-indigo-600`}></i>
                      </div>
                      <span className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg">
                        {job.type}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 mb-1">{job.title}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">{job.company}</p>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                      <span className="text-sm font-bold text-slate-700">{job.salary}</span>
                      <button className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                        Apply Now <i className="fa-solid fa-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Locked State Card */}
              <div className="col-span-full py-12 text-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50">
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <i className="fa-solid fa-lock text-xl"></i>
                </div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Unlock Global Feed</h3>
                <p className="text-slate-500 text-xs max-w-sm mx-auto mb-6">Complete your profile skill verification to access live job market data from 50+ countries.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto pb-20 custom-scrollbar p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(activeTab === 'headlines' ? headlines : dailyArticles).map((item: any, idx) => (
                <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 hover:scale-[1.02] transition-all duration-300 group cursor-pointer animate-in fade-in zoom-in-50 fill-mode-backwards" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="flex gap-5">
                    <span className="text-5xl font-black text-slate-100 group-hover:text-indigo-100 transition-colors pointer-events-none select-none">0{idx + 1}</span>
                    <div className="relative z-10 pt-2">
                      <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                        {item.source?.name || 'Trending'}
                      </p>
                      <h3 className="text-base font-bold text-slate-800 leading-relaxed group-hover:text-indigo-700 transition-colors">
                        {typeof item === 'string' ? item : item.title}
                      </h3>
                      <div className="mt-4 pt-4 border-t border-slate-50 flex justify-end">
                        <i className="fa-solid fa-arrow-right text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-2 transition-all"></i>
                      </div>
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
