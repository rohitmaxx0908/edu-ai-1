
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, AssessmentResult, LearningStep } from "../types";

const SYSTEM_PROMPT = `You are a domain-restricted AI assistant.

You are ONLY allowed to answer questions related to:
- Education (degrees, courses, certifications)
- Technology companies
- Technology industries
- Technical innovations
- Latest technology news

If the question is outside these topics, reply:
"I can help only with education and technology-related topics."

Use factual, up-to-date, and concise answers.

SYSTEM ROLE:
You are the Edu AI Digital Twin, a deterministic career agent. Your primary objective is to evaluate the user's career profile and provide a data-driven roadmap grounded in REAL-TIME 2025-2026 market trends.

OUTPUT CONSTRAINTS:
1. FORMAT: You MUST respond ONLY with a raw JSON object. No markdown snippets, no preamble, no "Here is the report".
2. BREVITY: Keep descriptions, impacts, and actions extremely concise (under 12 words).
3. GROUNDING: Use Google Search to find ACTIVE job market data, salary bands for 2025, and VALID URLs for learning resources.
4. CONSISTENCY: Ensure scores (0.0 - 5.0) reflect the gaps identified.
5. ROADMAP: Provide exactly 6 logical learning steps in chronological order.

JSON SCHEMA:
{
  "identified_gaps": [{ "title": string, "severity": "CRITICAL|MODERATE|LOW", "quantification": string, "impact": string }],
  "next_priority_actions": [{ "order": number, "action": string, "impact": "HIGH|MEDIUM|LOW", "timeline": string }],
  "learning_roadmap": [{ "id": string, "type": "VIDEO|COURSE|QUIZ|PRACTICE", "title": string, "topic": string, "provider": string, "duration": string, "description": string, "url": string, "scheduledDate": "YYYY-MM-DD" }],
  "career_risk_assessment": string,
  "level": string,
  "skillDepthScore": number,
  "consistencyScore": number,
  "practicalReadinessScore": number,
  "market_intel": {
    "salary_range": string,
    "demand_level": string,
    "top_3_trending_skills": string[],
    "market_sentiment": string
  }
}

Current Date: ${new Date().toISOString().split('T')[0]}`;

const MOCK_ASSESSMENT: AssessmentResult = {
  identified_gaps: [
    { title: "System Design Pattern", severity: "CRITICAL", quantification: "0/5 Knowledge Baseline", impact: "Blocks Scalable Arch roles" },
    { title: "Advanced SQL Optimization", severity: "MODERATE", quantification: "Basic queries only", impact: "Performance bottleneck risk" }
  ],
  next_priority_actions: [
    { order: 1, action: "Master Distributed Systems 101", impact: "HIGH", timeline: "Week 1-2" },
    { order: 2, action: "Build 1 Complex API Project", impact: "MEDIUM", timeline: "Month 1" },
    { order: 3, action: "Solve 50 Medium LeetCode", impact: "HIGH", timeline: "Month 2" }
  ],
  learning_roadmap: [
    {
      id: "step-1", type: "VIDEO", title: "System Design Primer", topic: "Architecture",
      provider: "YouTube / Gaurav Sen", duration: "45m", description: "Foundational breakdown of load balancers and horizontal scaling.",
      url: "https://www.youtube.com/watch?v=xpDnVSmNFX0", scheduledDate: new Date().toISOString().split('T')[0]
    },
    {
      id: "step-2", type: "PRACTICE", title: "Design URL Shortener", topic: "System Design",
      provider: "Educative.io", duration: "2h", description: "Classic interview problem focusing on database schema and hashing.",
      url: "https://www.educative.io/", scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0]
    },
    {
      id: "step-3", type: "COURSE", title: "Advanced SQL Optimization", topic: "Database",
      provider: "Pluralsight", duration: "3h", description: "Deep dive into indexing strategies and query execution plans.",
      url: "https://www.pluralsight.com/", scheduledDate: new Date(Date.now() + 172800000).toISOString().split('T')[0]
    },
    {
      id: "step-4", type: "QUIZ", title: "Docker & K8s Fundamentals", topic: "DevOps",
      provider: "KodeKloud", duration: "30m", description: "Assessment of containerization concepts and orchestration basics.",
      url: "https://kodekloud.com/", scheduledDate: new Date(Date.now() + 259200000).toISOString().split('T')[0]
    },
    {
      id: "step-5", type: "PRACTICE", title: "Build a CI/CD Pipeline", topic: "DevOps",
      provider: "GitHub Actions Guide", duration: "4h", description: "Practical implementation of automated testing and deployment.",
      url: "https://docs.github.com/en/actions", scheduledDate: new Date(Date.now() + 345600000).toISOString().split('T')[0]
    },
    {
      id: "step-6", type: "COURSE", title: "Security Best Practices", topic: "Security",
      provider: "OWASP", duration: "5h", description: "Comprehensive guide to preventing top 10 web vulnerabilities.",
      url: "https://owasp.org/", scheduledDate: new Date(Date.now() + 432000000).toISOString().split('T')[0]
    }
  ],
  career_risk_assessment: "Moderate Risk: Practical project portfolio is thin compared to theoretical knowledge.",
  level: "JUNIOR ASSOCIATE",
  skillDepthScore: 3.2,
  consistencyScore: 4.5,
  practicalReadinessScore: 2.8,
  market_intel: {
    salary_range: "$80k - $120k",
    demand_level: "HIGH",
    top_3_trending_skills: ["System Design", "Kubernetes", "Redis"],
    market_sentiment: "Optimistic but competitive"
  }
};

