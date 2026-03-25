'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  FileText, 
  Package, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Plus,
  Radio,
  LayoutDashboard,
  Settings,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { motion } from 'motion/react';

export default function DashboardOverview() {
  const { profile, user } = useAuth();
  const { t, dir } = useLanguage();
  const [stats, setStats] = useState({
    rfqs: 0,
    products: 0,
    unreadMessages: 0,
    profileViews: 1240,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    setRecentActivity([
      { id: 1, type: 'rfq', title: t('activity.new_rfq'), description: t('activity.new_rfq_desc'), timestamp: new Date('2026-03-24T21:00:00Z'), status: 'pending' },
      { id: 2, type: 'message', title: t('activity.new_message'), description: t('activity.new_message_desc'), timestamp: new Date('2026-03-24T20:00:00Z'), status: 'unread' },
      { id: 3, type: 'order', title: t('activity.order_completed'), description: t('activity.order_completed_desc'), timestamp: new Date('2026-03-23T21:00:00Z'), status: 'completed' },
    ]);
  }, [t]);

  useEffect(() => {
    if (!user || !profile) return;

    // Real-time stats listeners
    const rfqQuery = profile.role === 'factory' || profile.role === 'admin'
      ? query(collection(db, 'rfqs'), where('status', 'in', ['pending', 'quoted', 'accepted']))
      : query(collection(db, 'rfqs'), where('buyerId', '==', user.uid));
    
    const unsubRfqs = onSnapshot(rfqQuery, (snap) => setStats(prev => ({ ...prev, rfqs: snap.size })));

    if (profile.role === 'factory' || profile.role === 'admin') {
      const productQuery = query(collection(db, 'products'), where('factoryId', '==', user.uid));
      onSnapshot(productQuery, (snap) => setStats(prev => ({ ...prev, products: snap.size })));
    }

    // Listen for unread messages
    const chatsQuery = query(collection(db, 'chats'), where('participants', 'array-contains', user.uid));
    const unsubscribeChats = onSnapshot(chatsQuery, (snapshot) => {
      let unreadTotal = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.unreadCount && data.unreadCount[user.uid]) {
          unreadTotal += data.unreadCount[user.uid];
        }
      });
      setStats(prev => ({ ...prev, unreadMessages: unreadTotal }));
    });

    // Recent Activity (Mocking for now as we don't have an activity collection yet, but setting up the structure)

    return () => {
      unsubRfqs();
      unsubscribeChats();
    };
  }, [user, profile]);

  if (!profile) return null;

  const isFactory = profile.role === 'factory' || profile.role === 'admin';

  const statsConfig = isFactory ? [
    { label: t('dashboard.stats.total_products'), value: stats.products, change: '+12%', trend: 'up', icon: Package, color: 'emerald', bg: 'bg-emerald-50' },
    { label: t('dashboard.stats.total_quotes'), value: stats.rfqs, change: '+8%', trend: 'up', icon: FileText, color: 'blue', bg: 'bg-blue-50' },
    { label: t('dashboard.stats.profile_views'), value: stats.profileViews.toLocaleString(), change: '+18%', trend: 'up', icon: Eye, color: 'purple', bg: 'bg-purple-50' },
    { label: t('dashboard.stats.unread_messages'), value: stats.unreadMessages, change: stats.unreadMessages > 0 ? 'New' : '0', trend: stats.unreadMessages > 0 ? 'up' : 'neutral', icon: MessageSquare, color: 'amber', bg: 'bg-amber-50' },
  ] : [
    { label: t('dashboard.stats.active_rfqs'), value: stats.rfqs, change: '+2', trend: 'up', icon: FileText, color: 'emerald', bg: 'bg-emerald-50' },
    { label: t('dashboard.stats.total_orders'), value: '42', change: '+5%', trend: 'up', icon: Package, color: 'blue', bg: 'bg-blue-50' },
    { label: t('dashboard.stats.saved_factories'), value: '12', change: '0', trend: 'neutral', icon: Users, color: 'purple', bg: 'bg-purple-50' },
    { label: t('dashboard.stats.unread_messages'), value: stats.unreadMessages, change: stats.unreadMessages > 0 ? 'New' : '0', trend: stats.unreadMessages > 0 ? 'up' : 'neutral', icon: MessageSquare, color: 'amber', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8 pb-12" dir={dir}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {t('dashboard.welcome')}, {profile?.factoryName || profile?.displayName?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="text-slate-500 mt-1">
            {isFactory ? t('dashboard.factory') : t('dashboard.buyer')} • {new Date().toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard/live"
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-full font-medium hover:bg-rose-100 transition-colors border border-rose-100"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            {t('nav.live')}
          </Link>
          <Link 
            href={isFactory ? "/dashboard/products/new" : "/dashboard/rfq/new"}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
          >
            <Plus className="w-4 h-4" />
            {isFactory ? t('product.add_new') : t('nav.rfq')}
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsConfig.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="gulf-card p-6 hover:shadow-xl hover:shadow-slate-200/60 group"
          >
            <div className="flex items-start justify-between">
              <div className={`p-4 rounded-2xl ${stat.bg} text-${stat.color}-600 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full ${
                stat.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 
                stat.trend === 'down' ? 'bg-rose-50 text-rose-600' : 
                'bg-slate-50 text-slate-600'
              }`}>
                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : 
                 stat.trend === 'down' ? <ArrowDownRight className="w-3 h-3" /> : null}
                {stat.change}
              </div>
            </div>
            <div className="mt-5">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="gulf-card p-8">
        <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
          <div className="w-2 h-6 bg-amber-500 rounded-full" />
          {t('dashboard.quick_actions')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {isFactory ? (
            <>
              <Link 
                href="/dashboard/products/new"
                className="flex flex-col items-center gap-4 p-6 bg-slate-50 rounded-3xl hover:bg-emerald-600 hover:text-white transition-all duration-300 group shadow-sm hover:shadow-lg hover:shadow-emerald-900/20"
              >
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-white/20 transition-all">
                  <Plus className="w-7 h-7" />
                </div>
                <span className="text-sm font-bold tracking-tight">{t('dashboard.action.new_product')}</span>
              </Link>
              <Link 
                href="/dashboard/live"
                className="flex flex-col items-center gap-4 p-6 bg-slate-50 rounded-3xl hover:bg-rose-600 hover:text-white transition-all duration-300 group shadow-sm hover:shadow-lg hover:shadow-rose-900/20"
              >
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-white/20 transition-all">
                  <Radio className="w-7 h-7" />
                </div>
                <span className="text-sm font-bold tracking-tight">{t('dashboard.action.live_stream')}</span>
              </Link>
              <Link 
                href="/dashboard/rfqs"
                className="flex flex-col items-center gap-4 p-6 bg-slate-50 rounded-3xl hover:bg-blue-600 hover:text-white transition-all duration-300 group shadow-sm hover:shadow-lg hover:shadow-blue-900/20"
              >
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-white/20 transition-all">
                  <FileText className="w-7 h-7" />
                </div>
                <span className="text-sm font-bold tracking-tight">{t('dashboard.action.view_rfqs')}</span>
              </Link>
            </>
          ) : (
            <>
              <Link 
                href="/dashboard/rfq/new"
                className="flex flex-col items-center gap-4 p-6 bg-slate-50 rounded-3xl hover:bg-emerald-600 hover:text-white transition-all duration-300 group shadow-sm hover:shadow-lg hover:shadow-emerald-900/20"
              >
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-white/20 transition-all">
                  <Plus className="w-7 h-7" />
                </div>
                <span className="text-sm font-bold tracking-tight">{t('nav.rfq')}</span>
              </Link>
              <Link 
                href="/dashboard/messages"
                className="flex flex-col items-center gap-4 p-6 bg-slate-50 rounded-3xl hover:bg-blue-600 hover:text-white transition-all duration-300 group shadow-sm hover:shadow-lg hover:shadow-blue-900/20"
              >
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-white/20 transition-all">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <span className="text-sm font-bold tracking-tight">{t('nav.messages')}</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart Placeholder */}
        <div className="lg:col-span-2 gulf-card p-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900">{t('dashboard.performance')}</h3>
              <p className="text-sm font-medium text-slate-400">{t('dashboard.performance_desc')}</p>
            </div>
            <select className="bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold px-4 py-2.5 text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500 transition-all">
              <option>{t('dashboard.last_7_days')}</option>
              <option>{t('dashboard.last_30_days')}</option>
              <option>{t('dashboard.last_12_months')}</option>
            </select>
          </div>
          <div className="h-[300px] flex items-end justify-between gap-3">
            {[40, 70, 45, 90, 65, 85, 55, 75, 50, 80, 60, 95].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                <div 
                  className="w-full bg-emerald-50 rounded-t-xl group-hover:bg-emerald-600 transition-all duration-500 cursor-pointer relative shadow-sm group-hover:shadow-lg group-hover:shadow-emerald-900/10"
                  style={{ height: `${h}%` }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-xl">
                    {h * 10} {t('dashboard.views')}
                  </div>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">M{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="gulf-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900">{t('dashboard.recent_activity')}</h3>
            <Link href="#" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
              {t('common.view_all')}
            </Link>
          </div>
          <div className="space-y-8">
            {recentActivity.length > 0 ? recentActivity.map((activity) => (
              <div key={activity.id} className="flex gap-5 group cursor-pointer">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 ${
                  activity.type === 'order' ? 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white' :
                  activity.type === 'message' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' :
                  'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'
                }`}>
                  {activity.type === 'order' ? <TrendingUp className="w-6 h-6" /> :
                   activity.type === 'message' ? <MessageSquare className="w-6 h-6" /> :
                   <Package className="w-6 h-6" />}
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{activity.title}</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">{activity.description}</p>
                  <span className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1.5 uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5" />
                    {activity.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-10 h-10 text-slate-200" />
                </div>
                <p className="text-slate-400 font-bold">{t('dashboard.no_activity')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Insights Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 p-10 rounded-[2.5rem] text-white overflow-hidden relative shadow-2xl shadow-emerald-900/20 border border-emerald-500/10">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 text-amber-400 mb-6">
              <div className="p-2 bg-amber-400/10 rounded-lg">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-sm font-black uppercase tracking-[0.2em]">{t('dashboard.ai_insights_subtitle')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-6 leading-tight">{t('dashboard.ai_insights_title')}</h2>
            <p className="text-slate-300 text-lg leading-relaxed font-medium">
              {t('dashboard.ai_insights_description')}
            </p>
            <button className="mt-10 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black rounded-2xl transition-all duration-300 shadow-xl shadow-amber-900/40 active:scale-95">
              {t('dashboard.ai_insights_button')}
            </button>
          </div>
          <div className="hidden md:block">
            <div className="w-64 h-64 bg-emerald-500/5 rounded-full border border-emerald-500/10 flex items-center justify-center backdrop-blur-md relative group">
              <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-pulse" />
              <LayoutDashboard className="w-32 h-32 text-emerald-500/20 group-hover:scale-110 transition-transform duration-500" />
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-[100px]" />
      </div>
    </div>
  );
}
