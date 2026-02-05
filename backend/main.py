from fastapi import FastAPI, Request, APIRouter
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn
import os
import requests
import feedparser
from dotenv import load_dotenv
import json

load_dotenv()

from supabase import create_client, Client
from openai import OpenAI

# Environment Validation
REQUIRED_ENV = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "OPENAI_API_KEY"]
missing_env = [env for env in REQUIRED_ENV if not os.getenv(env)]
if missing_env:
    raise ValueError(f"Missing required environment variables: {', '.join(missing_env)}")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GNEWS_API_KEY = os.getenv("GNEWS_API_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
openai_client = OpenAI(api_key=OPENAI_API_KEY)

app = FastAPI(title="Edu AI Career Growth Agent API")

# Routers
assessment_router = APIRouter(prefix="/assessment", tags=["Assessment"])
opportunities_router = APIRouter(prefix="/opportunities", tags=["Opportunities"])
chat_router = APIRouter(prefix="/chat", tags=["Chat"])
profile_router = APIRouter(prefix="/profile", tags=["Profile"])
news_router = APIRouter(prefix="/news", tags=["News"])
rag_router = APIRouter(prefix="/rag", tags=["RAG"])
core_router = APIRouter(tags=["Core"])

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"data": None, "error": str(exc)}
    )

def success_response(data):
    return {"data": data, "error": None}

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@core_router.get("/")
async def root():
    return success_response("Edu AI Backend Signal: Active")

@core_router.get("/health")
async def health():
    return success_response("healthy")

TECH_FEEDS = [
    "https://techcrunch.com/feed/",
    "https://www.technologyreview.com/feed/",
    "https://www.wired.com/feed/"
]

def fetch_rss():
    articles = []
    for feed in TECH_FEEDS:
        try:
            parsed = feedparser.parse(feed)
            for entry in parsed.entries[:5]:
                title = getattr(entry, 'title', 'No Title')
                summary = getattr(entry, 'summary', '')
                if not summary and hasattr(entry, 'description'):
                    summary = entry.description

                # Basic cleaning: remove HTML tags if any
                import re
                clean_summary = re.sub('<[^<]+?>', '', summary)

                articles.append(f"{title} - {clean_summary[:200]}...")
        except Exception as e:
            print(f"Error parsing feed {feed}: {e}")
    return articles

@news_router.get("/rss")
async def get_rss_feeds():
    try:
        feeds = fetch_rss()
        if feeds and len(feeds) > 0:
            return success_response(feeds)
    except Exception as e:
        print(f"Error fetching RSS: {e}")
    
    # Fallback demo data
    demo_feeds = [
        "Google Announces New AI Capabilities - Google has unveiled their latest AI models for 2026 with improved reasoning...",
        "Microsoft Invests $100B in AI Infrastructure - Microsoft continues expanding its AI capabilities with major investments...",
        "Python Remains Top Language for AI Development - Latest TIOBE index shows Python dominance in AI/ML sector...",
        "Open Source AI Models Challenge Proprietary Solutions - New open-source models are gaining traction...",
        "Web3 and AI Integration Trends Emerge - Decentralized AI systems are becoming more practical..."
    ]
    return success_response(demo_feeds)


def fetch_tech_news():
    url = "https://gnews.io/api/v4/top-headlines"
    params = {
        "topic": "technology",
        "lang": "en",
        "apikey": GNEWS_API_KEY
    }
    response = requests.get(url, params=params)
    response.raise_for_status()
    return response.json()["articles"]

