import type {Metadata} from 'next';
import { Inter, Cairo } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const cairo = Cairo({ subsets: ['arabic'], variable: '--font-arabic' });

export const metadata: Metadata = {
  title: 'GulfFactory Market',
  description: 'Global B2B industrial marketplace for Saudi and Gulf factories.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" dir="ltr">
      <body suppressHydrationWarning className={`${inter.variable} ${cairo.variable} bg-gray-50 text-gray-900 font-sans`}>
        <ErrorBoundary>
          <LanguageProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </LanguageProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
