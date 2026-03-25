'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Building2, Search, CheckCircle2, XCircle, Trash2, ShieldAlert } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AdminFactoriesDashboard() {
  const { profile } = useAuth();
  const { t, dir } = useLanguage();
  const [factories, setFactories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFactories = async () => {
      if (!profile || profile.role !== 'admin') return;
      try {
        const querySnapshot = await getDocs(collection(db, 'factories'));
        const factoriesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFactories(factoriesData);
      } catch (error) {
        console.error('Error fetching factories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFactories();
  }, [profile]);

  const handleVerificationToggle = async (factoryId: string, currentStatus: boolean) => {
    if (!confirm(currentStatus ? t('admin.confirm_revoke') : t('admin.confirm_verify'))) return;
    try {
      await updateDoc(doc(db, 'factories', factoryId), { isVerified: !currentStatus });
      setFactories(factories.map(f => f.id === factoryId ? { ...f, isVerified: !currentStatus } : f));
    } catch (error) {
      console.error('Error updating verification status:', error);
      alert(t('admin.verify_error'));
    }
  };

  const handleDeleteFactory = async (factoryId: string) => {
    if (!confirm(t('admin.confirm_delete_factory'))) return;
    try {
      await deleteDoc(doc(db, 'factories', factoryId));
      setFactories(factories.filter(f => f.id !== factoryId));
    } catch (error) {
      console.error('Error deleting factory:', error);
      alert(t('admin.delete_factory_error'));
    }
  };

  if (!profile || profile.role !== 'admin') return null;

  return (
    <div className="space-y-6" dir={dir}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('admin.factories_title')}</h1>
          <p className="text-slate-600 mt-1">{t('admin.factories_subtitle')}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder={t('admin.search_factories')} 
              className="w-full px-9 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          </div>
        ) : factories.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-inline-start border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="p-4 text-inline-start">{t('admin.factory_name')}</th>
                  <th className="p-4 text-inline-start">{t('admin.location')}</th>
                  <th className="p-4 text-inline-start">{t('admin.status')}</th>
                  <th className="p-4 text-inline-start">{t('admin.joined')}</th>
                  <th className="p-4 text-inline-end">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {factories.map((factory) => (
                  <tr key={factory.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-slate-900 flex items-center gap-2">
                          {factory.companyName || factory.name || t('common.unnamed_factory')}
                          {factory.isVerified && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                        </p>
                        <p className="text-xs text-slate-500">{factory.email}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {factory.country || t('common.unknown')}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        factory.isVerified ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {factory.isVerified ? t('admin.verified') : t('admin.pending')}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      {factory.createdAt ? new Date(factory.createdAt).toLocaleDateString() : t('common.unknown')}
                    </td>
                    <td className="p-4 text-inline-end">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleVerificationToggle(factory.id, factory.isVerified)}
                          className={`p-1.5 rounded-md transition-colors ${
                            factory.isVerified 
                              ? 'text-amber-600 hover:bg-amber-50' 
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={factory.isVerified ? t('admin.confirm_revoke') : t('admin.confirm_verify')}
                        >
                          {factory.isVerified ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleDeleteFactory(factory.id)} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50" title={t('common.delete')}>
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
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">{t('admin.no_factories')}</h3>
            <p className="text-slate-500">{t('admin.no_factories_desc')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
