'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Video, Radio, Users, MessageSquare, Send, X, Settings, Shield, Zap, Play, Square, Loader2, RefreshCw, ZoomIn, ZoomOut, Heart, Smile, Camera, Phone, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function LiveStreamPage() {
  const { profile } = useAuth();
  const { t, dir } = useLanguage();
  const [isLive, setIsLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [messages, setMessages] = useState<{ id: string; user: string; text: string }[]>([]);
  const [inputText, setInputText] = useState('');
  const [streamTitle, setStreamTitle] = useState('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [zoom, setZoom] = useState(1);
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio element for notifications
    audioRef.current = new Audio('/notification.mp3');
  }, []);

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        setViewerCount(prev => prev + Math.floor(Math.random() * 5));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isLive]);

  const startStream = async (mode: 'user' | 'environment' = facingMode) => {
    try {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: mode }, 
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsLive(true);
      setFacingMode(mode);
      setStreamTitle(`${profile?.factoryName || 'Factory'} - Live Production`);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert(t('live.camera_error'));
    }
  };

  const switchCamera = () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    if (isLive) {
      startStream(newMode);
    } else {
      setFacingMode(newMode);
    }
  };

  const stopStream = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsLive(false);
    setViewerCount(0);
    setZoom(1);
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const newMessage = {
      id: Date.now().toString(),
      user: profile?.factoryName || 'Factory',
      text: inputText.trim()
    };
    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    // Play notification sound
    audioRef.current?.play().catch(e => console.error("Audio play failed", e));
  };

  const sendHeart = () => {
    const id = Date.now();
    setHearts(prev => [...prev, { id, x: Math.random() * 80 + 10 }]);
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== id));
    }, 2000);
  };

  return (
    <div className="flex flex-col w-full h-screen bg-slate-950" dir={dir}>
      {/* Video Container */}
      <div className="relative w-full flex-1 bg-slate-950 overflow-hidden">
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline 
          style={{ transform: `scale(${zoom})` }}
          className={`w-full h-full object-cover transition-all duration-500 origin-center ${isLive ? 'opacity-100' : 'opacity-0'}`}
        />
        
        {!isLive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center bg-slate-900/40 backdrop-blur-sm">
            <div className="w-28 h-28 bg-white/10 backdrop-blur-xl rounded-[2rem] flex items-center justify-center mb-8 border border-white/20 shadow-2xl rotate-3">
              <Video className="w-12 h-12 text-emerald-400" />
            </div>
            <h3 className="text-3xl font-black mb-3">{t('live.ready')}</h3>
            <p className="text-slate-300 max-w-md text-lg leading-relaxed">
              {t('live.ready_desc')}
            </p>
            <button
              onClick={() => startStream()}
              className="mt-8 flex items-center gap-3 px-8 py-3.5 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200"
            >
              <Play className="w-5 h-5" />
              {t('live.start')}
            </button>
          </div>
        )}

        {/* Overlay UI */}
        {isLive && (
          <>
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10 bg-gradient-to-b from-black/60 to-transparent">
              <div className="flex items-center gap-4">
                <div className="px-4 py-1.5 bg-red-600 text-white rounded-full text-xs font-black flex items-center gap-2 animate-pulse shadow-lg shadow-red-500/40">
                  <div className="w-2 h-2 bg-white rounded-full" />
                  LIVE
                </div>
                <div className="px-4 py-1.5 bg-black/40 backdrop-blur-md text-white rounded-full text-xs font-black flex items-center gap-2 border border-white/10">
                  <Users className="w-4 h-4 text-emerald-400" />
                  {viewerCount}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={switchCamera}
                  className="p-3 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-black/60 transition-all"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <button
                  onClick={stopStream}
                  className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all shadow-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Floating Hearts */}
            {hearts.map(heart => (
              <motion.div
                key={heart.id}
                initial={{ opacity: 0, y: '100vh', scale: 0 }}
                animate={{ opacity: 1, y: '20vh', scale: 1.5 }}
                exit={{ opacity: 0, scale: 0 }}
                className="absolute text-red-500 z-20"
                style={{ left: `${heart.x}%` }}
              >
                <Heart className="w-10 h-10 fill-current" />
              </motion.div>
            ))}

            {/* Chat Overlay */}
            <div className="absolute bottom-24 right-6 w-80 h-64 flex flex-col z-10">
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide flex flex-col-reverse">
                <AnimatePresence>
                  {messages.map((msg) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={msg.id} 
                      className="p-3 bg-black/40 backdrop-blur-md rounded-2xl text-sm text-white font-medium border border-white/10"
                    >
                      <span className="font-bold text-emerald-400 mr-2">{msg.user}:</span>
                      {msg.text}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessage} className="absolute bottom-6 left-6 right-6 z-10 flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={t('live.type_message')}
                  className="w-full pl-6 pr-16 py-4 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-sm text-white placeholder-white/50 focus:border-emerald-500 outline-none transition-all"
                />
                <button
                  type="button"
                  className="absolute right-16 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white"
                >
                  <Smile className="w-5 h-5" />
                </button>
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <button
                type="button"
                onClick={sendHeart}
                className="p-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-red-500 hover:bg-red-500/20 transition-all"
              >
                <Heart className="w-6 h-6 fill-current" />
              </button>
            </form>
          </>
        )}
      </div>
      
      {/* Supplier Info Section (Below video) */}
      {isLive && (
        <div className="bg-slate-900 p-6 text-white">
          <div className="bg-slate-800 p-5 rounded-3xl border border-white/10 text-white flex flex-col items-center text-center">
            <h4 className="text-lg font-bold mb-1">{profile?.factoryName || 'Factory Name'}</h4>
            <p className="text-sm text-slate-300 mb-4">High quality manufacturing</p>
            <div className="flex gap-4 w-full justify-center">
              <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 rounded-full text-sm font-bold">
                <Phone className="w-4 h-4" /> Contact
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm font-bold">
                <Info className="w-4 h-4" /> Request Quote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
