'use client';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { Search, MapPin, ShieldCheck, Star, Factory, Globe2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function FactoriesPage() {
  const [factories, setFactories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFactories = async () => {
      try {
        const q = query(collection(db, 'factories'), where('status', '==', 'approved'));
        const querySnapshot = await getDocs(q);
        const factoryData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFactories(factoryData);
      } catch (error) {
        console.error('Error fetching factories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFactories();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow">
        {/* Header */}
        <div className="bg-slate-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-4">Verified Gulf Factories</h1>
            <p className="text-xl text-slate-300 max-w-2xl mb-8">
              Discover certified manufacturers and suppliers across Saudi Arabia and the Gulf region.
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 max-w-3xl">
              <div className="relative flex-grow">
                <Search className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Search by factory name, product, or certification..." 
                  className="w-full pl-12 pr-4 rtl:pr-12 rtl:pl-4 py-4 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-lg font-semibold transition-colors whitespace-nowrap">
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="w-full md:w-64 flex-shrink-0">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-24">
                <h2 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-sm">Filters</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-slate-700 mb-3">Country</h3>
                    <div className="space-y-2">
                      {['Saudi Arabia', 'UAE', 'Bahrain', 'Oman', 'Qatar', 'Kuwait'].map(country => (
                        <label key={country} className="flex items-center gap-2 cursor-pointer group">
                          <input type="checkbox" className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                          <span className="text-sm text-slate-600 group-hover:text-slate-900">{country}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-700 mb-3">Certifications</h3>
                    <div className="space-y-2">
                      {['ISO 9001', 'ISO 14001', 'CE Mark', 'SASO', 'FDA'].map(cert => (
                        <label key={cert} className="flex items-center gap-2 cursor-pointer group">
                          <input type="checkbox" className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                          <span className="text-sm text-slate-600 group-hover:text-slate-900">{cert}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">Export Ready Only</span>
                    </label>
                  </div>
                </div>
              </div>
            </aside>

            {/* Factory List */}
            <div className="flex-grow">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                </div>
              ) : factories.length > 0 ? (
                <div className="space-y-6">
                  {factories.map((factory) => (
                    <div key={factory.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-64 h-48 md:h-auto relative bg-slate-100 flex-shrink-0">
                          <Image
                            src={`https://picsum.photos/seed/${factory.id}/400/300`}
                            alt={factory.name}
                            fill
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="p-6 flex-grow flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <h2 className="text-xl font-bold text-slate-900">
                                <Link href={`/factories/${factory.id}`} className="hover:text-emerald-600 transition-colors">
                                  {factory.name}
                                </Link>
                              </h2>
                              {factory.exportReady && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                                  <Globe2 className="w-3 h-3" /> Export Ready
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {factory.country}</span>
                              <span className="flex items-center gap-1 text-emerald-600 font-medium"><ShieldCheck className="w-4 h-4" /> Verified</span>
                              <span className="flex items-center gap-1 text-amber-500"><Star className="w-4 h-4 fill-current" /> 4.8 (124 reviews)</span>
                            </div>
                            
                            <p className="text-slate-600 text-sm line-clamp-2 mb-4">
                              {factory.description || 'Leading manufacturer of industrial products in the region, committed to quality and excellence in production.'}
                            </p>
                            
                            <div className="flex flex-wrap gap-2 mb-6">
                              {(factory.certifications || ['ISO 9001', 'SASO']).map((cert: string) => (
                                <span key={cert} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                                  {cert}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                            <Link href={`/factories/${factory.id}`} className="flex-1 text-center bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-2 px-4 rounded-lg text-sm font-semibold transition-colors">
                              View Profile
                            </Link>
                            <Link href={`/rfq?factory=${factory.id}`} className="flex-1 text-center bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors">
                              Contact Supplier
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                  <Factory className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No factories found</h3>
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
