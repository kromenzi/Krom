'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { CheckCircle2, ArrowRight, FileText, Send, AlertCircle, Loader2, Sparkles, Wand2, ChevronRight, ChevronLeft, Info, Search, Factory, MessageSquare } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import FileUpload from '@/components/FileUpload';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { aiComposeMessage, getRFQRecommendations } from '@/lib/ai';

export default function NewRFQPage() {
  const { profile } = useAuth();
  const { t, dir } = useLanguage();
  const searchParams = useSearchParams();
  const initialSupplier = searchParams.get('supplier');
  const initialProduct = searchParams.get('product');

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [isFetchingRecommendations, setIsFetchingRecommendations] = useState(false);

  const [formData, setFormData] = useState({
    title: initialProduct || '',
    category: '',
    quantity: '',
    targetPrice: '',
    description: '',
    attachments: [] as string[],
    supplier: initialSupplier || '',
  });

  // Load draft from localStorage
  useEffect(() => {
    const savedDraft = localStorage.getItem('rfq_draft');
    if (savedDraft && !initialProduct && !initialSupplier) {
      try {
        setFormData(JSON.parse(savedDraft));
      } catch (e) {
        console.error('Failed to parse draft', e);
      }
    }
  }, [initialProduct, initialSupplier]);

  // Save draft to localStorage
  useEffect(() => {
    if (formData.title || formData.description) {
      localStorage.setItem('rfq_draft', JSON.stringify(formData));
    }
  }, [formData]);

  useEffect(() => {
    if (initialProduct) {
      setFormData(prev => ({ ...prev, title: initialProduct }));
    }
    if (initialSupplier) {
      setFormData(prev => ({ ...prev, supplier: initialSupplier }));
    }
  }, [initialProduct, initialSupplier]);

  // Fetch AI recommendations when title or category changes
  useEffect(() => {
    const fetchRecs = async () => {
      if (formData.title.length > 5 && showAISuggestions) {
        setIsFetchingRecommendations(true);
        try {
          const recs = await getRFQRecommendations(formData.title, formData.description);
          setAiRecommendations(recs);
        } catch (error) {
          console.error(error);
        } finally {
          setIsFetchingRecommendations(false);
        }
      }
    };
    const timer = setTimeout(fetchRecs, 1000);
    return () => clearTimeout(timer);
  }, [formData.title, formData.category, formData.description, showAISuggestions]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUploadComplete = (urls: string[]) => {
    setFormData({ ...formData, attachments: urls });
  };

  const handleAIWrite = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const result = await aiComposeMessage(
        `Write a detailed RFQ description for ${formData.title} in the ${formData.category} category. Include technical specs, quality standards, and shipping terms.`,
        formData.description
      );
      setFormData(prev => ({ ...prev, description: result }));
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
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
        factoryId: formData.supplier || 'general',
        title: formData.title,
        category: formData.category,
        quantity: Number(formData.quantity),
        targetPrice: formData.targetPrice ? Number(formData.targetPrice) : null,
        description: formData.description,
        status: 'pending',
        attachments: formData.attachments,
        createdAt: new Date().toISOString(),
      });
      localStorage.removeItem('rfq_draft');
      setIsSuccess(true);
    } catch (error) {
      console.error('Error submitting RFQ:', error);
      alert(t('rfq.submit_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]" dir={dir}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-[2.5rem] p-12 text-center shadow-2xl shadow-emerald-100 border border-emerald-50"
        >
          <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner rotate-3">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
            {t('rfq.success')}
          </h2>
          <p className="text-slate-500 mb-10 font-medium leading-relaxed text-lg">
            {t('rfq.success_desc')}
          </p>
          <Link
            href="/dashboard/rfqs"
            className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 block"
          >
            {t('rfq.view_my')}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20" dir={dir}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-emerald-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-emerald-200 rotate-6 transform transition-transform hover:rotate-12">
            <FileText className="w-10 h-10" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                {(t('rfq.step_1') || '').split(' ')[0]} {step}/3
              </span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
              {t('rfq.new_title')}
            </h1>
            <p className="text-slate-500 mt-2 text-xl font-medium max-w-xl leading-relaxed">
              {t('rfq.new_subtitle')}
            </p>
          </div>
        </div>

        {/* AI Assistant Toggle */}
        <button 
          onClick={() => setShowAISuggestions(!showAISuggestions)}
          className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-sm transition-all border shadow-sm ${showAISuggestions ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-indigo-600 border-indigo-100 hover:bg-indigo-50'}`}
        >
          <Sparkles className="w-5 h-5" />
          {t('rfq.ai_help')}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(step / 3) * 100}%` }}
          className="absolute top-0 left-0 h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="p-10">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Info className="w-5 h-5" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t('rfq.step_1')}</h3>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-black text-slate-700 mb-3 px-1 uppercase tracking-wider">
                          {t('rfq.product_name')} *
                        </label>
                        <div className="relative group">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
                          <input
                            type="text"
                            name="title"
                            required
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-lg font-bold focus:bg-white focus:border-emerald-500 outline-none transition-all shadow-inner"
                            placeholder="e.g. High-Grade Steel Pipes"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-black text-slate-700 mb-3 px-1 uppercase tracking-wider">
                          {t('rfq.category')} *
                        </label>
                        <select
                          name="category"
                          required
                          value={formData.category}
                          onChange={handleChange}
                          className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-lg font-bold focus:bg-white focus:border-emerald-500 outline-none transition-all shadow-inner appearance-none"
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
                        <label className="block text-sm font-black text-slate-700 mb-3 px-1 uppercase tracking-wider">
                          Target Supplier (Optional)
                        </label>
                        <div className="relative group">
                          <Factory className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
                          <input
                            type="text"
                            name="supplier"
                            value={formData.supplier}
                            onChange={handleChange}
                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-lg font-bold focus:bg-white focus:border-emerald-500 outline-none transition-all shadow-inner"
                            placeholder="Search for a specific factory..."
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Info className="w-5 h-5" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t('rfq.step_2')}</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-sm font-black text-slate-700 mb-3 px-1 uppercase tracking-wider">
                          {t('rfq.quantity')} *
                        </label>
                        <input
                          type="number"
                          name="quantity"
                          required
                          min="1"
                          value={formData.quantity}
                          onChange={handleChange}
                          className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-lg font-bold focus:bg-white focus:border-emerald-500 outline-none transition-all shadow-inner"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-black text-slate-700 mb-3 px-1 uppercase tracking-wider">
                          {t('rfq.target_price')}
                        </label>
                        <div className="relative">
                          <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400">$</span>
                          <input
                            type="number"
                            name="targetPrice"
                            min="0"
                            step="0.01"
                            value={formData.targetPrice}
                            onChange={handleChange}
                            className="w-full pl-10 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-lg font-bold focus:bg-white focus:border-emerald-500 outline-none transition-all shadow-inner"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <Info className="w-5 h-5" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t('rfq.step_3')}</h3>
                      </div>
                      <button 
                        type="button"
                        onClick={handleAIWrite}
                        disabled={isGenerating}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black hover:bg-indigo-100 transition-all border border-indigo-100"
                      >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                        {t('rfq.ai_write')}
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-black text-slate-700 mb-3 px-1 uppercase tracking-wider">
                          {t('rfq.description')} *
                        </label>
                        <textarea
                          name="description"
                          required
                          rows={6}
                          value={formData.description}
                          onChange={handleChange}
                          className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-lg font-bold focus:bg-white focus:border-emerald-500 outline-none transition-all shadow-inner resize-none"
                          placeholder="Describe your requirements in detail..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-black text-slate-700 mb-4 px-1 uppercase tracking-wider">
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-10 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 1}
                className="px-8 py-4 flex items-center gap-2 text-slate-500 font-black hover:text-slate-900 disabled:opacity-0 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
                {t('rfq.prev')}
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95"
                >
                  {t('rfq.next')}
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-12 py-4 bg-emerald-600 text-white rounded-2xl font-black flex items-center gap-3 shadow-lg shadow-emerald-200 hover:bg-emerald-700 disabled:opacity-50 transition-all active:scale-95"
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
              )}
            </div>
          </form>
        </div>

        {/* Sidebar / AI Suggestions */}
        <div className="space-y-8">
          <AnimatePresence>
            {showAISuggestions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black tracking-tight">{t('rfq.ai_help')}</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                    <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-2">Smart Recommendations</p>
                    {isFetchingRecommendations ? (
                      <div className="flex items-center gap-2 text-sm opacity-60">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing requirements...
                      </div>
                    ) : aiRecommendations.length > 0 ? (
                      <ul className="space-y-2">
                        {aiRecommendations.map((rec, i) => (
                          <li key={i} className="text-sm font-medium leading-relaxed flex gap-2">
                            <span className="text-emerald-400">•</span>
                            {rec}
                            <button 
                              onClick={() => setFormData(prev => ({ ...prev, description: prev.description + `\n- ${rec}` }))}
                              className="ml-auto text-[10px] underline opacity-60 hover:opacity-100"
                            >
                              Add
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm font-medium leading-relaxed opacity-60 italic">
                        Enter product details to see smart recommendations.
                      </p>
                    )}
                  </div>

                  <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                    <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-2">Supplier Suggestions</p>
                    <p className="text-sm font-medium leading-relaxed">
                      We found verified factories in Saudi Arabia that match your requirements.
                    </p>
                    <Link 
                      href={`/dashboard/factories?category=${formData.category}`}
                      className="mt-4 inline-block text-xs font-black underline underline-offset-4 hover:opacity-80"
                    >
                      View Suggestions
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Next Best Action
            </h3>
            <div className="space-y-4">
              {formData.supplier ? (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <p className="text-xs font-bold text-emerald-800 mb-1">Direct Communication</p>
                  <p className="text-sm text-emerald-700 mb-3">You have a target supplier. Why not chat with them first to clarify specs?</p>
                  <Link 
                    href={`/dashboard/messages?chat=new&with=${formData.supplier}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Chat with Supplier
                  </Link>
                </div>
              ) : (
                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <p className="text-xs font-bold text-indigo-800 mb-1">Broaden Search</p>
                  <p className="text-sm text-indigo-700 mb-3">Submit this RFQ to the general marketplace to get multiple competitive quotes.</p>
                  <button 
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition-all"
                  >
                    Complete Details
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <Info className="w-5 h-5 text-emerald-600" />
              Quick Tips
            </h3>
            <ul className="space-y-4">
              {[
                'Be specific about materials and dimensions.',
                'Upload technical drawings if available.',
                'Specify your preferred shipping terms (Incoterms).',
                'Mention if you need a sample first.'
              ].map((tip, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-500 font-medium leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
