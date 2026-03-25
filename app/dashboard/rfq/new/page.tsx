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
      alert(t('rfq.submit_error'));
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
          className="max-w-md w-full gulf-card p-10 text-center"
        >
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">
            {t('rfq.success')}
          </h2>
          <p className="text-slate-500 mb-10 font-medium leading-relaxed text-lg">
            {t('rfq.success_desc')}
          </p>
          <Link
            href="/dashboard/rfqs"
            className="gulf-button-primary block w-full py-5 text-lg"
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

      <form onSubmit={handleSubmit} className="gulf-card overflow-hidden">
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="title" className="block text-sm font-bold text-slate-700 mb-3 px-1">
                {t('rfq.product_name')} *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="gulf-input"
                placeholder={t('rfq.title_placeholder')}
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-bold text-slate-700 mb-3 px-1">
                {t('rfq.category')} *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="gulf-input appearance-none"
              >
                <option value="">{t('rfq.select_category')}</option>
                <option value="Construction Materials">{t('rfq.category.construction')}</option>
                <option value="Petrochemicals">{t('rfq.category.petrochemicals')}</option>
                <option value="Machinery & Equipment">{t('rfq.category.machinery')}</option>
                <option value="Plastics & Packaging">{t('rfq.category.plastics')}</option>
                <option value="Metals & Alloys">{t('rfq.category.metals')}</option>
                <option value="Other">{t('rfq.category.other')}</option>
              </select>
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-bold text-slate-700 mb-3 px-1">
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
                className="gulf-input"
                placeholder={t('rfq.quantity_placeholder')}
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label htmlFor="targetPrice" className="block text-sm font-bold text-slate-700 mb-3 px-1">
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
                className="gulf-input"
                placeholder={t('rfq.price_placeholder')}
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label htmlFor="description" className="block text-sm font-bold text-slate-700 mb-3 px-1">
                {t('rfq.description')} *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={6}
                value={formData.description}
                onChange={handleChange}
                className="gulf-input resize-none"
                placeholder={t('rfq.desc_placeholder')}
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-4 px-1">
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

        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="gulf-button-primary px-12 py-4 flex items-center gap-3"
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
