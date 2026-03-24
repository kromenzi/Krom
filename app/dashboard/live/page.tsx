'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Video, Radio, Users, MessageSquare, Send, X, Settings, Shield, Zap, Play, Square, Loader2, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';
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
  const videoRef = useRef<HTMLVideoElement>(null);

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
      // Stop existing tracks if any
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
      setStreamTitle(`${profile?.factoryName} - Live Production`);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Please allow camera access to start streaming.");
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
  };

  return (
    <div className="max-w-full mx-auto space-y-8 pb-12" dir={dir}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
              <Radio className="w-6 h-6" />
            </div>
            {t('live.title') || 'Live Production'}
          </h1>
          <p className="text-slate-500 mt-2 text-lg">{t('live.subtitle') || 'Stream your factory floor live to build trust with buyers.'}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={switchCamera}
            className="p-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 font-bold"
            title={t('live.switch_camera')}
          >
            <RefreshCw className="w-5 h-5" />
            <span className="hidden sm:inline">{t('live.switch_camera')}</span>
          </button>
          {isLive ? (
            <button
              onClick={stopStream}
              className="flex items-center gap-3 px-8 py-3.5 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-xl shadow-red-200"
            >
              <Square className="w-5 h-5" />
              {t('live.stop') || 'End Stream'}
            </button>
          ) : (
            <button
              onClick={() => startStream()}
              className="flex items-center gap-3 px-8 py-3.5 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200"
            >
              <Play className="w-5 h-5" />
              {t('live.start') || 'Go Live Now'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Stream Area */}
        <div className="lg:col-span-8 space-y-6">
          <div className="aspect-video bg-slate-950 rounded-[3rem] overflow-hidden relative shadow-2xl border-[12px] border-white ring-1 ring-slate-200">
            <div className="absolute inset-0 overflow-hidden">
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline 
                style={{ transform: `scale(${zoom})` }}
                className={`w-full h-full object-cover transition-all duration-500 origin-center ${isLive ? 'opacity-100' : 'opacity-0'}`}
              />
            </div>
            
            {!isLive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center bg-slate-900/40 backdrop-blur-sm">
                <div className="w-28 h-28 bg-white/10 backdrop-blur-xl rounded-[2rem] flex items-center justify-center mb-8 border border-white/20 shadow-2xl rotate-3">
                  <Video className="w-12 h-12 text-emerald-400" />
                </div>
                <h3 className="text-3xl font-black mb-3">{t('live.ready') || 'Ready to broadcast?'}</h3>
                <p className="text-slate-300 max-w-md text-lg leading-relaxed">
                  {t('live.ready_desc') || 'Showcase your quality standards and production capacity in real-time.'}
                </p>
              </div>
            )}

            {isLive && (
              <>
                <div className="absolute top-8 left-8 flex items-center gap-4">
                  <div className="px-4 py-1.5 bg-red-600 text-white rounded-full text-xs font-black flex items-center gap-2 animate-pulse shadow-lg shadow-red-500/40">
                    <div className="w-2 h-2 bg-white rounded-full" />
                    LIVE
                  </div>
                  <div className="px-4 py-1.5 bg-black/60 backdrop-blur-xl text-white rounded-full text-xs font-black flex items-center gap-2 border border-white/10">
                    <Users className="w-4 h-4 text-emerald-400" />
                    {viewerCount}
                  </div>
                </div>

                <div className="absolute top-8 right-8 flex flex-col gap-3">
                  <button 
                    onClick={() => setZoom(prev => Math.min(prev + 0.5, 4))}
                    className="p-3 bg-black/60 backdrop-blur-xl text-white rounded-2xl hover:bg-black/80 transition-all border border-white/10"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setZoom(prev => Math.max(prev - 0.5, 1))}
                    className="p-3 bg-black/60 backdrop-blur-xl text-white rounded-2xl hover:bg-black/80 transition-all border border-white/10"
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                </div>

                <div className="absolute bottom-8 left-8 right-8 p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent rounded-b-[3rem]">
                  <div className="flex items-end justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-white tracking-tight">{streamTitle}</h2>
                      <p className="text-emerald-400 font-bold text-sm mt-1 uppercase tracking-widest">{profile?.factoryName}</p>
                    </div>
                    <div className="flex items-center gap-2 text-white/60 text-xs font-bold">
                      <Settings className="w-4 h-4" />
                      1080p HD
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center gap-5 group hover:border-emerald-200 transition-colors">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{t('live.security') || 'Security'}</p>
                <p className="text-base font-black text-slate-900">{t('live.encrypted') || 'End-to-End'}</p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center gap-5 group hover:border-blue-200 transition-colors">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{t('live.latency') || 'Latency'}</p>
                <p className="text-base font-black text-slate-900">{t('live.ultra_low') || 'Ultra Low'}</p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center gap-5 group hover:border-purple-200 transition-colors">
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                <Settings className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{t('live.quality') || 'Quality'}</p>
                <p className="text-base font-black text-slate-900">1080p HD</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Chat */}
        <div className="lg:col-span-4 bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 flex flex-col h-[600px] lg:h-auto overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <h3 className="font-black text-slate-900 flex items-center gap-3 text-lg">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                <MessageSquare className="w-5 h-5" />
              </div>
              {t('live.chat') || 'Live Chat'}
            </h3>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-wider">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Active
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <MessageSquare className="w-8 h-8 text-slate-200" />
                </div>
                <p className="text-slate-400 font-medium leading-relaxed">{t('live.no_messages') || 'No messages yet. Start the conversation!'}</p>
              </div>
            ) : (
              messages.map((msg) => (
                <motion.div 
                  initial={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={msg.id} 
                  className="space-y-2"
                >
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{msg.user}</p>
                  <div className="p-4 bg-slate-50 rounded-3xl rounded-tl-none text-sm text-slate-700 font-medium shadow-sm border border-slate-100">
                    {msg.text}
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <form onSubmit={sendMessage} className="p-8 border-t border-slate-50 bg-slate-50/50">
            <div className="relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t('live.type_message') || "Type a message..."}
                className="w-full pl-6 pr-16 py-4 rounded-2xl bg-white border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
