'use client';

import React, { memo, useState } from 'react';
import { ChevronLeft, User, Phone, Video, MoreVertical, FileText, Sparkles, Languages, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';

import { summarizeConversation } from '@/lib/ai';

export const ChatHeader = memo(({ 
  otherParticipantName, 
  isMobileView, 
  setActiveChatId, 
  messages,
  t, 
  dir 
}: { 
  otherParticipantName: string, 
  isMobileView: boolean, 
  setActiveChatId: (id: string | null) => void, 
  messages: any[],
  t: any, 
  dir: string 
}) => {
  const [showAI, setShowAI] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState('');

  const handleSummary = React.useCallback(async () => {
    setIsSummarizing(true);
    try {
      const result = await summarizeConversation(messages);
      setSummary(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSummarizing(false);
    }
  }, [messages]);

  React.useEffect(() => {
    if (showAI && !summary && messages.length > 0) {
      handleSummary();
    }
  }, [showAI, messages.length, summary, handleSummary]);

  return (
    <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm relative z-20">
      <div className="flex items-center gap-4">
        {isMobileView && (
          <button onClick={() => setActiveChatId(null)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
            <ChevronLeft className={`w-6 h-6 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
          </button>
        )}
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 shadow-sm overflow-hidden">
            <User className="w-6 h-6" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
        </div>
        <div>
          <h3 className="font-black text-slate-900 leading-tight">{otherParticipantName}</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">{t('messages.online')}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 mr-4 border-r pr-4 border-slate-100">
          <Link 
            href={`/dashboard/rfq/new?supplier=${otherParticipantName}`}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all border border-emerald-100/50 shadow-sm"
          >
            <FileText className="w-4 h-4" />
            {t('messages.convert_to_rfq')}
          </Link>
          <button 
            onClick={() => setShowAI(!showAI)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm ${showAI ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-indigo-50 text-indigo-700 border-indigo-100/50 hover:bg-indigo-100'}`}
          >
            <Sparkles className="w-4 h-4" />
            {t('messages.summary')}
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showAI && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 p-4 bg-indigo-600 text-white shadow-xl z-10 border-t border-indigo-500/30"
          >
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold opacity-80 uppercase tracking-wider">{t('messages.summary')}</p>
                  <p className="text-sm font-medium">
                    {isSummarizing ? 'Analyzing conversation...' : (summary || 'No summary available yet.')}
                  </p>
                </div>
              </div>
              <button 
                onClick={handleSummary}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isSummarizing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
ChatHeader.displayName = 'ChatHeader';
