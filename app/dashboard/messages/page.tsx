'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  orderBy, 
  doc, 
  updateDoc,
  getDoc,
  limit
} from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  Send, 
  MoreVertical, 
  Phone, 
  Video, 
  ImageIcon, 
  Paperclip, 
  Smile,
  ChevronLeft,
  User,
  Clock,
  CheckCheck,
  MessageSquare,
  X
} from 'lucide-react';
import Image from 'next/image';
import FileUpload from '@/components/FileUpload';

interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: any;
  type?: 'text' | 'image' | 'video';
  fileUrl?: string;
}

interface Chat {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  lastMessage: string;
  lastMessageTime: any;
  unreadCount: Record<string, number>;
}

function MessagesContent() {
  const { profile } = useAuth();
  const { t, dir } = useLanguage();
  const searchParams = useSearchParams();
  const chatIdParam = searchParams.get('chat');
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (chatIdParam && chats.length > 0) {
      const foundChat = chats.find(c => c.id === chatIdParam);
      if (foundChat && activeChatId !== chatIdParam) {
        // Use a timeout to avoid synchronous update in effect
        const timer = setTimeout(() => {
          setActiveChatId(chatIdParam);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [chatIdParam, chats, activeChatId]);

  useEffect(() => {
    if (!profile) return;

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', profile.uid),
      orderBy('lastMessageTime', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat));
      setChats(chatData);
    });

    return () => unsubscribe();
  }, [profile]);

  useEffect(() => {
    if (!activeChatId) return;

    const q = query(
      collection(db, `chats/${activeChatId}/messages`),
      orderBy('createdAt', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(messageData);
      
      // Mark as read
      if (profile) {
        updateDoc(doc(db, 'chats', activeChatId), {
          [`unreadCount.${profile.uid}`]: 0
        }).catch(console.error);
      }
    });

    return () => unsubscribe();
  }, [activeChatId, profile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent, fileUrl?: string, fileType?: 'image' | 'video') => {
    if (e) e.preventDefault();
    if (!newMessage.trim() && !fileUrl) return;
    if (!profile || !activeChatId) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setShowFileUpload(false);

    try {
      const messageData = {
        senderId: profile.uid,
        text: fileUrl ? (fileType === 'image' ? 'Sent an image' : 'Sent a video') : messageText,
        createdAt: serverTimestamp(),
        type: fileUrl ? fileType : 'text',
        fileUrl: fileUrl || null,
      };

      await addDoc(collection(db, `chats/${activeChatId}/messages`), messageData);

      const chat = chats.find(c => c.id === activeChatId);
      const otherParticipant = chat?.participants.find(p => p !== profile.uid);

      if (otherParticipant) {
        await updateDoc(doc(db, 'chats', activeChatId), {
          lastMessage: messageData.text,
          lastMessageTime: serverTimestamp(),
          [`unreadCount.${otherParticipant}`]: (chat?.unreadCount?.[otherParticipant] || 0) + 1
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileUpload = (urls: string[]) => {
    if (urls.length > 0) {
      const url = urls[0];
      const isVideo = url.includes('.mp4') || url.includes('.mov');
      handleSendMessage(undefined, url, isVideo ? 'video' : 'image');
    }
  };

  if (!profile) return null;

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const activeChat = chats.find(c => c.id === activeChatId);
  const otherParticipantId = activeChat?.participants.find(p => p !== profile.uid) || '';
  const otherParticipantName = activeChat?.participantNames?.[otherParticipantId] || 'User';

  return (
    <div className="h-[calc(100vh-12rem)] flex bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Chat List Sidebar */}
      <aside className={`${isMobileView && activeChatId ? 'hidden' : 'flex'} w-full lg:w-80 flex-col border-r rtl:border-r-0 rtl:border-l border-slate-100`}>
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-4">{t('messages.title')}</h2>
          <div className="relative">
            <Search className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4`} />
            <input 
              type="text" 
              placeholder={t('messages.search')} 
              className={`w-full ${dir === 'rtl' ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50/50`}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => {
            const otherId = chat.participants.find(p => p !== profile.uid) || '';
            const otherName = chat.participantNames?.[otherId] || 'User';
            const unread = chat.unreadCount?.[profile.uid] || 0;

            return (
              <button
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`w-full text-left rtl:text-right p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex items-start gap-3 relative ${activeChatId === chat.id ? 'bg-emerald-50/50' : ''}`}
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0 border border-slate-200 overflow-hidden">
                  <User className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-slate-900 truncate">{otherName}</h3>
                    <span className="text-[10px] text-slate-400 flex-shrink-0 ml-2">{formatTime(chat.lastMessageTime)}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{chat.lastMessage}</p>
                </div>
                {unread > 0 && (
                  <div className="absolute right-4 rtl:left-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {unread}
                  </div>
                )}
              </button>
            );
          })}
          {chats.length === 0 && (
            <div className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 text-sm">{t('messages.empty')}</p>
            </div>
          )}
        </div>
      </aside>

      {/* Chat Area */}
      <main className={`${isMobileView && !activeChatId ? 'hidden' : 'flex'} flex-grow flex-col bg-slate-50/30`}>
        {activeChatId ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm relative z-10">
              <div className="flex items-center gap-3">
                {isMobileView && (
                  <button onClick={() => setActiveChatId(null)} className="p-2 -ml-2 text-slate-600">
                    <ChevronLeft className={`w-5 h-5 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                  </button>
                )}
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{otherParticipantName}</h3>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isMe = msg.senderId === profile.uid;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`p-3 rounded-2xl shadow-sm ${
                        isMe 
                          ? `bg-emerald-600 text-white rounded-2xl ${dir === 'rtl' ? 'rounded-tl-none' : 'rounded-tr-none'}` 
                          : `bg-white border border-slate-100 rounded-2xl ${dir === 'rtl' ? 'rounded-tr-none' : 'rounded-tl-none'}`
                      }`}>
                        {msg.type === 'image' ? (
                          <div className="space-y-2">
                            <div className="relative h-60 w-64">
                              <Image 
                                src={msg.fileUrl || ''} 
                                alt="Sent image" 
                                fill
                                className="rounded-lg object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            {msg.text && <p className="text-sm">{msg.text}</p>}
                          </div>
                        ) : msg.type === 'video' ? (
                          <div className="space-y-2">
                            <video src={msg.fileUrl} controls className="rounded-lg max-h-60 w-auto" />
                            {msg.text && <p className="text-sm">{msg.text}</p>}
                          </div>
                        ) : (
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                        )}
                      </div>
                      <div className={`flex items-center gap-1 text-[10px] text-slate-400 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <Clock className="w-3 h-3" />
                        {formatTime(msg.createdAt)}
                        {isMe && <CheckCheck className="w-3 h-3 text-emerald-500" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white border-t border-slate-100">
              {showFileUpload && (
                <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase">Upload Media</h4>
                    <button onClick={() => setShowFileUpload(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <FileUpload 
                    onUploadComplete={handleFileUpload}
                    maxFiles={1}
                    folder={`chats/${activeChatId}`}
                    label="Drop image or video here"
                  />
                </div>
              )}
              <form onSubmit={(e) => handleSendMessage(e)} className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={() => setShowFileUpload(!showFileUpload)}
                  className={`p-2 rounded-lg transition-all ${showFileUpload ? 'bg-emerald-100 text-emerald-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <button 
                  type="button"
                  className="p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-lg transition-all"
                >
                  <Smile className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={t('messages.type_placeholder')}
                  className="flex-grow px-4 py-2.5 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() && !showFileUpload}
                  className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm"
                >
                  <Send className={`w-5 h-5 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-grow flex items-center justify-center p-8 text-center">
            <div className="max-w-sm">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-12">
                <MessageSquare className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t('messages.select_chat')}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Connect with manufacturers and buyers to discuss requirements, quotes, and delivery timelines.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function MessagesDashboard() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading messages...</div>}>
      <MessagesContent />
    </Suspense>
  );
}
