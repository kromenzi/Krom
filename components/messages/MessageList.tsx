'use client';

import React, { memo, useState } from 'react';
import Image from 'next/image';
import { Clock, CheckCheck, Video, Languages, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: any;
  type?: 'text' | 'image' | 'video';
  fileUrl?: string;
}

const formatTime = (timestamp: any) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

import { translateMessage } from '@/lib/ai';

export const MessageList = memo(({ 
  messages, 
  profileUid, 
  messagesEndRef, 
  dir,
  t
}: { 
  messages: Message[], 
  profileUid: string, 
  messagesEndRef: React.RefObject<HTMLDivElement | null>, 
  dir: string,
  t: any
}) => {
  const [translatedMsgs, setTranslatedMsgs] = useState<Record<string, string>>({});
  const [translatingId, setTranslatingId] = useState<string | null>(null);

  const handleTranslate = async (msgId: string, text: string) => {
    if (translatedMsgs[msgId]) {
      const newTranslated = { ...translatedMsgs };
      delete newTranslated[msgId];
      setTranslatedMsgs(newTranslated);
      return;
    }

    setTranslatingId(msgId);
    try {
      const result = await translateMessage(text, dir === 'rtl' ? 'ar' : 'en');
      setTranslatedMsgs(prev => ({
        ...prev,
        [msgId]: result
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setTranslatingId(null);
    }
  };

  return (
    <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/30">
      {messages.map((msg, index) => {
        const isMe = msg.senderId === profileUid;
        const isTranslated = !!translatedMsgs[msg.id];
        const showAvatar = index === 0 || messages[index - 1].senderId !== msg.senderId;

        return (
          <div key={msg.id} className={`flex items-end gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
            {!isMe && (
              <div className={`w-8 h-8 rounded-lg bg-slate-200 flex-shrink-0 flex items-center justify-center text-slate-400 border border-slate-300 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                <span className="text-[10px] font-bold">S</span>
              </div>
            )}
            <div className={`max-w-[70%] group relative ${isMe ? 'items-end' : 'items-start'}`}>
              <div className={`relative p-4 shadow-sm transition-all hover:shadow-md ${
                isMe 
                  ? `bg-emerald-600 text-white rounded-2xl ${dir === 'rtl' ? 'rounded-tr-none' : 'rounded-tl-none'}` 
                  : `bg-white border border-slate-100 text-slate-800 rounded-2xl ${dir === 'rtl' ? 'rounded-tl-none' : 'rounded-tr-none'}`
              }`}>
                {msg.type === 'image' ? (
                  <div className="space-y-3">
                    <div className="relative h-64 w-full min-w-[240px] rounded-xl overflow-hidden shadow-inner border border-black/5">
                      <Image 
                        src={msg.fileUrl || ''} 
                        alt="Sent image" 
                        fill
                        className="object-cover transition-transform hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    {msg.text && <p className="text-sm font-medium leading-relaxed">{msg.text}</p>}
                  </div>
                ) : msg.type === 'video' ? (
                  <div className="space-y-3">
                    {msg.fileUrl ? (
                      <video src={msg.fileUrl} controls className="rounded-xl max-h-72 w-full shadow-inner border border-black/5" />
                    ) : (
                      <div className="w-64 h-40 bg-slate-100 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-200">
                        <Video className="w-10 h-10 text-slate-300" />
                      </div>
                    )}
                    {msg.text && <p className="text-sm font-medium leading-relaxed">{msg.text}</p>}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm leading-relaxed font-medium">
                      {isTranslated ? translatedMsgs[msg.id] : msg.text}
                    </p>
                    <AnimatePresence>
                      {isTranslated && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          className="pt-2 mt-2 border-t border-current/10 flex items-center gap-2 text-[10px] font-bold opacity-70 italic"
                        >
                          <Sparkles className="w-3 h-3" />
                          AI Translated
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Translate Button - Only for others' messages */}
                {!isMe && msg.type === 'text' && (
                  <button 
                    onClick={() => handleTranslate(msg.id, msg.text)}
                    className={`absolute -top-2 ${dir === 'rtl' ? '-left-2' : '-right-2'} p-1.5 bg-white border border-slate-100 rounded-lg shadow-sm text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100`}
                    title={t('messages.translate')}
                  >
                    {translatingId === msg.id ? (
                      <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Languages className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
              
              <div className={`flex items-center gap-2 mt-1.5 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  <Clock className="w-3 h-3" />
                  {formatTime(msg.createdAt)}
                </div>
                {isMe && (
                  <div className="flex items-center">
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
});
MessageList.displayName = 'MessageList';
