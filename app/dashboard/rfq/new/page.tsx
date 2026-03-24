'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { CheckCircle2, ArrowRight, FileText, Send, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import FileUpload from '@/components/FileUpload';
import { motion } from 'motion/react';
import Link from 'next/link';

export default function NewRFQPage() {
  const { profile } = useAuth();
  const { t, dir } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    quantity: '',
    targetPrice: '',
    description: '',
    attachments: [] as string[],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUploadComplete = (urls: string[]) => {
    setFormData({ ...formData, attachments: urls });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSubmitting(true);
    try {
      const rfqRef = doc(collection(db, 'rfqs'));
      await setDoc(rfqRef, {
        id: rfqRef.id,
        buyerId: profile.uid,
        factoryId: 'general',
        title: formData.title,
        category: formData.category,
        quantity: Number(formData.quantity),
        targetPrice: formData.targetPrice ? Number(formData.targetPrice) : null,
        description: formData.description,
        status: 'pending',
        attachments: formData.attachments,
        createdAt: new Date().toISOString(),
      });
      setIsSuccess(true);
    } catch (error) {
      console.error('Error submitting RFQ:', error);
      alert('Failed to submit RFQ. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" dir={dir}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-10 text-center"
        >
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-4">
            {t('rfq.success')}
          </h2>
          <p className="text-slate-500 mb-10 font-medium leading-relaxed">
            {t('rfq.success_desc')}
          </p>
          <Link
            href="/dashboard/rfqs"
            className="block w-full bg-emerald-600 text-white py-4 px-6 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
          >
            {t('rfq.view_my')}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8" dir={dir}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-emerald-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-emerald-100 rotate-3">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              {t('rfq.new_title')}
            </h1>
            <p className="text-slate-500 mt-1 text-lg font-medium">
              {t('rfq.new_subtitle')}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="title" className="block text-sm font-bold text-slate-700 mb-2">
                {t('rfq.product_name')} *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all font-medium`}
                placeholder={dir === 'rtl' ? 'مثال: مواسير فولاذية صناعية' : "e.g., Industrial Grade Steel Pipes"}
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-bold text-slate-700 mb-2">
                {t('rfq.category')} *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all font-medium appearance-none`}
              >
                <option value="">{t('rfq.select_category')}</option>
                <option value="Construction Materials">{dir === 'rtl' ? 'مواد البناء' : 'Construction Materials'}</option>
                <option value="Petrochemicals">{dir === 'rtl' ? 'البتروكيماويات' : 'Petrochemicals'}</option>
                <option value="Machinery & Equipment">{dir === 'rtl' ? 'الآلات والمعدات' : 'Machinery & Equipment'}</option>
                <option value="Plastics & Packaging">{dir === 'rtl' ? 'البلاستيك والتغليف' : 'Plastics & Packaging'}</option>
                <option value="Metals & Alloys">{dir === 'rtl' ? 'المعادن والسبائك' : 'Metals & Alloys'}</option>
                <option value="Other">{dir === 'rtl' ? 'أخرى' : 'Other'}</option>
              </select>
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-bold text-slate-700 mb-2">
                {t('rfq.quantity')} *
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                required
                min="1"
                value={formData.quantity}
                onChange={handleChange}
                className={`w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all font-medium`}
                placeholder="e.g., 1000"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label htmlFor="targetPrice" className="block text-sm font-bold text-slate-700 mb-2">
                {t('rfq.target_price')}
              </label>
              <input
                type="number"
                id="targetPrice"
                name="targetPrice"
                min="0"
                step="0.01"
                value={formData.targetPrice}
                onChange={handleChange}
                className={`w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all font-medium`}
                placeholder="e.g., 50.00"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label htmlFor="description" className="block text-sm font-bold text-slate-700 mb-2">
                {t('rfq.description')} *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={6}
                value={formData.description}
                onChange={handleChange}
                className={`w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all font-medium resize-none`}
                placeholder={dir === 'rtl' ? 'صف مواصفات المنتج، المواد، الشهادات المطلوبة، الجدول الزمني للتسليم، إلخ.' : "Describe the product specifications, materials, certifications required, delivery timeline, etc."}
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-4">
                {t('rfq.attachments')}
              </label>
              <FileUpload 
                onUploadComplete={handleUploadComplete}
                maxFiles={5}
                folder="rfq-attachments"
                label={t('rfq.attachments')}
              />
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-emerald-600 text-white py-4 px-10 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-3"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('rfq.submitting')}
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                {t('rfq.submit')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
