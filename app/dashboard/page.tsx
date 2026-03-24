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
  const [recentActivity, setRecentActivity] = useState<any[]>([
    { id: 1, type: 'rfq', title: 'New RFQ received', description: 'Aluminum Parts for Automotive', timestamp: new Date('2026-03-24T21:00:00Z'), status: 'pending' },
    { id: 2, type: 'message', title: 'New Message', description: 'From Saudi Steel Co.', timestamp: new Date('2026-03-24T20:00:00Z'), status: 'unread' },
    { id: 3, type: 'order', title: 'Order Completed', description: 'Order #ORD-742', timestamp: new Date('2026-03-23T21:00:00Z'), status: 'completed' },
  ]);

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
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-2xl ${stat.bg} text-${stat.color}-600`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                stat.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 
                stat.trend === 'down' ? 'bg-rose-50 text-rose-600' : 
                'bg-slate-50 text-slate-600'
              }`}>
                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : 
                 stat.trend === 'down' ? <ArrowDownRight className="w-3 h-3" /> : null}
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6">{t('dashboard.quick_actions')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {isFactory ? (
            <>
              <Link 
                href="/dashboard/products/new"
                className="flex flex-col items-center gap-3 p-4 bg-slate-50 rounded-2xl hover:bg-emerald-50 hover:text-emerald-600 transition-all group"
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium">{t('dashboard.action.new_product')}</span>
              </Link>
              <Link 
                href="/dashboard/live"
                className="flex flex-col items-center gap-3 p-4 bg-slate-50 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all group"
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-rose-600 group-hover:text-white transition-all">
                  <Radio className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium">{t('dashboard.action.live_stream')}</span>
              </Link>
              <Link 
                href="/dashboard/rfqs"
                className="flex flex-col items-center gap-3 p-4 bg-slate-50 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all group"
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium">{t('dashboard.action.view_rfqs')}</span>
              </Link>
            </>
          ) : (
            <>
              <Link 
                href="/dashboard/rfq/new"
                className="flex flex-col items-center gap-3 p-4 bg-slate-50 rounded-2xl hover:bg-emerald-50 hover:text-emerald-600 transition-all group"
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium">{t('nav.rfq')}</span>
              </Link>
              <Link 
                href="/dashboard/messages"
                className="flex flex-col items-center gap-3 p-4 bg-slate-50 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all group"
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium">{t('nav.messages')}</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart Placeholder */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Performance Overview</h3>
              <p className="text-sm text-slate-500">Analytics for the last 30 days</p>
            </div>
            <select className="bg-slate-50 border-none rounded-lg text-sm font-medium px-3 py-2 text-slate-600 outline-none">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 12 months</option>
            </select>
          </div>
          <div className="h-[300px] flex items-end justify-between gap-2">
            {[40, 70, 45, 90, 65, 85, 55, 75, 50, 80, 60, 95].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div 
                  className="w-full bg-emerald-100 rounded-t-lg group-hover:bg-emerald-500 transition-all cursor-pointer relative"
                  style={{ height: `${h}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {h * 10} views
                  </div>
                </div>
                <span className="text-[10px] font-medium text-slate-400">M{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
            <Link href="#" className="text-sm font-bold text-emerald-600 hover:text-emerald-700">
              {t('common.view_all')}
            </Link>
          </div>
          <div className="space-y-6">
            {recentActivity.length > 0 ? recentActivity.map((activity) => (
              <div key={activity.id} className="flex gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  activity.type === 'order' ? 'bg-amber-50 text-amber-600' :
                  activity.type === 'message' ? 'bg-blue-50 text-blue-600' :
                  'bg-emerald-50 text-emerald-600'
                }`}>
                  {activity.type === 'order' ? <TrendingUp className="w-5 h-5" /> :
                   activity.type === 'message' ? <MessageSquare className="w-5 h-5" /> :
                   <Package className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{activity.description}</p>
                  <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {activity.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-500 text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Insights Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-3xl text-white overflow-hidden relative">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-emerald-400 mb-4">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-wider">AI Sourcing Insights</span>
            </div>
            <h2 className="text-2xl font-bold mb-4">Optimize your supply chain with GulfFactory AI</h2>
            <p className="text-slate-300 leading-relaxed">
              Based on your recent activity, we&apos;ve identified 3 new verified factories in the Eastern Province that match your sourcing criteria for industrial plastics.
            </p>
            <button className="mt-6 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-xl transition-colors">
              View AI Recommendations
            </button>
          </div>
          <div className="hidden md:block">
            <div className="w-48 h-48 bg-emerald-500/10 rounded-full border border-emerald-500/20 flex items-center justify-center backdrop-blur-sm">
              <LayoutDashboard className="w-24 h-24 text-emerald-500/30" />
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
      </div>
    </div>
  );
}
