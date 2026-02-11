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
from datetime import datetime

load_dotenv()

from supabase import create_client, Client
from openai import OpenAI
from google import genai
import logging

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
gemini_client = None
if GEMINI_API_KEY:
    try:
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception as e:
        print(f"Failed to initialize Gemini client: {e}")
import json
import traceback

# Environment Validation

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
    status = {
        "api": "online",
        "supabase": "unknown",
        "openai": "unknown"
    }

    # Check Supabase
    try:
        supabase.table("user_data").select("count", count="exact").limit(1).execute()
        status["supabase"] = "connected"
    except Exception as e:
        status["supabase"] = f"error: {str(e)}"

    # Check OpenAI
    if openai_client:
        status["openai"] = "configured"
    else:
        status["openai"] = "missing_key"

    return success_response(status)

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


def fetch_tech_news(topic="technology"):
    url = "https://gnews.io/api/v4/top-headlines"

    clean_topic = topic.strip().lower() if topic else "technology"
    categories = ["breaking-news", "world", "nation", "business", "technology", "entertainment", "sports", "science", "health"]

    params = {
        "lang": "en",
        "apikey": GNEWS_API_KEY
    }

    if clean_topic in categories:
        params["topic"] = clean_topic
    else:
        params["q"] = clean_topic

    response = requests.get(url, params=params)
    if response.status_code != 200:
        return []
    return response.json().get("articles", [])

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
async def get_tech_news(topic: str = "technology"):
    try:
        if not GNEWS_API_KEY or GNEWS_API_KEY == "YOUR_KEY":
            return success_response(DEMO_NEWS)
        articles = fetch_tech_news(topic)
        return success_response(articles)
    except Exception as e:
        print(f"GNews API error: {e}")
        return success_response(DEMO_NEWS)

def create_embedding(text):
    if not openai_client:
        raise ValueError("OpenAI client not configured")
    if not text or not text.strip():
        return [0.0] * 1536 # Return zero vector for empty text

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
You are the "Twin Agent" - a sophisticated digital career companion grounded in market reality.
Your core directive is to optimize the user's career trajectory using deterministic logic and data-driven insights.

DOMAIN RESTRICTION - MANDATORY:
You are ONLY allowed to answer questions related to:
- Education (degrees, courses, certifications, learning paths)
- Technology (software, hardware, engineering, companies, industries, innovations, news)
- Career Growth (job search, interviews, skill gaps, salaries within tech)

If the question is outside these domains (e.g., medical advice, sports, general entertainment, cooking, etc.), you MUST reply exactly with:
"I can help only with education and technology-related topics."

Identity & Tone:
- You are NOT a generic chatbot. You are a "Neural Twin" synchronized with the user's profile.
- Speak with precision, authority, and slight futuristic/cybernetic flair (e.g., "Analyzing trajectory...", "Market vectors alignment confirmed").
- Be encouraging but radically honest about skill gaps (the "Deterministic Gap Map").

Operational Protocols:
1. **Context Awareness**: Always reference the user's specific skills (`skillInventory`) and goals when answering.
2. **Action Bias**: Provide concrete "Priority Actions" rather than vague advice.
3. **Market Grounding**: Relate every answer back to real-world market demand and salary data.
4. **Expansion**: If asked about a topic, proactively search for recent news or learning resources to "update your internal model".

Focus areas: System Design, Career Architecture, Market Arbitrage, Skill Acquisition Efficiency.
"""

# ============= AGENTIC RAG SYSTEM =============

AVAILABLE_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_knowledge_base",
            "description": "Search the internal career guidance database for specific advice, patterns, or educational resources. Use this for questions about learning paths, skills, or career advice.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The search query to find relevant context."
                    }
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_industry_news",
            "description": "Search for real-time news about specific technology topics, trends, or companies. Use this when the user asks about current events, market trends, or recent updates.",
            "parameters": {
                "type": "object",
                "properties": {
                    "topic": {
                        "type": "string",
                        "description": "The topic or keyword to search for (e.g., 'artificial intelligence', 'react jobs', 'crypto markets')."
                    }
                },
                "required": ["topic"]
            }
        }
    }
]

def execute_tool_call(tool_call):
    """Execute the tool requested by the model"""
    func_name = tool_call.function.name
    args = json.loads(tool_call.function.arguments)

    if func_name == "search_knowledge_base":
        query = args.get("query")
        embedding = create_embedding(query)
        context = get_context(embedding)
        return json.dumps(context)

    elif func_name == "search_industry_news":
        topic = args.get("topic")
        articles = fetch_tech_news(topic)
        # Summarize articles to save tokens
        summary = [f"{a['title']} - {a['description']}" for a in articles[:3]]
        return json.dumps(summary)

    return "Error: Function not found"

async def run_agent(query: str):
    """
    Run the Agentic RAG loop:
    1. Plan/Think
    2. Call Tools (if needed)
    3. Generate Final Answer
    """
    if not openai_client:
        return "AI Client unavailable."

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": query}
    ]

    # First Turn: Let the model decide to use tools or answer directly
    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        tools=AVAILABLE_TOOLS,
        tool_choice="auto"
    )

    response_message = response.choices[0].message
    messages.append(response_message)

    # Check if the model wants to call tools
    if response_message.tool_calls:
        for tool_call in response_message.tool_calls:
            # Execute tool
            try:
                tool_output = execute_tool_call(tool_call)
                messages.append({
                    "tool_call_id": tool_call.id,
                    "role": "tool",
                    "name": tool_call.function.name,
                    "content": tool_output
                })
            except Exception as e:
                print(f"Tool execution error: {e}")
                messages.append({
                    "tool_call_id": tool_call.id,
                    "role": "tool",
                    "name": tool_call.function.name,
                    "content": "Error executing tool."
                })

        # Second Turn: Generate final response with tool outputs
        final_response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages
        )
        return final_response.choices[0].message.content

    return response_message.content

@chat_router.post("/ask")
async def ask_ai(payload: dict):
    query = payload.get("query")
    if not query:
        return JSONResponse(status_code=400, content={"data": None, "error": "Query is required"})

    try:
        # Use Agentic RAG
        answer = await run_agent(query)
        return success_response({"answer": answer})
    except Exception as e:
        print(f"Agent error: {e}")
        traceback.print_exc()

        # Fallback to simple direct answer (OpenAI)
        if openai_client:
             try:
                response = openai_client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": query}
                    ]
                )
                return success_response({"answer": response.choices[0].message.content})
             except Exception as e:
                 print(f"OpenAI fallback error: {e}")

        # Super Fallback: Use Gemini (if available)
        if gemini_client:
            try:
                print("Using Gemini fallback...")
                response = gemini_client.models.generate_content(
                    model="gemini-2.5-flash-lite",
                    contents=f"{SYSTEM_PROMPT}\n\nUser: {query}"
                )
                return success_response({"answer": response.text})
            except Exception as e:
                print(f"Gemini error: {e}")

        return success_response({"answer": "I'm having trouble connecting to my brain. Please try again."})

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

        current_date = datetime.now().strftime("%Y-%m-%d")
        system_prompt = f"""You are a career assessment AI. Analyze the user's profile and provide a structured assessment.

Current Date: {current_date}

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
