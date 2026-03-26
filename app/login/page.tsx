'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Building2, User, LogIn, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { user, profile, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (user && profile) {
      router.push('/dashboard');
    }
  }, [user, profile, router]);

  const handleSignIn = async (role?: any) => {
    setError(null);
    setIsLoggingIn(true);
    try {
      await signInWithGoogle(role);
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized for login. Please contact support or use the authorized domain.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('The sign-in popup was blocked by your browser. Please allow popups for this site.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        // Handled in AuthContext, but just in case
        setError('Sign-in popup was closed before completion.');
      } else {
        setError(err.message || 'An unexpected error occurred during sign-in.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-8 text-center border-b border-slate-100 bg-slate-50/50">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-6 shadow-sm">
              <Building2 className="w-8 h-8 text-emerald-600 transform rotate-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h1>
            <p className="text-slate-600">Sign in to GulfFactory Market to manage your sourcing and sales.</p>
          </div>
          
          <div className="p-8 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <button
              onClick={() => handleSignIn()}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:border-emerald-500 hover:bg-slate-50 text-slate-700 font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {isLoggingIn ? 'Signing in...' : 'Continue with Google'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">New to GulfFactory?</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleSignIn('buyer')}
                disabled={isLoggingIn}
                className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <User className="w-6 h-6 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-700">Join as Buyer</span>
              </button>
              <button
                onClick={() => handleSignIn('factory')}
                disabled={isLoggingIn}
                className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Building2 className="w-6 h-6 text-slate-400 group-hover:text-blue-600 transition-colors" />
                <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700">Join as Factory</span>
              </button>
            </div>
            
            <p className="text-xs text-center text-slate-500 mt-6">
              By continuing, you agree to our <Link href="#" className="underline hover:text-slate-900">Terms of Service</Link> and <Link href="#" className="underline hover:text-slate-900">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
