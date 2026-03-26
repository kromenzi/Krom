'use client';

import { useState, useEffect, useRef, memo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { Video, X, Play, RefreshCw, Heart, Smile, Send, ShoppingBag, ExternalLink, MessageCircle, FileText, BadgeCheck, Globe, Zap, Sparkles, ChevronDown, ChevronUp, Package, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// --- Types ---
interface LiveProduct {
  id: string;
  name: string;
  price: string;
  minOrder: string;
  image: string;
  category: string;
}

interface LiveFactory {
  id: string;
  name: string;
  verified: boolean;
  exportReady: boolean;
  responseRate: string;
}

// --- Memoized Sub-components ---

const SupplierOverlay = memo(({ factory, t, dir, onVisit }: { factory: any, t: any, dir: string, onVisit: () => void }) => (
  <div className={`absolute top-20 ${dir === 'rtl' ? 'right-6' : 'left-6'} z-20 flex flex-col gap-2`}>
    <div className="bg-black/40 backdrop-blur-md border border-white/10 p-2 rounded-2xl flex items-center gap-3 shadow-2xl min-w-[240px]">
      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-emerald-600 flex-shrink-0 border border-white/20">
        {factory.logo ? (
          <Image src={factory.logo} alt={factory.name} fill className="object-cover" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
            {factory.name.charAt(0)}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h4 className="text-white font-bold text-sm truncate">{factory.name}</h4>
          {factory.verified && <BadgeCheck className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
          <div className="flex items-center gap-1 text-[9px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-400/10 px-1.5 py-0.5 rounded">
            <Globe className="w-2.5 h-2.5" />
            {t('live.export_ready') || 'Export Ready'}
          </div>
          <div className="flex items-center gap-1 text-[9px] text-amber-400 font-bold uppercase tracking-wider bg-amber-400/10 px-1.5 py-0.5 rounded">
            <Zap className="w-2.5 h-2.5" />
            {factory.responseRate} {t('live.response_rate') || 'Response'}
          </div>
        </div>
      </div>
      <button 
        onClick={onVisit}
        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
        title={t('live.visit_factory') || 'Visit Factory'}
      >
        <ExternalLink className="w-4 h-4" />
      </button>
    </div>
  </div>
));
SupplierOverlay.displayName = 'SupplierOverlay';

const ProductCardOverlay = memo(({ product, t, dir, onAction }: { product: any, t: any, dir: string, onAction: (type: string) => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    className={`absolute bottom-32 ${dir === 'rtl' ? 'right-4' : 'left-4'} w-72 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden z-30 border border-white/20`}
  >
    <div className="relative h-32 w-full group">
      <Image 
        src={product.image} 
        alt={product.name} 
        fill 
        className="object-cover transition-transform duration-500 group-hover:scale-110"
        referrerPolicy="no-referrer"
      />
      <div className="absolute top-2 right-2 px-2 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-md uppercase tracking-wider shadow-lg">
        {t('live.featured') || 'Featured'}
      </div>
      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-[9px] font-medium rounded uppercase tracking-widest">
        {product.category}
      </div>
    </div>
    <div className="p-3">
      <h5 className="font-bold text-slate-900 text-sm truncate mb-1">{product.name}</h5>
      
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center justify-between">
          <span className="text-emerald-600 font-black text-sm">{product.price}</span>
          <span className="text-slate-500 text-[10px] font-medium bg-slate-100 px-1.5 py-0.5 rounded">
            {t('live.moq') || 'MOQ'}: {product.minOrder}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
          <Loader2 className="w-3 h-3 animate-spin-slow" />
          <span>{t('live.lead_time') || 'Lead Time'}: {product.leadTime || '15-20 days'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button 
          onClick={() => onAction('view')}
          className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-md"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          {t('live.view_product') || 'View Product'}
        </button>
        <button 
          onClick={() => onAction('rfq')}
          className="flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-bold hover:bg-emerald-700 transition-all active:scale-95 shadow-md shadow-emerald-200"
        >
          <FileText className="w-3.5 h-3.5" />
          {t('live.request_quote') || 'Get Quote'}
        </button>
      </div>
    </div>
  </motion.div>
));
ProductCardOverlay.displayName = 'ProductCardOverlay';

const AIAgentOverlay = memo(({ t, dir, factory, messages }: { t: any, dir: string, factory: any, messages: any[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const generateAI = async (type: string) => {
    setLoading(true);
    // Simulate AI delay
    await new Promise(r => setTimeout(r, 1500));
    
    let result = "";
    switch(type) {
      case 'title': result = `Live from ${factory?.name}: Advanced ${factory?.industry || 'Production'} Showcase`; break;
      case 'desc': result = `Join us for a deep dive into our manufacturing process. We're showcasing our latest ${factory?.capabilities?.[0] || 'products'} and answering buyer questions live.`; break;
      case 'summary': result = `The stream has covered the main production line and quality control checks. Currently focusing on packaging.`; break;
      case 'comments': result = `Most viewers are asking about MOQ and shipping to the GCC region. Interest is high for the featured product.`; break;
      case 'cta': result = `Offer a "Live Stream Special" - 5% discount for RFQs submitted in the next 30 minutes!`; break;
    }
    setSuggestion(result);
    setLoading(false);
  };

  return (
    <div className={`absolute top-20 ${dir === 'rtl' ? 'left-6' : 'right-6'} z-40`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform relative border-2 border-white/20"
      >
        <Sparkles className="w-6 h-6" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-bounce" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className={`absolute top-14 ${dir === 'rtl' ? 'left-0' : 'right-0'} w-80 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl text-white`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h4 className="font-bold text-sm">AI Stream Assistant</h4>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                { id: 'title', label: 'Suggest Title', icon: FileText },
                { id: 'desc', label: 'Suggest Desc', icon: Globe },
                { id: 'summary', label: 'Summarize', icon: Zap },
                { id: 'comments', label: 'Chat Insights', icon: MessageCircle },
                { id: 'cta', label: 'Suggest CTA', icon: Sparkles },
              ].map(btn => (
                <button
                  key={btn.id}
                  onClick={() => generateAI(btn.id)}
                  className="flex flex-col items-center gap-1 p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all text-[9px] font-bold uppercase tracking-wider"
                >
                  <btn.icon className="w-4 h-4 text-indigo-400" />
                  {btn.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
              </div>
            ) : suggestion ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-xl"
              >
                <p className="text-[10px] text-indigo-300 font-bold uppercase mb-1">AI Suggestion</p>
                <p className="text-xs leading-relaxed text-slate-200">{suggestion}</p>
                <button 
                  onClick={() => {
                    setSuggestion(null);
                  }}
                  className="mt-2 text-[9px] text-indigo-400 font-bold hover:underline"
                >
                  Use this suggestion
                </button>
              </motion.div>
            ) : (
              <div className="text-center py-4 text-slate-500 text-xs italic">
                Select an action above to get AI insights for your stream.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
AIAgentOverlay.displayName = 'AIAgentOverlay';

const LiveStreamHeader = memo(({ viewerCount, stopStream, t }: { viewerCount: number, stopStream: () => void, t: any }) => (
  <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10">
    <div className="flex items-center gap-4">
      <div className="px-3 py-1 bg-red-600 text-white rounded-md text-xs font-bold flex items-center gap-1.5 animate-pulse">
        <div className="w-1.5 h-1.5 bg-white rounded-full" />
        LIVE
      </div>
      <div className="text-white text-sm font-bold drop-shadow-md">
        {viewerCount} {t('dashboard.views')}
      </div>
    </div>
    <button
      onClick={stopStream}
      className="p-2 bg-black/30 text-white rounded-full hover:bg-black/50 transition-all"
    >
      <X className="w-6 h-6" />
    </button>
  </div>
));
LiveStreamHeader.displayName = 'LiveStreamHeader';

const LiveStreamActions = memo(({ switchCamera, sendHeart, onChat, t }: { switchCamera: () => void, sendHeart: () => void, onChat: () => void, t: any }) => (
  <div className="absolute right-4 bottom-32 flex flex-col gap-6 z-50 pointer-events-auto">
    <button 
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChat(); }} 
      className="p-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 active:scale-95 transition-all shadow-lg relative z-50" 
      title={t('live.chat_with_supplier') || 'Chat with Supplier'}
    >
      <MessageCircle className="w-7 h-7" />
    </button>
    <button 
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); switchCamera(); }} 
      className="p-3 bg-black/40 text-white rounded-full hover:bg-black/60 active:scale-95 transition-all shadow-lg backdrop-blur-sm relative z-50" 
      title={t('live.switch_camera')}
    >
      <RefreshCw className="w-7 h-7" />
    </button>
    <button 
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); sendHeart(); }} 
      className="p-3 bg-black/40 text-white rounded-full hover:bg-black/60 active:scale-95 transition-all shadow-lg backdrop-blur-sm relative z-50"
    >
      <Heart className="w-7 h-7 fill-current text-red-500" />
    </button>
  </div>
));
LiveStreamActions.displayName = 'LiveStreamActions';

const LiveStreamChat = memo(({ messages, factory, t }: { messages: { id: string; user: string; text: string }[], factory: any, t: any }) => (
  <div className="absolute bottom-28 left-4 w-[calc(100%-5rem)] max-w-sm h-72 flex flex-col z-20 pointer-events-none">
    <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide flex flex-col-reverse">
      <AnimatePresence initial={false}>
        {messages.map((msg) => {
          const isFactory = msg.user === factory?.name || msg.user === 'Factory' || msg.user === 'FACTORY';
          return (
            <motion.div 
              initial={{ opacity: 0, x: -10, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              key={msg.id} 
              className="flex flex-col gap-1 pointer-events-auto"
            >
              <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl backdrop-blur-md border shadow-lg ${
                isFactory 
                  ? 'bg-emerald-500/25 border-emerald-500/40 self-start' 
                  : 'bg-black/40 border-white/15 self-start'
              }`}>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[11px] font-bold tracking-tight ${isFactory ? 'text-emerald-300' : 'text-white/80'}`}>
                      {msg.user}
                    </span>
                    {isFactory && (
                      <span className="px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-black rounded-full uppercase tracking-widest shadow-sm">
                        {t('live.host') || 'Host'}
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] text-white/95 leading-normal drop-shadow-md break-words">
                    {msg.text}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  </div>
));
LiveStreamChat.displayName = 'LiveStreamChat';

const LiveStreamInput = memo(({ 
  inputText, 
  setInputText, 
  sendMessage, 
  showEmojis, 
  setShowEmojis, 
  t 
}: { 
  inputText: string, 
  setInputText: (text: string) => void, 
  sendMessage: (e: React.FormEvent) => void, 
  showEmojis: boolean, 
  setShowEmojis: (show: boolean) => void, 
  t: any 
}) => (
  <div className="absolute bottom-6 left-4 right-4 z-30 flex gap-3 items-center pointer-events-auto">
    <form onSubmit={sendMessage} className="flex-1 relative flex items-center gap-3">
      <div className="relative flex-1">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t('live.say_something') || 'Say something...'}
          className="w-full pl-5 pr-14 py-4 rounded-2xl bg-black/50 backdrop-blur-2xl border border-white/20 text-[15px] text-white placeholder-white/40 focus:border-emerald-500/50 focus:bg-black/70 outline-none transition-all shadow-2xl"
        />
        <button 
          type="button"
          onClick={() => setShowEmojis(!showEmojis)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors p-1.5"
        >
          <Smile className="w-6 h-6" />
        </button>
        
        <AnimatePresence>
          {showEmojis && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-full right-0 mb-5 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-2.5 shadow-2xl flex gap-1.5 z-50"
            >
              {['👍', '❤️', '🔥', '👏', '🏭', '⚙️', '📦', '💰'].map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setInputText(inputText + emoji);
                    setShowEmojis(false);
                  }}
                  className="p-3 hover:bg-white/10 rounded-xl text-2xl transition-colors active:scale-90"
                >
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <button
        type="submit"
        disabled={!inputText.trim()}
        className="w-14 h-14 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-500 active:scale-95 transition-all shadow-xl shadow-emerald-900/40 disabled:opacity-40 disabled:scale-100 flex items-center justify-center border border-emerald-400/20"
      >
        <Send className="w-6 h-6" />
      </button>
    </form>
  </div>
));
LiveStreamInput.displayName = 'LiveStreamInput';

const LiveStreamSetup = memo(({ 
  error, 
  startStream, 
  startMockStream, 
  products, 
  selectedProduct, 
  setSelectedProduct, 
  t 
}: { 
  error: string | null, 
  startStream: () => void, 
  startMockStream: () => void, 
  products: any[], 
  selectedProduct: any, 
  setSelectedProduct: (p: any) => void, 
  t: any 
}) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center bg-black/60 backdrop-blur-sm">
    {error && (
      <div className="mb-6 p-6 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-200 text-sm font-bold flex flex-col gap-4 max-w-md">
        <div className="flex items-center gap-2 text-red-400">
          <X className="w-5 h-5" />
          <span>{t('live.camera_error') || 'Camera Access Error'}</span>
        </div>
        <p className="text-xs font-normal opacity-80 leading-relaxed">
          {error.includes('NotReadableError') || error.includes('Could not start video source') 
            ? (t('live.camera_busy') || 'Your camera might be in use by another application. Please close other apps and try again.')
            : error}
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <button 
            onClick={() => startStream()}
            className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors"
          >
            {t('common.retry') || 'Retry'}
          </button>
          <button 
            onClick={() => window.open(window.location.href, '_blank')}
            className="flex-1 px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg font-bold hover:bg-white/20 transition-colors"
          >
            Open in New Tab
          </button>
          <button 
            onClick={() => startMockStream()}
            className="w-full px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-bold hover:bg-slate-700 transition-colors"
          >
            {t('live.use_mock') || 'Use Mock Stream'}
          </button>
        </div>
      </div>
    )}
    <div className="w-28 h-28 bg-white/10 backdrop-blur-xl rounded-[2rem] flex items-center justify-center mb-8 border border-white/20 shadow-2xl rotate-3">
      <Video className="w-12 h-12 text-emerald-400" />
    </div>
    <h3 className="text-3xl font-black mb-3">{t('live.ready')}</h3>
    <p className="text-slate-300 max-w-md text-lg leading-relaxed mb-8">
      {t('live.ready_desc')}
    </p>

    {/* Product Selection */}
    {products.length > 0 && (
      <div className="w-full max-w-sm mb-8">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 text-start">
          {t('live.select_featured_product') || 'Select Featured Product'}
        </label>
        <div className="relative">
          <select 
            value={selectedProduct?.id || ''}
            onChange={(e) => setSelectedProduct(products.find(p => p.id === e.target.value))}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white appearance-none focus:border-emerald-500 outline-none transition-all"
          >
            {products.map(p => (
              <option key={p.id} value={p.id} className="bg-slate-900">{p.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none" />
        </div>
      </div>
    )}

    <button
      onClick={() => startStream()}
      className="flex items-center gap-3 px-8 py-3.5 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200"
    >
      <Play className="w-5 h-5" />
      {t('live.start')}
    </button>
  </div>
));
LiveStreamSetup.displayName = 'LiveStreamSetup';

const LiveStreamMockPreview = memo(() => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 text-white p-6 text-center">
    <Video className="w-16 h-16 text-slate-500 mb-4 animate-pulse" />
    <h2 className="text-2xl font-bold mb-2">Camera Preview (Mock)</h2>
    <p className="text-slate-400 max-w-sm text-sm leading-relaxed">
      This is a simulated live stream. <br/>
      If you want to use your real camera, please ensure you have granted camera permissions and are using a secure connection (HTTPS).
    </p>
    <button 
      onClick={() => window.open(window.location.href, '_blank')}
      className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-sm font-bold transition-all"
    >
      Open in New Tab
    </button>
  </div>
));
LiveStreamMockPreview.displayName = 'LiveStreamMockPreview';

// --- Main Component ---

export default function LiveStreamPage() {
  const { profile } = useAuth();
  const { t, dir } = useLanguage();
  const router = useRouter();
  
  const [isLive, setIsLive] = useState(false);
  const [isMock, setIsMock] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [messages, setMessages] = useState<{ id: string; user: string; text: string }[]>([]);
  const [inputText, setInputText] = useState('');
  const onSetInputText = useCallback((text: string) => setInputText(text), []);
  
  const [streamTitle, setStreamTitle] = useState('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [zoom, setZoom] = useState(1);
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([]);
  const [showEmojis, setShowEmojis] = useState(false);
  const onSetShowEmojis = useCallback((show: boolean) => setShowEmojis(show), []);

  const [factoryData, setFactoryData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [streamId, setStreamId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);

  // Fetch factory and products
  useEffect(() => {
    const fetchData = async () => {
      if (!profile) return;
      
      try {
        setLoadingData(true);
        // Fetch Factory
        const factoryDoc = await getDoc(doc(db, 'factories', profile.uid));
        if (factoryDoc.exists()) {
          setFactoryData({ id: factoryDoc.id, ...factoryDoc.data() });
          
          // Fetch Products
          const q = query(collection(db, 'products'), where('factoryId', '==', factoryDoc.id));
          const querySnapshot = await getDocs(q);
          const productsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setProducts(productsList);
          if (productsList.length > 0) {
            setSelectedProduct(productsList[0]);
          }
        } else if (profile.role !== 'admin') {
          // If not a factory and not an admin, show viewer interface
          console.log('DEBUG: Setting up viewer interface for buyer');
          setFactoryData(null); // Will trigger viewer mode
        }
      } catch (err) {
        console.error("Error fetching live stream data:", err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [profile, router]);

  const playNotificationSound = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        return; // Don't play if suspended
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.error("Audio play failed", e);
    }
  }, []);

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        setViewerCount(prev => prev + Math.floor(Math.random() * 5));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isLive]);

  const startMockStream = useCallback(async () => {
    if (!profile) return;
    
    try {
      const streamDoc = await addDoc(collection(db, 'streams'), {
        factoryId: profile.uid,
        title: `${profile?.companyName || 'Factory'} - Live Production (Mock)`,
        status: 'live',
        featuredProductId: selectedProduct?.id || null,
        viewerCount: 0,
        createdAt: serverTimestamp(),
      });
      
      setStreamId(streamDoc.id);
      setIsLive(true);
      setIsMock(true);
      setStreamTitle(`${profile?.companyName || 'Factory'} - Live Production (Mock)`);
    } catch (err) {
      console.error("Error starting mock stream:", err);
    }
  }, [profile, selectedProduct]);

  const startStream = useCallback(async (mode: 'user' | 'environment' = facingMode, specificDeviceId?: string) => {
    if (!profile) return;
    setError(null);
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('Camera access is not supported. Starting mock stream.');
      startMockStream();
      return;
    }

    try {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }

      let videoConstraints: any = { facingMode: mode };
      
      if (specificDeviceId) {
        videoConstraints = { deviceId: { exact: specificDeviceId } };
      } else if (mode === 'environment') {
        // Try environment camera but don't force it if it fails
        videoConstraints = { facingMode: 'environment' };
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: videoConstraints, 
          audio: true 
        });
      } catch (e: any) {
        console.warn('Initial camera constraints failed, trying fallback:', e);
        try {
          // Fallback: Just get any video/audio
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: true 
          });
        } catch (fallbackErr: any) {
          throw fallbackErr;
        }
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.error("Video play error:", e));
      }
      
      // Try to get the actual device ID we are using
      const activeTrack = stream.getVideoTracks()[0];
      if (activeTrack) {
        setCurrentDeviceId(activeTrack.getSettings().deviceId || null);
      }

      // Create stream in Firestore
      const streamDoc = await addDoc(collection(db, 'streams'), {
        factoryId: profile?.uid,
        title: `${profile?.companyName || 'Factory'} - Live Production`,
        status: 'live',
        featuredProductId: selectedProduct?.id || null,
        viewerCount: 0,
        createdAt: serverTimestamp(),
      });

      setStreamId(streamDoc.id);
      setIsLive(true);
      setIsMock(false);
      setFacingMode(mode);
      setStreamTitle(`${profile?.companyName || 'Factory'} - Live Production`);
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      setError(err.message || "Could not access camera. Please check permissions.");
    }
  }, [facingMode, profile, startMockStream, selectedProduct]);

  const switchCamera = useCallback(async () => {
    if (!isLive) return;

    const newMode = facingMode === 'user' ? 'environment' : 'user';

    if (isMock) {
      setFacingMode(newMode);
      return;
    }
    
    try {
      await startStream(newMode);
    } catch (err) {
      console.error("Error in switchCamera:", err);
      // Fallback to user camera if environment fails
      if (newMode === 'environment') {
        await startStream('user');
      }
    }
  }, [isLive, facingMode, isMock, startStream]);

  const stopStream = useCallback(async () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    if (streamId) {
      try {
        await updateDoc(doc(db, 'streams', streamId), {
          status: 'ended',
          endedAt: serverTimestamp(),
        });
      } catch (err) {
        console.error("Error ending stream in Firestore:", err);
      }
    }

    setIsLive(false);
    setIsMock(false);
    setViewerCount(0);
    setZoom(1);
    setStreamId(null);
  }, [streamId]);

  const sendMessage = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const newMessage = {
      id: Date.now().toString(),
      user: profile?.companyName || 'Factory',
      text: inputText.trim()
    };
    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    // Play notification sound
    playNotificationSound();
  }, [inputText, profile?.companyName, playNotificationSound]);

  const sendHeart = useCallback(() => {
    const id = Date.now();
    setHearts(prev => [...prev, { id, x: Math.random() * 80 + 10 }]);
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== id));
    }, 2000);
  }, []);

  const handleProductAction = useCallback((type: string) => {
    if (!selectedProduct) return;
    if (type === 'view') {
      router.push(`/dashboard/products?id=${selectedProduct.id}`);
    } else if (type === 'rfq') {
      router.push(`/dashboard/rfq/new?product=${encodeURIComponent(selectedProduct.name)}&supplier=${factoryData?.id || ''}`);
    }
  }, [router, selectedProduct, factoryData]);

  const handleChatWithSupplier = useCallback(() => {
    if (!factoryData) return;
    router.push(`/dashboard/messages?newChat=true&with=${factoryData.id}&name=${encodeURIComponent(factoryData.name)}&context=live_stream`);
  }, [router, factoryData]);

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
      </div>
    );
  }

  // Viewer Mode for Buyers
  if (!factoryData && profile?.role !== 'admin') {
    return (
      <div className="flex flex-col w-full h-screen bg-black overflow-hidden" dir={dir}>
        <div className="flex items-center justify-center h-full text-white">
          <p>{t('live.viewerMode') || 'Viewer Mode (Coming Soon)'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-screen bg-black overflow-hidden" dir={dir}>
      {/* Video Container - Full Screen */}
      <div className="relative w-full h-full bg-black">
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline 
          style={{ transform: `scale(${zoom})` }}
          className={`w-full h-full object-cover transition-all duration-500 origin-center ${isLive && !isMock ? 'opacity-100' : 'opacity-0'}`}
        />
        
        {isLive && isMock && <LiveStreamMockPreview />}
        
        {!isLive && (
          <LiveStreamSetup 
            error={error}
            startStream={startStream}
            startMockStream={startMockStream}
            products={products}
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            t={t}
          />
        )}

        {/* Overlay UI - TikTok Style */}
        {isLive && (
          <>
            <LiveStreamHeader viewerCount={viewerCount} stopStream={stopStream} t={t} />
            {factoryData && <SupplierOverlay factory={{
              name: factoryData.name,
              logo: factoryData.logo,
              verified: factoryData.status === 'approved',
              exportReady: factoryData.exportReady,
              responseRate: factoryData.responseRate || '95%',
              id: factoryData.id,
              industry: factoryData.industry,
              capabilities: factoryData.capabilities
            }} t={t} dir={dir} onVisit={() => router.push(`/dashboard/profile?id=${factoryData.id}`)} />}
            <AIAgentOverlay t={t} dir={dir} factory={factoryData} messages={messages} />
            <LiveStreamActions switchCamera={switchCamera} sendHeart={sendHeart} onChat={handleChatWithSupplier} t={t} />

            {selectedProduct && <ProductCardOverlay product={{
              id: selectedProduct.id,
              name: selectedProduct.name,
              price: selectedProduct.pricingTiers?.[0] ? `$${selectedProduct.pricingTiers[0].price}` : 'Quote Only',
              minOrder: `${selectedProduct.moq} Units`,
              image: selectedProduct.images?.[0] || `https://picsum.photos/seed/${selectedProduct.id}/200/200`,
              category: selectedProduct.category,
              leadTime: selectedProduct.leadTime
            }} t={t} dir={dir} onAction={handleProductAction} />}

            {/* Hearts Animation */}
            <div className="absolute right-4 bottom-48 w-16 h-64 pointer-events-none z-30">
              <AnimatePresence>
                {hearts.map((heart) => (
                  <motion.div
                    key={heart.id}
                    initial={{ opacity: 1, y: 0, scale: 0.5, x: 0 }}
                    animate={{ 
                      opacity: 0, 
                      y: -200, 
                      scale: 1.5,
                      x: (Math.random() - 0.5) * 50
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="absolute bottom-0 text-red-500"
                    style={{ left: `${heart.x}%` }}
                  >
                    <Heart className="w-8 h-8 fill-current" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <LiveStreamChat messages={messages} factory={factoryData} t={t} />
            <LiveStreamInput 
              inputText={inputText} 
              setInputText={onSetInputText} 
              sendMessage={sendMessage} 
              showEmojis={showEmojis} 
              setShowEmojis={onSetShowEmojis} 
              t={t} 
            />
          </>
        )}
      </div>
    </div>
  );
}
