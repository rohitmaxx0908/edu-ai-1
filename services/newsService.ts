
export interface NewsArticle {
    title: string;
    description: string;
    content: string;
    url: string;
    image: string;
    publishedAt: string;
    source: {
        name: string;
        url: string;
    };
}


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export const fetchTechNews = async (): Promise<NewsArticle[]> => {
    try {
        const response = await fetch(`${BACKEND_URL}/news/`);
        const result = await response.json();

        if (!response.ok || result.error) {
            throw new Error(result.error || 'Failed to fetch news');
        }

        return (result.data || []).map((article: any) => ({
            ...article,
            description: article.description || article.content || 'No description available',
        }));
    } catch (error) {
        console.error('Error fetching tech news:', error);
        return [];
    }
};

export const fetchRssFeeds = async (): Promise<string[]> => {
    try {
        const response = await fetch(`${BACKEND_URL}/news/rss`);
        const result = await response.json();

        if (!response.ok || result.error) {
            throw new Error(result.error || 'Failed to fetch RSS feeds');
        }

        return result.data;
    } catch (error) {
        console.error('Error fetching RSS feeds:', error);
        return [];
    }
};
