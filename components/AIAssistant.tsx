'use client';

import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Bot, Send, X, Minimize2, Maximize2, Sparkles, User, Loader2, MessageSquare, Lightbulb, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AIAssistant() {
  const { t, dir } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([
    { role: 'ai', content: dir === 'rtl' ? 'مرحباً! أنا مساعدك الذكي في Gulf Sourcing. كيف يمكنني مساعدتك اليوم؟' : 'Hello! I am your Gulf Sourcing AI assistant. How can I help you today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    { text: dir === 'rtl' ? 'كيف أحسن ملف مصنعي؟' : 'How to optimize my profile?', icon: Lightbulb },
    { text: dir === 'rtl' ? 'تحليل طلبات التسعير' : 'Analyze my RFQs', icon: BarChart3 },
    { text: dir === 'rtl' ? 'نصائح لزيادة المبيعات' : 'Sales growth tips', icon: Sparkles },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text?: string) => {
    const userMessage = text || input.trim();
    if (!userMessage || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: 'user', parts: [{ text: `You are a helpful AI assistant for a B2B sourcing platform called "Gulf Sourcing". You help buyers find factories in Saudi Arabia and the GCC, and help factories manage their profiles and products. Be professional, concise, and helpful. Current language direction: ${dir}. User says: ${userMessage}` }] }
        ],
        config: {
          systemInstruction: "You are an expert in GCC manufacturing and international trade. Help users with sourcing strategies, factory verification, and platform navigation."
        }
      });

      const aiContent = response.text || "I'm sorry, I couldn't process that request.";
      setMessages(prev => [...prev, { role: 'ai', content: aiContent }]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I'm having trouble connecting to my brain right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed bottom-6 ${dir === 'rtl' ? 'left-6' : 'right-6'} z-50 flex flex-col items-end`} dir={dir}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden mb-4 transition-all duration-300 ${
              isMinimized ? 'h-16 w-72' : 'h-[550px] w-[350px] md:w-[400px]'
            }`}
          >
            {/* Header */}
            <div className="bg-emerald-600 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-1.5 rounded-lg">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Gulf AI Assistant</h3>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    <span className="text-[10px] opacity-80">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          msg.role === 'user' ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-slate-600 border border-slate-200'
                        }`}>
                          {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div className={`p-3 rounded-2xl text-sm shadow-sm ${
                          msg.role === 'user' 
                            ? 'bg-emerald-600 text-white rounded-tr-none' 
                            : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                        }`}>
                          <div className="prose prose-sm max-w-none prose-p:leading-relaxed">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                        <span className="text-xs text-slate-500 italic">AI is thinking...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Suggestions */}
                {messages.length === 1 && !isLoading && (
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2 overflow-x-auto scrollbar-hide">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(s.text)}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:border-emerald-500 hover:text-emerald-600 transition-all whitespace-nowrap shadow-sm"
                      >
                        <s.icon className="w-3 h-3" />
                        {s.text}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input */}
                <div className="p-4 bg-white border-t border-slate-100">
                  <div className="relative">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      placeholder={dir === 'rtl' ? 'اسأل أي شيء...' : "Ask anything..."}
                      className="w-full pl-4 pr-12 py-3 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <button
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isLoading}
                      className={`absolute ${dir === 'rtl' ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-all`}
                    >
                      <Send className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 text-center">
                    Powered by Gulf Sourcing AI • Gemini 3.0
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
        className={`bg-emerald-600 text-white p-4 rounded-2xl shadow-xl hover:bg-emerald-700 hover:scale-110 transition-all duration-300 flex items-center gap-2 group ${
          isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        <span className="font-bold hidden md:block">{dir === 'rtl' ? 'مساعد الذكاء الاصطناعي' : 'AI Assistant'}</span>
      </button>
    </div>
  );
}
