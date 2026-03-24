'use client';

import { useAuth } from '@/contexts/AuthContext';
import { FileText, Package, MessageSquare, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';

export default function DashboardOverview() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    rfqs: 0,
    products: 0,
    unreadMessages: 0,
  });

  useEffect(() => {
    if (!profile) return;

    const fetchStats = async () => {
      try {
        // Fetch RFQs count
        const rfqQuery = profile.role === 'factory' || profile.role === 'admin'
          ? query(collection(db, 'rfqs'), where('status', 'in', ['pending', 'quoted', 'accepted']))
          : query(collection(db, 'rfqs'), where('buyerId', '==', profile.uid));
        
        const rfqSnapshot = await getDocs(rfqQuery);
        const rfqCount = rfqSnapshot.size;

        // Fetch Products count (for factories)
        let productCount = 0;
        if (profile.role === 'factory' || profile.role === 'admin') {
          const productQuery = query(collection(db, 'products'), where('factoryId', '==', profile.uid));
          const productSnapshot = await getDocs(productQuery);
          productCount = productSnapshot.size;
        }

        setStats(prev => ({ ...prev, rfqs: rfqCount, products: productCount }));
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();

    // Listen for unread messages
    const chatsQuery = query(collection(db, 'chats'), where('participants', 'array-contains', profile.uid));
    const unsubscribeChats = onSnapshot(chatsQuery, (snapshot) => {
      let unreadTotal = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.unreadCount && data.unreadCount[profile.uid]) {
          unreadTotal += data.unreadCount[profile.uid];
        }
      });
      setStats(prev => ({ ...prev, unreadMessages: unreadTotal }));
    });

    return () => unsubscribeChats();
  }, [profile]);

  if (!profile) return null;

  const isFactory = profile.role === 'factory' || profile.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <div className="flex gap-4">
          {isFactory ? (
            <Link href="/dashboard/products/new" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Add Product
            </Link>
          ) : (
            <Link href="/rfq" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              New RFQ
            </Link>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Active RFQs</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.rfqs}</h3>
            </div>
          </div>
          <Link href="/dashboard/rfqs" className="text-sm text-blue-600 font-medium hover:text-blue-700">View all RFQs &rarr;</Link>
        </div>

        {isFactory ? (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Products Listed</p>
                <h3 className="text-2xl font-bold text-slate-900">{stats.products}</h3>
              </div>
            </div>
            <Link href="/dashboard/products" className="text-sm text-emerald-600 font-medium hover:text-emerald-700">Manage catalog &rarr;</Link>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Spent</p>
                <h3 className="text-2xl font-bold text-slate-900">$0</h3>
              </div>
            </div>
            <Link href="/dashboard/orders" className="text-sm text-purple-600 font-medium hover:text-purple-700">View order history &rarr;</Link>
          </div>
        )}

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Unread Messages</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.unreadMessages}</h3>
            </div>
          </div>
          <Link href="/dashboard/messages" className="text-sm text-orange-600 font-medium hover:text-orange-700">Go to inbox &rarr;</Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
        </div>
        <div className="p-6 text-center text-slate-500 py-12">
          <p>No recent activity to show.</p>
        </div>
      </div>
    </div>
  );
}
