'use client';

import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, addDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { ArrowLeft, CheckCircle2, Clock, FileText, Building2, User, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function RFQDetails() {
  const { id } = useParams();
  const { profile } = useAuth();
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
      alert('Quote submitted successfully!');
    } catch (error) {
      console.error('Error submitting quote:', error);
      alert('Failed to submit quote.');
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  const handleQuoteAction = async (quoteId: string, action: 'accepted' | 'rejected') => {
    if (!confirm(`Are you sure you want to ${action} this quote?`)) return;
    try {
      await updateDoc(doc(db, 'quotes', quoteId), { status: action });
      
      if (action === 'accepted') {
        await updateDoc(doc(db, 'rfqs', rfq.id), { status: 'accepted' });
        setRfq({ ...rfq, status: 'accepted' });
      }
      
      setQuotes(quotes.map(q => q.id === quoteId ? { ...q, status: action } : q));
    } catch (error) {
      console.error(`Error ${action} quote:`, error);
      alert(`Failed to ${action} quote.`);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
      </div>
    );
  }

  if (!rfq || !profile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">RFQ Not Found</h2>
        <Link href="/dashboard/rfqs" className="text-emerald-600 hover:text-emerald-700 font-medium">
          &larr; Back to RFQs
        </Link>
      </div>
    );
  }

  const isFactory = profile.role === 'factory' || profile.role === 'admin';
  const hasQuoted = quotes.some(q => q.factoryId === profile.uid);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/rfqs" className="text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">RFQ Details</h1>
          <p className="text-slate-600 mt-1">ID: {rfq.id}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">{rfq.title}</h2>
            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
              <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> {rfq.category}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(rfq.createdAt).toLocaleDateString()}</span>
              {isFactory ? (
                <span className="flex items-center gap-1"><User className="w-4 h-4" /> Buyer ID: {rfq.buyerId.substring(0, 8)}</span>
              ) : (
                <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> Factory ID: {rfq.factoryId === 'general' ? 'Multiple' : rfq.factoryId.substring(0, 8)}</span>
              )}
            </div>
          </div>
          <div>
            <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold border ${
              rfq.status === 'accepted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              rfq.status === 'quoted' ? 'bg-blue-50 text-blue-700 border-blue-200' :
              rfq.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
              'bg-red-50 text-red-700 border-red-200'
            }`}>
              {rfq.status.toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Requirements</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Quantity Required</p>
                <p className="font-semibold text-slate-900">{rfq.quantity} units</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Target Price (Optional)</p>
                <p className="font-semibold text-slate-900">{rfq.targetPrice ? `$${rfq.targetPrice} / unit` : 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Detailed Description</p>
                <p className="text-slate-700 whitespace-pre-wrap">{rfq.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quotes Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Quotations</h2>
        
        {quotes.length > 0 ? (
          <div className="space-y-4">
            {quotes.map(quote => (
              <div key={quote.id} className={`bg-white rounded-xl shadow-sm border p-6 ${quote.status === 'accepted' ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-200'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900">Quote from Factory {quote.factoryId.substring(0, 8)}</h3>
                    <p className="text-sm text-slate-500">{new Date(quote.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">${quote.price}</p>
                    <p className="text-sm text-slate-500">per unit</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                    <p className="text-slate-500">Lead Time</p>
                    <p className="font-medium text-slate-900">{quote.leadTime || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Status</p>
                    <p className={`font-medium ${
                      quote.status === 'accepted' ? 'text-emerald-600' :
                      quote.status === 'rejected' ? 'text-red-600' : 'text-amber-600'
                    }`}>{quote.status.toUpperCase()}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-slate-500">Notes</p>
                    <p className="text-slate-700">{quote.notes || 'No additional notes.'}</p>
                  </div>
                </div>

                {!isFactory && quote.status === 'pending' && rfq.status !== 'accepted' && (
                  <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button onClick={() => handleQuoteAction(quote.id, 'accepted')} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Accept Quote
                    </button>
                    <button onClick={() => handleQuoteAction(quote.id, 'rejected')} className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
            No quotes received yet.
          </div>
        )}

        {/* Submit Quote Form (For Factories) */}
        {isFactory && !hasQuoted && rfq.status !== 'accepted' && rfq.status !== 'cancelled' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Submit a Quote</h3>
            <form onSubmit={handleQuoteSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price per Unit (USD) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={quoteForm.price}
                    onChange={e => setQuoteForm({...quoteForm, price: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="e.g., 45.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Lead Time *</label>
                  <input
                    type="text"
                    required
                    value={quoteForm.leadTime}
                    onChange={e => setQuoteForm({...quoteForm, leadTime: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="e.g., 14-21 days"
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Additional Notes</label>
                  <textarea
                    rows={3}
                    value={quoteForm.notes}
                    onChange={e => setQuoteForm({...quoteForm, notes: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                    placeholder="Include shipping terms, validity of quote, etc."
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isSubmittingQuote}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-6 rounded-lg font-semibold transition-colors disabled:opacity-70"
                >
                  {isSubmittingQuote ? 'Submitting...' : 'Submit Quote'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
