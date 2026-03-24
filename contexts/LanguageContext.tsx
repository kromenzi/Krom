'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  locale: Language; // Alias for language
  setLocale: (lang: Language) => void; // Alias for setLanguage
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.factories': 'Factories',
    'nav.products': 'Products',
    'nav.rfq': 'Submit RFQ',
    'nav.dashboard': 'Dashboard',
    'nav.signin': 'Sign In',
    'nav.login': 'Login',
    'nav.messages': 'Messages',
    'nav.settings': 'Settings',
    'nav.suppliers': 'Saved Suppliers',
    'nav.profile': 'Factory Profile',
    'nav.logout': 'Logout',
    'nav.live': 'Live Production',
    'hero.title': 'The Digital Gateway to Gulf Manufacturing',
    'hero.subtitle': 'Connect directly with verified factories in Saudi Arabia and the GCC. Streamline your sourcing with AI-powered matching.',
    'hero.cta.start': 'Start Sourcing',
    'hero.cta.factory': 'List Your Factory',
    'hero.cta.join': 'Join as Factory',
    'dashboard.welcome': 'Welcome back,',
    'dashboard.stats.rfqs': 'Active RFQs',
    'dashboard.stats.products': 'Total Products',
    'dashboard.stats.messages': 'Unread Messages',
    'dashboard.stats.views': 'Profile Views',
    'dashboard.ai_insights': 'AI Sourcing Insights',
    'dashboard.ai_desc': 'Based on current market trends, there is a 15% increase in demand for sustainable packaging in the Gulf region.',
    'dashboard.performance': 'Performance Overview',
    'dashboard.recent_activity': 'Recent Activity',
    'dashboard.quick_actions': 'Quick Actions',
    'dashboard.action.new_product': 'Add New Product',
    'dashboard.action.view_rfqs': 'View RFQs',
    'dashboard.action.live_stream': 'Go Live',
    
    'profile.title': 'Factory Profile',
    'profile.subtitle': 'Manage your factory branding and information.',
    'profile.save': 'Save Changes',
    'profile.factory_name': 'Factory Name',
    'profile.description': 'Factory Description',
    'profile.location': 'Location',
    'profile.category': 'Primary Category',
    'profile.branding': 'Branding',
    'profile.logo': 'Factory Logo',
    'profile.banner': 'Profile Banner',
    
    'products.title': 'Product Management',
    'products.subtitle': 'Manage your product catalog and visibility.',
    'products.add': 'Add Product',
    'products.search': 'Search products...',
    'products.name': 'Product Name',
    'products.category': 'Category',
    'products.price': 'Price',
    'products.status': 'Status',
    'products.actions': 'Actions',
    'products.empty': 'No products found.',
    
    'products.new.title': 'Add New Product',
    'products.new.subtitle': 'List a new product on the GulfFactory marketplace.',
    'products.new.basic_info': 'Basic Information',
    'products.new.media': 'Product Media',
    'products.new.description': 'Description',
    'products.new.min_order': 'Minimum Order Quantity',
    'products.new.price_range': 'Price Range',
    'products.new.images': 'Product Images',
    'products.new.video': 'Product Video',
    'products.new.submit': 'Create Product',
    'products.new.success': 'Product created successfully!',

    'live.title': 'Live Production',
    'live.subtitle': 'Stream your factory floor live to build trust with buyers.',
    'live.start': 'Go Live Now',
    'live.stop': 'End Stream',
    'live.ready': 'Ready to broadcast?',
    'live.ready_desc': 'Showcase your quality standards and production capacity in real-time.',
    'live.chat': 'Live Chat',
    'live.no_messages': 'No messages yet. Start the conversation!',
    'live.type_message': 'Type a message...',
    'live.security': 'Security',
    'live.encrypted': 'End-to-End',
    'live.latency': 'Latency',
    'live.ultra_low': 'Ultra Low',
    'live.quality': 'Quality',
    'live.switch_camera': 'Switch Camera',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred.',
    'common.success': 'Success!',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.view_all': 'View All',
    'rfq.new_title': 'Submit New RFQ',
    'rfq.new_subtitle': 'Provide detailed requirements to get accurate quotes.',
    'rfq.product_name': 'Product Name / RFQ Title',
    'rfq.category': 'Category',
    'rfq.quantity': 'Required Quantity',
    'rfq.target_price': 'Target Price per Unit (USD)',
    'rfq.description': 'Detailed Specifications',
    'rfq.attachments': 'Attachments',
    'rfq.submit': 'Submit RFQ',
    'rfq.submitting': 'Submitting...',
    'rfq.success': 'RFQ Submitted Successfully!',
    'rfq.success_desc': 'Your Request for Quotation has been sent to our network of verified factories.',
    'rfq.view_my': 'View My RFQs',
    'rfq.select_category': 'Select a category',
  },
  ar: {
    'nav.home': 'الرئيسية',
    'nav.factories': 'المصانع',
    'nav.products': 'المنتجات',
    'nav.rfq': 'طلب تسعير',
    'nav.dashboard': 'لوحة التحكم',
    'nav.signin': 'تسجيل الدخول',
    'nav.login': 'دخول',
    'nav.messages': 'الرسائل',
    'nav.settings': 'الإعدادات',
    'nav.suppliers': 'الموردين المحفوظين',
    'nav.profile': 'ملف المصنع',
    'nav.logout': 'تسجيل الخروج',
    'nav.live': 'البث المباشر للمصنع',
    'hero.title': 'البوابة الرقمية للتصنيع في الخليج',
    'hero.subtitle': 'تواصل مباشرة مع المصانع المعتمدة في المملكة العربية السعودية والخليج. سهّل عمليات التوريد الخاصة بك من خلال الربط المدعوم بالذكاء الاصطناعي.',
    'hero.cta.start': 'ابدأ التوريد',
    'hero.cta.factory': 'سجل مصنعك',
    'hero.cta.join': 'انضم كمصنع',
    'dashboard.welcome': 'مرحباً بك مجدداً،',
    'dashboard.stats.rfqs': 'طلبات التسعير النشطة',
    'dashboard.stats.products': 'إجمالي المنتجات',
    'dashboard.stats.messages': 'رسائل غير مقروءة',
    'dashboard.stats.views': 'مشاهدات الملف الشخصي',
    'dashboard.ai_insights': 'رؤى التوريد بالذكاء الاصطناعي',
    'dashboard.ai_desc': 'بناءً على اتجاهات السوق الحالية، هناك زيادة بنسبة 15٪ في الطلب على التغليف المستدام في منطقة الخليج.',
    'dashboard.performance': 'نظرة عامة على الأداء',
    'dashboard.recent_activity': 'النشاط الأخير',
    'dashboard.quick_actions': 'إجراءات سريعة',
    'dashboard.action.new_product': 'إضافة منتج جديد',
    'dashboard.action.view_rfqs': 'عرض طلبات التسعير',
    'dashboard.action.live_stream': 'بدء بث مباشر',
    
    'profile.title': 'ملف المصنع',
    'profile.subtitle': 'إدارة هوية مصنعك ومعلوماته.',
    'profile.save': 'حفظ التغييرات',
    'profile.factory_name': 'اسم المصنع',
    'profile.description': 'وصف المصنع',
    'profile.location': 'الموقع',
    'profile.category': 'الفئة الرئيسية',
    'profile.branding': 'الهوية البصرية',
    'profile.logo': 'شعار المصنع',
    'profile.banner': 'غلاف الملف الشخصي',
    
    'products.title': 'إدارة المنتجات',
    'products.subtitle': 'إدارة كتالوج المنتجات وظهورها.',
    'products.add': 'إضافة منتج',
    'products.search': 'البحث عن منتجات...',
    'products.name': 'اسم المنتج',
    'products.category': 'الفئة',
    'products.price': 'السعر',
    'products.status': 'الحالة',
    'products.actions': 'الإجراءات',
    'products.empty': 'لم يتم العثور على منتجات.',
    
    'products.new.title': 'إضافة منتج جديد',
    'products.new.subtitle': 'أدرج منتجاً جديداً في سوق GulfFactory.',
    'products.new.basic_info': 'المعلومات الأساسية',
    'products.new.media': 'وسائط المنتج',
    'products.new.description': 'الوصف',
    'products.new.min_order': 'أقل كمية للطلب',
    'products.new.price_range': 'نطاق السعر',
    'products.new.images': 'صور المنتج',
    'products.new.video': 'فيديو المنتج',
    'products.new.submit': 'إنشاء المنتج',
    'products.new.success': 'تم إنشاء المنتج بنجاح!',

    'live.title': 'البث المباشر للمصنع',
    'live.subtitle': 'بث حي من أرض المصنع لبناء الثقة مع المشترين.',
    'live.start': 'بدء البث الآن',
    'live.stop': 'إنهاء البث',
    'live.ready': 'هل أنت مستعد للبث؟',
    'live.ready_desc': 'اعرض معايير الجودة وقدرتك الإنتاجية في الوقت الفعلي.',
    'live.chat': 'الدردشة المباشرة',
    'live.no_messages': 'لا توجد رسائل بعد. ابدأ المحادثة!',
    'live.type_message': 'اكتب رسالة...',
    'live.security': 'الأمان',
    'live.encrypted': 'مشفر بالكامل',
    'live.latency': 'التأخير',
    'live.ultra_low': 'منخفض جداً',
    'live.quality': 'الجودة',
    'live.switch_camera': 'تبديل الكاميرا',
    'common.loading': 'جاري التحميل...',
    'common.error': 'حدث خطأ ما.',
    'common.success': 'تم بنجاح!',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.view': 'عرض',
    'common.view_all': 'عرض الكل',
    'rfq.new_title': 'تقديم طلب تسعير جديد',
    'rfq.new_subtitle': 'قدم متطلبات مفصلة للحصول على عروض أسعار دقيقة.',
    'rfq.product_name': 'اسم المنتج / عنوان الطلب',
    'rfq.category': 'الفئة',
    'rfq.quantity': 'الكمية المطلوبة',
    'rfq.target_price': 'السعر المستهدف للوحدة (USD)',
    'rfq.description': 'المواصفات التفصيلية',
    'rfq.attachments': 'المرفقات',
    'rfq.submit': 'تقديم طلب التسعير',
    'rfq.submitting': 'جاري التقديم...',
    'rfq.success': 'تم تقديم الطلب بنجاح!',
    'rfq.success_desc': 'تم إرسال طلب عرض السعر الخاص بك إلى شبكتنا من المصانع المعتمدة.',
    'rfq.view_my': 'عرض طلباتي',
    'rfq.select_category': 'اختر الفئة',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'ar')) {
      setLanguage(savedLang);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      locale: language, 
      setLocale: setLanguage, 
      t, 
      dir 
    }}>
      <div dir={dir}>
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
