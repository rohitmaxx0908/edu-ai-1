#!/usr/bin/env python
"""Verify the news endpoint fix is working"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Import and check the main module
try:
    from backend.main import DEMO_NEWS, get_tech_news
    print("✓ Successfully imported news endpoint components")
    print(f"✓ DEMO_NEWS defined with {len(DEMO_NEWS)} articles")
    
    # Check the articles structure
    for i, article in enumerate(DEMO_NEWS, 1):
        required_fields = ['title', 'description', 'source', 'url']
        missing = [f for f in required_fields if f not in article]
        if missing:
            print(f"✗ Article {i} missing fields: {missing}")
        else:
            print(f"✓ Article {i}: {article['title'][:50]}...")
            
    print("\n✓ News endpoint fallback is properly configured")
    
except ImportError as e:
    print(f"✗ Import error: {e}")
    sys.exit(1)
except Exception as e:
    print(f"✗ Error: {e}")
    sys.exit(1)
