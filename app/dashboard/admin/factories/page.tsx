'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { Factory, Shield, ShieldAlert, Trash2, Search, ExternalLink, BadgeCheck, Globe, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';

export default function AdminFactoriesPage() {
  const { t, dir } = useLanguage();
  const [factories, setFactories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFactories();
  }, []);

  const fetchFactories = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'factories'), orderBy('name', 'asc'));
      const querySnapshot = await getDocs(q);
      setFactories(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching factories:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleVerification = async (factoryId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'factories', factoryId), {
        verified: !currentStatus
      });
      setFactories(prev => prev.map(f => f.id === factoryId ? { ...f, verified: !currentStatus } : f));
    } catch (error) {
      console.error('Error updating verification:', error);
    }
  };

  const approveFactory = async (factoryId: string) => {
    try {
      await updateDoc(doc(db, 'factories', factoryId), {
        status: 'approved'
      });
      setFactories(prev => prev.map(f => f.id === factoryId ? { ...f, status: 'approved' } : f));
    } catch (error) {
      console.error('Error approving factory:', error);
    }
  };

  const deleteFactory = async (factoryId: string) => {
    if (!confirm(t('admin.confirm_delete_factory'))) return;
    try {
      await deleteDoc(doc(db, 'factories', factoryId));
      setFactories(prev => prev.filter(f => f.id !== factoryId));
    } catch (error) {
      console.error('Error deleting factory:', error);
    }
  };

  const filteredFactories = factories.filter(f => 
    f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6" dir={dir}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('admin.factories_title')}</h1>
          <p className="text-slate-500">{t('admin.factories_subtitle')}</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('admin.search_factories')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none w-full md:w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('admin.factory')}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('admin.location')}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('admin.status')}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      {t('common.loading')}
                    </div>
                  </td>
                </tr>
              ) : filteredFactories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    {t('admin.no_factories_found')}
                  </td>
                </tr>
              ) : (
                filteredFactories.map((factory) => (
                  <tr key={factory.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold relative overflow-hidden">
                          {factory.logo ? (
                            <Image src={factory.logo} alt="" fill className="object-cover" />
                          ) : (
                            factory.name?.charAt(0) || 'F'
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-slate-900">{factory.name}</span>
                            {factory.verified && <BadgeCheck className="w-4 h-4 text-emerald-500" />}
                          </div>
                          <span className="text-xs text-slate-500">{factory.companyName}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <MapPin className="w-3.5 h-3.5" />
                        {factory.location || t('admin.not_specified')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {factory.verified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 w-fit">
                            <Shield className="w-3 h-3" />
                            {t('admin.verified')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 w-fit">
                            <ShieldAlert className="w-3 h-3" />
                            {t('admin.unverified')}
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit ${factory.status === 'approved' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                          {factory.status === 'approved' ? t('admin.approved') : t('admin.pending')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {factory.status !== 'approved' && (
                          <button
                            onClick={() => approveFactory(factory.id)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title={t('admin.approve')}
                          >
                            <BadgeCheck className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => toggleVerification(factory.id, factory.verified)}
                          className={`p-2 rounded-lg transition-colors ${factory.verified ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                          title={factory.verified ? t('admin.unverify') : t('admin.verify')}
                        >
                          <Shield className="w-5 h-5" />
                        </button>
                        <a
                          href={`/factories/${factory.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                        <button
                          onClick={() => deleteFactory(factory.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
