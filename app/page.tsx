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
        <section className="relative bg-slate-900 text-white overflow-hidden min-h-[85vh] flex items-center">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://picsum.photos/seed/industrial/1920/1080?blur=1"
              alt="Industrial Background"
              fill
              className="object-cover opacity-40 scale-105"
              referrerPolicy="no-referrer"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900/40" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(5,150,105,0.15),transparent_50%)]" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-emerald-500/10 text-emerald-400 text-sm font-bold mb-8 border border-emerald-500/20 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-700">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {t('hero.badge')}
              </div>
              <h1 className="text-6xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-1000">
                {t('hero.title1')} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-amber-400">
                  {t('hero.title2')}
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-slate-300 mb-12 max-w-2xl leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                {t('hero.subtitle')}
              </p>

              <div className="flex flex-col sm:flex-row gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
                <Link href="/rfq" className="gulf-button-primary text-xl px-10 py-5 flex items-center justify-center gap-3 group">
                  {t('hero.cta.rfq')}
                  <ArrowRight className={`w-6 h-6 group-hover:translate-x-1 transition-transform ${dir === 'rtl' ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                </Link>
                {!profile && (
                  <button onClick={() => signInWithGoogle('factory')} className="px-10 py-5 rounded-2xl font-bold text-xl bg-white/5 hover:bg-white/10 text-white border border-white/20 backdrop-blur-md transition-all duration-300 flex items-center justify-center gap-3">
                    {t('hero.cta.join')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Stats/Trust Section */}
        <section className="bg-white border-b border-slate-100 relative z-20 -mt-10 mx-4 lg:mx-auto max-w-7xl rounded-3xl shadow-2xl shadow-slate-900/10">
          <div className="px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x rtl:divide-x-reverse divide-slate-100">
              <div className="px-4">
                <div className="text-5xl font-black text-emerald-600 mb-2">500+</div>
                <div className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{t('stats.factories')}</div>
              </div>
              <div className="px-4">
                <div className="text-5xl font-black text-emerald-600 mb-2">12k+</div>
                <div className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{t('stats.products')}</div>
              </div>
              <div className="px-4">
                <div className="text-5xl font-black text-emerald-600 mb-2">$50M+</div>
                <div className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{t('stats.volume')}</div>
              </div>
              <div className="px-4">
                <div className="text-5xl font-black text-emerald-600 mb-2">15+</div>
                <div className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{t('stats.countries')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('features.title')}</h2>
              <p className="text-lg text-slate-600">{t('features.subtitle')}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{t('features.v_suppliers')}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {t('features.v_suppliers_desc')}
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <Globe2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{t('features.export_ready')}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {t('features.export_ready_desc')}
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{t('features.bulk_rfq')}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {t('features.bulk_rfq_desc')}
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
                <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('categories.title')}</h2>
                <p className="text-lg text-slate-600">{t('categories.subtitle')}</p>
              </div>
              <Link href="/products" className="hidden sm:flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700">
                {t('categories.view_all')} <ChevronRight className={`w-5 h-5 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: t('cat.construction'), image: 'construction' },
                { name: t('cat.petrochemicals'), image: 'chemical' },
                { name: t('cat.machinery'), image: 'machine' },
                { name: t('cat.plastics'), image: 'plastic' },
                { name: t('cat.metals'), image: 'metal' },
                { name: t('cat.electrical'), image: 'electronics' },
                { name: t('cat.food'), image: 'food' },
                { name: t('cat.textiles'), image: 'textile' },
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
                  <div className="absolute bottom-4 inset-inline-start-4 inset-inline-end-4">
                    <h3 className="text-white font-semibold text-lg leading-tight">{category.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="mt-8 sm:hidden">
              <Link href="/products" className="flex justify-center items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700">
                {t('categories.view_all')} <ChevronRight className={`w-5 h-5 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
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
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">{t('cta.ready')}</h2>
            <p className="text-xl text-emerald-100 mb-10">
              {t('cta.desc')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/rfq" className="bg-white text-emerald-900 hover:bg-slate-50 px-8 py-4 rounded-lg font-bold text-lg transition-colors shadow-lg">
                {t('cta.post_rfq')}
              </Link>
              {!profile && (
                <button onClick={() => signInWithGoogle('buyer')} className="bg-emerald-800 hover:bg-emerald-700 text-white border border-emerald-700 px-8 py-4 rounded-lg font-bold text-lg transition-colors">
                  {t('cta.create_account')}
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
