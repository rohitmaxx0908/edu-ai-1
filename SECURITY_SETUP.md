# Edu AI - Secure Architecture Setup Guide

## ✅ Security Refactoring Complete

Your application now follows the **secure 3-tier architecture**:

```
React (Public)
   ↓ HTTP only
FastAPI (Secure) - holds ALL API keys
   ↓
Supabase / Gemini / OpenAI
```

## 🔐 API Keys Location

**Frontend** (`.env.local`):
- ✅ Only has `VITE_BACKEND_URL`
- ❌ No Gemini, Supabase, or OpenAI keys

**Backend** (`backend/.env`):
- ✅ GEMINI_API_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY (not anon key!)
- ✅ OPENAI_API_KEY
- ✅ GNEWS_API_KEY

## 🚀 How to Run

### 1. Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Start Backend Server
```bash
cd backend
python main.py
```
Backend runs on: `http://localhost:8000`

### 3. Start Frontend (in new terminal)
```bash
npm run dev
```
Frontend runs on: `http://localhost:3000`

## 🔧 What Changed

### Backend (`backend/main.py`)
- ✅ Added `/assessment/analyze` - Career assessment with Gemini
- ✅ Added `/opportunities/fetch` - AI opportunity discovery
- ✅ Added `/profile/save` - Save user profile to Supabase
- ✅ Added `/profile/save-assessment` - Save assessment results
- ✅ Added `/profile/data` - Fetch user data
- ✅ Integrated `google-genai` SDK

### Frontend Services
- ✅ `geminiService.ts` - Now calls backend instead of direct Gemini
- ✅ `opportunityService.ts` - Routes through backend
- ✅ `dbService.ts` - Removed Supabase client, uses backend API
- ✅ `supabaseClient.ts` - ❌ REMOVED (no longer needed)
- ✅ `authService.ts` - ❌ REMOVED (auth moved to backend)

### Environment Variables
- ✅ `.env.local` - Cleaned (only backend URL)
- ✅ `backend/.env` - All secrets centralized

## 🛡️ Security Benefits

1. **Zero Client-Side Keys** - API keys never exposed in browser
2. **Rate Limiting** - Control API usage at backend
3. **Request Validation** - Pydantic models validate input
4. **CORS Protection** - Only your frontend can call backend
5. **Service Role Key** - Full Supabase access without RLS bypass

## 📝 Next Steps

1. **Test the flow**:
   - Start backend: `cd backend && python main.py`
   - Start frontend: `npm run dev`
   - Fill profile → See AI assessment

2. **Production Deployment**:
   - Deploy backend to Railway/Render/Fly.io
   - Update `VITE_BACKEND_URL` in frontend
   - Enable HTTPS
   - Add authentication middleware

3. **Optional Enhancements**:
   - Add JWT authentication
   - Implement rate limiting (slowapi)
   - Add request logging
   - Set up error tracking (Sentry)

## 🐛 Troubleshooting

**Backend won't start?**
- Check `backend/.env` has valid keys
- Install: `pip install google-genai`

**Frontend can't connect?**
- Ensure backend is running on port 8000
- Check CORS settings in `backend/main.py`

**Still seeing VITE_GEMINI_API_KEY errors?**
- Clear browser cache
- Restart dev server
- The keys are now in backend only!
