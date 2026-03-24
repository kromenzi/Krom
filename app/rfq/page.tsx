'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { UploadCloud, CheckCircle2, ArrowRight } from 'lucide-react';

export default function RFQPage() {
  const { profile, signInWithGoogle } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    quantity: '',
    targetPrice: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        factoryId: 'general', // General RFQ to be routed
        title: formData.title,
        category: formData.category,
        quantity: Number(formData.quantity),
        targetPrice: formData.targetPrice ? Number(formData.targetPrice) : null,
        description: formData.description,
        status: 'pending',
        attachments: [],
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
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">RFQ Submitted Successfully!</h2>
            <p className="text-slate-600 mb-8">
              Your Request for Quotation has been sent to our network of verified factories. You will be notified when quotes start arriving.
            </p>
            <button
              onClick={() => window.location.href = '/dashboard/rfqs'}
              className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              View My RFQs
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Submit Request for Quotation (RFQ)</h1>
            <p className="text-slate-600 mt-2">Provide detailed requirements to get accurate quotes from certified Gulf factories.</p>
          </div>

          {!profile ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Sign in to submit an RFQ</h2>
              <p className="text-slate-600 mb-6">You need a buyer account to request quotes and communicate with factories.</p>
              <button
                onClick={() => signInWithGoogle('buyer')}
                className="inline-flex items-center gap-2 bg-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
              >
                Sign In with Google
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Product Name / RFQ Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="e.g., Industrial Grade Steel Pipes"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                  <select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
                  >
                    <option value="">Select a category</option>
                    <option value="Construction Materials">Construction Materials</option>
                    <option value="Petrochemicals">Petrochemicals</option>
                    <option value="Machinery & Equipment">Machinery & Equipment</option>
                    <option value="Plastics & Packaging">Plastics & Packaging</option>
                    <option value="Metals & Alloys">Metals & Alloys</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 mb-1">Required Quantity *</label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    required
                    min="1"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="e.g., 1000"
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label htmlFor="targetPrice" className="block text-sm font-medium text-slate-700 mb-1">Target Price per Unit (USD) - Optional</label>
                  <input
                    type="number"
                    id="targetPrice"
                    name="targetPrice"
                    min="0"
                    step="0.01"
                    value={formData.targetPrice}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="e.g., 50.00"
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Detailed Specifications & Requirements *</label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={5}
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                    placeholder="Describe the product specifications, materials, certifications required, delivery timeline, etc."
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Attachments (Drawings, Specs, Images)</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                    <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm text-slate-600 font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG up to 10MB</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit RFQ'}
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
