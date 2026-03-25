'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { db, storage } from '@/lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { UploadCloud, CheckCircle2, ArrowRight, X } from 'lucide-react';

export default function RFQPage() {
  const { profile, signInWithGoogle } = useAuth();
  const { t, dir } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    quantity: '',
    targetPrice: '',
    description: '',
  });
  const [file, setFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSubmitting(true);
    try {
      let attachmentUrl = '';
      if (file) {
        const storageRef = ref(storage, `rfq_attachments/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        attachmentUrl = await getDownloadURL(storageRef);
      }

      const rfqRef = doc(collection(db, 'rfqs'));
      await setDoc(rfqRef, {
        id: rfqRef.id,
        buyerId: profile.uid,
        factoryId: 'general', // General RFQ to be routed
        title: formData.title,
        category: formData.category,
        quantity: Number(formData.quantity),
        targetPrice: formData.targetPrice ? Number(formData.targetPrice) : null,
        description: formData.description,
        status: 'pending',
        attachments: attachmentUrl ? [attachmentUrl] : [],
        createdAt: new Date().toISOString(),
      });
      setIsSuccess(true);
    } catch (error) {
      console.error('Error submitting RFQ:', error);
      alert(t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50" dir={dir}>
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('rfq.success')}</h2>
            <p className="text-slate-600 mb-8">
              {t('rfq.success_desc')}
            </p>
            <button
              onClick={() => window.location.href = '/dashboard/rfqs'}
              className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              {t('rfq.view_my')}
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50" dir={dir}>
      <Navbar />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">{t('rfq.new_title')}</h1>
            <p className="text-slate-600 mt-2">{t('rfq.new_subtitle')}</p>
          </div>

          {!profile ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
              <h2 className="text-xl font-bold text-slate-900 mb-4">{t('dashboard.signin_required')}</h2>
              <p className="text-slate-600 mb-6">{t('rfq.new_subtitle')}</p>
              <button
                onClick={() => signInWithGoogle('buyer')}
                className="inline-flex items-center gap-2 bg-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
              >
                {t('nav.login')}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">{t('rfq.product_name')} *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder={t('rfq.title_placeholder')}
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">{t('rfq.category')} *</label>
                  <select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
                  >
                    <option value="">{t('product.select_category')}</option>
                    <option value="Construction Materials">{t('rfq.category.construction')}</option>
                    <option value="Petrochemicals">{t('rfq.category.petrochemicals')}</option>
                    <option value="Machinery & Equipment">{t('rfq.category.machinery')}</option>
                    <option value="Plastics & Packaging">{t('rfq.category.plastics')}</option>
                    <option value="Metals & Alloys">{t('rfq.category.metals')}</option>
                    <option value="Other">{t('rfq.category.other')}</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 mb-1">{t('rfq.quantity')} *</label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    required
                    min="1"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder={t('rfq.quantity_placeholder')}
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label htmlFor="targetPrice" className="block text-sm font-medium text-slate-700 mb-1">{t('rfq.target_price')}</label>
                  <input
                    type="number"
                    id="targetPrice"
                    name="targetPrice"
                    min="0"
                    step="0.01"
                    value={formData.targetPrice}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder={t('rfq.price_placeholder')}
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">{t('rfq.description')} *</label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={5}
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                    placeholder={t('rfq.desc_placeholder')}
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t('rfq.attachments')}</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {file ? (
                      <div className="flex items-center justify-center gap-2 text-emerald-600 font-medium">
                        <CheckCircle2 className="w-6 h-6" />
                        {file.name}
                        <button type="button" onClick={() => setFile(null)} className="text-slate-400 hover:text-red-500">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                        <p className="text-sm text-slate-600 font-medium">{t('product.upload_label')}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? t('rfq.submitting') : t('rfq.submit')}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
