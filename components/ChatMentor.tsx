
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, AssessmentResult } from '../types';
import { askAI } from '../api/backend';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface ChatMentorProps {
  profile: UserProfile;
  assessment: AssessmentResult;
}

const ChatMentor: React.FC<ChatMentorProps> = ({ profile, assessment }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    const initChat = async () => {
      setMessages([{ role: 'model', text: "Digital Twin synchronized. Grounding engine active. Awaiting strategic command." }]);
    };

    if (!initialized.current) {
      initChat();
      initialized.current = true;
    }
  }, [profile, assessment]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (customMsg?: string) => {
    const msgToSend = (customMsg || input).trim();
    if (!msgToSend || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msgToSend }]);
    setIsLoading(true);

    try {
      // Build context string from user profile and assessment
      // Build context string from user profile and assessment
      const context = `
User Profile Context:
- Name: ${profile.personalContext.name || 'User'}
- Education: ${profile.personalContext.educationLevel} in ${profile.personalContext.fieldOfStudy}
- Target Role: ${profile.careerTarget.desiredRole || 'Not specified'}
- Target Industry: ${profile.careerTarget.targetIndustry || 'Not specified'}
- Top Skills: ${Object.entries(profile.skillInventory).filter(([_, v]) => v > 5).map(([k, _]) => k).join(', ') || 'None prominent'}
- Current Level: ${assessment?.level || 'Analyzing'}
- Identified Gaps: ${assessment?.identified_gaps?.map(g => g.title).join(', ') || 'None'}

User Query: ${msgToSend}`;

      const response = await askAI(context);
      setMessages(prev => [...prev, { role: 'model', text: response.answer || 'Error: Uptime conflict.' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'SYSTEM ERROR: Uplink to Twin Agent lost.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = (msg: Message) => {
    const textNodes = msg.text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={i} className="h-4" />;

      if (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && trimmed.length < 60 && !trimmed.startsWith('•')) {
        return (
          <div key={i} className="mt-12 mb-6 first:mt-0">
            <h2 className="text-slate-900 font-black text-xs tracking-[0.3em] uppercase flex items-center gap-3">
              <span className="w-6 h-[2px] bg-indigo-600"></span>
              {trimmed}
            </h2>
          </div>
        );
      }

      if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.match(/^\d\./)) {
        return (
          <div key={i} className="flex gap-4 ml-2 mb-4 items-start group">
            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-indigo-200 group-hover:bg-indigo-600 transition-colors shrink-0"></div>
            <p className="text-slate-600 text-[15px] leading-relaxed font-medium">
              {trimmed.replace(/^[•-]\s*/, '').replace(/^\d\.\s*/, '')}
            </p>
          </div>
        );
      }

      return <p key={i} className="text-slate-600 text-[15px] leading-relaxed mb-4 font-medium">{trimmed}</p>;
    });

    return (
      <div className="space-y-6">
        <div>{textNodes}</div>
      </div>
    );
  };

  return (
    <div className="flex h-full bg-white">
      {/* Left Panel: Twin Monitor */}
      <div className="hidden lg:flex w-80 border-r border-slate-100 flex-col bg-slate-50/30 p-8">
        <div className="mb-10">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Twin State</label>
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm space-y-4">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">Target Role</p>
              <p className="text-sm font-black text-slate-900">{profile.careerTarget.desiredRole}</p>
            </div>
            <div className="pt-4 border-t border-slate-50">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">Current Level</p>
              <span className="inline-block px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                {assessment.level}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-10">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Grounded Logic</label>
          <div className="space-y-3">
            {assessment.next_priority_actions.slice(0, 2).map((act, idx) => (
              <div key={idx} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <p className="text-[9px] font-black text-indigo-600 uppercase mb-1">Priority 0{act.order}</p>
                <p className="text-[11px] font-bold text-slate-700 leading-tight">{act.action}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto">
          <div className="p-5 bg-slate-900 rounded-2xl text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-brain text-4xl"></i>
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-2 opacity-50 relative z-10">Agent Intelligence</p>
            <p className="text-[11px] font-medium leading-relaxed relative z-10">A personalized mentoring stream grounded in your career trajectory and skill inventory.</p>
          </div>
        </div>
      </div>

      {/* Main Analysis Column */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="px-10 py-6 border-b border-slate-50 flex justify-between items-center bg-white z-10">
          <div className="flex flex-col">
            <h2 className="text-slate-900 font-black text-xs uppercase tracking-[0.4em]">Twin Dialogue Workspace</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Profile Synced: {profile.personalContext.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setMessages([])} className="text-[9px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">Clear Stream</button>
          </div>
        </header>

        {/* Stream Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth bg-white">
          <div className="max-w-3xl mx-auto px-10 py-16 space-y-12">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start animate-in fade-in slide-in-from-bottom-2 duration-500'}`}>
                <div className={`${msg.role === 'user' ? 'max-w-[80%] bg-slate-50 border border-slate-100 p-5 rounded-[1.5rem] shadow-sm' : 'w-full'}`}>
                  {msg.role === 'user' ? (
                    <p className="text-slate-800 text-[15px] font-bold leading-relaxed">{msg.text}</p>
                  ) : (
                    <div className="max-w-none prose prose-slate">
                      {renderContent(msg)}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-4 py-6">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></div>
                </div>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Twin Reasoning...</span>
              </div>
            )}
          </div>
        </div>

        {/* Input Dock */}
        <div className="p-8 bg-white border-t border-slate-50">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { label: "Identify my next critical skill node", icon: "fa-diagram-project" },
                { label: "Analyze my roadmap risks", icon: "fa-chart-simple" },
              ].map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => handleSend(chip.label)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 group shadow-sm hover:border-slate-900 hover:bg-slate-900 hover:text-white"
                >
                  <i className={`fa-solid ${chip.icon} opacity-30 group-hover:opacity-100 text-[8px]`}></i>
                  {chip.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Synchronize with your Twin Agent..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-medium focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none transition-all pr-16 shadow-inner"
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-slate-900 text-white rounded-xl disabled:bg-slate-100 disabled:text-slate-300 transition-all hover:bg-indigo-600 active:scale-95 shadow-md shadow-slate-900/10"
                aria-label="Send message"
              >
                <i className="fa-solid fa-arrow-up text-sm"></i>
              </button>
            </div>
            <p className="text-center mt-6 text-[8px] text-slate-300 font-black uppercase tracking-[0.5em]">
              Strategic Feedback Loop Activated
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMentor;
