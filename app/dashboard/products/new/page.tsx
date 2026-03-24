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
      alert("Please enter a product name first.");
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
        className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 p-12 text-center"
        dir={dir}
      >
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">{t('product.success_title') || 'Product Added Successfully!'}</h2>
        <p className="text-slate-500 mb-10 text-lg leading-relaxed">
          {t('product.success_desc') || 'Your product is now listed on the marketplace and visible to buyers worldwide.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => {
              setFormData({ name: '', category: '', moq: '', price: '', description: '', hidePrice: false, images: [] });
              setIsSuccess(false);
            }}
            className="px-8 py-3.5 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all"
          >
            {t('product.add_another') || 'Add Another'}
          </button>
          <Link
            href="/dashboard/products"
            className="px-8 py-3.5 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
          >
            {t('product.view_catalog') || 'View Catalog'}
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12" dir={dir}>
      <div className="flex items-center gap-4">
        <Link href="/dashboard/products" className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-900 transition-all shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t('product.add_new')}</h1>
          <p className="text-slate-500 mt-1">{t('product.add_subtitle') || 'List a new industrial product in your catalog.'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Info */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-600" />
              {t('profile.basic_info')}
            </h3>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">{t('product.name')} *</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    placeholder="e.g., High-Grade Aluminum Sheets"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">{t('product.category')} *</label>
                  <div className="relative">
                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none"
                    >
                      <option value="">{t('product.select_category') || 'Select a category'}</option>
                      <option value="Construction Materials">Construction Materials</option>
                      <option value="Petrochemicals">Petrochemicals</option>
                      <option value="Machinery & Equipment">Machinery & Equipment</option>
                      <option value="Plastics & Packaging">Plastics & Packaging</option>
                      <option value="Metals & Alloys">Metals & Alloys</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">{t('product.moq')} *</label>
                  <input
                    type="number"
                    name="moq"
                    required
                    min="1"
                    value={formData.moq}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    placeholder="e.g., 100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700">{t('product.description')} *</label>
                  <button
                    type="button"
                    onClick={generateDescription}
                    disabled={isGenerating || !formData.name}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 disabled:opacity-50 transition-colors"
                  >
                    {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    {isGenerating ? 'Generating...' : 'Generate with AI'}
                  </button>
                </div>
                <div className="relative">
                  <FileText className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                  <textarea
                    name="description"
                    required
                    rows={6}
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                    placeholder="Describe the product features, materials, applications..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Media Upload */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-emerald-600" />
              {t('product.media') || 'Product Media'}
            </h3>
            <p className="text-sm text-slate-500">{t('product.media_desc') || 'Upload high-quality images and videos to showcase your product.'}</p>
            <FileUpload 
              onUploadComplete={handleUploadComplete}
              folder={`products/${profile?.uid}`}
              maxFiles={8}
              label={t('product.upload_label') || "Upload product images and videos"}
            />
          </div>
        </div>

        <div className="space-y-8">
          {/* Pricing Card */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              {t('product.pricing') || 'Pricing'}
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">{t('product.price')} (USD) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    name="price"
                    required={!formData.hidePrice}
                    disabled={formData.hidePrice}
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-50"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer group hover:bg-slate-100 transition-all">
                <input
                  type="checkbox"
                  name="hidePrice"
                  checked={formData.hidePrice}
                  onChange={handleChange}
                  className="rounded-lg border-slate-300 text-emerald-600 focus:ring-emerald-500 w-5 h-5"
                />
                <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">
                  {t('product.hide_price') || 'Hide price (Request Quote Only)'}
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isSubmitting ? t('common.loading') : t('product.save')}
            </button>
            <Link
              href="/dashboard/products"
              className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all text-center"
            >
              {t('common.cancel')}
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
