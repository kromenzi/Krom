'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { LayoutDashboard, Package, FileText, MessageSquare, Settings, Building2, Radio, Menu, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';

const AIAssistant = dynamic(() => import('@/components/AIAssistant'), {
  ssr: false,
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  const { t, dir } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isFactory = profile?.role === 'factory' || profile?.role === 'admin';

  const navItems = useMemo(() => {
    console.log('DEBUG: navItems being calculated, profile:', profile);
    const items = [
      { name: t('nav.dashboard'), href: '/dashboard', icon: LayoutDashboard },
      { name: t('nav.rfq'), href: '/dashboard/rfqs', icon: FileText },
      { name: 'Live', href: '/dashboard/live', icon: Radio },
      ...(isFactory ? [
        { name: t('nav.products'), href: '/dashboard/products', icon: Package },
        { name: t('nav.profile'), href: '/dashboard/profile', icon: Building2 },
      ] : [
        { name: t('nav.suppliers'), href: '/dashboard/suppliers', icon: Building2 },
      ]),
      { name: t('nav.messages'), href: '/dashboard/messages', icon: MessageSquare },
      { name: t('nav.settings'), href: '/dashboard/settings', icon: Settings },
      ...(profile?.role === 'admin' ? [
        { name: t('admin.users'), href: '/dashboard/admin/users', icon: Settings },
        { name: t('admin.factories'), href: '/dashboard/admin/factories', icon: Building2 },
        { name: t('admin.products'), href: '/dashboard/admin/products', icon: Package },
        { name: t('admin.rfqs'), href: '/dashboard/admin/rfqs', icon: FileText },
      ] : []),
    ];
    console.log('DEBUG: navItems:', items);
    return items;
  }, [t, isFactory, profile?.role, profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F9FA] animate-pulse">
        <div className="h-16 bg-white border-b border-slate-100" />
        <div className="flex-grow max-w-7xl mx-auto w-full px-4 py-8 flex gap-8">
          <div className="hidden lg:block w-72 h-[600px] bg-white rounded-3xl" />
          <div className="flex-grow h-[600px] bg-white rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('dashboard.signin_required')}</h2>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col bg-[#F8F9FA] relative`} dir={dir}>
      {/* Subtle Pattern Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" style={{ backgroundImage: 'radial-gradient(#059669 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      <div className="relative z-10 flex flex-col flex-grow">
        <Navbar />
      
      <div className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Sidebar Toggle */}
          <div className="lg:hidden flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-4 z-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-200">
                {profile.displayName?.charAt(0) || profile.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="font-bold text-slate-900 block leading-none">{profile.displayName || 'User'}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{profile.role}</span>
              </div>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors border border-slate-100"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Sidebar */}
          <aside className={`${isSidebarOpen ? 'block' : 'hidden'} lg:block w-full lg:w-72 flex-shrink-0`}>
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-24">
              <div className="hidden lg:block p-8 border-b border-slate-50 bg-gradient-to-br from-slate-50 to-white">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-3xl bg-emerald-600 text-white flex items-center justify-center font-bold text-3xl shadow-2xl shadow-emerald-200 rotate-3 hover:rotate-0 transition-transform duration-300">
                      {profile.displayName?.charAt(0) || profile.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-400 rounded-full border-4 border-white shadow-sm"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg leading-tight">{profile.displayName || 'User'}</h3>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">{profile.role}</p>
                  </div>
                </div>
              </div>
              
              <nav className="p-6 space-y-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex w-full items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 group ${
                        isActive 
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100 translate-x-1' 
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-6 pt-0">
                <div className="bg-slate-900 rounded-2xl p-4 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-700"></div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1">{t('dashboard.support')}</p>
                  <p className="text-xs text-slate-300 mb-3">{t('dashboard.support_desc')}</p>
                  <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-colors">
                    {t('dashboard.contact_agent')}
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-grow min-w-0">
            <div className="min-h-[600px]">
              {children}
            </div>
          </main>
        </div>
      </div>

      <AIAssistant />
      <Footer />
      </div>
    </div>
  );
}
