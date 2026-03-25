'use client';

import Link from 'next/link';
import { Factory, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function Footer() {
  const { t, dir } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <Factory className="h-8 w-8 text-emerald-500" />
              <span className="font-bold text-xl tracking-tight text-white">GulfFactory<span className="text-emerald-500">Market</span></span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              {t('footer.desc')}
            </p>
            <div className="flex space-x-4 rtl:space-x-reverse">
              <a href="https://www.linkedin.com/in/abdulkarem-alanzi-9505b53a1?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all duration-300 border border-slate-700 hover:border-emerald-500/30 group">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a href="https://t.me/Kromenzi" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all duration-300 border border-slate-700 hover:border-emerald-500/30 group">
                <span className="sr-only">Telegram</span>
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.14-.26.26-.53.26l.213-3.033 5.518-4.98c.24-.213-.054-.33-.373-.12l-6.82 4.292-2.94-.92c-.64-.2-.65-.64.13-.945l11.507-4.435c.53-.19.994.125.815.99z" />
                </svg>
              </a>
              <a href="https://www.tiktok.com/@390k?_r=1&_t=ZS-94y6uSqekFt" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all duration-300 border border-slate-700 hover:border-emerald-500/30 group">
                <span className="sr-only">TikTok</span>
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
              </a>
              <a href="https://youtube.com/@kromenzi?si=S7gRQW2LBe7lrAQz" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all duration-300 border border-slate-700 hover:border-emerald-500/30 group">
                <span className="sr-only">YouTube</span>
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">{t('footer.for_buyers')}</h3>
            <ul className="space-y-3">
              <li><Link href="/products" className="text-sm hover:text-emerald-400 transition-colors">{t('footer.browse_products')}</Link></li>
              <li><Link href="/factories" className="text-sm hover:text-emerald-400 transition-colors">{t('footer.find_factories')}</Link></li>
              <li><Link href="/rfq" className="text-sm hover:text-emerald-400 transition-colors">{t('footer.submit_rfq')}</Link></li>
              <li><Link href="/dashboard" className="text-sm hover:text-emerald-400 transition-colors">{t('footer.buyer_dashboard')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">{t('footer.for_factories')}</h3>
            <ul className="space-y-3">
              <li><Link href="/join" className="text-sm hover:text-emerald-400 transition-colors">{t('footer.join_supplier')}</Link></li>
              <li><Link href="/dashboard" className="text-sm hover:text-emerald-400 transition-colors">{t('footer.factory_dashboard')}</Link></li>
              <li><Link href="/dashboard/rfqs" className="text-sm hover:text-emerald-400 transition-colors">{t('footer.view_rfqs')}</Link></li>
              <li><Link href="/dashboard/products" className="text-sm hover:text-emerald-400 transition-colors">{t('footer.manage_catalog')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <span className="text-sm">{t('footer.location')}<br />{t('footer.district')}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <span className="text-sm">+966 11 123 4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <span className="text-sm">support@gulffactory.market</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} GulfFactory Market. {t('footer.rights')}
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="/privacy" className="hover:text-white transition-colors">{t('footer.privacy')}</Link>
            <Link href="/terms" className="hover:text-white transition-colors">{t('footer.terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
