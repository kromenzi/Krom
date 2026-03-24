'use client';

import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { FileText, Search, Clock, CheckCircle2, XCircle, AlertCircle, Filter, ArrowRight, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function RFQsDashboard() {
  const { profile } = useAuth();
  const { t, dir } = useLanguage();
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchRfqs = async () => {
      if (!profile) return;
      try {
        const isFactory = profile.role === 'factory' || profile.role === 'admin';
        const q = isFactory 
          ? query(collection(db, 'rfqs'), where('factoryId', 'in', [profile.uid, 'general']))
          : query(collection(db, 'rfqs'), where('buyerId', '==', profile.uid));
          
        const querySnapshot = await getDocs(q);
        const rfqData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        
        // Sort by createdAt descending
        rfqData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setRfqs(rfqData);
      } catch (error) {
        console.error('Error fetching RFQs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRfqs();
  }, [profile]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200/50"><Clock className="w-3 h-3" /> {status.toUpperCase()}</span>;
      case 'quoted':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/50"><AlertCircle className="w-3 h-3" /> {status.toUpperCase()}</span>;
      case 'accepted':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/50"><CheckCircle2 className="w-3 h-3" /> {status.toUpperCase()}</span>;
      case 'rejected':
      case 'cancelled':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200/50"><XCircle className="w-3 h-3" /> {status.toUpperCase()}</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200/50">{status.toUpperCase()}</span>;
    }
  };

  if (!profile) return null;

  const isFactory = profile.role === 'factory' || profile.role === 'admin';
  const filteredRfqs = filter === 'all' ? rfqs : rfqs.filter(r => r.status === filter);

  return (
    <div className="space-y-8" dir={dir}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {isFactory ? (dir === 'rtl' ? 'طلبات التسعير الواردة' : 'Received RFQs') : (dir === 'rtl' ? 'طلبات التسعير الخاصة بي' : 'My RFQs')}
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            {isFactory 
              ? (dir === 'rtl' ? 'إدارة طلبات عروض الأسعار من المشترين.' : 'Manage requests for quotations from buyers.') 
              : (dir === 'rtl' ? 'تتبع طلبات عروض الأسعار الخاصة بك.' : 'Track your requests for quotations.')}
          </p>
        </div>
        {!isFactory && (
          <Link href="/dashboard/rfq/new" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-emerald-200 flex items-center gap-2 group">
            <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
            {dir === 'rtl' ? 'طلب تسعير جديد' : 'New RFQ'}
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['all', 'pending', 'quoted', 'accepted', 'rejected'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              filter === s 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-500'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/30">
          <div className="relative w-full max-w-md">
            <Search className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4`} />
            <input 
              type="text" 
              placeholder={dir === 'rtl' ? 'البحث في طلبات التسعير...' : "Search RFQs..."}
              className={`w-full ${dir === 'rtl' ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 rounded-2xl bg-white border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all`}
            />
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
            <Filter className="w-4 h-4" />
            <span>{filteredRfqs.length} {dir === 'rtl' ? 'طلبات' : 'Results'}</span>
          </div>
        </div>

        {loading ? (
          <div className="p-20 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-slate-500 font-medium">{dir === 'rtl' ? 'جاري التحميل...' : 'Loading RFQs...'}</p>
          </div>
        ) : filteredRfqs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" dir={dir}>
              <thead>
                <tr className={`bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 font-black ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                  <th className="px-8 py-4">{dir === 'rtl' ? 'تفاصيل الطلب' : 'RFQ Details'}</th>
                  <th className="px-8 py-4">{dir === 'rtl' ? 'الفئة' : 'Category'}</th>
                  <th className="px-8 py-4">{dir === 'rtl' ? 'الكمية' : 'Quantity'}</th>
                  <th className="px-8 py-4">{dir === 'rtl' ? 'الحالة' : 'Status'}</th>
                  <th className="px-8 py-4">{dir === 'rtl' ? 'التاريخ' : 'Date'}</th>
                  <th className="px-8 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredRfqs.map((rfq) => (
                  <tr key={rfq.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-6">
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">{rfq.title}</p>
                        <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-tighter">ID: {rfq.id.substring(0, 8)}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                        {rfq.category}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-slate-700">{rfq.quantity} units</td>
                    <td className="px-8 py-6">
                      {getStatusBadge(rfq.status)}
                    </td>
                    <td className="px-8 py-6 text-sm font-medium text-slate-400">
                      {new Date(rfq.createdAt).toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Link 
                        href={`/dashboard/rfqs/${rfq.id}`} 
                        className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-black text-xs uppercase tracking-widest transition-all group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                      >
                        {dir === 'rtl' ? 'التفاصيل' : 'View'}
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">{dir === 'rtl' ? 'لا توجد طلبات تسعير' : 'No RFQs found'}</h3>
            <p className="text-slate-500 mb-8 max-w-xs mx-auto font-medium">
              {isFactory 
                ? (dir === 'rtl' ? 'لم تتلق أي طلبات تسعير بعد.' : "You haven't received any RFQs yet.") 
                : (dir === 'rtl' ? 'لم تقم بتقديم أي طلبات تسعير بعد.' : "You haven't submitted any RFQs yet.")}
            </p>
            {!isFactory && (
              <Link href="/dashboard/rfq/new" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-emerald-200">
                {dir === 'rtl' ? 'قدم طلبك الأول الآن' : 'Submit Your First RFQ'}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
