'use client';

import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { Package, Plus, Edit, Trash2, Search, Loader2, Filter, MoreVertical, ExternalLink, TrendingUp, Eye, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

export default function ProductsDashboard() {
  const { profile } = useAuth();
  const { t, dir } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      if (!profile) return;
      try {
        const q = query(collection(db, 'products'), where('factoryId', '==', profile.uid));
        const querySnapshot = await getDocs(q);
        const productData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productData);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [profile]);

  const handleDelete = async (id: string) => {
    if (window.confirm(t('common.confirm_delete'))) {
      try {
        await deleteDoc(doc(db, 'products', id));
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!profile) return null;

  const stats = [
    { label: t('product.total_products'), value: products.length, icon: Package, color: 'bg-blue-50 text-blue-600' },
    { label: t('product.product_views'), value: '1.2k', icon: Eye, color: 'bg-emerald-50 text-emerald-600' },
    { label: t('product.active_inquiries'), value: '24', icon: MessageSquare, color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="space-y-8 pb-12" dir={dir}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('nav.products')}</h1>
          <p className="text-slate-500 mt-2 font-medium">{t('product.subtitle')}</p>
        </div>
        <Link 
          href="/dashboard/products/new" 
          className="gulf-button-primary px-8 py-4 flex items-center gap-3 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          {t('product.add_new')}
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i}
            className="gulf-card p-8 flex items-center gap-6 group hover:scale-[1.02] transition-all"
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 ${stat.color}`}>
              <stat.icon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Table Section */}
      <div className="gulf-card overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-6 bg-slate-50/30">
          <div className="relative w-full max-w-md">
            <Search className={`absolute ${dir === 'rtl' ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5`} />
            <input 
              type="text" 
              placeholder={t('common.search')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="gulf-input"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-2xl border-2 border-slate-100 bg-white text-slate-600 text-sm font-black uppercase tracking-widest hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm">
              <Filter className="w-4 h-4" />
              {t('common.filter')}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-24 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto" />
            <p className="mt-4 text-slate-500 font-bold">{t('product.loading')}</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" dir={dir}>
              <thead>
                <tr className={`bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                  <th className="px-8 py-6">{t('product.name')}</th>
                  <th className="px-8 py-6">{t('product.category')}</th>
                  <th className="px-8 py-6">{t('product.moq')}</th>
                  <th className="px-8 py-6">{t('product.price')}</th>
                  <th className={`px-8 py-6 ${dir === 'rtl' ? 'text-left' : 'text-right'}`}>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={product.id} 
                      className="group hover:bg-slate-50/80 transition-all cursor-pointer"
                    >
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-6">
                          <div className="w-20 h-20 rounded-2xl bg-slate-100 relative overflow-hidden flex-shrink-0 border-2 border-slate-100 group-hover:border-emerald-200 transition-all shadow-sm">
                            <Image
                              src={product.images?.[0] || `https://picsum.photos/seed/${product.id}/200/200`}
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-700"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-lg group-hover:text-emerald-700 transition-colors leading-tight">{product.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-1.5 uppercase tracking-widest">#{product.id.substring(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <span className="px-4 py-2 bg-white border border-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-8 py-8">
                        <p className="text-sm text-slate-600 font-black uppercase tracking-widest">{product.moq} <span className="text-[10px] text-slate-400">{t('common.units')}</span></p>
                      </td>
                      <td className="px-8 py-8">
                        <p className="text-xl font-black text-slate-900 tracking-tight">
                          {product.hidePrice ? t('product.on_request') : `$${product.pricingTiers?.[0]?.price || '0.00'}`}
                        </p>
                      </td>
                      <td className={`px-8 py-8 ${dir === 'rtl' ? 'text-left' : 'text-right'}`}>
                        <div className={`flex ${dir === 'rtl' ? 'justify-start' : 'justify-end'} gap-3 opacity-0 group-hover:opacity-100 transition-all ${dir === 'rtl' ? '-translate-x-4' : 'translate-x-4'} group-hover:translate-x-0`}>
                          <Link 
                            href={`/dashboard/products/edit/${product.id}`}
                            className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-all rounded-2xl hover:bg-white border-2 border-transparent hover:border-emerald-100 hover:shadow-lg"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                          <button 
                            onClick={() => handleDelete(product.id)}
                            className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-red-600 transition-all rounded-2xl hover:bg-white border-2 border-transparent hover:border-red-100 hover:shadow-lg"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-24 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <Package className="w-12 h-12 text-slate-200" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3">{t('product.no_products')}</h3>
            <p className="text-slate-500 mb-10 max-w-sm mx-auto font-medium leading-relaxed">{t('product.no_products_desc')}</p>
            <Link 
              href="/dashboard/products/new" 
              className="inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-emerald-200"
            >
              <Plus className="w-5 h-5" />
              {t('product.add_first')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
