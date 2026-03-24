import Link from 'next/link';
import { Factory, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <Factory className="h-8 w-8 text-emerald-500" />
              <span className="font-bold text-xl tracking-tight text-white">GulfFactory<span className="text-emerald-500">Market</span></span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              The premier B2B industrial sourcing platform connecting global buyers with certified Saudi and Gulf factories.
            </p>
            <div className="flex space-x-4">
              {/* Social links placeholder */}
              <a href="#" className="text-slate-400 hover:text-emerald-500 transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">For Buyers</h3>
            <ul className="space-y-3">
              <li><Link href="/products" className="text-sm hover:text-emerald-400 transition-colors">Browse Products</Link></li>
              <li><Link href="/factories" className="text-sm hover:text-emerald-400 transition-colors">Find Factories</Link></li>
              <li><Link href="/rfq" className="text-sm hover:text-emerald-400 transition-colors">Submit RFQ</Link></li>
              <li><Link href="/dashboard" className="text-sm hover:text-emerald-400 transition-colors">Buyer Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">For Factories</h3>
            <ul className="space-y-3">
              <li><Link href="/join" className="text-sm hover:text-emerald-400 transition-colors">Join as Supplier</Link></li>
              <li><Link href="/dashboard" className="text-sm hover:text-emerald-400 transition-colors">Factory Dashboard</Link></li>
              <li><Link href="/dashboard/rfqs" className="text-sm hover:text-emerald-400 transition-colors">View RFQs</Link></li>
              <li><Link href="/dashboard/products" className="text-sm hover:text-emerald-400 transition-colors">Manage Catalog</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <span className="text-sm">Riyadh, Saudi Arabia<br />King Abdullah Financial District</span>
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
            &copy; {new Date().getFullYear()} GulfFactory Market. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
