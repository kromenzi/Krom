'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Factory, Search, Menu, User, LogOut, Globe, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { profile, signInWithGoogle, logout } = useAuth();
  const { locale, setLocale, t, dir } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-50 border-b border-emerald-500/20 shadow-lg shadow-emerald-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                <Factory className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-2xl tracking-tight">GulfFactory<span className="text-emerald-500">Market</span></span>
            </Link>
            <div className={`hidden md:flex ${dir === 'rtl' ? 'mr-10 space-x-reverse' : 'ml-10'} space-x-8`}>
              <Link href="/products" className="text-gray-300 hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-bold transition-all duration-300 hover:bg-emerald-500/5">{t('nav.products')}</Link>
              <Link href="/factories" className="text-gray-300 hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-bold transition-all duration-300 hover:bg-emerald-500/5">{t('nav.factories')}</Link>
              <Link href={profile ? "/dashboard/rfq/new" : "/rfq"} className="text-emerald-400 hover:text-emerald-300 px-4 py-2 rounded-xl text-sm font-bold border border-emerald-500/30 hover:bg-emerald-500/10 transition-all duration-300 shadow-sm shadow-emerald-500/10">{t('nav.rfq')}</Link>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <div className="relative group">
              <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input
                type="text"
                className="block w-64 ps-10 pe-3 py-2.5 border border-slate-700 rounded-xl leading-5 bg-slate-800/50 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-slate-800 focus:text-white focus:border-emerald-500 sm:text-sm transition-all duration-300"
                placeholder={t('nav.search_placeholder')}
              />
            </div>

            <div className="relative group">
              <button 
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:border-amber-500/50 hover:bg-amber-500/5 text-gray-300 hover:text-amber-500 transition-all duration-300 group shadow-sm"
              >
                <Globe className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                <span className="text-sm font-bold tracking-wide uppercase">{locale}</span>
              </button>
              <div className="absolute top-full mt-2 end-0 w-32 bg-slate-800 border border-slate-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                {(['en', 'ar', 'zh', 'ur'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLocale(lang)}
                    className={`w-full text-start px-4 py-2 text-sm font-bold hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors ${locale === lang ? 'text-emerald-500 bg-emerald-500/5' : 'text-gray-400'}`}
                  >
                    {lang === 'en' ? 'English' : lang === 'ar' ? 'العربية' : lang === 'zh' ? '中文' : 'اردو'}
                  </button>
                ))}
              </div>
            </div>

            {profile ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-all duration-300 shadow-lg shadow-emerald-900/20">
                  <User className="h-4 w-4" />
                  {t('nav.dashboard')}
                </Link>
                <button onClick={logout} className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all duration-300 border border-slate-700">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button onClick={() => signInWithGoogle('buyer')} className="text-gray-300 hover:text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all">
                  {t('nav.login')}
                </button>
                <button onClick={() => signInWithGoogle('factory')} className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-amber-900/20">
                  {t('hero.cta.join')}
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-gray-400 hover:text-white border border-slate-700">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-4 pb-6 space-y-2">
            <Link href="/products" className="block px-4 py-3 rounded-xl text-base font-bold text-gray-300 hover:text-white hover:bg-slate-800 transition-all">{t('nav.products')}</Link>
            <Link href="/factories" className="block px-4 py-3 rounded-xl text-base font-bold text-gray-300 hover:text-white hover:bg-slate-800 transition-all">{t('nav.factories')}</Link>
            <Link href={profile ? "/dashboard/rfq/new" : "/rfq"} className="block px-4 py-3 rounded-xl text-base font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all">{t('nav.rfq')}</Link>
            
            <div className="pt-4 border-t border-slate-800">
              <p className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-widest">{t('nav.settings')}</p>
              <div className="grid grid-cols-2 gap-2 px-2">
                {(['en', 'ar', 'zh', 'ur'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setLocale(lang);
                      setIsMenuOpen(false);
                    }}
                    className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${locale === lang ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-gray-400 hover:bg-slate-700'}`}
                  >
                    {lang === 'en' ? 'English' : lang === 'ar' ? 'العربية' : lang === 'zh' ? '中文' : 'اردو'}
                  </button>
                ))}
              </div>
            </div>

            {profile ? (
              <div className="pt-4 space-y-2">
                <Link href="/dashboard" className="block px-4 py-3 rounded-xl text-base font-bold bg-emerald-600 text-white text-center shadow-lg shadow-emerald-900/20">{t('nav.dashboard')}</Link>
                <button onClick={logout} className="block w-full text-center px-4 py-3 rounded-xl text-base font-bold text-red-400 hover:bg-red-400/10 transition-all">{t('nav.logout')}</button>
              </div>
            ) : (
              <div className="pt-4 space-y-2">
                <button onClick={() => signInWithGoogle('buyer')} className="block w-full px-4 py-3 rounded-xl text-base font-bold text-gray-300 hover:text-white hover:bg-slate-800 text-center transition-all">{t('nav.login')}</button>
                <button onClick={() => signInWithGoogle('factory')} className="block w-full px-4 py-3 rounded-xl text-base font-bold bg-amber-600 text-white text-center shadow-lg shadow-amber-900/20 transition-all">{t('hero.cta.join')}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
