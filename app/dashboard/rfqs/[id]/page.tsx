'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, addDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { ArrowLeft, CheckCircle2, Clock, FileText, Building2, User, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function RFQDetails() {
  const { id } = useParams();
  const { profile } = useAuth();
  const { t, dir } = useLanguage();
  const [rfq, setRfq] = useState<any>(null);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const [quoteForm, setQuoteForm] = useState({ price: '', leadTime: '', notes: '' });

  useEffect(() => {
    const fetchRFQDetails = async () => {
      if (!profile || !id) return;
      try {
        const rfqDoc = await getDoc(doc(db, 'rfqs', id as string));
        if (rfqDoc.exists()) {
          setRfq({ id: rfqDoc.id, ...rfqDoc.data() });
          
          // Fetch quotes for this RFQ
          const quotesQuery = query(collection(db, 'quotes'), where('rfqId', '==', id));
          const quotesSnapshot = await getDocs(quotesQuery);
          const quotesData = quotesSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          setQuotes(quotesData);
        }
      } catch (error) {
        console.error('Error fetching RFQ:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRFQDetails();
  }, [id, profile]);

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !rfq) return;

    setIsSubmittingQuote(true);
    try {
      const quoteRef = await addDoc(collection(db, 'quotes'), {
        rfqId: rfq.id,
        factoryId: profile.uid,
        buyerId: rfq.buyerId,
        price: Number(quoteForm.price),
        leadTime: quoteForm.leadTime,
        notes: quoteForm.notes,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      // Update RFQ status
      await updateDoc(doc(db, 'rfqs', rfq.id), { status: 'quoted' });

      setQuotes([...quotes, {
        id: quoteRef.id,
        rfqId: rfq.id,
        factoryId: profile.uid,
        buyerId: rfq.buyerId,
        price: Number(quoteForm.price),
        leadTime: quoteForm.leadTime,
        notes: quoteForm.notes,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }]);
      
      setRfq({ ...rfq, status: 'quoted' });
      setQuoteForm({ price: '', leadTime: '', notes: '' });
      alert(t('rfq.quote_success'));
    } catch (error) {
      console.error('Error submitting quote:', error);
      alert(t('rfq.quote_error'));
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  const handleQuoteAction = async (quoteId: string, action: 'accepted' | 'rejected') => {
    if (!confirm(t('rfq.confirm_action', { action: t(`common.${action}`) }))) return;
    try {
      await updateDoc(doc(db, 'quotes', quoteId), { status: action });
      
      if (action === 'accepted') {
        await updateDoc(doc(db, 'rfqs', rfq.id), { status: 'accepted' });
        setRfq({ ...rfq, status: 'accepted' });
      }
      
      setQuotes(quotes.map(q => q.id === quoteId ? { ...q, status: action } : q));
    } catch (error) {
      console.error(`Error ${action} quote:`, error);
      alert(t('rfq.action_error', { action: t(`common.${action}`) }));
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center" dir={dir}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
      </div>
    );
  }

  if (!rfq || !profile) {
    return (
      <div className="text-center py-12" dir={dir}>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('rfq.not_found')}</h2>
        <Link href="/dashboard/rfqs" className="text-emerald-600 hover:text-emerald-700 font-medium">
          &larr; {t('rfq.back_to_rfqs')}
        </Link>
      </div>
    );
  }

  const isFactory = profile.role === 'factory' || profile.role === 'admin';
  const hasQuoted = quotes.some(q => q.factoryId === profile.uid);

  return (
    <div className="max-w-5xl mx-auto space-y-8" dir={dir}>
      <div className="flex items-center gap-6 mb-8">
        <Link href="/dashboard/rfqs" className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-200 hover:shadow-lg transition-all">
          <ArrowLeft className="w-6 h-6 rtl:rotate-180" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('rfq.details')}</h1>
          <p className="text-slate-500 mt-1 font-mono text-xs uppercase tracking-widest">ID: {rfq.id}</p>
        </div>
      </div>

      <div className="gulf-card overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start gap-6 bg-slate-50/30">
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 leading-tight">{rfq.title}</h2>
            <div className="flex flex-wrap gap-6 text-sm font-bold text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm"><FileText className="w-4 h-4 text-emerald-600" /> {t(`cat.${rfq.category.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_')}`) || rfq.category}</span>
              <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm"><Clock className="w-4 h-4 text-emerald-600" /> {new Date(rfq.createdAt).toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US')}</span>
              {isFactory ? (
                <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm"><User className="w-4 h-4 text-emerald-600" /> {t('rfq.buyer')}: {rfq.buyerId.substring(0, 8)}</span>
              ) : (
                <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm"><Building2 className="w-4 h-4 text-emerald-600" /> {t('rfq.factory')}: {rfq.factoryId === 'general' ? t('common.general') : rfq.factoryId.substring(0, 8)}</span>
              )}
            </div>
          </div>
          <div>
            <span className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest border shadow-sm ${
              rfq.status === 'accepted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              rfq.status === 'quoted' ? 'bg-blue-50 text-blue-700 border-blue-200' :
              rfq.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
              'bg-red-50 text-red-700 border-red-200'
            }`}>
              {rfq.status === 'accepted' ? <CheckCircle2 className="w-4 h-4" /> : 
               rfq.status === 'pending' ? <Clock className="w-4 h-4" /> : 
               rfq.status === 'quoted' ? <AlertCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {t(`rfq.${rfq.status}`)}
            </span>
          </div>
        </div>
        
        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{t('rfq.requirements')}</h3>
              <div className="bg-slate-50/50 rounded-3xl p-8 border border-slate-100/50">
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed font-medium text-lg">{rfq.description}</p>
              </div>
            </div>

            {rfq.attachments && rfq.attachments.length > 0 && (
              <div>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{t('rfq.attachments')}</h3>
                <div className="flex flex-wrap gap-4">
                  {rfq.attachments.map((url: string, index: number) => (
                    <a 
                      key={index} 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:text-emerald-600 hover:border-emerald-200 hover:shadow-md transition-all"
                    >
                      <FileText className="w-5 h-5 text-emerald-600" />
                      {t('rfq.attachment')} {index + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16"></div>
              <h3 className="text-sm font-black text-emerald-400 uppercase tracking-widest mb-6">{t('rfq.summary')}</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{t('rfq.quantity_required')}</p>
                  <p className="font-black text-xl text-white">{rfq.quantity} <span className="text-xs text-slate-500 font-bold">{t('rfq.units')}</span></p>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{t('rfq.target_price')}</p>
                  <p className="font-black text-xl text-white">{rfq.targetPrice ? `$${rfq.targetPrice}` : t('rfq.not_specified')}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{t('rfq.current_status')}</p>
                  <p className="font-black text-sm text-emerald-400 uppercase tracking-widest">{t(`rfq.${rfq.status}`)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quotes Section */}
      <div className="mt-12 space-y-6">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase tracking-widest flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-emerald-600" />
          {t('rfq.quotations_received')}
        </h2>
        
        {quotes.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {quotes.map(quote => (
              <div key={quote.id} className={`gulf-card overflow-hidden transition-all hover:shadow-2xl ${quote.status === 'accepted' ? 'ring-2 ring-emerald-500' : ''}`}>
                <div className="p-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                        <Building2 className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-lg uppercase tracking-widest">{t('rfq.quote_from_factory')} {quote.factoryId.substring(0, 8)}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{new Date(quote.createdAt).toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US')}</p>
                      </div>
                    </div>
                    <div className="bg-emerald-50 px-6 py-4 rounded-3xl border border-emerald-100 text-center min-w-[140px] shadow-inner">
                      <p className="text-3xl font-black text-emerald-600">${quote.price}</p>
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">{t('rfq.per_unit')}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('rfq.lead_time')}</p>
                      <p className="font-bold text-slate-900 text-lg">{quote.leadTime || t('rfq.not_specified')}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('common.status')}</p>
                      <p className={`font-black text-lg uppercase tracking-widest ${
                        quote.status === 'accepted' ? 'text-emerald-600' :
                        quote.status === 'rejected' ? 'text-red-600' : 'text-amber-600'
                      }`}>{t(`rfq.${quote.status}`)}</p>
                    </div>
                    <div className="md:col-span-3 space-y-2 bg-slate-50/50 p-6 rounded-2xl border border-slate-100/50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('rfq.additional_notes')}</p>
                      <p className="text-slate-700 font-medium leading-relaxed">{quote.notes || t('rfq.no_notes')}</p>
                    </div>
                  </div>

                  {!isFactory && quote.status === 'pending' && rfq.status !== 'accepted' && (
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100">
                      <button onClick={() => handleQuoteAction(quote.id, 'accepted')} className="gulf-button-primary flex-1 py-4 flex items-center justify-center gap-3">
                        <CheckCircle2 className="w-5 h-5" /> {t('rfq.accept_quote')}
                      </button>
                      <button onClick={() => handleQuoteAction(quote.id, 'rejected')} className="flex-1 bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3">
                        <XCircle className="w-5 h-5" /> {t('rfq.reject')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="gulf-card p-16 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
              <FileText className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">{t('rfq.no_quotes')}</h3>
            <p className="text-slate-500 font-medium">{t('rfq.no_quotes_desc')}</p>
          </div>
        )}

        {/* Submit Quote Form (For Factories) */}
        {isFactory && !hasQuoted && rfq.status !== 'accepted' && rfq.status !== 'cancelled' && (
          <div className="gulf-card p-8 mt-12">
            <h3 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-widest">{t('rfq.submit_quote')}</h3>
            <form onSubmit={handleQuoteSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-sm font-black text-slate-700 uppercase tracking-widest px-1">{t('rfq.price_per_unit')}</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={quoteForm.price}
                    onChange={e => setQuoteForm({...quoteForm, price: e.target.value})}
                    className="gulf-input"
                    placeholder={t('rfq.price_placeholder')}
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-black text-slate-700 uppercase tracking-widest px-1">{t('rfq.estimated_lead_time')}</label>
                  <input
                    type="text"
                    required
                    value={quoteForm.leadTime}
                    onChange={e => setQuoteForm({...quoteForm, leadTime: e.target.value})}
                    className="gulf-input"
                    placeholder={t('rfq.lead_time_placeholder')}
                  />
                </div>
                <div className="col-span-1 md:col-span-2 space-y-3">
                  <label className="block text-sm font-black text-slate-700 uppercase tracking-widest px-1">{t('rfq.additional_notes')}</label>
                  <textarea
                    rows={4}
                    value={quoteForm.notes}
                    onChange={e => setQuoteForm({...quoteForm, notes: e.target.value})}
                    className="gulf-input resize-none"
                    placeholder={t('rfq.notes_placeholder')}
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isSubmittingQuote}
                  className="gulf-button-primary px-12 py-4 flex items-center gap-3"
                >
                  {isSubmittingQuote ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('rfq.submitting')}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      {t('rfq.submit_quote')}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
