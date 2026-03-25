'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { UploadCloud, CheckCircle2, ArrowLeft, Loader2, Package, Tag, DollarSign, FileText, Layers, Save, Sparkles } from 'lucide-react';
import Link from 'next/link';
import FileUpload from '@/components/FileUpload';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

export default function NewProductPage() {
  const { profile } = useAuth();
  const { t, dir } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    moq: '',
    price: '',
    description: '',
    hidePrice: false,
    images: [] as string[],
  });

  const generateDescription = async () => {
    if (!formData.name) {
      alert(t('product.enter_name_alert'));
      return;
    }
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: `Generate a professional, detailed B2B product description for a product named "${formData.name}" in the category "${formData.category}". Focus on technical specifications, quality standards, and benefits for industrial buyers. Language: ${dir === 'rtl' ? 'Arabic' : 'English'}.` }] }]
      });
      setFormData(prev => ({ ...prev, description: response.text || '' }));
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleUploadComplete = (urls: string[]) => {
    setFormData({ ...formData, images: urls });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSubmitting(true);
    try {
      const productRef = doc(collection(db, 'products'));
      await setDoc(productRef, {
        id: productRef.id,
        factoryId: profile.uid,
        name: formData.name,
        category: formData.category,
        moq: Number(formData.moq),
        pricingTiers: [{ minQty: Number(formData.moq), price: Number(formData.price) }],
        description: formData.description,
        hidePrice: formData.hidePrice,
        images: formData.images,
        createdAt: new Date().toISOString(),
      });
      setIsSuccess(true);
    } catch (error) {
      console.error('Error adding product:', error);
      alert(t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto gulf-card p-16 text-center"
        dir={dir}
      >
        <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-inner border border-emerald-100/50">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight leading-tight">{t('product.success_title')}</h2>
        <p className="text-slate-500 mb-12 text-lg font-medium leading-relaxed max-w-md mx-auto">
          {t('product.success_desc')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => {
              setFormData({ name: '', category: '', moq: '', price: '', description: '', hidePrice: false, images: [] });
              setIsSuccess(false);
            }}
            className="px-10 py-4 bg-slate-100 text-slate-700 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-200 transition-all"
          >
            {t('product.add_another')}
          </button>
          <Link
            href="/dashboard/products"
            className="gulf-button-primary px-10 py-4"
          >
            {t('product.view_catalog')}
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16" dir={dir}>
      <div className="flex items-center gap-6">
        <Link href="/dashboard/products" className="w-12 h-12 bg-white border border-slate-200 rounded-2xl text-slate-500 flex items-center justify-center hover:text-emerald-600 hover:border-emerald-200 hover:shadow-lg transition-all">
          <ArrowLeft className={`w-6 h-6 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase tracking-widest">{t('product.add_new')}</h1>
          <p className="text-slate-500 mt-2 font-medium">{t('product.add_subtitle')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Basic Info */}
          <div className="gulf-card p-10 space-y-10">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-widest">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-emerald-600" />
              </div>
              {t('profile.basic_info')}
            </h3>
            
            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-black text-slate-700 uppercase tracking-widest px-1">{t('product.name')} *</label>
                <div className="relative">
                  <Tag className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="gulf-input"
                    placeholder={t('product.name_placeholder')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-black text-slate-700 uppercase tracking-widest px-1">{t('product.category')} *</label>
                  <div className="relative">
                    <Layers className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <select
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleChange}
                      className="gulf-input appearance-none"
                    >
                      <option value="">{t('product.select_category')}</option>
                      <option value="Construction Materials">{t('cat.construction')}</option>
                      <option value="Petrochemicals">{t('cat.petrochemicals')}</option>
                      <option value="Machinery & Equipment">{t('cat.machinery')}</option>
                      <option value="Plastics & Packaging">{t('cat.plastics')}</option>
                      <option value="Metals & Alloys">{t('cat.metals')}</option>
                      <option value="Other">{t('rfq.category.other')}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-black text-slate-700 uppercase tracking-widest px-1">{t('product.moq')} *</label>
                  <input
                    type="number"
                    name="moq"
                    required
                    min="1"
                    value={formData.moq}
                    onChange={handleChange}
                    className="gulf-input"
                    placeholder={t('product.moq_placeholder')}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <label className="text-sm font-black text-slate-700 uppercase tracking-widest">{t('product.description')} *</label>
                  <button
                    type="button"
                    onClick={generateDescription}
                    disabled={isGenerating || !formData.name}
                    className="flex items-center gap-2 text-[10px] font-black text-emerald-600 hover:text-emerald-700 disabled:opacity-50 transition-colors uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100"
                  >
                    {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    {isGenerating ? t('product.generating') : t('product.generate_ai')}
                  </button>
                </div>
                <div className="relative">
                  <FileText className="absolute inset-inline-start-5 top-6 w-5 h-5 text-slate-400" />
                  <textarea
                    name="description"
                    required
                    rows={8}
                    value={formData.description}
                    onChange={handleChange}
                    className="gulf-input resize-none"
                    placeholder={t('product.desc_placeholder')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Media Upload */}
          <div className="gulf-card p-10 space-y-8">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-widest">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <UploadCloud className="w-5 h-5 text-emerald-600" />
              </div>
              {t('product.media')}
            </h3>
            <p className="text-sm text-slate-500 font-medium">{t('product.media_desc')}</p>
            <div className="bg-slate-50/50 p-8 rounded-3xl border-2 border-dashed border-slate-200 hover:border-emerald-300 transition-all">
              <FileUpload 
                onUploadComplete={handleUploadComplete}
                folder={`products/${profile?.uid}`}
                maxFiles={8}
                label={t('product.upload_label')}
              />
            </div>
          </div>
        </div>

        <div className="space-y-10">
          {/* Pricing Card */}
          <div className="gulf-card p-10 space-y-8">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-widest">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              {t('product.pricing')}
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-black text-slate-700 uppercase tracking-widest px-1">{t('product.price')} (USD) *</label>
                <div className="relative">
                  <DollarSign className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    name="price"
                    required={!formData.hidePrice}
                    disabled={formData.hidePrice}
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    className="gulf-input"
                    placeholder={t('product.price_placeholder')}
                  />
                </div>
              </div>

              <label className="flex items-center gap-4 p-6 rounded-3xl bg-slate-50 border-2 border-slate-100 cursor-pointer group hover:bg-white hover:border-emerald-200 transition-all shadow-sm">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    name="hidePrice"
                    checked={formData.hidePrice}
                    onChange={handleChange}
                    className="rounded-lg border-slate-300 text-emerald-600 focus:ring-emerald-500 w-6 h-6 cursor-pointer"
                  />
                </div>
                <span className="text-sm font-black text-slate-700 group-hover:text-emerald-700 uppercase tracking-widest">
                  {t('product.hide_price')}
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="gulf-button-primary w-full py-5 flex items-center justify-center gap-3"
            >
              {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
              {isSubmitting ? t('common.loading') : t('product.save')}
            </button>
            <Link
              href="/dashboard/products"
              className="w-full py-5 bg-white border-2 border-slate-100 text-slate-600 rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-slate-50 hover:border-slate-200 transition-all text-center shadow-sm"
            >
              {t('common.cancel')}
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
