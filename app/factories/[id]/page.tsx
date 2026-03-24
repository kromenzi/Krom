'use client';

import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { Building2, CheckCircle2, Globe2, MapPin, Package, ShieldCheck, Star, Mail, Phone, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

export default function FactoryDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { profile } = useAuth();
  const [factory, setFactory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingChat, setCreatingChat] = useState(false);

  const handleMessageSupplier = async () => {
    if (!profile) {
      router.push('/login');
      return;
    }
    if (!factory) return;

    setCreatingChat(true);
    try {
      const chatsRef = collection(db, 'chats');
      const q = query(chatsRef, where('participants', 'array-contains', profile.uid));
      const querySnapshot = await getDocs(q);
      
      let existingChatId = null;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.participants.includes(factory.id)) {
          existingChatId = doc.id;
        }
      });

      if (existingChatId) {
        router.push(`/dashboard/messages?chat=${existingChatId}`);
      } else {
        const newChatRef = await addDoc(chatsRef, {
          participants: [profile.uid, factory.id],
          participantNames: {
            [profile.uid]: profile.name || 'Buyer',
            [factory.id]: factory.companyName || factory.name || 'Factory'
          },
          lastMessage: '',
          lastMessageTime: serverTimestamp(),
          unreadCount: {
            [profile.uid]: 0,
            [factory.id]: 0
          }
        });
        router.push(`/dashboard/messages?chat=${newChatRef.id}`);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      alert('Failed to start chat. Please try again.');
    } finally {
      setCreatingChat(false);
    }
  };

  useEffect(() => {
    const fetchFactoryAndProducts = async () => {
      if (!id) return;
      try {
        const factoryDoc = await getDoc(doc(db, 'factories', id as string));
        if (factoryDoc.exists()) {
          setFactory({ id: factoryDoc.id, ...factoryDoc.data() });
          
          // Fetch factory's products
          const productsQuery = query(collection(db, 'products'), where('factoryId', '==', id));
          const productsSnapshot = await getDocs(productsQuery);
          const productsData = productsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          setProducts(productsData);
        }
      } catch (error) {
        console.error('Error fetching factory details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFactoryAndProducts();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!factory) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center text-center p-6">
          <Building2 className="w-16 h-16 text-slate-300 mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Factory Not Found</h1>
          <p className="text-slate-600 mb-6">The factory profile you are looking for does not exist or has been removed.</p>
          <Link href="/factories" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
            Browse All Factories
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Factory Header / Hero */}
        <div className="bg-slate-900 text-white py-16 lg:py-24 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <Image
              src={`https://picsum.photos/seed/${factory.id}/1920/1080`}
              alt="Factory Background"
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-8">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-white border-4 border-slate-800 flex items-center justify-center flex-shrink-0 overflow-hidden relative shadow-2xl">
                {factory.logo ? (
                  <Image src={factory.logo} alt={factory.companyName || factory.name} fill className="object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <Building2 className="w-16 h-16 text-slate-300" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  {factory.isVerified && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-semibold border border-emerald-500/30 backdrop-blur-sm">
                      <ShieldCheck className="w-4 h-4" /> Verified Supplier
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-sm font-semibold border border-slate-700 backdrop-blur-sm">
                    {factory.businessType || 'Manufacturer'}
                  </span>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                  {factory.companyName || factory.name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-6 text-slate-300 text-sm md:text-base">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-500" />
                    {factory.city ? `${factory.city}, ` : ''}{factory.country || 'Saudi Arabia'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-400 fill-current" />
                    <span className="font-medium text-white">4.8</span>
                    <span>(124 Reviews)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe2 className="w-5 h-5 text-blue-400" />
                    Export Ready
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 w-full md:w-auto mt-6 md:mt-0">
                <Link href={`/rfq?factory=${factory.id}`} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3.5 rounded-xl font-bold transition-colors text-center shadow-lg shadow-emerald-900/20">
                  Request Quote
                </Link>
                <button 
                  onClick={handleMessageSupplier}
                  disabled={creatingChat}
                  className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-8 py-3.5 rounded-xl font-bold transition-colors text-center flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <MessageSquare className="w-5 h-5" />
                  {creatingChat ? 'Opening Chat...' : 'Message Supplier'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* About Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6">About the Company</h2>
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {factory.description || `${factory.companyName || factory.name} is a leading manufacturer based in ${factory.country || 'Saudi Arabia'}. We specialize in high-quality industrial products and are committed to providing excellent service to our B2B partners globally.`}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8 pt-8 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Established</p>
                    <p className="font-bold text-slate-900">{factory.establishedYear || '2010'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Employees</p>
                    <p className="font-bold text-slate-900">{factory.employeeCount || '50-200'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Main Markets</p>
                    <p className="font-bold text-slate-900">GCC, Europe</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Certifications</p>
                    <p className="font-bold text-slate-900">ISO 9001</p>
                  </div>
                </div>
              </div>

              {/* Products Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-emerald-600" /> Products Catalog
                  </h2>
                  <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    {products.length} Items
                  </span>
                </div>
                
                {products.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {products.map((product) => (
                      <Link key={product.id} href={`/products/${product.id}`} className="group flex gap-4 border border-slate-200 rounded-xl p-4 hover:border-emerald-500 hover:shadow-md transition-all bg-white">
                        <div className="w-24 h-24 rounded-lg bg-slate-100 relative overflow-hidden flex-shrink-0">
                          <Image
                            src={product.images?.[0] || `https://picsum.photos/seed/${product.id}/200/200`}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex flex-col justify-center">
                          <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-2 mb-1">
                            {product.name}
                          </h3>
                          <p className="text-sm text-slate-500 mb-2">{product.category}</p>
                          <p className="font-semibold text-slate-900">
                            {product.hidePrice ? 'On Request' : `$${product.pricingTiers?.[0]?.price || '0.00'}`}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-100">
                    <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No products listed yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Contact Info */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Contact Information</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Address</p>
                      <p className="text-sm text-slate-600 mt-1">{factory.address || 'Address not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Globe2 className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Website</p>
                      {factory.website ? (
                        <a href={factory.website} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-600 hover:underline mt-1 block">
                          {factory.website.replace(/^https?:\/\//, '')}
                        </a>
                      ) : (
                        <p className="text-sm text-slate-600 mt-1">Not provided</p>
                      )}
                    </div>
                  </div>

                  {/* Only show email/phone if user is logged in, otherwise prompt to login */}
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-500 mb-3 text-center">Contact details are hidden for guests</p>
                    <Link href="/login" className="block w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-900 px-4 py-2.5 rounded-lg font-semibold transition-colors text-sm">
                      Sign in to view contact details
                    </Link>
                  </div>
                </div>
              </div>

              {/* Capabilities */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Capabilities</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> OEM Services Offered
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Design Service Offered
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Buyer Label Offered
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
