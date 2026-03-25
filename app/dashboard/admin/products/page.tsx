'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { Package, Search, Trash2, Eye } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function AdminProductsDashboard() {
  const { profile } = useAuth();
  const { t, dir } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!profile || profile.role !== 'admin') return;
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [profile]);

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm(t('admin.confirm_delete_product'))) return;
    try {
      await deleteDoc(doc(db, 'products', productId));
      setProducts(products.filter(p => p.id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
      alert(t('admin.delete_product_error'));
    }
  };

  if (!profile || profile.role !== 'admin') return null;

  return (
    <div className="space-y-6" dir={dir}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('admin.products_title')}</h1>
          <p className="text-slate-600 mt-1">{t('admin.products_subtitle')}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder={t('admin.search_products')} 
              className="w-full px-9 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          </div>
        ) : products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-inline-start border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="p-4 text-inline-start">{t('admin.product')}</th>
                  <th className="p-4 text-inline-start">{t('admin.factory_id')}</th>
                  <th className="p-4 text-inline-start">{t('product.category')}</th>
                  <th className="p-4 text-inline-start">{t('admin.price_moq')}</th>
                  <th className="p-4 text-inline-end">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-slate-100 relative overflow-hidden flex-shrink-0">
                          <Image
                            src={product.images?.[0] || `https://picsum.photos/seed/${product.id}/100/100`}
                            alt={product.name}
                            fill
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 line-clamp-1">{product.name}</p>
                          <p className="text-xs text-slate-500">ID: {product.id.substring(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600 font-mono">
                      {product.factoryId.substring(0, 8)}
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {t(`cat.${product.category.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_')}`) || product.category}
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium text-slate-900">
                        {product.hidePrice ? t('admin.on_request') : `$${product.pricingTiers?.[0]?.price || '0.00'}`}
                      </p>
                      <p className="text-xs text-slate-500">{t('product.moq')}: {product.moq}</p>
                    </td>
                    <td className="p-4 text-inline-end">
                      <div className="flex justify-end gap-2">
                        <Link href={`/products`} className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors rounded-md hover:bg-blue-50" title={t('common.view')}>
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDeleteProduct(product.id)} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50" title={t('common.delete')}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">{t('admin.no_products')}</h3>
            <p className="text-slate-500">{t('admin.no_products_desc')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
