'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { LayoutDashboard, Package, FileText, MessageSquare, Settings, Building2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  const { t, dir } = useLanguage();
  const pathname = usePathname();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Please sign in to access your dashboard</h2>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isFactory = profile.role === 'factory' || profile.role === 'admin';

  const navItems = [
    { name: t('nav.dashboard') || 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: t('nav.rfq') || 'My RFQs', href: '/dashboard/rfqs', icon: FileText },
    ...(isFactory ? [
      { name: t('nav.products') || 'My Products', href: '/dashboard/products', icon: Package },
      { name: t('nav.factories') || 'Factory Profile', href: '/dashboard/profile', icon: Building2 },
    ] : [
      { name: 'Saved Suppliers', href: '/dashboard/suppliers', icon: Building2 },
    ]),
    { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ...(profile.role === 'admin' ? [
      { name: 'Admin Users', href: '/dashboard/admin/users', icon: Settings },
      { name: 'Admin Factories', href: '/dashboard/admin/factories', icon: Building2 },
      { name: 'Admin Products', href: '/dashboard/admin/products', icon: Package },
      { name: 'Admin RFQs', href: '/dashboard/admin/rfqs', icon: FileText },
    ] : []),
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <div className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xl">
                    {profile.displayName?.charAt(0) || profile.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 truncate max-w-[140px]">{profile.displayName || 'User'}</h3>
                    <p className="text-xs text-slate-500 capitalize">{profile.role}</p>
                  </div>
                </div>
              </div>
              <nav className="p-4 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-grow">
            {children}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
