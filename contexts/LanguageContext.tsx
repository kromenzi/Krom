'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Locale = 'en' | 'ar';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const translations: Record<Locale, Record<string, string>> = {
  en: {
    'nav.products': 'Products',
    'nav.factories': 'Factories',
    'nav.rfq': 'Submit RFQ',
    'nav.dashboard': 'Dashboard',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    'hero.badge': 'The Premier B2B Marketplace for Saudi & Gulf Factories',
    'hero.title1': 'Source Industrial',
    'hero.title2': 'Excellence',
    'hero.subtitle': 'Connect directly with certified manufacturers, distributors, and export-ready factories across the Gulf region. Request quotes, negotiate bulk pricing, and secure your supply chain.',
    'hero.cta.rfq': 'Submit RFQ',
    'hero.cta.join': 'Join as Factory',
    'stats.factories': 'Certified Factories',
    'stats.products': 'Industrial Products',
    'stats.volume': 'Monthly RFQ Volume',
    'stats.countries': 'Export Countries',
    // Add more as needed
  },
  ar: {
    'nav.products': 'المنتجات',
    'nav.factories': 'المصانع',
    'nav.rfq': 'طلب تسعيرة',
    'nav.dashboard': 'لوحة التحكم',
    'nav.login': 'تسجيل الدخول',
    'nav.logout': 'تسجيل الخروج',
    'hero.badge': 'السوق الأول للأعمال بين الشركات للمصانع السعودية والخليجية',
    'hero.title1': 'مصدر التميز',
    'hero.title2': 'الصناعي',
    'hero.subtitle': 'تواصل مباشرة مع المصنعين المعتمدين والموزعين والمصانع الجاهزة للتصدير في جميع أنحاء منطقة الخليج. اطلب عروض أسعار، وفاوض على أسعار الجملة، وأمن سلسلة التوريد الخاصة بك.',
    'hero.cta.rfq': 'تقديم طلب تسعيرة',
    'hero.cta.join': 'انضم كمصنع',
    'stats.factories': 'مصنع معتمد',
    'stats.products': 'منتج صناعي',
    'stats.volume': 'حجم الطلبات الشهري',
    'stats.countries': 'دول التصدير',
    // Add more as needed
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('locale') as Locale;
    if (saved && (saved === 'en' || saved === 'ar')) {
      setLocaleState(saved);
      document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = saved;
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
    document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLocale;
  };

  const t = (key: string): string => {
    return translations[locale][key] || key;
  };

  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, dir }}>
      <div dir={dir} className={dir === 'rtl' ? 'font-arabic' : ''}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
