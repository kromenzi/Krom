'use client';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, Globe2, Factory, TrendingUp, Search, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Home() {
  const { signInWithGoogle, profile } = useAuth();
  const { t, dir } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-slate-900 text-white overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://picsum.photos/seed/industrial/1920/1080?blur=2"
              alt="Industrial Background"
              fill
              className="object-cover opacity-30"
              referrerPolicy="no-referrer"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-8 border border-emerald-500/20">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                {t('hero.badge')}
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-8 leading-tight">
                {t('hero.title1')} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  {t('hero.title2')}
                </span>
              </h1>
              <p className="text-xl text-slate-300 mb-10 max-w-2xl leading-relaxed">
                {t('hero.subtitle')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/rfq" className="inline-flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg shadow-emerald-900/20">
                  {t('hero.cta.rfq')}
                  <ArrowRight className={`w-5 h-5 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                </Link>
                {!profile && (
                  <button onClick={() => signInWithGoogle('factory')} className="inline-flex justify-center items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-lg font-semibold text-lg transition-all backdrop-blur-sm">
                    {t('hero.cta.join')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Stats/Trust Section */}
        <section className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-100">
              <div className="px-4">
                <div className="text-4xl font-bold text-slate-900 mb-2">500+</div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">{t('stats.factories')}</div>
              </div>
              <div className="px-4">
                <div className="text-4xl font-bold text-slate-900 mb-2">12k+</div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">{t('stats.products')}</div>
              </div>
              <div className="px-4">
                <div className="text-4xl font-bold text-slate-900 mb-2">$50M+</div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">{t('stats.volume')}</div>
              </div>
              <div className="px-4">
                <div className="text-4xl font-bold text-slate-900 mb-2">15+</div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">{t('stats.countries')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Built for Global B2B Trade</h2>
              <p className="text-lg text-slate-600">Streamline your procurement process with tools designed specifically for industrial sourcing and wholesale trade.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Verified Suppliers</h3>
                <p className="text-slate-600 leading-relaxed">
                  Every factory undergoes a strict verification process. View certifications, production capacity, and export readiness before engaging.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <Globe2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Export Ready</h3>
                <p className="text-slate-600 leading-relaxed">
                  Filter suppliers by Incoterms (EXW, FOB, CIF, DDP) and find partners experienced in international shipping and customs.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Bulk RFQ Workflows</h3>
                <p className="text-slate-600 leading-relaxed">
                  Submit one detailed Request for Quotation and receive competitive bids from multiple qualified manufacturers simultaneously.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Categories */}
        <section className="py-24 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Industrial Categories</h2>
                <p className="text-lg text-slate-600">Browse products from top manufacturing sectors.</p>
              </div>
              <Link href="/products" className="hidden sm:flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700">
                View All Categories <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: 'Construction Materials', image: 'construction' },
                { name: 'Petrochemicals', image: 'chemical' },
                { name: 'Machinery & Equipment', image: 'machine' },
                { name: 'Plastics & Packaging', image: 'plastic' },
                { name: 'Metals & Alloys', image: 'metal' },
                { name: 'Electrical Components', image: 'electronics' },
                { name: 'Food Processing', image: 'food' },
                { name: 'Textiles', image: 'textile' },
              ].map((category, i) => (
                <Link key={i} href={`/products?category=${encodeURIComponent(category.name)}`} className="group relative h-48 rounded-xl overflow-hidden bg-slate-100 block">
                  <Image
                    src={`https://picsum.photos/seed/${category.image}/400/300`}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-semibold text-lg leading-tight">{category.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="mt-8 sm:hidden">
              <Link href="/products" className="flex justify-center items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700">
                View All Categories <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-emerald-900 py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M0 40L40 0H20L0 20M40 40V20L20 40" stroke="currentColor" strokeWidth="2" fill="none" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-pattern)" />
            </svg>
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to scale your sourcing?</h2>
            <p className="text-xl text-emerald-100 mb-10">
              Join thousands of buyers and factories already trading on GulfFactory Market.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/rfq" className="bg-white text-emerald-900 hover:bg-slate-50 px-8 py-4 rounded-lg font-bold text-lg transition-colors shadow-lg">
                Post an RFQ Now
              </Link>
              {!profile && (
                <button onClick={() => signInWithGoogle('buyer')} className="bg-emerald-800 hover:bg-emerald-700 text-white border border-emerald-700 px-8 py-4 rounded-lg font-bold text-lg transition-colors">
                  Create Buyer Account
                </button>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
