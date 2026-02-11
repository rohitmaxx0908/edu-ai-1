import os
from google import genai
import time

GEMINI_API_KEY = "AIzaSyAbMBMhbMn4jyijq6JXBGHEHFI2KSaU_eU"
client = genai.Client(api_key=GEMINI_API_KEY)

models_to_test = [
    "gemini-3-flash-preview",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-2.0-flash-lite-preview-02-05" # Guessing specific names if standard ones fail, but let's stick to basics first
]

print("Listing supported models first...")
try:
    for m in client.models.list():
        if "generateContent" in m.supported_methods:
            print(f"- {m.name}")
except Exception as e:
    print(f"List error: {e}")

print("\nTesting generation...")
for model in models_to_test:
    print(f"\n--- Testing {model} ---")
    try:
        response = client.models.generate_content(
            model=model,
            contents="Hello, are you working?"
        )
        print(f"SUCCESS: {response.text}")
    except Exception as e:
        print(f"FAILED: {e}")
    time.sleep(1)