# Demo news data as fallback
DEMO_NEWS = [
    {
        "title": "OpenAI Releases GPT-5 with Multimodal Capabilities",
        "description": "OpenAI has unveiled GPT-5, featuring enhanced reasoning abilities and improved context understanding for complex tasks.",
        "source": {"name": "OpenAI News"},
        "url": "https://openai.com",
        "image": "https://images.unsplash.com/photo-1677442d019cecf8f69a4ad20af71e71974008b78?w=500"
    },
    {
        "title": "Google DeepMind Achieves New Breakthrough in Protein Folding",
        "description": "DeepMind's latest advances in protein structure prediction could revolutionize drug discovery and biological research.",
        "source": {"name": "Google DeepMind"},
        "url": "https://deepmind.com",
        "image": "https://images.unsplash.com/photo-1518611505868-d7384ca08f96?w=500"
    },
    {
        "title": "Meta's Llama Model Achieves New Performance Records",
        "description": "Meta releases Llama 3.2, showing competitive performance with closed-source models while remaining open-source.",
        "source": {"name": "Meta AI"},
        "url": "https://meta.com",
        "image": "https://images.unsplash.com/photo-1639749881753-f3f8f4f2c4c3?w=500"
    }
]

@news_router.get("/")
async def get_tech_news():
    try:
        if not GNEWS_API_KEY or GNEWS_API_KEY == "YOUR_KEY":
            return success_response(DEMO_NEWS)
        articles = fetch_tech_news()
        return success_response(articles)
    except Exception as e:
        print(f"GNews API error: {e}")
        return success_response(DEMO_NEWS)

def create_embedding(text):
    if not openai_client:
        raise ValueError("OpenAI client not configured")
    return openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    ).data[0].embedding

@rag_router.post("/ingest")
async def ingest_content(payload: dict):
    content = payload.get("content")
    source = payload.get("source", "manual")

    if not content:
        return JSONResponse(status_code=400, content={"data": None, "error": "Content is required"})

    embedding = create_embedding(content)
    result = supabase.table("knowledge_base").insert({
        "content": content,
        "embedding": embedding,
        "source": source
    }).execute()

    return success_response({"id": result.data[0]["id"]})

def get_context(query_embedding):
    res = supabase.rpc("match_knowledge", {
        "query_embedding": query_embedding,
        "match_count": 5
    }).execute()
    return [r["content"] for r in res.data]

@rag_router.get("/search")
async def search_knowledge(query: str):
    if not query:
        return JSONResponse(status_code=400, content={"data": None, "error": "Query is required"})
    query_embedding = create_embedding(query)
    context = get_context(query_embedding)
    return success_response(context)

SYSTEM_PROMPT = """
You are an expert career growth mentor for technology professionals. Your role is to:
1. Provide personalized career guidance based on user skills, interests, and constraints
2. Recommend learning paths, skill development, and industry-relevant technologies
3. Identify job opportunities that match user profiles and career aspirations
4. Offer mentorship on navigating career transitions and growth opportunities
5. Discuss emerging technologies, industry trends, and their career implications

Communication style:
- Be encouraging, supportive, and constructive
- Provide specific, actionable advice with clear next steps
- Acknowledge constraints and offer practical solutions
- Use data-driven insights when available
- Maintain context of the user's background and goals throughout conversations

Focus areas: Technology careers, skill development, career advancement, industry insights, educational resources, opportunity matching, and professional growth.
"""

def generate_answer(question, context):
    if not openai_client:
        raise ValueError("OpenAI client not configured")

    prompt = SYSTEM_PROMPT + "\n\nContext:\n" + ("\n".join(context) if context else "No context found.") + f"\n\nQuestion: {question}"
    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=250
    )
    return response.choices[0].message.content

@rag_router.post("/ask")
async def ask_ai(payload: dict):
    query = payload.get("query")
    if not query:
        return JSONResponse(status_code=400, content={"data": None, "error": "Query is required"})
    
    try:
        # Try to get context from knowledge base
        embedding = create_embedding(query)
        context = get_context(embedding)
        answer = generate_answer(query, context)
        return success_response({"answer": answer})
    except Exception as e:
        # Fallback: Answer without RAG context
        print(f"RAG error: {e}, falling back to direct answer")
        if not openai_client:
            return success_response({"answer": "I apologize, but the AI mentor is currently unavailable. Please try again later."})
        
        try:
            response = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": query}
                ],
                max_tokens=250
            )
            return success_response({"answer": response.choices[0].message.content})
        except Exception as fallback_error:
            return success_response({"answer": f"I'm having trouble processing your request right now. Please try asking something about education, tech careers, or learning paths."})

