import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

BACKEND_URL = "http://localhost:8000"

# Initial knowledge data
KNOWLEDGE_DATA = [
    {
        "content": "A Full Stack Developer should focus on React for frontend, Node.js for backend, and SQL/NoSQL databases. Knowledge of cloud platforms like AWS or Azure is highly valued in 2025.",
        "source": "Career Guide"
    },
    {
        "content": "DSA (Data Structures and Algorithms) is fundamental for software engineering interviews. Focus on Arrays, Linked Lists, Trees, and Dynamic Programming.",
        "source": "Interview Prep"
    },
    {
        "content": "Generative AI and LLMs are transforming software development. Developers should learn how to integrate AI using APIs like OpenAI and Google Gemini.",
        "source": "Tech Trends"
    },
    {
        "content": "System Design involves understanding scalability, load balancing, caching, and database sharding. It is crucial for senior roles.",
        "source": "Advanced Engineering"
    },
    {
        "content": "Soft skills like communication, teamwork, and project management are just as important as technical skills for long-term career growth.",
        "source": "Career Growth"
    }
]

def ingest_data():
    print(f"Starting ingestion to {BACKEND_URL}...")

    for item in KNOWLEDGE_DATA:
        try:
            response = requests.post(f"{BACKEND_URL}/rag/ingest", json=item)
            if response.status_code == 200:
                print(f"Successfully ingested: {item['content'][:50]}...")
            else:
                print(f"Failed to ingest: {item['content'][:50]}. Error: {response.text}")
        except Exception as e:
            print(f"Error connecting to backend: {e}")

if __name__ == "__main__":
    ingest_data()
