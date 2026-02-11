import os
from google import genai
import time

GEMINI_API_KEY = "AIzaSyAbMBMhbMn4jyijq6JXBGHEHFI2KSaU_eU"
client = genai.Client(api_key=GEMINI_API_KEY)

def test(model_name):
    print(f"Testing {model_name}...")
    try:
        response = client.models.generate_content(
            model=model_name,
            contents="Hello"
        )
        print(f"SUCCESS: {response.text}")
        return True
    except Exception as e:
        print(f"FAILED: {e}")
        return False

# Candidates based on earlier list
candidates = [
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash-preview-09-2025",
    "gemini-2.0-flash",
    "gemini-1.5-flash-8b",
    "gemini-1.5-flash-latest"
]

for c in candidates:
    if test(c):
        print(f"Winner: {c}")
        break