# ============= ASSESSMENT ENDPOINTS =============
class ProfileData(BaseModel):
    personalContext: Dict[str, Any]
    careerTarget: Dict[str, Any]
    timeConsistency: Dict[str, Any]
    skillInventory: Dict[str, Any]
    practiceOutput: Dict[str, Any]
    learningSources: Dict[str, Any]
    academicProgress: Optional[Dict[str, Any]] = None

MOCK_ASSESSMENT = {
    "identified_gaps": [
        {"title": "System Design Pattern", "severity": "CRITICAL", "quantification": "0/5 Knowledge Baseline", "impact": "Blocks scalable architecture roles"},
        {"title": "Advanced SQL Optimization", "severity": "MODERATE", "quantification": "Basic queries only", "impact": "Performance bottleneck risk"}
    ],
    "next_priority_actions": [
        {"order": 1, "action": "Master Distributed Systems 101", "impact": "HIGH", "timeline": "Week 1-2"},
        {"order": 2, "action": "Build 1 Complex API Project", "impact": "MEDIUM", "timeline": "Month 1"},
        {"order": 3, "action": "Solve 50 Medium LeetCode", "impact": "HIGH", "timeline": "Month 2"}
    ],
    "learning_roadmap": [
        {
            "id": "step-1", "type": "VIDEO", "title": "System Design Primer", "topic": "Architecture",
            "provider": "YouTube / Gaurav Sen", "duration": "45m", "description": "Foundational breakdown of load balancers and scaling.",
            "url": "https://www.youtube.com/watch?v=xpDnVSmNFX0", "scheduledDate": "2026-02-01"
        },
        {
            "id": "step-2", "type": "PRACTICE", "title": "Design URL Shortener", "topic": "System Design",
            "provider": "Educative.io", "duration": "2h", "description": "Practice schema design and hashing strategies.",
            "url": "https://www.educative.io/", "scheduledDate": "2026-02-02"
        },
        {
            "id": "step-3", "type": "COURSE", "title": "Advanced SQL Optimization", "topic": "Database",
            "provider": "Pluralsight", "duration": "3h", "description": "Indexing strategies and query planning.",
            "url": "https://www.pluralsight.com/", "scheduledDate": "2026-02-03"
        },
        {
            "id": "step-4", "type": "QUIZ", "title": "Docker & K8s Fundamentals", "topic": "DevOps",
            "provider": "KodeKloud", "duration": "30m", "description": "Assess containerization and orchestration basics.",
            "url": "https://kodekloud.com/", "scheduledDate": "2026-02-04"
        },
        {
            "id": "step-5", "type": "PRACTICE", "title": "Build a CI/CD Pipeline", "topic": "DevOps",
            "provider": "GitHub Actions Guide", "duration": "4h", "description": "Automated testing and deployment.",
            "url": "https://docs.github.com/en/actions", "scheduledDate": "2026-02-05"
        },
        {
            "id": "step-6", "type": "COURSE", "title": "Security Best Practices", "topic": "Security",
            "provider": "OWASP", "duration": "5h", "description": "Prevent the OWASP top 10 web risks.",
            "url": "https://owasp.org/", "scheduledDate": "2026-02-06"
        }
    ],
    "career_risk_assessment": "Moderate Risk: Practical project portfolio is thin compared to theory.",
    "level": "JUNIOR ASSOCIATE",
    "skillDepthScore": 3.2,
    "consistencyScore": 4.5,
    "practicalReadinessScore": 2.8,
    "market_intel": {
        "salary_range": "$80k - $120k",
        "demand_level": "HIGH",
        "top_3_trending_skills": ["System Design", "Kubernetes", "Redis"],
        "market_sentiment": "Optimistic but competitive"
    }
}

