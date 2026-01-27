<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Edu AI Career Growth Agent

A "Digital Twin" career assistant powered by Google Gemini and Supabase.

## 🚀 Quick Start (Demo Mode)

The app comes with a **Demo Mode** enabled by default, allowing you to preview functionality without API keys.

### 1. Run the App
Since Node.js path variables might not be set globally on some Windows environments, use this safe command:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force; $env:Path += ";C:\Program Files\nodejs"; npm run dev
```

### 2. Open in Browser
Visit **[http://localhost:3000](http://localhost:3000)** (or the port shown in your terminal).

---

## 🔑 Full Setup (Connected Mode)

To enable real AI analysis and cloud persistence:

### 1. Get API Keys
- **Google Gemini**: [Get Key](https://aistudio.google.com/app/apikey)
- **Supabase**: [Get Keys](https://supabase.com/dashboard)

### 2. Configure Environment
Open `.env.local` and update the settings:

```properties
# Paste your actual keys here
GEMINI_API_KEY=your_gemini_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Disable Demo Mode to use real APIs
VITE_ENABLE_DEMO_MODE=false
```

### 3. Database Setup (Supabase)
Run this SQL in your Supabase SQL Editor:
```sql
create table user_data (
  id uuid default gen_random_uuid() primary key,
  user_id text not null unique,
  profile jsonb,
  assessment jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
alter table user_data enable row level security;
create policy "Public Access" on user_data for all using (true);
```

### 4. Restart Server
If you change `.env.local`, restart the server:
```powershell
$env:Path += ";C:\Program Files\nodejs"; npm run dev
```
