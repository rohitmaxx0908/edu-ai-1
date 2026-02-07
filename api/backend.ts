/**
 * Centralized backend API client
 * All calls to the FastAPI backend go through here
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

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

/**
 * Ask AI with RAG context
 */
export async function askAI(question: string): Promise<{ answer: string }> {
  const res = await fetch(`${BACKEND_URL}/chat/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: question }),
  });

  if (!res.ok) {
    throw new Error("Backend error");
  }

  const result: ApiResponse<{ answer: string }> = await res.json();

  if (result.error) {
    throw new Error(result.error);
  }

  return result.data!;
}

/**
 * Assess career profile
 */
export async function assessCareer(profile: any): Promise<any> {
  const res = await fetch(`${BACKEND_URL}/assessment/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });

  if (!res.ok) {
    throw new Error("Assessment failed");
  }

  const result: ApiResponse<any> = await res.json();

  if (result.error) {
    throw new Error(result.error);
  }

  return result.data;
}

/**
 * Fetch job opportunities
 */
export async function fetchOpportunities(profile: any): Promise<any[]> {
  const res = await fetch(`${BACKEND_URL}/opportunities/fetch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile }),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch opportunities");
  }

  const result: ApiResponse<any[]> = await res.json();

  if (result.error) {
    throw new Error(result.error);
  }

  return result.data!;
}

/**
 * Save user profile
 */
export async function saveProfile(profile: any): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/profile/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile }),
  });

  if (!res.ok) {
    throw new Error("Failed to save profile");
  }
}

/**
 * Save assessment results
 */
export async function saveAssessment(assessment: any): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/profile/save-assessment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assessment }),
  });

  if (!res.ok) {
    throw new Error("Failed to save assessment");
  }
}

/**
 * Get user data (profile + assessment)
 */
export async function getUserData(): Promise<{ profile: any; assessment: any }> {
  const res = await fetch(`${BACKEND_URL}/profile/data`);

  if (!res.ok) {
    throw new Error("Failed to fetch user data");
  }

  const result: ApiResponse<{ profile: any; assessment: any }> = await res.json();

  if (result.error) {
    throw new Error(result.error);
  }

  return result.data!;
}

/**
 * Fetch tech news
 */
export async function fetchNews(topic: string = "technology"): Promise<any[]> {
  const res = await fetch(`${BACKEND_URL}/news/?topic=${encodeURIComponent(topic)}`);

  if (!res.ok) {
    return []; // Silent fail for news
  }

  const result: ApiResponse<any[]> = await res.json();
  return result.data || [];
}

/**
 * Fetch RSS feeds
 */
export async function fetchRssFeeds(): Promise<string[]> {
  const res = await fetch(`${BACKEND_URL}/news/rss`);

  if (!res.ok) {
    return []; // Silent fail for RSS
  }

  const result: ApiResponse<string[]> = await res.json();
  return result.data || [];
}