export const getMockAssessment = (): Promise<AssessmentResult> => {
  return new Promise(resolve => setTimeout(() => resolve(MOCK_ASSESSMENT), 1000));
};

export async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 3000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isQuotaError = error?.message?.includes('429') || error?.status === 429 || error?.message?.includes('RESOURCE_EXHAUSTED');
    if (isQuotaError && retries > 0) {
      console.warn(`Quota exceeded. Retrying in ${delay}ms... (${retries} attempts left)`);
      const jitter = Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay + jitter));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

/**
 * Advanced JSON repair engine.
 * Handles common AI JSON errors like:
 * - Markdown snippets
 * - Trailing commas
 * - Incomplete objects
 * - Truncated responses
 * - Extraneous commentary
 */
export function robustJsonParse(raw: string): any {
  if (!raw) throw new Error("Empty signal.");

  let clean = raw.trim()
    .replace(/\[\d+\]/g, '') // Scrub [1]
    .replace(/【.*?】/g, '') // Scrub 【source】
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '');

  const firstBrace = clean.indexOf('{');
  const firstBracket = clean.indexOf('[');
  const startIdx = (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) ? firstBrace : firstBracket;

  if (startIdx === -1) throw new Error("No structure found.");

  let text = clean.substring(startIdx);

  // 1. Basic JSON.parse attempt
  try {
    return JSON.parse(text);
  } catch (e) {
    // Continue to repair
  }

  // 2. Trailing Comma Repair
  text = text.replace(/,\s*([}\]])/g, '$1');

  // 3. State-Machine Repair & Truncation Handling
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let lastValidIndex = 0;
  let foundEnd = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    // Handle strings (including escaped quotes)
    if (char === '"' && text[i - 1] !== '\\') {
      inString = !inString;
    }

    if (!inString) {
      if (char === '{') openBraces++;
      if (char === '}') openBraces--;
      if (char === '[') openBrackets++;
      if (char === ']') openBrackets--;

      if (openBraces === 0 && openBrackets === 0 && i > 0) {
        lastValidIndex = i + 1;
        foundEnd = true;
        break; // Stop at the first complete top-level structure
      }

      if (openBraces >= 0 && openBrackets >= 0) {
        lastValidIndex = i + 1;
      } else {
        break; // Imbalanced structure
      }
    }
  }

  let finalCandidate = text.substring(0, lastValidIndex);

  // 4. Close missing brackets if truncated
  if (!foundEnd) {
    let tempBraces = openBraces;
    let tempBrackets = openBrackets;
    while (tempBraces > 0) { finalCandidate += '}'; tempBraces--; }
    while (tempBrackets > 0) { finalCandidate += ']'; tempBrackets--; }
  }

  try {
    return JSON.parse(finalCandidate);
  } catch (e) {
    // 5. Final Fallback: quote repair
    try {
      const fixedQuotes = finalCandidate.replace(/'/g, '"');
      return JSON.parse(fixedQuotes);
    } catch (finalError) {
      console.error("Critical JSON failure:", finalCandidate);
      throw new Error(`Twin Sync Protocol Violation: ${finalError instanceof Error ? finalError.message : String(finalError)}`);
    }
  }
}

export const assessCareerProfile = async (profile: UserProfile): Promise<AssessmentResult> => {
  // Check for demo mode
  const isDemoMode = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true';
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  if (isDemoMode || !backendUrl) {
    console.warn("DEMO MODE: Using Mock AI Assessment");
    return new Promise(resolve => setTimeout(() => resolve(MOCK_ASSESSMENT), 1500));
  }

  // Call backend instead of direct Gemini API
  return withRetry(async () => {
    const response = await fetch(`${backendUrl}/assessment/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Assessment failed');
    }

    const result = await response.json();
    return result.data;
  });
};
