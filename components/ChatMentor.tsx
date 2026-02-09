
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, AssessmentResult } from '../types';
import { askGemini } from '../services/geminiService';

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

      const response = await askGemini(context);

      setMessages(prev => [...prev, { role: 'model', text: response.answer || 'Error: Uptime conflict.' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'SYSTEM ERROR: Uplink to Twin Agent lost.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = (msg: Message) => {
    // Simple markdown-like parsing for the chat
    const textNodes = msg.text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={i} className="h-2" />;

      if (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && trimmed.length < 60 && !trimmed.startsWith('•') && !trimmed.startsWith('-')) {
        return (
          <h3 key={i} className="text-indigo-900 font-extrabold text-xs tracking-[0.2em] uppercase mt-6 mb-3 flex items-center gap-2">
            <span className="w-1 h-3 bg-indigo-500 rounded-full"></span>
            {trimmed}
          </h3>
        );
      }

      if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.match(/^\d\./)) {
        return (
          <div key={i} className="flex gap-3 ml-1 mb-2 items-start group">
            <div className="mt-2 w-1 h-1 rounded-full bg-indigo-400 shrink-0"></div>
            <p className="text-slate-700 text-sm leading-relaxed">
              {trimmed.replace(/^[•-]\s*/, '').replace(/^\d\.\s*/, '')}
            </p>
          </div>
        );
      }
      return <p key={i} className="text-slate-700 text-sm leading-relaxed mb-3 font-medium">{trimmed}</p>;
    });

    return <div className="space-y-1">{textNodes}</div>;
  };

  return (
    <div className="flex h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] bg-slate-50 overflow-hidden relative">

      {/* Absolute Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-300/20 rounded-full blur-[120px] mix-blend-multiply animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-300/20 rounded-full blur-[100px] mix-blend-multiply animate-pulse delay-1000"></div>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 flex flex-col relative z-20 max-w-5xl mx-auto w-full shadow-2xl bg-white/80 backdrop-blur-xl md:rounded-3xl border border-white/50 md:my-4 overflow-hidden">

        {/* Header HUD */}
        <div className="px-6 py-4 border-b border-indigo-50/50 bg-white/70 backdrop-blur-xl flex justify-between items-center z-30 shadow-sm transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 blur-lg rounded-full opacity-30 group-hover:opacity-60 animate-pulse"></div>
              <div className="w-12 h-12 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl flex items-center justify-center relative shadow-xl border border-slate-700/50 group-hover:scale-105 transition-transform">
                <i className="fa-solid fa-robot text-indigo-400 text-lg relative z-10"></i>
                <div className="absolute inset-0 bg-black/20 rounded-2xl"></div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm ring-1 ring-emerald-500/30"></div>
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                Twin Agent <span className="px-1.5 py-0.5 rounded text-[9px] bg-indigo-50 text-indigo-600 border border-indigo-100">v2.4</span>
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Online & Synced
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setMessages([])}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm border border-slate-100 hover:border-red-100"
              title="Clear Chat"
            >
              <i className="fa-solid fa-trash-can text-xs"></i>
            </button>
          </div>
        </div>

        {/* Messages Stream */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth p-4 md:p-8 space-y-8 pb-10">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-70 animate-in fade-in zoom-in-95 duration-700">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-indigo-50 rounded-3xl flex items-center justify-center mb-8 shadow-inner border border-white">
                <i className="fa-solid fa-comment-dots text-4xl text-indigo-300 animate-pulse"></i>
              </div>
              <p className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Secure Channel Open</p>
              <p className="text-xs font-medium text-slate-400 max-w-xs leading-relaxed">
                Twin Agent allows you to query your career data and simulate interview scenarios.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards`}>

              {/* Bot Avatar (Desktop) */}
              {msg.role === 'model' && (
                <div className="hidden md:flex flex-col items-center mr-4 mt-1">
                  <div className="w-10 h-10 rounded-2xl bg-white border border-indigo-100 flex items-center justify-center shadow-md relative overflow-hidden group">
                    <div className="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <i className="fa-solid fa-robot text-sm text-indigo-600 relative z-10"></i>
                  </div>
                </div>
              )}

              <div
                className={`max-w-[85%] md:max-w-[75%] p-6 md:p-7 rounded-[2rem] shadow-sm relative group transition-all duration-300
                  ${msg.role === 'user'
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-tr-sm shadow-indigo-500/20 hover:shadow-indigo-500/30'
                    : 'bg-white border border-slate-100 rounded-tl-sm shadow-slate-200/50 hover:shadow-lg hover:shadow-slate-200/40 text-slate-700'
                  }`}
              >
                {msg.role === 'user' ? (
                  <p className="text-sm md:text-[15px] font-medium leading-relaxed tracking-wide text-indigo-50">{msg.text}</p>
                ) : (
                  <div className="prose prose-sm max-w-none prose-p:text-slate-600 prose-headings:text-indigo-900 prose-strong:text-slate-800">
                    {renderContent(msg)}
                  </div>
                )}

                {/* Timestamp / Meta */}
                <div className={`absolute -bottom-6 ${msg.role === 'user' ? 'right-2' : 'left-2'} flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                    {msg.role === 'user' ? 'You' : 'Twin Agent'}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start animate-in fade-in duration-300 pl-2 md:pl-14">
              <div className="bg-white/80 backdrop-blur-sm border border-indigo-50 px-6 py-4 rounded-3xl rounded-tl-sm shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce shadow-sm shadow-indigo-500/50"></span>
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s] shadow-sm shadow-purple-500/50"></span>
                <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce [animation-delay:0.4s] shadow-sm shadow-pink-500/50"></span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-white/60 backdrop-blur-xl border-t border-indigo-50 relative z-30 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
          {/* Quick Chips */}
          <div className="flex gap-2 mb-5 overflow-x-auto pb-2 no-scrollbar mask-linear-fade">
            {[
              "Analyze my skill gaps",
              "Trend forecast integration",
              "Suggest project ideas",
              "Audit my portfolio"
            ].map((chip, idx) => (
              <button
                key={chip}
                onClick={() => handleSend(chip)}
                className="whitespace-nowrap px-5 py-2 bg-white border border-slate-200/60 hover:border-indigo-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-white text-slate-500 hover:text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-2 fill-mode-backwards"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="relative flex items-end gap-2 bg-white border border-slate-200 focus-within:border-indigo-200 focus-within:ring-4 focus-within:ring-indigo-50 rounded-[2rem] p-2 transition-all shadow-lg shadow-indigo-100/30">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Query your Twin Agent..."
              className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-800 placeholder:text-slate-400 resize-none max-h-32 min-h-[48px] py-3.5 px-5"
              rows={1}
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="w-12 h-12 mb-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-lg"
            >
              {isLoading ? (
                <i className="fa-solid fa-spinner animate-spin text-sm"></i>
              ) : (
                <i className="fa-solid fa-paper-plane text-sm ml-0.5"></i>
              )}
            </button>
          </div>
          <p className="text-center mt-3 text-[9px] font-bold text-slate-300 uppercase tracking-widest opacity-60">
            AI-Generated Content • Verify Important Information
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatMentor;
