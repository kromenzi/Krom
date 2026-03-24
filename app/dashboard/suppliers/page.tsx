'use client';

import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, doc, getDoc, addDoc } from 'firebase/firestore';
import { Building2, Search, MapPin, Star, MessageSquare, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function SavedSuppliersDashboard() {
  const { profile } = useAuth();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedSuppliers = async () => {
      if (!profile || profile.role !== 'buyer') return;
      
      try {
        // In a real app, you'd have a 'saved_suppliers' collection or an array on the user profile.
        // For this demo, we'll just fetch a few verified factories to simulate saved suppliers.
        const q = query(collection(db, 'factories'), where('isVerified', '==', true));
        const querySnapshot = await getDocs(q);
        const factoryData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).slice(0, 3); // Just show 3 for demo
        setSuppliers(factoryData);
      } catch (error) {
        console.error('Error fetching saved suppliers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedSuppliers();
  }, [profile]);

  const handleMessageSupplier = async (supplierId: string, supplierName: string) => {
    if (!profile) return;
    try {
      // Check if chat exists
      const q = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', profile.uid)
      );
      const querySnapshot = await getDocs(q);
      let existingChatId = null;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.participants.includes(supplierId)) {
          existingChatId = doc.id;
        }
      });

      if (existingChatId) {
        window.location.href = `/dashboard/messages?chat=${existingChatId}`;
      } else {
        // Create new chat
        const chatRef = await addDoc(collection(db, 'chats'), {
          participants: [profile.uid, supplierId],
          participantNames: {
            [profile.uid]: profile.displayName || profile.email,
            [supplierId]: supplierName,
          },
          lastMessage: '',
          lastMessageTime: new Date().toISOString(),
          unreadCount: {
            [profile.uid]: 0,
            [supplierId]: 0,
          },
        });
        window.location.href = `/dashboard/messages?chat=${chatRef.id}`;
      }
    } catch (error) {
      console.error('Error initiating chat:', error);
      alert('Failed to initiate chat.');
    }
  };

  if (!profile || profile.role !== 'buyer') return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Saved Suppliers</h1>
          <p className="text-slate-600 mt-1">Manage your favorite factories and quick contacts.</p>
        </div>
        <Link href="/factories" className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
          <Search className="w-4 h-4" /> Find More
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search saved suppliers..." 
              className="w-full pl-9 pr-4 rtl:pr-9 rtl:pl-4 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          </div>
        ) : suppliers.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {suppliers.map((supplier) => (
              <div key={supplier.id} className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex-shrink-0 relative overflow-hidden">
                  {supplier.logo ? (
                    <Image src={supplier.logo} alt={supplier.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Building2 className="w-8 h-8" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-slate-900 truncate">{supplier.name}</h3>
                    {supplier.isVerified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 uppercase tracking-wider border border-blue-200">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {supplier.location || 'Saudi Arabia'}</span>
                    <span className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-400 fill-amber-400" /> {supplier.rating || '4.8'}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-2 line-clamp-2">{supplier.description}</p>
                </div>
                
                <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                  <Link 
                    href={`/factories/${supplier.id}`}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" /> Profile
                  </Link>
                  <button 
                    onClick={() => handleMessageSupplier(supplier.id, supplier.name)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" /> Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">No saved suppliers</h3>
            <p className="text-slate-500 mb-6">You haven&apos;t saved any factories to your list yet.</p>
            <Link href="/factories" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Search className="w-4 h-4" /> Browse Factories
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
