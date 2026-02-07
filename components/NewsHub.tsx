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
  const [activeTab, setActiveTab] = useState<'articles' | 'headlines'>('articles');
  const hasLoaded = useRef(false);

  const [selectedTopic, setSelectedTopic] = useState('technology');

  const TOPICS = [
    { id: 'technology', label: 'Tech General', icon: 'fa-microchip' },
    { id: 'software engineering', label: 'Software Eng', icon: 'fa-code' },
    { id: 'artificial intelligence', label: 'AI & ML', icon: 'fa-brain' },
    { id: 'tech courses', label: 'Courses', icon: 'fa-graduation-cap' }
  ];

  const loadNews = async (isRetry = false) => {
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
      // ... fallback logic (kept same but could be improved) ...
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
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <i className="fa-solid fa-newspaper text-white text-lg"></i>
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">News Hub</h1>
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Industry Pulse & Insights</p>
              </div>
            </div>

            <button
              onClick={() => loadNews(true)}
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
            >
              <i className="fa-solid fa-rotate-right mr-2" style={{ opacity: loading ? 0.5 : 1 }}></i>
              Refresh
            </button>
          </div>

          {/* Topics Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {TOPICS.map((topic) => (
              <button
                key={topic.id}
                onClick={() => {
                  setSelectedTopic(topic.id);
                  setActiveTab('articles');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${selectedTopic === topic.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-105'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700'
                  }`}
              >
                <i className={`fa-solid ${topic.icon}`}></i>
                {topic.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-slate-100 px-8 flex gap-4 sticky top-0 z-10">
        {['articles', 'headlines'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-4 border-b-2 font-bold text-[11px] uppercase tracking-widest transition-all ${activeTab === tab
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
          >
            {tab === 'articles' ? `📰 ${TOPICS.find(t => t.id === selectedTopic)?.label} Articles` : '📢 Global Headlines'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex gap-6 p-8">
        {/* Main Content Area */}
        {activeTab === 'articles' ? (
          <>
            {/* Articles List */}
            <div className="w-80 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest">
                  <i className="fa-solid fa-list mr-2 text-indigo-600"></i>
                  {articles.length} Articles
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar">
                {loading && articles.length === 0 ? (
                  <div className="p-6 text-center text-slate-500">
                    <i className="fa-solid fa-spinner fa-spin text-2xl text-indigo-600 mb-4"></i>
                    <p className="text-[10px] font-medium">Loading news...</p>
                  </div>
                ) : articles.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">
                    <p className="text-[9px] font-medium">No articles found</p>
                  </div>
                ) : (
                  articles.map((article, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedArticle(article)}
                      className={`w-full text-left p-4 border-b border-slate-100 transition-all ${selectedArticle?.title === article.title
                          ? 'bg-indigo-50 border-l-4 border-l-indigo-600'
                          : 'hover:bg-slate-50/50'
                        }`}
                    >
                      <div className="space-y-2">
                        <h3 className="font-bold text-[11px] text-slate-900 line-clamp-2 leading-tight">
                          {article.title}
                        </h3>
                        <p className="text-[9px] text-slate-500 line-clamp-2">
                          {article.description || 'No description'}
                        </p>
                        {article.source && (
                          <p className="text-[8px] font-semibold text-indigo-600 uppercase tracking-tight">
                            {article.source.name}
                          </p>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Article Detail */}
            <div className="flex-1 flex flex-col gap-6">
              {selectedArticle ? (
                <div className="flex flex-col gap-6">
                  {/* Featured Image */}
                  {selectedArticle.image && (
                    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 aspect-video shadow-lg border border-slate-200">
                      <img
                        src={selectedArticle.image}
                        alt={selectedArticle.title}
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    </div>
                  )}

                  {/* Article Content */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                    <div className="space-y-6">
                      {/* Source and Date */}
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        {selectedArticle.source && (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                              <i className="fa-solid fa-building text-indigo-600 text-[10px]"></i>
                            </div>
                            <div>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Source</p>
                              <p className="text-[11px] font-bold text-slate-900">{selectedArticle.source.name}</p>
                            </div>
                          </div>
                        )}
                        {selectedArticle.publishedAt && (
                          <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Published</p>
                            <p className="text-[11px] font-bold text-slate-900">
                              {new Date(selectedArticle.publishedAt).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <div className="border-t border-slate-100 pt-6">
                        <h1 className="text-2xl font-black text-slate-900 leading-tight mb-4">
                          {selectedArticle.title}
                        </h1>
                        <p className="text-slate-600 text-sm leading-relaxed font-medium">
                          {selectedArticle.description}
                        </p>
                      </div>

                      {/* Content */}
                      {selectedArticle.content && (
                        <div className="bg-slate-50/50 rounded-xl p-6 border border-slate-100">
                          <p className="text-slate-700 text-[13px] leading-relaxed whitespace-pre-wrap">
                            {selectedArticle.content}
                          </p>
                        </div>
                      )}

                      {/* Read Full Article */}
                      {selectedArticle.url && (
                        <a
                          href={selectedArticle.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-indigo-700 hover:shadow-lg transition-all"
                        >
                          <span>Read Full Article</span>
                          <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-center text-slate-500">
                  <div>
                    <i className="fa-solid fa-newspaper text-4xl text-slate-300 mb-4"></i>
                    <p className="text-[11px] font-medium">Select an article to read</p>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          // Headlines Tab
          <div className="w-full flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-red-50 to-orange-50">
                <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest">
                  <i className="fa-solid fa-fire mr-2 text-red-600"></i>
                  Trending Headlines
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {headlines.length === 0 ? (
                  <p className="text-slate-500 text-center text-[10px] font-medium py-8">
                    {loading ? 'Loading headlines...' : 'No headlines available'}
                  </p>
                ) : (
                  headlines.map((headline, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100/50 hover:shadow-md transition-all group cursor-pointer"
                    >
                      <div className="flex gap-4 items-start">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <span className="text-white text-[10px] font-black">{idx + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-bold text-slate-900 leading-snug">
                            {headline}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-t border-red-200 px-8 py-4">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-circle-exclamation text-red-600 text-lg"></i>
            <p className="text-[11px] font-medium text-red-700">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsHub;
