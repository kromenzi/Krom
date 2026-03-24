'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { UploadCloud, CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
  const { profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    moq: '',
    price: '',
    description: '',
    hidePrice: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
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
        images: [],
        createdAt: new Date().toISOString(),
      });
      setIsSuccess(true);
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Product Added Successfully!</h2>
        <p className="text-slate-600 mb-8">
          Your product is now listed on the marketplace and visible to buyers.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => {
              setFormData({ name: '', category: '', moq: '', price: '', description: '', hidePrice: false });
              setIsSuccess(false);
            }}
            className="bg-white border border-slate-300 text-slate-700 py-2 px-6 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
          >
            Add Another
          </button>
          <Link
            href="/dashboard/products"
            className="bg-emerald-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
          >
            View Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/dashboard/products" className="text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add New Product</h1>
          <p className="text-slate-600 mt-1">List a new industrial product in your catalog.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Product Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="e.g., High-Grade Aluminum Sheets"
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
            <label htmlFor="moq" className="block text-sm font-medium text-slate-700 mb-1">Minimum Order Quantity (MOQ) *</label>
            <input
              type="number"
              id="moq"
              name="moq"
              required
              min="1"
              value={formData.moq}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="e.g., 100"
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-1">Base Price per Unit (USD) *</label>
            <input
              type="number"
              id="price"
              name="price"
              required={!formData.hidePrice}
              disabled={formData.hidePrice}
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-400"
              placeholder="e.g., 15.50"
            />
          </div>

          <div className="flex items-center mt-6">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                name="hidePrice"
                checked={formData.hidePrice}
                onChange={handleChange}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-5 h-5"
              />
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Hide price (Request Quote Only)</span>
            </label>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Product Description *</label>
            <textarea
              id="description"
              name="description"
              required
              rows={5}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
              placeholder="Describe the product features, materials, applications..."
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Product Images</label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer">
              <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-sm text-slate-600 font-medium">Click to upload or drag and drop</p>
              <p className="text-xs text-slate-500 mt-1">JPG, PNG up to 5MB</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 flex justify-end gap-4">
          <Link
            href="/dashboard/products"
            className="bg-white border border-slate-300 text-slate-700 py-3 px-6 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-emerald-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
