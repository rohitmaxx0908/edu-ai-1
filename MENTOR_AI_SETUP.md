# Mentor AI - OpenAI Integration Setup

## ✅ Status: FULLY CONNECTED AND OPTIMIZED

The ChatMentor AI is completely integrated with OpenAI GPT-4o-mini and configured for optimal career guidance.

---

## Architecture Flow

```
ChatMentor.tsx (React Component)
    ↓ (user message + context)
askAI() in api/backend.ts
    ↓ (POST request)
FastAPI Backend (backend/main.py)
    ↓
/rag/ask endpoint
    ↓ (2-step process)
    1. Create embedding of query (OpenAI text-embedding-3-small)
    2. Retrieve relevant knowledge base context
    ↓
generate_answer() function
    ↓
OpenAI GPT-4o-mini
    ↓ (career guidance response)
ChatMentor displays response
```

---

## Current Configuration

### Frontend (ChatMentor.tsx)
- **Component**: React functional component
- **AI Function**: `askAI()` from centralized api/backend.ts
- **Context Passing**: User profile + assessment + skills included with each query
- **Features**:
  - Current role, target role, skills, experience level
  - Career goals and learning preferences
  - Conversation history with scrolling
  - Loading states and error handling

### Backend (main.py)
- **Endpoint**: POST `/rag/ask`
- **RAG System**: 
  - Embeddings via OpenAI text-embedding-3-small
  - Vector search in Supabase pgvector
  - Context retrieval from knowledge_base table
- **AI Model**: GPT-4o-mini (gpt-4o-mini)
- **System Prompt**: Career growth mentor role with specific instructions
- **Fallback Strategy**:
  1. Try RAG (knowledge base + OpenAI)
  2. If RAG fails, ask OpenAI directly
  3. If OpenAI unavailable, return friendly error message

### API Key Security
- **Location**: `backend/.env` (server-side only)
- **Key**: `OPENAI_API_KEY`
- **Exposure**: Zero - frontend has no access to API keys
- **Model**: OpenAI GPT-4o-mini for optimal speed and cost

---

## Enhanced Features (Latest Update)

### 1. Improved System Prompt
The mentor AI now has a specialized system prompt focused on:
- ✅ Personalized career guidance
- ✅ Skill development recommendations
- ✅ Job opportunity matching
- ✅ Career transition support
- ✅ Technology and industry insights
- ✅ Encouraging and supportive communication style

### 2. User Context Integration
ChatMentor now passes rich context to the AI:
```typescript
- Current Role: [user's current job]
- Target Role: [user's career goal]
- Skills: [user's technical skills]
- Experience Level: [assessed by system]
- Career Goals: [from user profile]
- Learning Preferences: [from user profile]
```

This enables:
- More relevant career guidance
- Personalized skill recommendations
- Better opportunity matching
- Contextual learning path suggestions

### 3. RAG Enhancement
The knowledge base can be enriched with:
- Technology trends and insights
- Industry career paths
- Skill development guides
- Educational resources
- Company insights and opportunities

Ingest via: POST `/rag/ingest` with `{"content": "...", "source": "..."}`

---

## How to Use

### As End User (ChatMentor Component)
1. Fill in your profile (current role, target role, skills)
2. Complete the career assessment
3. Open the Chat Mentor tab
4. Ask any career-related question
5. Mentor responds with personalized guidance backed by:
   - Your profile context
   - OpenAI GPT-4o-mini intelligence
   - Knowledge base context (if available)

### As Developer (API Level)

**Send a mentor question:**
```bash
curl -X POST http://localhost:8000/rag/ask \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What skills should I learn to transition from frontend to full-stack development?"
  }'
```

**Ingest knowledge into mentor:**
```bash
curl -X POST http://localhost:8000/rag/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Full-stack developers need backend skills including Node.js, databases, APIs...",
    "source": "internal_knowledge"
  }'
```

**Search knowledge base:**
```bash
curl -X GET "http://localhost:8000/rag/search?query=full-stack+skills"
```

---

## Key Files

| File | Purpose | Status |
|------|---------|--------|
| `components/ChatMentor.tsx` | Mentor UI component | ✅ Optimized with context |
| `api/backend.ts` | API client (askAI function) | ✅ Connected |
| `backend/main.py` | RAG router & endpoints | ✅ OpenAI integrated |
| `backend/.env` | OpenAI API key | ✅ Secured server-side |
| `lib/supabase.ts` | Database client | ✅ Connected |
| Database: `knowledge_base` table | Mentor knowledge storage | ✅ Ready to populate |

---

## Verification Checklist

- [x] OpenAI API key configured in backend/.env
- [x] ChatMentor component uses askAI function
- [x] askAI calls /rag/ask endpoint
- [x] /rag/ask endpoint uses OpenAI GPT-4o-mini
- [x] System prompt optimized for career guidance
- [x] User context (skills, goals) passed to AI
- [x] Fallback strategy implemented
- [x] Knowledge base vector search ready
- [x] Zero API key exposure in frontend

---

## Testing

To test the Mentor AI:

1. **Ensure backend is running:**
   ```bash
   cd backend && python main.py
   ```
   Should show: `Uvicorn running on http://127.0.0.1:8000`

2. **Ensure frontend is running:**
   ```bash
   npm run dev
   ```
   Should show: `VITE v6.4.1 ready in ...`

3. **Test in browser:**
   - Navigate to Chat Mentor tab
   - Enter your profile and assessment
   - Ask: "What skills should I develop next?"
   - Should receive OpenAI-powered career guidance

4. **Test API directly:**
   ```bash
   curl -X POST http://localhost:8000/rag/ask \
     -H "Content-Type: application/json" \
     -d '{"query": "What is a good learning path for cloud engineering?"}'
   ```

---

## Next Steps (Optional Enhancements)

1. **Populate Knowledge Base**
   - Ingest career guides, tech tutorials, industry insights
   - Improves context relevance for mentor responses

2. **Conversation History**
   - Store chat history in database
   - Enable multi-turn context awareness
   - Learn user preferences over time

3. **Conversation Analytics**
   - Track common questions and mentor responses
   - Identify skill gaps in user base
   - Optimize knowledge base content

4. **Integration with Assessment**
   - Auto-generate mentor recommendations based on assessment results
   - Suggest learning paths based on identified gaps
   - Track progress across sessions

---

## Support

**Issue**: Mentor returns generic responses
**Solution**: Populate knowledge_base table with career-specific content

**Issue**: Empty context error
**Solution**: Ensure OPENAI_API_KEY is set in backend/.env

**Issue**: Slow responses
**Solution**: Check OpenAI API rate limits; consider caching common responses

**Issue**: Context not personalized
**Solution**: Verify ChatMentor passes full user profile context in handleSend

---

**Last Updated**: Current Session
**OpenAI Model**: gpt-4o-mini
**Embedding Model**: text-embedding-3-small
**Framework**: React 19 + FastAPI
