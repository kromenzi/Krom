'use client';

import { useState, useEffect, useRef, memo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, getDoc, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { Video, X, Play, Heart, Send, ShoppingBag, ExternalLink, MessageCircle, FileText, BadgeCheck, Globe, Zap, Sparkles, ChevronDown, ChevronUp, Package, Loader2, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Navbar } from '@/components/Navbar';

// --- Types ---
interface Stream {
  id: string;
  factoryId: string;
  title: string;
  status: 'live' | 'ended';
  featuredProductId?: string;
  viewerCount: number;
  createdAt: any;
}

interface Factory {
  id: string;
  name: string;
  logo?: string;
  verified: boolean;
  exportReady: boolean;
  responseRate: string;
}

interface Product {
  id: string;
  name: string;
  price: string;
  minOrder: string;
  image: string;
  category: string;
  leadTime?: string;
}

// --- Sub-components ---

const StreamCard = memo(({ stream, isActive }: { stream: Stream, isActive: boolean }) => {
  const { t, dir } = useLanguage();
  const { profile } = useAuth();
  const router = useRouter();
  const [factory, setFactory] = useState<Factory | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [hearts, setHearts] = useState<{ id: number; x: number; drift: number }[]>([]);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (!stream.factoryId) return;
    const fetchFactory = async () => {
      const docRef = doc(db, 'factories', stream.factoryId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setFactory({ id: docSnap.id, ...docSnap.data() } as Factory);
      }
    };
    fetchFactory();
  }, [stream.factoryId]);

  useEffect(() => {
    if (!stream.featuredProductId) return;
    const fetchProduct = async () => {
      const docRef = doc(db, 'products', stream.featuredProductId!);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
      }
    };
    fetchProduct();
  }, [stream.featuredProductId]);

  useEffect(() => {
    if (!isActive) return;
    const q = query(
      collection(db, `streams/${stream.id}/messages`),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    return onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, [stream.id, isActive]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !profile) return;
    try {
      await addDoc(collection(db, `streams/${stream.id}/messages`), {
        userId: profile.uid,
        user: profile.displayName || profile.name || 'User',
        text: inputText.trim(),
        createdAt: serverTimestamp()
      });
      setInputText('');
    } catch (err) {
      console.error(err);
    }
  };

  const sendHeart = () => {
    const id = Date.now();
    setHearts(prev => [...prev, { id, x: Math.random() * 80 + 10, drift: (Math.random() - 0.5) * 100 }]);
    setTimeout(() => setHearts(prev => prev.filter(h => h.id !== id)), 2000);
  };

  return (
    <div className="relative w-full h-full bg-slate-900 snap-start overflow-hidden">
      {/* Mock Video Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-950">
        <div className="absolute inset-0 flex items-center justify-center">
          <Video className="w-20 h-20 text-white/10 animate-pulse" />
        </div>
        {/* Real video would go here */}
      </div>

      {/* Overlays */}
      <div className="absolute inset-0 flex flex-col p-6 pointer-events-none">
        {/* Header */}
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-black animate-pulse">LIVE</div>
            <div className="flex items-center gap-1.5 text-white text-sm font-bold drop-shadow-md">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              {stream.viewerCount}
            </div>
          </div>
          <button onClick={() => setIsMuted(!isMuted)} className="p-2 bg-black/20 rounded-full text-white backdrop-blur-sm">
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>

        {/* Factory Info */}
        <div className="mt-4 pointer-events-auto">
          <div className="bg-black/40 backdrop-blur-md border border-white/10 p-2 rounded-2xl flex items-center gap-3 w-fit pr-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold border border-white/20 overflow-hidden relative">
              {factory?.logo ? <Image src={factory.logo} alt="" fill className="object-cover" /> : factory?.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-white font-bold text-sm">{factory?.name}</span>
                {factory?.verified && <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">{t('live.export_ready')}</span>
            </div>
            <button 
              onClick={() => router.push(`/factories/${factory?.id}`)}
              className="ml-2 p-1.5 bg-white/10 rounded-lg text-white hover:bg-white/20"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex-grow" />

        {/* Bottom Section */}
        <div className="flex flex-col gap-4 pointer-events-auto">
          {/* Product Card */}
          {product && (
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-white/95 backdrop-blur-md rounded-2xl p-3 flex gap-3 w-72 shadow-2xl border border-white/20"
            >
              <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden relative flex-shrink-0">
                <Image src={product.image} alt="" fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="font-bold text-slate-900 text-xs truncate">{product.name}</h5>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-emerald-600 font-black text-xs">{product.price}</span>
                  <span className="text-[9px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded">MOQ: {product.minOrder}</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  <button 
                    onClick={() => router.push(`/dashboard/rfq/new?product=${encodeURIComponent(product.name)}&supplier=${factory?.id}`)}
                    className="py-1.5 bg-emerald-600 text-white rounded-lg text-[9px] font-black hover:bg-emerald-700"
                  >
                    {t('live.request_quote')}
                  </button>
                  <button 
                    onClick={() => router.push(`/dashboard/messages?newChat=true&with=${factory?.id}&name=${encodeURIComponent(factory?.name || '')}`)}
                    className="py-1.5 bg-slate-900 text-white rounded-lg text-[9px] font-black hover:bg-slate-800"
                  >
                    {t('live.chat')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Chat & Actions */}
          <div className="flex items-end gap-4">
            <div className="flex-1 h-48 flex flex-col-reverse overflow-y-auto scrollbar-hide space-y-2 space-y-reverse">
              {messages.map(msg => (
                <div key={msg.id} className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2 w-fit max-w-full">
                  <span className="text-[10px] font-bold text-emerald-400 block mb-0.5">{msg.user}</span>
                  <p className="text-xs text-white leading-tight">{msg.text}</p>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col gap-4 pb-2">
              <button onClick={sendHeart} className="w-12 h-12 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                <Heart className="w-6 h-6 fill-red-500 text-red-500" />
              </button>
              <button className="w-12 h-12 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                <ShoppingBag className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="flex gap-2">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t('live.say_something')}
              className="flex-1 bg-black/40 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-emerald-500/50"
            />
            <button type="submit" className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-700">
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Hearts Animation */}
      <AnimatePresence>
        {hearts.map(heart => (
          <motion.div
            key={heart.id}
            initial={{ y: 0, opacity: 1, scale: 1 }}
            animate={{ y: -400, opacity: 0, scale: 1.5, x: heart.drift }}
            exit={{ opacity: 0 }}
            className="absolute bottom-20 pointer-events-none text-red-500"
            style={{ left: `${heart.x}%` }}
          >
            <Heart className="w-8 h-8 fill-current" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
});
StreamCard.displayName = 'StreamCard';

export default function LiveExplorePage() {
  const { profile } = useAuth();
  const { t, dir } = useLanguage();
  const router = useRouter();
  const [streams, setStreams] = useState<Stream[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simplified query to avoid requiring composite index (status + createdAt)
    // We'll filter by status in memory for now to ensure reliability
    const q = query(
      collection(db, 'streams'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allStreams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Stream));
      // Filter for live streams in memory
      setStreams(allStreams.filter(s => s.status === 'live'));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching streams:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createTestStream = async () => {
    if (!profile) return;
    try {
      await addDoc(collection(db, 'streams'), {
        factoryId: profile.uid,
        title: "Test Live Production",
        status: 'live',
        viewerCount: 12,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error creating test stream:", err);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (streams.length === 0) {
    return (
      <div className="h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center text-white p-6 text-center">
          <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mb-6">
            <Video className="w-10 h-10 text-slate-500" />
          </div>
          <h2 className="text-2xl font-black mb-2">{t('live.no_streams')}</h2>
          <p className="text-slate-400 max-w-xs mb-8">{t('live.no_streams_desc')}</p>
          
          {(profile?.role === 'admin' || profile?.role === 'factory') && (
            <button 
              onClick={createTestStream}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all"
            >
              Create Test Stream (Admin)
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden relative">
      {/* Back Button */}
      <button 
        onClick={() => router.back()}
        className="absolute top-6 left-6 z-50 w-12 h-12 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/40 transition-all border border-white/10"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="flex-grow overflow-y-auto snap-y snap-mandatory scrollbar-hide">
        {streams.map((stream, index) => (
          <StreamCard key={stream.id} stream={stream} isActive={index === activeIndex} />
        ))}
      </div>
    </div>
  );
}