@assessment_router.post("/analyze")
async def assess_career_profile(profile: ProfileData):
    try:
        profile_dict = profile.dict()
        
        system_prompt = """You are a career assessment AI. Analyze the user's profile and provide a structured assessment.

Current Date: 2026-01-29

Return ONLY valid JSON matching this schema:
{
  "identified_gaps": [{"title": "string", "severity": "CRITICAL|MODERATE|LOW", "quantification": "string", "impact": "string"}],
  "next_priority_actions": [{"order": 1, "action": "string", "impact": "HIGH|MEDIUM|LOW", "timeline": "string"}],
  "learning_roadmap": [{"id": "string", "type": "VIDEO|COURSE|QUIZ|PRACTICE", "title": "string", "topic": "string", "provider": "string", "duration": "string", "description": "string", "url": "string", "scheduledDate": "2026-02-15"}],
  "career_risk_assessment": "string",
  "level": "BEGINNER|INTERMEDIATE|ADVANCED",
  "skillDepthScore": 0.75,
  "consistencyScore": 0.82,
  "practicalReadinessScore": 0.68,
  "market_intel": {"salary_range": "$80k-$120k", "demand_level": "HIGH", "top_3_trending_skills": ["string"], "market_sentiment": "string"}
}

Provide exactly 6 learning roadmap items with real URLs. Keep descriptions under 150 characters."""

        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Analyze this career profile and return JSON: {json.dumps(profile_dict)}"}
            ],
            temperature=0.7,
            max_tokens=2000,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        return success_response(result)
    except Exception as e:
        print(f"Assessment error: {e}")
        return success_response(MOCK_ASSESSMENT)

# ============= OPPORTUNITIES ENDPOINTS =============
@opportunities_router.post("/fetch")
async def fetch_opportunities(payload: dict):
    try:
        profile = payload.get("profile", {})
        career_target = profile.get("careerTarget", {})
        skill_inventory = profile.get("skillInventory", {})
        
        desired_role = career_target.get("desiredRole", "Software Engineer")
        
        # Extract top skills
        skill_labels = {
            "programmingFundamentals": "Fundamentals",
            "dsa": "DSA",
            "development": "Dev",
            "databases": "Databases",
            "systemDesign": "System Design",
            "mathStats": "Math",
            "aiMl": "AI/ML"
        }
        
        top_skills = [skill_labels.get(k, k) for k, v in skill_inventory.items() if v >= 3]
        skills_str = ", ".join(top_skills) if top_skills else "General Tech"
        
        prompt = f"""Find REAL, ACTIVE (2025-2026) career opportunities for a {desired_role}.
Skills: {skills_str}

Return a JSON array of opportunities with this structure:
[{{
  "id": str,
  "title": str,
  "company": str,
  "type": "INTERNSHIP|COMPETITION|EVENT|PLACEMENT",
  "deadline": str,
  "url": str (must be real URL),
  "relevanceReason": str,
  "requirements": [str],
  "location": str,
  "stipend": str,
  "matchScore": int (0-100)
}}]

Find 5-8 diverse opportunities. Use Google Search to find real links."""

        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a career opportunities finder. Return ONLY valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=3000,
            response_format={"type": "json_object"}
        )
        
        opportunities = json.loads(response.choices[0].message.content)
        return success_response(opportunities)
    except Exception as e:
        # Fallback demo data when API fails
        demo_opportunities = [
            {
                "id": "opp-1",
                "title": "Software Engineering Internship",
                "company": "Google",
                "type": "INTERNSHIP",
                "deadline": "2026-03-15",
                "url": "https://careers.google.com/jobs/results/",
                "relevanceReason": "Perfect match for Software Engineering role",
                "requirements": ["DSA", "System Design", "Web Development"],
                "location": "Mountain View, CA",
                "stipend": "$8,000/month",
                "matchScore": 92
            },
            {
                "id": "opp-2",
                "title": "Full Stack Developer Role",
                "company": "Microsoft",
                "type": "PLACEMENT",
                "deadline": "2026-04-30",
                "url": "https://careers.microsoft.com/us/en/",
                "relevanceReason": "Aligned with your development skills",
                "requirements": ["Web Dev", "Databases", "System Design"],
                "location": "Seattle, WA",
                "stipend": "$150,000/year",
                "matchScore": 85
            },
            {
                "id": "opp-3",
                "title": "Hackathon 2026: AI Innovation",
                "company": "TechCrunch",
                "type": "COMPETITION",
                "deadline": "2026-02-28",
                "url": "https://techcrunch.com/event/",
                "relevanceReason": "Great for building portfolio",
                "requirements": ["Programming", "Problem Solving"],
                "location": "Virtual",
                "stipend": "$50,000 prize pool",
                "matchScore": 78
            },
            {
                "id": "opp-4",
                "title": "AI/ML Summer Camp",
                "company": "DeepMind Academy",
                "type": "EVENT",
                "deadline": "2026-02-15",
                "url": "https://deepmind.com/careers/",
                "relevanceReason": "Expand AI/ML knowledge",
                "requirements": ["Math/Stats", "Python", "AI/ML Basics"],
                "location": "London, UK",
                "stipend": "Fully funded",
                "matchScore": 81
            },
            {
                "id": "opp-5",
                "title": "Backend Engineer - Startup",
                "company": "Stripe",
                "type": "INTERNSHIP",
                "deadline": "2026-03-20",
                "url": "https://stripe.com/jobs",
                "relevanceReason": "Build scalable systems",
                "requirements": ["Databases", "System Design", "API Design"],
                "location": "San Francisco, CA",
                "stipend": "$7,500/month",
                "matchScore": 88
            }
        ]
        return success_response(demo_opportunities)
        return JSONResponse(status_code=500, content={"data": None, "error": str(e)})

