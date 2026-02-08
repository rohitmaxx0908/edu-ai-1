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
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 px-6 py-4 z-10 sticky top-0">
        <div className="flex flex-col gap-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <i className="fa-solid fa-newspaper text-white text-sm"></i>
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">News Hub</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Intelligence Stream</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => loadNews(true)}
                disabled={loading}
                className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                title="Refresh Stream"
              >
                <i className={`fa-solid fa-rotate-right text-xs ${loading ? 'animate-spin' : ''}`}></i>
              </button>
            </div>
          </div>

          {/* Topics & Tabs Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Topics */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              {TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => {
                    setSelectedTopic(topic.id);
                    setActiveTab('articles');
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${selectedTopic === topic.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                    }`}
                >
                  <i className={`fa-solid ${topic.icon}`}></i>
                  {topic.label}
                </button>
              ))}
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-slate-100/50 p-1 rounded-xl">
              {['articles', 'headlines', 'daily', 'opportunities'].map(tab => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab as any);
                    if (tab === 'daily' && dailyArticles.length === 0) {
                      loadDailyNews();
                    }
                  }}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
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
            <div className="w-[350px] hidden lg:flex flex-col bg-white/60 backdrop-blur-xl rounded-3xl border border-white/40 shadow-sm overflow-hidden h-full">
              <div className="p-4 border-b border-slate-100/50 bg-white/40 backdrop-blur-md">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Latest Updates</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                {loading && articles.length === 0 ? (
                  <div className="p-8 text-center"><i className="fa-solid fa-spinner animate-spin text-indigo-500"></i></div>
                ) : (
                  articles.map((article, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedArticle(article)}
                      className={`w-full text-left p-4 rounded-2xl transition-all border border-transparent ${selectedArticle?.title === article.title
                        ? 'bg-white shadow-md border-slate-100 scale-[1.02]'
                        : 'hover:bg-white/50 hover:border-slate-100/50'
                        }`}
                    >
                      <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-tight mb-1">{article.source?.name}</p>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-relaxed">{article.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-2">{new Date(article.publishedAt || Date.now()).toLocaleDateString()}</p>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Selected Article Reading Pane */}
            <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden flex flex-col h-full relative">
              {selectedArticle ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {selectedArticle.image && (
                    <div className="h-64 md:h-80 w-full relative">
                      <img src={selectedArticle.image} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                      <div className="absolute bottom-0 left-0 p-8">
                        <span className="px-3 py-1 bg-indigo-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg mb-3 inline-block">
                          {selectedArticle.source?.name}
                        </span>
                        <h1 className="text-2xl md:text-4xl font-black text-white leading-tight shadow-sm">
                          {selectedArticle.title}
                        </h1>
                      </div>
                    </div>
                  )}

                  <div className="p-8 md:p-12 max-w-4xl mx-auto">
                    {!selectedArticle.image && (
                      <h1 className="text-3xl font-black text-slate-900 mb-8">{selectedArticle.title}</h1>
                    )}

                    <p className="text-lg font-medium text-slate-600 leading-relaxed mb-8 border-l-4 border-indigo-500 pl-6 italic">
                      {selectedArticle.description}
                    </p>

                    {selectedArticle.content && (
                      <div className="prose prose-slate max-w-none mb-10">
                        <p>{selectedArticle.content}</p>
                      </div>
                    )}

                    {selectedArticle.url && (
                      <a href={selectedArticle.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg hover:shadow-indigo-500/25 group">
                        Read Full Story
                        <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-300">
                  <div className="text-center">
                    <i className="fa-solid fa-book-open text-4xl mb-4"></i>
                    <p className="text-xs font-bold uppercase tracking-widest">Select an article</p>
                  </div>
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
          <div className="h-full overflow-y-auto pb-20 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(activeTab === 'headlines' ? headlines : dailyArticles).map((item: any, idx) => (
                <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex gap-4">
                    <span className="text-4xl font-black text-slate-100 group-hover:text-indigo-50 transition-colors">0{idx + 1}</span>
                    <div>
                      <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mb-2">
                        {item.source?.name || 'Trending'}
                      </p>
                      <h3 className="text-sm font-bold text-slate-800 leading-relaxed group-hover:text-indigo-600 transition-colors">
                        {typeof item === 'string' ? item : item.title}
                      </h3>
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
