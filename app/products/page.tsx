'use client';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Filter, ChevronDown, Package, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productData);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow">
        {/* Header */}
        <div className="bg-slate-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-4">Industrial Products</h1>
            <div className="flex flex-col md:flex-row gap-4 max-w-3xl">
              <div className="relative flex-grow">
                <Search className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Search products by name, category, or specifications..." 
                  className="w-full pl-12 pr-4 rtl:pr-12 rtl:pl-4 py-3 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap">
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="w-full md:w-64 flex-shrink-0">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-24">
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-6 uppercase tracking-wider text-sm">
                  <Filter className="w-4 h-4" /> Filters
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-slate-700 mb-3 flex justify-between items-center cursor-pointer">
                      Categories <ChevronDown className="w-4 h-4 text-slate-400" />
                    </h3>
                    <div className="space-y-2">
                      {['Construction', 'Petrochemicals', 'Machinery', 'Plastics', 'Metals'].map(cat => (
                        <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                          <input type="checkbox" className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                          <span className="text-sm text-slate-600 group-hover:text-slate-900">{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-700 mb-3 flex justify-between items-center cursor-pointer">
                      MOQ (Minimum Order) <ChevronDown className="w-4 h-4 text-slate-400" />
                    </h3>
                    <div className="space-y-2">
                      {['Any', '< 100 units', '100 - 1000 units', '> 1000 units'].map(moq => (
                        <label key={moq} className="flex items-center gap-2 cursor-pointer group">
                          <input type="radio" name="moq" className="border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                          <span className="text-sm text-slate-600 group-hover:text-slate-900">{moq}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-700 mb-3 flex justify-between items-center cursor-pointer">
                      Incoterms <ChevronDown className="w-4 h-4 text-slate-400" />
                    </h3>
                    <div className="space-y-2">
                      {['EXW', 'FOB', 'CIF', 'DDP'].map(term => (
                        <label key={term} className="flex items-center gap-2 cursor-pointer group">
                          <input type="checkbox" className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                          <span className="text-sm text-slate-600 group-hover:text-slate-900">{term}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Product Grid */}
            <div className="flex-grow">
              <div className="flex justify-between items-center mb-6">
                <p className="text-slate-600 text-sm">Showing {products.length} products</p>
                <select className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-700 bg-white focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option>Most Relevant</option>
                  <option>Newest Arrivals</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div key={product.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                      <Link href={`/products/${product.id}`} className="block relative h-48 bg-slate-100 overflow-hidden">
                        <Image
                          src={product.images?.[0] || `https://picsum.photos/seed/${product.id}/400/300`}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </Link>
                      <div className="p-5 flex-grow flex flex-col">
                        <div className="flex-grow">
                          <Link href={`/products/${product.id}`}>
                            <h3 className="font-bold text-slate-900 hover:text-emerald-600 transition-colors line-clamp-2 mb-2">
                              {product.name}
                            </h3>
                          </Link>
                          <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider font-semibold">{product.category}</p>
                          
                          <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                            <span className="font-medium text-slate-900">MOQ:</span> {product.moq} units
                          </div>
                          
                          {product.hidePrice ? (
                            <div className="text-sm font-semibold text-emerald-600 mb-4">Price on Request</div>
                          ) : (
                            <div className="mb-4">
                              <span className="text-lg font-bold text-slate-900">
                                ${product.pricingTiers?.[0]?.price || '0.00'}
                              </span>
                              <span className="text-xs text-slate-500 ml-1">/ unit</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="pt-4 border-t border-slate-100 mt-auto">
                          <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Verified Supplier
                          </div>
                          <Link href={`/rfq?product=${product.id}`} className="block w-full text-center bg-white border border-emerald-600 text-emerald-600 hover:bg-emerald-50 py-2 px-4 rounded-lg text-sm font-semibold transition-colors">
                            Request Quote
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                  <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No products found</h3>
                  <p className="text-slate-500">Try adjusting your search filters or check back later.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
