'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { FileText, Search, Trash2, Eye, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function AdminRFQsDashboard() {
  const { profile } = useAuth();
  const { t, dir } = useLanguage();
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRfqs = async () => {
      if (!profile || profile.role !== 'admin') return;
      try {
        const querySnapshot = await getDocs(collection(db, 'rfqs'));
        const rfqsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        
        // Sort by createdAt descending
        rfqsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setRfqs(rfqsData);
      } catch (error) {
        console.error('Error fetching RFQs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRfqs();
  }, [profile]);

  const handleDeleteRfq = async (rfqId: string) => {
    if (!confirm(t('admin.confirm_delete_rfq'))) return;
    try {
      await deleteDoc(doc(db, 'rfqs', rfqId));
      setRfqs(rfqs.filter(r => r.id !== rfqId));
    } catch (error) {
      console.error('Error deleting RFQ:', error);
      alert(t('admin.delete_rfq_error'));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200"><Clock className="w-3 h-3" /> {t('rfq.pending')}</span>;
      case 'quoted':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200"><AlertCircle className="w-3 h-3" /> {t('rfq.quoted')}</span>;
      case 'accepted':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200"><CheckCircle2 className="w-3 h-3" /> {t('rfq.accepted')}</span>;
      case 'rejected':
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold border border-red-200"><XCircle className="w-3 h-3" /> {t(`rfq.${status}`)}</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200">{status}</span>;
    }
  };

  if (!profile || profile.role !== 'admin') return null;

  return (
    <div className="space-y-6" dir={dir}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('admin.rfqs_title')}</h1>
          <p className="text-slate-600 mt-1">{t('admin.rfqs_subtitle')}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder={t('admin.search_rfqs')} 
              className="w-full px-9 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          </div>
        ) : rfqs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-inline-start border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="p-4 text-inline-start">{t('admin.rfq_details')}</th>
                  <th className="p-4 text-inline-start">{t('admin.buyer_factory')}</th>
                  <th className="p-4 text-inline-start">{t('admin.status')}</th>
                  <th className="p-4 text-inline-start">{t('admin.date')}</th>
                  <th className="p-4 text-inline-end">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rfqs.map((rfq) => (
                  <tr key={rfq.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-slate-900 line-clamp-1">{rfq.title}</p>
                        <p className="text-xs text-slate-500">ID: {rfq.id.substring(0, 8)} | {t(`cat.${rfq.category.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_')}`) || rfq.category}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-xs text-slate-600 font-mono">{t('rfq.buyer')}: {rfq.buyerId.substring(0, 8)}</p>
                      <p className="text-xs text-slate-600 font-mono">{t('rfq.factory')}: {rfq.factoryId === 'general' ? t('common.general') : rfq.factoryId.substring(0, 8)}</p>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(rfq.status)}
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      {new Date(rfq.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-inline-end">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/rfqs/${rfq.id}`} className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors rounded-md hover:bg-blue-50" title={t('common.view')}>
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDeleteRfq(rfq.id)} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50" title={t('common.delete')}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">{t('admin.no_rfqs')}</h3>
            <p className="text-slate-500">{t('admin.no_rfqs_desc')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
