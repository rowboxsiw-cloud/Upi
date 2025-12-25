
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageSquare, Send, X, Bot, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../App';
import { Transaction } from '../types';

const AIAssistant: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const { authState } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const handleQuery = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const context = transactions.slice(0, 10).map(t => 
        `${t.type === 'debit' ? 'Sent' : 'Received'} ₹${t.amount} ${t.type === 'debit' ? 'to' : 'from'} ${t.type === 'debit' ? t.toName : t.fromName} on ${new Date(t.timestamp).toLocaleDateString()} for ${t.note || 'no note'}`
      ).join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: `You are PayFast Assistant. Help the user with their finance. Current balance: ₹${authState.user?.balance}. Recent Transactions: ${context}. Keep answers short and professional.`,
        },
      });

      setMessages(prev => [...prev, { role: 'ai', text: response.text || "I'm sorry, I couldn't process that." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "Error connecting to AI. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center animate-float z-40 border-4 border-white/10"
      >
        <Sparkles size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-24 sm:pb-6 pointer-events-none">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl shadow-2xl flex flex-col h-[70vh] pointer-events-auto overflow-hidden animate-in slide-in-from-bottom-10">
            <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot size={20} />
                <span className="font-bold">PayFast Intelligence</span>
              </div>
              <button onClick={() => setIsOpen(false)}><X size={20}/></button>
            </div>
            
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              <div className="bg-white/5 p-3 rounded-2xl text-xs text-indigo-200">
                Hi {authState.user?.displayName}! I can analyze your transactions or answer financial questions.
              </div>
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white/10 text-slate-200'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 p-3 rounded-2xl">
                    <Loader2 size={16} className="animate-spin text-indigo-400" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-800 flex gap-2">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                placeholder="Ask about your spending..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button 
                onClick={handleQuery}
                className="p-2 bg-indigo-600 text-white rounded-xl active:scale-95 transition-transform"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
