'use client';

import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { FileText, Search, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function RFQsDashboard() {
  const { profile } = useAuth();
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200"><Clock className="w-3 h-3" /> Pending</span>;
      case 'quoted':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200"><AlertCircle className="w-3 h-3" /> Quoted</span>;
      case 'accepted':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200"><CheckCircle2 className="w-3 h-3" /> Accepted</span>;
      case 'rejected':
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold border border-red-200"><XCircle className="w-3 h-3" /> {status}</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200">{status}</span>;
    }
  };

  if (!profile) return null;

  const isFactory = profile.role === 'factory' || profile.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{isFactory ? 'Received RFQs' : 'My RFQs'}</h1>
          <p className="text-slate-600 mt-1">
            {isFactory ? 'Manage requests for quotations from buyers.' : 'Track your requests for quotations.'}
          </p>
        </div>
        {!isFactory && (
          <Link href="/rfq" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <FileText className="w-4 h-4" /> New RFQ
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search RFQs by title or ID..." 
              className="w-full pl-9 pr-4 rtl:pr-9 rtl:pl-4 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          </div>
        ) : rfqs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="p-4">RFQ Details</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Quantity</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rfqs.map((rfq) => (
                  <tr key={rfq.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-slate-900 line-clamp-1">{rfq.title}</p>
                        <p className="text-xs text-slate-500">ID: {rfq.id.substring(0, 8)}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{rfq.category}</td>
                    <td className="p-4 text-sm text-slate-600">{rfq.quantity} units</td>
                    <td className="p-4">
                      {getStatusBadge(rfq.status)}
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      {new Date(rfq.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <Link href={`/dashboard/rfqs/${rfq.id}`} className="text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">No RFQs found</h3>
            <p className="text-slate-500 mb-6">
              {isFactory ? "You haven't received any RFQs yet." : "You haven't submitted any RFQs yet."}
            </p>
            {!isFactory && (
              <Link href="/rfq" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Submit Your First RFQ
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
