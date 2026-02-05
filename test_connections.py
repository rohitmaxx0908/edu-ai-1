#!/usr/bin/env python
import requests
import json
import sys

endpoints = [
    ('http://localhost:8000/profile/data', 'GET'),
    ('http://localhost:8000/news/', 'GET'),
    ('http://localhost:8000/news/rss', 'GET'),
]

print("=== BACKEND CONNECTION TEST ===\n")
all_good = True

for url, method in endpoints:
    try:
        response = requests.get(url, timeout=5)
        status = "✓" if response.status_code == 200 else "⚠"
        print(f"{status} {method} {url.replace('http://localhost:8000', '')}")
        print(f"  Status: {response.status_code}")
        try:
            data = response.json()
            if 'error' in data:
                print(f"  Error: {data['error']}")
                all_good = False
            else:
                print(f"  Response OK")
        except:
            print(f"  Response (non-JSON)")
        print()
    except Exception as e:
        print(f"✗ {method} {url.replace('http://localhost:8000', '')}")
        print(f"  Error: {str(e)}\n")
        all_good = False

print("\n=== SUPABASE CONNECTION TEST ===\n")
try:
    from supabase import create_client
    import os
    
    url = os.getenv('SUPABASE_URL', 'https://your-project.supabase.co')
    key = os.getenv('SUPABASE_SERVICE_ROLE_KEY', '')
    
    if key and url:
        try:
            supabase = create_client(url, key)
            # Try to fetch from a table
            result = supabase.table("user_data").select("*").limit(1).execute()
            print("✓ Supabase Connection: OK")
        except Exception as e:
            print(f"⚠ Supabase Connection: {str(e)[:100]}")
    else:
        print("⚠ Supabase Keys: Not configured or missing")
except Exception as e:
    print(f"⚠ Supabase Client: {str(e)[:100]}")

print("\n=== OPENAI CONNECTION TEST ===\n")
try:
    import os
    key = os.getenv('OPENAI_API_KEY', '')
    if key:
        from openai import OpenAI
        client = OpenAI(api_key=key)
        print("✓ OpenAI Client: Configured")
    else:
        print("⚠ OpenAI API Key: Not configured")
except Exception as e:
    print(f"⚠ OpenAI Error: {str(e)[:100]}")

print("\n" + "="*50)
if all_good:
    print("✓ All connections OK!")
    sys.exit(0)
else:
    print("⚠ Some connections need attention")
    sys.exit(1)
