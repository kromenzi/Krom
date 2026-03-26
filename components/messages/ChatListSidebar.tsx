'use client';

import React, { memo } from 'react';
import { Search, MessageSquare, User } from 'lucide-react';

interface Chat {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: any;
  lastMessageSenderId?: string;
  unreadCount?: { [uid: string]: number };
  participantNames?: { [uid: string]: string };
}

const formatTime = (timestamp: any) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const ChatListSidebar = memo(({ 
  chats, 
  activeChatId, 
  setActiveChatId, 
  profileUid, 
  isMobileView, 
  t, 
  dir 
}: { 
  chats: Chat[], 
  activeChatId: string | null, 
  setActiveChatId: (id: string) => void, 
  profileUid: string, 
  isMobileView: boolean, 
  t: any, 
  dir: string 
}) => {
  return (
    <aside className={`${isMobileView && activeChatId ? 'hidden' : 'flex'} w-full lg:w-96 flex-col border-r rtl:border-r-0 rtl:border-l border-slate-100 bg-white`}>
      <div className="p-6 border-b border-slate-100 bg-slate-50/30">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('messages.title')}</h2>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>
        <div className="relative group">
          <Search className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 transition-colors group-focus-within:text-emerald-500`} />
          <input 
            type="text" 
            placeholder={t('messages.search')} 
            className={`w-full ${dir === 'rtl' ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white transition-all shadow-sm`}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {chats.map((chat) => {
          const otherId = chat.participants.find(p => p !== profileUid) || '';
          const otherName = chat.participantNames?.[otherId] || 'User';
          const unread = chat.unreadCount?.[profileUid] || 0;
          const isActive = activeChatId === chat.id;

          return (
            <button
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              className={`w-full text-left rtl:text-right p-4 border-b border-slate-50 hover:bg-slate-50 transition-all flex items-center gap-4 relative group ${isActive ? 'bg-emerald-50/40' : ''}`}
            >
              {isActive && (
                <div className={`absolute top-0 bottom-0 w-1 bg-emerald-600 ${dir === 'rtl' ? 'right-0' : 'left-0'}`} />
              )}
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                  <User className="w-7 h-7" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className={`font-bold truncate transition-colors ${isActive ? 'text-emerald-900' : 'text-slate-900'}`}>
                    {otherName}
                  </h3>
                  <span className="text-[10px] font-medium text-slate-400 flex-shrink-0 bg-slate-100 px-2 py-0.5 rounded-full">
                    {formatTime(chat.lastMessageTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-xs truncate flex-1 ${unread > 0 ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                    {chat.lastMessageSenderId === profileUid ? `${t('messages.you')}: ` : ''}{chat.lastMessage || 'No messages yet'}
                  </p>
                  {unread > 0 && (
                    <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center shadow-sm shadow-emerald-200">
                      {unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
        {chats.length === 0 && (
          <div className="p-12 text-center opacity-60">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-12">
              <MessageSquare className="w-10 h-10 text-slate-300" />
            </div>
            <p className="text-slate-500 font-bold text-lg mb-2">{t('messages.empty')}</p>
            <p className="text-slate-400 text-sm px-4">{t('messages.select_chat_desc')}</p>
          </div>
        )}
      </div>
    </aside>
  );
});
ChatListSidebar.displayName = 'ChatListSidebar';
