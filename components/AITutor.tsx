import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { createTutorChat, sendMessageToTutor } from '../services/geminiService';
import { Send, User, Bot, Loader2, Mic, Radio } from 'lucide-react';
import { Chat } from '@google/genai';

interface AITutorProps {
  initialPrompt?: string;
  isDarkMode?: boolean;
}

export const AITutor: React.FC<AITutorProps> = ({ initialPrompt, isDarkMode }) => {
  const isBriefing = !!initialPrompt;
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: isBriefing 
        ? 'Establishing secure link to Technical Instructor. Standby for briefing initialization...' 
        : 'I am your WellTegra technical mentor. Ready to focus on a specific operational domain?',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatSessionRef.current = createTutorChat();
    if (initialPrompt) handleAutoPrompt(initialPrompt);
  }, [initialPrompt]);

  const handleAutoPrompt = async (prompt: string) => {
    setIsLoading(true);
    const responseText = await sendMessageToTutor(chatSessionRef.current!, prompt);
    const modelMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'model',
      text: responseText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, modelMessage]);
    setIsLoading(false);
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !chatSessionRef.current || isLoading) return;
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', text: inputText, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    const responseText = await sendMessageToTutor(chatSessionRef.current, userMessage.text);
    const modelMessage: ChatMessage = { id: crypto.randomUUID(), role: 'model', text: responseText, timestamp: new Date() };
    setMessages(prev => [...prev, modelMessage]);
    setIsLoading(false);
  };

  return (
    <div className={`h-full flex flex-col overflow-hidden transition-all duration-700 ${isBriefing ? 'bg-[#0a0f1e]' : (isDarkMode ? 'bg-[#0f172a]' : 'bg-slate-50/50')}`}>
      {/* Header */}
      <div className={`p-6 border-b flex items-center justify-between ${isBriefing ? 'bg-[#0f172a] border-white/10' : (isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200')}`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl shadow-lg ${isBriefing ? 'bg-emerald-500 text-white shadow-emerald-900/40' : 'bg-blue-600 text-white shadow-blue-900/40'}`}>
            {isBriefing ? <Radio className="h-5 w-5 animate-pulse" /> : <Bot className="h-5 w-5" />}
          </div>
          <div>
            <h2 className={`font-black text-sm uppercase tracking-widest ${isBriefing ? 'text-white' : (isDarkMode ? 'text-white' : 'text-slate-800')}`}>
              {isBriefing ? 'Technical Liaison' : 'Expert Coach'}
            </h2>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500 opacity-80">
              {isBriefing ? 'Live Influx Analysis' : 'IWCF Standardized AI'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
              msg.role === 'user' ? (isDarkMode ? 'bg-white/10' : 'bg-slate-200') : (isBriefing ? 'bg-emerald-600' : 'bg-blue-600')
            }`}>
              {msg.role === 'user' ? <User size={18} className={isDarkMode ? 'text-white' : 'text-slate-600'} /> : <Mic size={18} className="text-white" />}
            </div>
            
            <div className={`max-w-[85%] rounded-[1.75rem] px-6 py-5 text-sm leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? (isDarkMode ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-slate-900 text-white rounded-tr-sm') 
                : (isBriefing 
                    ? 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm backdrop-blur-sm' 
                    : (isDarkMode ? 'bg-white/[0.03] border border-white/5 text-slate-200 rounded-tl-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'))
            }`}>
              {msg.text.split('\n').map((line, i) => (
                <p key={i} className={i > 0 ? 'mt-3' : ''}>{line}</p>
              ))}
              <span className={`text-[8px] block mt-3 font-black uppercase tracking-widest opacity-40 font-mono ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-500'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] ml-14 ${isBriefing ? 'text-emerald-500' : 'text-blue-500'} animate-pulse`}>
            <Loader2 className="animate-spin h-3 w-3" />
            <span>Processing Query...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`p-6 border-t ${isBriefing ? 'bg-[#0f172a] border-white/10' : (isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200')}`}>
        <div className={`flex items-center gap-3 rounded-[1.5rem] px-3 py-3 border transition-all duration-500 ${
          isBriefing || isDarkMode
            ? 'bg-white/5 border-white/10 focus-within:border-blue-500/50' 
            : 'bg-slate-50 border-slate-200 focus-within:border-blue-500'
        }`}>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Technical query input..."
            className="flex-1 bg-transparent border-none outline-none text-sm h-12 py-3 resize-none custom-scrollbar font-medium"
            style={{ color: isBriefing || isDarkMode ? '#fff' : '#1e293b' }}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputText.trim()}
            className={`p-3 rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl active:scale-95 ${
              isBriefing ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/40'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};