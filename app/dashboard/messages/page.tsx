'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { MessageSquare, Search, User, Send } from 'lucide-react';
import { useState, useEffect, useRef, Suspense } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';

interface Chat {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  lastMessage: string;
  lastMessageTime: any;
  unreadCount: Record<string, number>;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: any;
}

function MessagesContent() {
  const { profile } = useAuth();
  const { t, dir } = useLanguage();
  const searchParams = useSearchParams();
  const chatIdParam = searchParams.get('chat');
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatIdParam && chats.some(c => c.id === chatIdParam)) {
      setActiveChat(chatIdParam);
    }
  }, [chatIdParam, chats]);

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
    if (!activeChat) return;

    const q = query(
      collection(db, `chats/${activeChat}/messages`),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(messageData);
      
      // Mark as read
      if (profile) {
        updateDoc(doc(db, 'chats', activeChat), {
          [`unreadCount.${profile.uid}`]: 0
        }).catch(console.error);
      }
    });

    return () => unsubscribe();
  }, [activeChat, profile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !profile) return;

    const text = newMessage.trim();
    setNewMessage('');

    try {
      await addDoc(collection(db, `chats/${activeChat}/messages`), {
        senderId: profile.uid,
        text,
        createdAt: serverTimestamp()
      });

      const chat = chats.find(c => c.id === activeChat);
      const otherParticipant = chat?.participants.find(p => p !== profile.uid);

      if (otherParticipant) {
        await updateDoc(doc(db, 'chats', activeChat), {
          lastMessage: text,
          lastMessageTime: serverTimestamp(),
          [`unreadCount.${otherParticipant}`]: (chat?.unreadCount?.[otherParticipant] || 0) + 1
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!profile) return null;

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
        <p className="text-slate-600 mt-1">Communicate with buyers and factories.</p>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex">
        {/* Chat List Sidebar */}
        <div className="w-1/3 border-r rtl:border-r-0 rtl:border-l border-slate-200 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4`} />
              <input 
                type="text" 
                placeholder="Search messages..." 
                className={`w-full ${dir === 'rtl' ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white`}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {chats.map((chat) => {
              const otherParticipantId = chat.participants.find(p => p !== profile.uid) || '';
              const otherParticipantName = chat.participantNames?.[otherParticipantId] || 'User';
              const unread = chat.unreadCount?.[profile.uid] || 0;

              return (
                <button
                  key={chat.id}
                  onClick={() => setActiveChat(chat.id)}
                  className={`w-full text-left p-4 border-b border-slate-100 hover:bg-slate-100 transition-colors flex items-start gap-3 ${activeChat === chat.id ? 'bg-slate-100' : ''}`}
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-semibold text-slate-900 truncate">{otherParticipantName}</h3>
                      <span className="text-xs text-slate-500 flex-shrink-0 ml-2">{formatTime(chat.lastMessageTime)}</span>
                    </div>
                    <p className="text-sm text-slate-600 truncate">{chat.lastMessage}</p>
                  </div>
                  {unread > 0 && (
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {unread}
                    </div>
                  )}
                </button>
              );
            })}
            {chats.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-sm">
                No messages yet.
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50/50">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">
                    {(() => {
                      const chat = chats.find(c => c.id === activeChat);
                      const otherId = chat?.participants.find(p => p !== profile.uid) || '';
                      return chat?.participantNames?.[otherId] || 'User';
                    })()}
                  </h2>
                  <p className="text-xs text-emerald-600 font-medium">Online</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto bg-slate-50">
                <div className="space-y-4">
                  {messages.map((msg) => {
                    const isMe = msg.senderId === profile.uid;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`px-4 py-2 max-w-[70%] shadow-sm ${
                          isMe 
                            ? `bg-emerald-600 text-white rounded-2xl ${dir === 'rtl' ? 'rounded-tl-none' : 'rounded-tr-none'}` 
                            : `bg-white border border-slate-200 rounded-2xl ${dir === 'rtl' ? 'rounded-tr-none' : 'rounded-tl-none'}`
                        }`}>
                          <p className={`text-sm ${isMe ? 'text-white' : 'text-slate-800'}`}>{msg.text}</p>
                          <span className={`text-[10px] mt-1 block ${isMe ? 'text-emerald-200 text-right' : 'text-slate-400'}`}>
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-slate-200 bg-white">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-full focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  />
                  <button 
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-6 py-2 rounded-full font-semibold transition-colors text-sm flex items-center gap-2"
                  >
                    Send <Send className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
              <MessageSquare className="w-16 h-16 text-slate-200 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Your Messages</h3>
              <p className="max-w-md">Select a conversation from the sidebar to view messages or start a new chat with a factory or buyer.</p>
            </div>
          )}
        </div>
      </div>
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
