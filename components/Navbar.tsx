'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Factory, Search, Menu, User, LogOut, Globe } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { profile, signInWithGoogle, logout } = useAuth();
  const { locale, setLocale, t, dir } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Factory className="h-8 w-8 text-emerald-500" />
              <span className="font-bold text-xl tracking-tight">GulfFactory<span className="text-emerald-500">Market</span></span>
            </Link>
            <div className={`hidden md:flex ${dir === 'rtl' ? 'mr-10 space-x-reverse' : 'ml-10'} space-x-8`}>
              <Link href="/products" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">{t('nav.products')}</Link>
              <Link href="/factories" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">{t('nav.factories')}</Link>
              <Link href={profile ? "/dashboard/rfq/new" : "/rfq"} className="text-emerald-400 hover:text-emerald-300 px-3 py-2 rounded-md text-sm font-medium">{t('nav.rfq')}</Link>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-md leading-5 bg-slate-800 text-gray-300 placeholder-gray-400 focus:outline-none focus:bg-white focus:text-gray-900 focus:border-emerald-500 sm:text-sm transition-colors"
                placeholder="Search products or factories..."
              />
            </div>

            <button 
              onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
              className="text-gray-300 hover:text-white p-2 flex items-center gap-1"
            >
              <Globe className="h-5 w-5" />
              <span className="text-sm font-medium">{locale === 'en' ? 'العربية' : 'English'}</span>
            </button>

            {profile ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white">
                  <User className="h-5 w-5" />
                  {t('nav.dashboard')}
                </Link>
                <button onClick={logout} className="text-gray-400 hover:text-white">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => signInWithGoogle('buyer')} className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  {t('nav.login')}
                </button>
                <button onClick={() => signInWithGoogle('factory')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  {t('hero.cta.join')}
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-400 hover:text-white p-2">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/products" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-slate-700">Products</Link>
            <Link href="/factories" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-slate-700">Factories</Link>
            <Link href={profile ? "/dashboard/rfq/new" : "/rfq"} className="block px-3 py-2 rounded-md text-base font-medium text-emerald-400 hover:text-emerald-300 hover:bg-slate-700">Post RFQ</Link>
            
            {profile ? (
              <>
                <Link href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-slate-700">Dashboard</Link>
                <button onClick={logout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-slate-700">Sign Out</button>
              </>
            ) : (
              <>
                <button onClick={() => signInWithGoogle('buyer')} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-slate-700">Sign In</button>
                <button onClick={() => signInWithGoogle('factory')} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-emerald-400 hover:text-emerald-300 hover:bg-slate-700">Join as Factory</button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
