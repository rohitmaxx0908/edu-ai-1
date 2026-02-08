
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
        <div className="px-6 py-4 border-b border-slate-100 bg-white/50 backdrop-blur-md flex justify-between items-center z-30">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/30 blur-md rounded-full animate-pulse"></div>
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center relative shadow-lg">
                <i className="fa-solid fa-robot text-white text-sm"></i>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Twin Agent <span className="text-indigo-500">v2.4</span></h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Online & Synced
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setMessages([])}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              title="Clear Chat"
            >
              <i className="fa-solid fa-trash-can text-sm"></i>
            </button>
          </div>
        </div>

        {/* Messages Stream */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth p-4 md:p-8 space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <i className="fa-solid fa-comment-dots text-3xl text-slate-300"></i>
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Channel Open</p>
              <p className="text-xs text-slate-300 mt-2">Initialize dialogue sequence...</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>

              {/* Bot Avatar (Desktop) */}
              {msg.role === 'model' && (
                <div className="hidden md:flex flex-col items-center mr-4 mt-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shadow-lg mb-2">
                    <i className="fa-solid fa-robot text-[10px] text-white"></i>
                  </div>
                </div>
              )}

              <div
                className={`max-w-[85%] md:max-w-[75%] p-5 md:p-6 rounded-3xl shadow-sm relative group transition-all
                  ${msg.role === 'user'
                    ? 'bg-slate-900 text-white rounded-br-none'
                    : 'bg-white border border-slate-100 rounded-tl-none'
                  }`}
              >
                {msg.role === 'user' ? (
                  <p className="text-sm md:text-[15px] font-medium leading-relaxed">{msg.text}</p>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    {renderContent(msg)}
                  </div>
                )}

                {/* Timestamp / Meta */}
                <p className={`text-[9px] font-bold uppercase tracking-widest mt-2 opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-5 ${msg.role === 'user' ? 'right-0 text-slate-400' : 'left-0 text-slate-300'}`}>
                  {msg.role === 'user' ? 'You' : 'Twin Agent'} • Now
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start animate-in fade-in duration-300 pl-12">
              <div className="bg-white border border-slate-100 px-6 py-4 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-white border-t border-slate-100 relative z-30">
          {/* Quick Chips */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar">
            {[
              "Analyze my skill gaps",
              "Trend forecast integration",
              "Suggest project ideas",
              "Audit my portfolio"
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => handleSend(chip)}
                className="whitespace-nowrap px-4 py-1.5 bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-white text-slate-500 hover:text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all shadow-sm"
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="relative flex items-end gap-2 bg-slate-50 border-2 border-slate-100 focus-within:border-indigo-200 focus-within:bg-white rounded-3xl p-2 transition-all shadow-inner">
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
              className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-800 placeholder:text-slate-400 resize-none max-h-32 min-h-[44px] py-3 px-4"
              rows={1}
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="w-10 h-10 mb-0.5 rounded-2xl bg-slate-900 text-white flex items-center justify-center hover:bg-indigo-600 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-lg shadow-slate-900/10"
            >
              {isLoading ? (
                <i className="fa-solid fa-spinner animate-spin text-xs"></i>
              ) : (
                <i className="fa-solid fa-paper-plane text-xs"></i>
              )}
            </button>
          </div>
          <p className="text-center mt-3 text-[9px] font-bold text-slate-300 uppercase tracking-widest">
            AI-Generated Content • Verify Important Information
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatMentor;
