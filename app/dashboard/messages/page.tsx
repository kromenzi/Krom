'use client';

import { useState, useEffect, useRef, Suspense, memo, useCallback, useMemo } from 'react';
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
  limit
} from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  Send, 
  MoreVertical, 
  Phone, 
  Video, 
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
import dynamic from 'next/dynamic';

const ChatListSidebar = dynamic(() => import('@/components/messages/ChatListSidebar').then(m => m.ChatListSidebar), {
  loading: () => <div className="w-80 border-r border-slate-100 animate-pulse bg-slate-50" />,
  ssr: false
});

const ChatHeader = dynamic(() => import('@/components/messages/ChatHeader').then(m => m.ChatHeader), {
  loading: () => <div className="h-16 border-b border-slate-100 animate-pulse bg-white" />,
  ssr: false
});

const MessageList = dynamic(() => import('@/components/messages/MessageList').then(m => m.MessageList), {
  loading: () => <div className="flex-grow animate-pulse bg-slate-50/30" />,
  ssr: false
});

const ChatInputArea = dynamic(() => import('@/components/messages/ChatInputArea').then(m => m.ChatInputArea), {
  loading: () => <div className="h-20 border-t border-slate-100 animate-pulse bg-white" />,
  ssr: false
});

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
  lastMessageSenderId: string;
  unreadCount: Record<string, number>;
}

const formatTime = (timestamp: any) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// --- Main Component ---

function MessagesContent() {
  const { profile } = useAuth();
  const { t, dir } = useLanguage();
  const searchParams = useSearchParams();
  const chatIdParam = searchParams.get('chat');
  const newChatWith = searchParams.get('with');
  const newChatName = searchParams.get('name');
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  
  const onSetActiveChatId = useCallback((id: string | null) => {
    setActiveChatId(id);
  }, []);

  // Handle new chat request from URL
  useEffect(() => {
    if (!profile || !newChatWith || chats.length === 0 || isCreatingChat) return;

    const existingChat = chats.find(c => c.participants.includes(newChatWith));
    if (existingChat) {
      onSetActiveChatId(existingChat.id);
    } else {
      // Create new chat
      const createChat = async () => {
        setIsCreatingChat(true);
        try {
          const chatRef = await addDoc(collection(db, 'chats'), {
            participants: [profile.uid, newChatWith],
            participantNames: {
              [profile.uid]: profile.displayName || profile.name || 'User',
              [newChatWith]: newChatName || 'Supplier'
            },
            lastMessage: '',
            lastMessageTime: serverTimestamp(),
            lastMessageSenderId: '',
            unreadCount: {
              [profile.uid]: 0,
              [newChatWith]: 0
            },
            createdAt: serverTimestamp()
          });
          onSetActiveChatId(chatRef.id);
        } catch (error) {
          console.error('Error creating new chat:', error);
        } finally {
          setIsCreatingChat(false);
        }
      };
      createChat();
    }
  }, [newChatWith, newChatName, profile, chats, onSetActiveChatId, isCreatingChat]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
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
        const timer = setTimeout(() => {
          onSetActiveChatId(chatIdParam);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [chatIdParam, chats, activeChatId, onSetActiveChatId]);

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

  const handleSendMessage = useCallback(async (e?: React.FormEvent, fileUrl?: string, fileType?: 'image' | 'video') => {
    if (e) e.preventDefault();
    if (!newMessage.trim() && !fileUrl) return;
    if (!profile || !activeChatId) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      const messageData = {
        senderId: profile.uid,
        text: fileUrl ? (fileType === 'image' ? t('messages.sent_image') : t('messages.sent_video')) : messageText,
        createdAt: serverTimestamp(),
        type: fileUrl ? fileType : 'text',
        fileUrl: fileUrl || null,
      };

      await addDoc(collection(db, `chats/${activeChatId}/messages`), messageData);

      // Use a functional update or ref for chats to avoid dependency on chats array
      setChats(prevChats => {
        const chat = prevChats.find(c => c.id === activeChatId);
        const otherParticipant = chat?.participants.find(p => p !== profile.uid);

        if (otherParticipant) {
          updateDoc(doc(db, 'chats', activeChatId), {
            lastMessage: messageData.text,
            lastMessageTime: serverTimestamp(),
            lastMessageSenderId: profile.uid,
            [`unreadCount.${otherParticipant}`]: (chat?.unreadCount?.[otherParticipant] || 0) + 1
          }).catch(console.error);
        }
        return prevChats;
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [newMessage, profile, activeChatId, t]);

  const handleFileUpload = useCallback((urls: string[]) => {
    if (urls.length > 0) {
      const url = urls[0];
      const isVideo = url.includes('.mp4') || url.includes('.mov');
      handleSendMessage(undefined, url, isVideo ? 'video' : 'image');
    }
  }, [handleSendMessage]);

  const activeChat = useMemo(() => chats.find(c => c.id === activeChatId), [chats, activeChatId]);
  const otherParticipantId = useMemo(() => activeChat?.participants.find(p => p !== profile?.uid) || '', [activeChat, profile?.uid]);
  const otherParticipantName = useMemo(() => activeChat?.participantNames?.[otherParticipantId] || 'User', [activeChat, otherParticipantId]);

  if (!profile) return null;

  return (
    <div className="h-[calc(100vh-12rem)] flex bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden" dir={dir}>
      <ChatListSidebar 
        chats={chats}
        activeChatId={activeChatId}
        setActiveChatId={onSetActiveChatId}
        profileUid={profile.uid}
        isMobileView={isMobileView}
        t={t}
        dir={dir}
      />

      <main className={`${isMobileView && !activeChatId ? 'hidden' : 'flex'} flex-grow flex-col bg-slate-50/30`}>
        {activeChatId ? (
          <>
            <ChatHeader 
              otherParticipantName={otherParticipantName}
              isMobileView={isMobileView}
              setActiveChatId={onSetActiveChatId}
              messages={messages}
              t={t}
              dir={dir}
            />
            <MessageList 
              messages={messages}
              profileUid={profile.uid}
              messagesEndRef={messagesEndRef}
              dir={dir}
              t={t}
            />
            <ChatInputArea 
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              handleSendMessage={handleSendMessage}
              handleFileUpload={handleFileUpload}
              activeChatId={activeChatId}
              messages={messages}
              t={t}
              dir={dir}
            />
          </>
        ) : (
          <div className="flex-grow flex items-center justify-center p-8 text-center">
            <div className="max-w-sm">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-12">
                <MessageSquare className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t('messages.select_chat')}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {t('messages.select_chat_desc')}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function MessagesDashboard() {
  const { t } = useLanguage();
  return (
    <Suspense fallback={<div className="p-8 text-center">{t('dashboard.loading')}</div>}>
      <MessagesContent />
    </Suspense>
  );
}
