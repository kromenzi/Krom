'use client';

import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { Building2, Save, MapPin, Globe, Phone, Mail, FileText, CheckCircle2, Image as ImageIcon, Loader2, Award, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import FileUpload from '@/components/FileUpload';
import { motion } from 'motion/react';
import Image from 'next/image';

export default function FactoryProfileDashboard() {
  const { profile } = useAuth();
  const { t, dir } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    website: '',
    phone: '',
    email: '',
    yearEstablished: '',
    employeeCount: '',
    certifications: '',
    capabilities: '',
    logo: '',
    banner: '',
  });

  useEffect(() => {
    const fetchFactoryProfile = async () => {
      if (!profile || profile.role !== 'factory') return;
      
      try {
        const docRef = doc(db, 'factories', profile.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            name: data.name || '',
            description: data.description || '',
            address: data.address || '',
            website: data.website || '',
            phone: data.phone || '',
            email: data.email || '',
            yearEstablished: data.yearEstablished || '',
            employeeCount: data.employeeCount || '',
            certifications: data.certifications ? data.certifications.join(', ') : '',
            capabilities: data.capabilities ? data.capabilities.join(', ') : '',
            logo: data.logo || '',
            banner: data.banner || '',
          });
        }
      } catch (error) {
        console.error('Error fetching factory profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFactoryProfile();
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSuccess(false);
  };

  const handleLogoUpload = (urls: string[]) => {
    setFormData({ ...formData, logo: urls[0] || '' });
  };

  const handleBannerUpload = (urls: string[]) => {
    setFormData({ ...formData, banner: urls[0] || '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setSuccess(false);
    
    try {
      const certificationsArray = formData.certifications.split(',').map(s => s.trim()).filter(Boolean);
      const capabilitiesArray = formData.capabilities.split(',').map(s => s.trim()).filter(Boolean);
      
      await updateDoc(doc(db, 'factories', profile.uid), {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        website: formData.website,
        phone: formData.phone,
        email: formData.email,
        yearEstablished: formData.yearEstablished,
        employeeCount: formData.employeeCount,
        certifications: certificationsArray,
        capabilities: capabilitiesArray,
        logo: formData.logo,
        banner: formData.banner,
        updatedAt: new Date().toISOString(),
      });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating factory profile:', error);
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!profile || profile.role !== 'factory') return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12" dir={dir}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">{t('profile.title')}</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">{t('profile.subtitle')}</p>
        </div>
        <div className="flex items-center gap-4">
          {success && (
            <motion.span 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-emerald-600 text-sm font-black uppercase tracking-widest"
            >
              <CheckCircle2 className="w-5 h-5" /> {t('common.success')}
            </motion.span>
          )}
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="gulf-button-primary px-8 py-3 flex items-center gap-3"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? t('common.loading') : t('profile.save')}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Branding & Media */}
        <div className="space-y-8">
          <div className="gulf-card p-8 space-y-8">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-widest">
              <ImageIcon className="w-6 h-6 text-emerald-600" />
              {t('profile.branding')}
            </h3>
            
            <div className="space-y-4">
              <label className="block text-sm font-black text-slate-700 uppercase tracking-widest px-1">{t('profile.logo')}</label>
              <div className="aspect-square w-40 mx-auto rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group shadow-inner">
                {formData.logo ? (
                  <Image src={formData.logo} alt="Logo" fill className="object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <Building2 className="w-12 h-12 text-slate-300" />
                )}
              </div>
              <FileUpload 
                onUploadComplete={handleLogoUpload}
                initialUrls={formData.logo ? [formData.logo] : []}
                maxFiles={1}
                folder={`factories/${profile.uid}/logo`}
                label={t('profile.logo')}
              />
            </div>

            <div className="space-y-4 pt-4">
              <label className="block text-sm font-black text-slate-700 uppercase tracking-widest px-1">{t('profile.banner')}</label>
              <div className="aspect-video w-full rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative shadow-inner">
                {formData.banner ? (
                  <Image src={formData.banner} alt="Banner" fill className="object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <ImageIcon className="w-12 h-12 text-slate-300" />
                )}
              </div>
              <FileUpload 
                onUploadComplete={handleBannerUpload}
                initialUrls={formData.banner ? [formData.banner] : []}
                maxFiles={1}
                folder={`factories/${profile.uid}/banner`}
                label={t('profile.banner')}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Info */}
          <div className="gulf-card p-8 space-y-8">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-widest">
              <Building2 className="w-6 h-6 text-emerald-600" />
              {t('profile.basic_info')}
            </h3>
            
            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-black text-slate-700 uppercase tracking-widest px-1">{t('product.name')} *</label>
                <div className="relative">
                  <Building2 className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="gulf-input px-14"
                    placeholder={t('profile.name_placeholder')}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-black text-slate-700 uppercase tracking-widest px-1">{t('product.description')}</label>
                <div className="relative">
                  <FileText className="absolute inset-inline-start-5 top-6 w-5 h-5 text-slate-400" />
                  <textarea
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className="gulf-input px-14 resize-none"
                    placeholder={t('profile.desc_placeholder')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="gulf-card p-8 space-y-8">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-widest">
              <Globe className="w-6 h-6 text-emerald-600" />
              {t('profile.contact_details')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-black text-slate-700 uppercase tracking-widest px-1">{t('profile.email')}</label>
                <div className="relative">
                  <Mail className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="gulf-input px-14"
                    placeholder={t('profile.email_placeholder')}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-black text-slate-700 uppercase tracking-widest px-1">{t('profile.phone')}</label>
                <div className="relative">
                  <Phone className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="gulf-input px-14"
                    placeholder={t('profile.phone_placeholder')}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-black text-slate-700 uppercase tracking-widest px-1">{t('profile.website')}</label>
                <div className="relative">
                  <Globe className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="gulf-input px-14"
                    placeholder="https://www.example.com"
                  />
                </div>
              </div>
              <div className="space-y-3 md:col-span-2">
                <label className="text-sm font-black text-slate-700 uppercase tracking-widest px-1">{t('profile.address')}</label>
                <div className="relative">
                  <MapPin className="absolute inset-inline-start-5 top-6 w-5 h-5 text-slate-400" />
                  <textarea
                    name="address"
                    rows={2}
                    value={formData.address}
                    onChange={handleChange}
                    className="gulf-input px-14 resize-none"
                    placeholder={t('profile.address_placeholder')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Capabilities & Stats */}
          <div className="gulf-card p-8 space-y-8">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-widest">
              <Award className="w-6 h-6 text-emerald-600" />
              {t('profile.capabilities')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-black text-slate-700 uppercase tracking-widest px-1">{t('profile.year_established')}</label>
                <div className="relative">
                  <Building2 className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="yearEstablished"
                    value={formData.yearEstablished}
                    onChange={handleChange}
                    className="gulf-input px-14"
                    placeholder={t('profile.year_placeholder')}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-black text-slate-700 uppercase tracking-widest px-1">{t('profile.employee_count')}</label>
                <div className="relative">
                  <Users className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="employeeCount"
                    value={formData.employeeCount}
                    onChange={handleChange}
                    className="gulf-input px-14"
                    placeholder={t('profile.employee_placeholder')}
                  />
                </div>
              </div>
              <div className="col-span-1 md:col-span-2 space-y-3">
                <label className="text-sm font-black text-slate-700 uppercase tracking-widest px-1">{t('profile.certifications')}</label>
                <input
                  type="text"
                  name="certifications"
                  value={formData.certifications}
                  onChange={handleChange}
                  className="gulf-input"
                  placeholder={t('profile.cert_placeholder')}
                />
              </div>
              <div className="col-span-1 md:col-span-2 space-y-3">
                <label className="text-sm font-black text-slate-700 uppercase tracking-widest px-1">{t('profile.core_capabilities')}</label>
                <input
                  type="text"
                  name="capabilities"
                  value={formData.capabilities}
                  onChange={handleChange}
                  className="gulf-input"
                  placeholder={t('profile.cap_placeholder')}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
