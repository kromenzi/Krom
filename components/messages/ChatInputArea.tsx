'use client';

import React, { memo, useState, useMemo, useEffect, useCallback } from 'react';
import { Paperclip, Smile, Send, X, Sparkles, Wand2 } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import { motion, AnimatePresence } from 'motion/react';

import { generateSuggestedReplies, aiComposeMessage } from '@/lib/ai';

export const ChatInputArea = memo(({ 
  newMessage, 
  setNewMessage, 
  handleSendMessage, 
  handleFileUpload, 
  activeChatId, 
  messages,
  t, 
  dir 
}: { 
  newMessage: string, 
  setNewMessage: React.Dispatch<React.SetStateAction<string>>, 
  handleSendMessage: (e?: React.FormEvent, fileUrl?: string, fileType?: 'image' | 'video') => void, 
  handleFileUpload: (urls: string[]) => void, 
  activeChatId: string, 
  messages: any[],
  t: any, 
  dir: string 
}) => {
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (messages.length > 0) {
        const result = await generateSuggestedReplies(messages);
        if (result.length > 0) setAiSuggestions(result);
      }
    };
    fetchSuggestions();
  }, [messages]);

  const suggestions = useMemo(() => {
    if (aiSuggestions.length > 0) return aiSuggestions;
    return [
      t('messages.suggested_1') || 'Can you send more details?',
      t('messages.suggested_2') || 'What is the lead time?',
      t('messages.suggested_3') || 'I am interested in a quote.',
    ];
  }, [t, aiSuggestions]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(e);
    setShowFileUpload(false);
  };

  const onUpload = (urls: string[]) => {
    handleFileUpload(urls);
    setShowFileUpload(false);
  };

  const handleAICompose = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const result = await aiComposeMessage(newMessage || "Inquire about product details and quote", messages.slice(-5).map(m => m.text).join('\n'));
      setNewMessage(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] relative z-10">
      <AnimatePresence>
        {!newMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex flex-wrap gap-2 mb-4"
          >
            <div className="flex items-center gap-2 mr-2 text-indigo-600">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">{t('messages.suggested')}</span>
            </div>
            {suggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => setNewMessage(suggestion)}
                className="px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all shadow-sm"
              >
                {suggestion}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {showFileUpload && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 shadow-inner"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Paperclip className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-black text-slate-700 uppercase tracking-wider">{t('messages.upload_media')}</h4>
            </div>
            <button 
              onClick={() => setShowFileUpload(false)} 
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <FileUpload 
            onUploadComplete={onUpload}
            maxFiles={1}
            folder={`chats/${activeChatId}`}
            label={t('messages.drop_file')}
          />
        </motion.div>
      )}

      <form onSubmit={onSubmit} className="flex items-center gap-3 relative">
        <div className="flex items-center gap-1">
          <button 
            type="button"
            onClick={() => setShowFileUpload(!showFileUpload)}
            className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all border ${showFileUpload ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200' : 'bg-white text-slate-400 border-slate-200 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50'}`}
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <div className="relative">
            <button 
              type="button"
              onClick={() => setShowEmojis(!showEmojis)}
              className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all border ${showEmojis ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-200' : 'bg-white text-slate-400 border-slate-200 hover:border-amber-500 hover:text-amber-600 hover:bg-amber-50'}`}
            >
              <Smile className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {showEmojis && (
                <motion.div 
                  initial={{ opacity: 0, y: -10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.9 }}
                  className={`absolute bottom-full ${dir === 'rtl' ? 'right-0' : 'left-0'} mb-4 bg-white border border-slate-200 rounded-2xl p-3 shadow-2xl flex flex-wrap gap-1.5 z-50 w-56`}
                >
                  {['👍', '❤️', '🔥', '👏', '😊', '😂', '🏭', '⚙️', '📦', '🚚', '✅', '❌', '💰', '📅'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setNewMessage(prev => prev + emoji);
                        setShowEmojis(false);
                      }}
                      className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-xl text-xl transition-all hover:scale-110"
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex-grow relative group">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t('messages.type_placeholder')}
            className="w-full px-6 py-3.5 bg-slate-100 border-2 border-transparent rounded-2xl text-sm font-medium focus:ring-0 focus:border-emerald-500 focus:bg-white outline-none transition-all shadow-inner"
          />
          <button
            type="button"
            onClick={handleAICompose}
            disabled={isGenerating}
            className={`absolute ${dir === 'rtl' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${isGenerating ? 'text-indigo-600 animate-pulse' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
            title={t('rfq.ai_write')}
          >
            <Wand2 className="w-4 h-4" />
          </button>
        </div>

        <button
          type="submit"
          disabled={!newMessage.trim() && !showFileUpload}
          className="w-12 h-12 flex items-center justify-center bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 disabled:opacity-50 disabled:grayscale transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 active:scale-95"
        >
          <Send className={`w-5 h-5 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
        </button>
      </form>
    </div>
  );
});
ChatInputArea.displayName = 'ChatInputArea';