# ============= PROFILE ENDPOINTS =============
DEMO_USER_ID = 'demo-user-001'

@profile_router.post("/save")
async def save_profile(payload: dict):
    try:
        profile = payload.get("profile")
        if not profile:
            return JSONResponse(status_code=400, content={"data": None, "error": "Profile is required"})
        
        result = supabase.table("user_data").upsert({
            "user_id": DEMO_USER_ID,
            "profile": profile,
            "updated_at": "now()"
        }, on_conflict="user_id").execute()
        
        return success_response({"saved": True})
    except Exception as e:
        return success_response({"saved": False, "warning": "Profile persistence unavailable"})

@profile_router.post("/save-assessment")
async def save_assessment(payload: dict):
    try:
        assessment = payload.get("assessment")
        if not assessment:
            return JSONResponse(status_code=400, content={"data": None, "error": "Assessment is required"})
        
        result = supabase.table("user_data").upsert({
            "user_id": DEMO_USER_ID,
            "assessment": assessment,
            "updated_at": "now()"
        }, on_conflict="user_id").execute()
        
        return success_response({"saved": True})
    except Exception as e:
        return success_response({"saved": False, "warning": "Assessment persistence unavailable"})

@profile_router.get("/data")
async def get_user_data():
    try:
        result = supabase.table("user_data").select("profile, assessment").eq("user_id", DEMO_USER_ID).single().execute()
        
        if not result.data:
            return success_response({"profile": None, "assessment": None})
        
        return success_response({
            "profile": result.data.get("profile"),
            "assessment": result.data.get("assessment")
        })
    except Exception as e:
        # Return null if not found
        return success_response({"profile": None, "assessment": None})

app.include_router(assessment_router)
app.include_router(opportunities_router)
app.include_router(chat_router)
app.include_router(profile_router)
app.include_router(news_router)
app.include_router(rag_router)
app.include_router(core_router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
