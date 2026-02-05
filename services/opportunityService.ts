
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, Opportunity } from "../types";
import { withRetry, robustJsonParse } from "./geminiService";

const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'mock-1',
    title: 'Junior Backend Engineer',
    company: 'TechFlow Systems',
    type: 'INTERNSHIP',
    deadline: '2025-05-15',
    url: '#',
    relevanceReason: 'Matches your interest in Distributed Systems.',
    requirements: ['Node.js', 'PostgreSQL', 'AWS'],
    location: 'Remote (US)',
    stipend: '$30-40/hr',
    matchScore: 92
  },
  {
    id: 'mock-2',
    title: 'Global AI Hackathon 2025',
    company: 'DevPost & Google',
    type: 'COMPETITION',
    deadline: '2025-04-01',
    url: '#',
    relevanceReason: 'Perfect for building your project portfolio.',
    requirements: ['GenAI', 'Python', 'React'],
    location: 'Global (Online)',
    stipend: '$50k Prize Pool',
    matchScore: 88
  },
  {
    id: 'mock-3',
    title: 'Cloud Architecture Summit',
    company: 'AWS Events',
    type: 'EVENT',
    deadline: '2025-06-20',
    url: '#',
    relevanceReason: 'Networking with principal engineers.',
    requirements: ['Cloud Concepts'],
    location: 'San Francisco, CA',
    stipend: 'Free Entry',
    matchScore: 75
  }
];

export const fetchTailoredOpportunities = async (profile: UserProfile): Promise<Opportunity[]> => {
  const isDemoMode = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true';
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  if (isDemoMode || !backendUrl) {
    console.warn("DEMO MODE: Using Mock Opportunities");
    return new Promise(resolve => setTimeout(() => resolve(MOCK_OPPORTUNITIES), 1200));
  }

  try {
    return await withRetry(async () => {
      const response = await fetch(`${backendUrl}/opportunities/fetch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch opportunities');
      }

      const result = await response.json();
      
      if (Array.isArray(result.data) && result.data.length > 0) {
        return result.data;
      }
      throw new Error("No opportunities found");

    }, 2, 2000);
  } catch (error) {
    console.warn("Real Data Sync Failed (Using Fallback):", error);
    return MOCK_OPPORTUNITIES;
  }
};
