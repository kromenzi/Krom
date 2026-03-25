'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { User, Building2, Mail, Phone, MapPin, Globe, Save, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SettingsDashboard() {
  const { profile } = useAuth();
  const { t, dir } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    phone: '',
    address: '',
    website: '',
    businessType: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        companyName: profile.companyName || '',
        phone: profile.phone || '',
        address: profile.address || '',
        website: profile.website || '',
        businessType: profile.businessType || '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    setStatus(null);
    try {
      const collectionName = profile.role === 'factory' ? 'factories' : 'users';
      await updateDoc(doc(db, collectionName, profile.uid), {
        ...formData,
        updatedAt: new Date().toISOString(),
      });
      setStatus({ type: 'success', message: t('settings.success') });
      setTimeout(() => setStatus(null), 5000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setStatus({ type: 'error', message: t('settings.error') });
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  const isFactory = profile.role === 'factory';

  return (
    <div className="max-w-4xl space-y-6" dir={dir}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('settings.title')}</h1>
          <p className="text-slate-600 mt-1">{t('settings.subtitle')}</p>
        </div>
        
        {status && (
          <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border animate-in fade-in slide-in-from-top-4 duration-300 ${
            status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'
          }`}>
            {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-bold">{status.message}</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            {isFactory ? <Building2 className="w-8 h-8" /> : <User className="w-8 h-8" />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
            <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
              <Mail className="w-4 h-4" /> {profile.email}
            </p>
            <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 uppercase tracking-wider">
              <Shield className="w-3 h-3" /> {t('settings.account_type')}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Common Fields */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-2">{t('settings.personal_info')}</h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('settings.full_name')}</label>
                <div className="relative">
                  <User className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('settings.phone_number')}</label>
                <div className="relative">
                  <Phone className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder={t('settings.phone_placeholder')}
                  />
                </div>
              </div>
            </div>

            {/* Business Fields */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-2">{t('settings.business_info')}</h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('settings.company_name')}</label>
                <div className="relative">
                  <Building2 className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {!isFactory && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('settings.business_type')}</label>
                  <select
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  >
                    <option value="">{t('settings.select_type')}</option>
                    <option value="wholesaler">{t('settings.wholesaler')}</option>
                    <option value="contractor">{t('settings.contractor')}</option>
                    <option value="distributor">{t('settings.distributor')}</option>
                    <option value="retailer">{t('settings.retailer')}</option>
                    <option value="other">{t('settings.other')}</option>
                  </select>
                </div>
              )}

              {isFactory && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('settings.website')}</label>
                  <div className="relative">
                    <Globe className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full px-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="https://www.example.com"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Full Width Fields */}
            <div className="col-span-1 md:col-span-2 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('settings.address')}</label>
                <div className="relative">
                  <MapPin className="absolute inset-inline-start-3 top-3 text-slate-400 w-4 h-4" />
                  <textarea
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                    placeholder={t('settings.address_placeholder')}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-slate-100">
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-6 rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {loading ? t('settings.saving') : t('settings.save_changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
