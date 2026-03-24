'use client';

import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { Building2, CheckCircle2, FileText, Globe2, Package, ShieldCheck, Star, Truck, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

export default function ProductDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { profile } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [factory, setFactory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
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
    const fetchProductAndFactory = async () => {
      if (!id) return;
      try {
        const productDoc = await getDoc(doc(db, 'products', id as string));
        if (productDoc.exists()) {
          const productData = { id: productDoc.id, ...productDoc.data() } as any;
          setProduct(productData);
          
          if (productData.factoryId) {
            const factoryDoc = await getDoc(doc(db, 'factories', productData.factoryId));
            if (factoryDoc.exists()) {
              setFactory({ id: factoryDoc.id, ...factoryDoc.data() });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndFactory();
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

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center text-center p-6">
          <Package className="w-16 h-16 text-slate-300 mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Product Not Found</h1>
          <p className="text-slate-600 mb-6">The product you are looking for does not exist or has been removed.</p>
          <Link href="/products" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
            Browse All Products
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [`https://picsum.photos/seed/${product.id}/800/600`];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumbs */}
          <nav className="flex text-sm text-slate-500 mb-8" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/" className="hover:text-emerald-600">Home</Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2">/</span>
                  <Link href="/products" className="hover:text-emerald-600">Products</Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2">/</span>
                  <span className="text-slate-900 font-medium line-clamp-1">{product.name}</span>
                </div>
              </li>
            </ol>
          </nav>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              
              {/* Product Images */}
              <div className="p-6 lg:p-10 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/50">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-white border border-slate-200 mb-4">
                  <Image
                    src={images[activeImage]}
                    alt={product.name}
                    fill
                    className="object-contain p-4"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {images.length > 1 && (
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {images.map((img: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(idx)}
                        className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                          activeImage === idx ? 'border-emerald-600 ring-2 ring-emerald-600/20' : 'border-slate-200 hover:border-emerald-400'
                        }`}
                      >
                        <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-6 lg:p-10 flex flex-col">
                <div className="mb-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 uppercase tracking-wider">
                    {product.category}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-4">{product.name}</h1>
                
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current text-slate-300" />
                    <span className="text-slate-600 text-sm ml-1">(4.0)</span>
                  </div>
                  <span className="text-slate-300">|</span>
                  <span className="text-sm text-slate-600">ID: {product.id.substring(0, 8)}</span>
                </div>

                <div className="mb-8">
                  {product.hidePrice ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
                      <p className="text-lg font-semibold text-slate-900 mb-2">Price available upon request</p>
                      <p className="text-sm text-slate-500 mb-4">Contact the supplier to get the latest wholesale pricing.</p>
                      <Link href={`/rfq?product=${product.id}`} className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors w-full sm:w-auto">
                        Request Quotation
                      </Link>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-end gap-2 mb-4">
                        <span className="text-4xl font-bold text-slate-900">${product.pricingTiers?.[0]?.price || '0.00'}</span>
                        <span className="text-slate-500 mb-1">/ unit</span>
                      </div>
                      
                      {product.pricingTiers?.length > 1 && (
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 mb-6">
                          <h4 className="text-sm font-semibold text-slate-900 mb-3">Volume Pricing</h4>
                          <div className="space-y-2">
                            {product.pricingTiers.map((tier: any, idx: number) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span className="text-slate-600">{tier.minQuantity}+ units</span>
                                <span className="font-semibold text-slate-900">${tier.price} / unit</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Min. Order (MOQ)</p>
                    <p className="font-bold text-slate-900">{product.moq} units</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Supply Ability</p>
                    <p className="font-bold text-slate-900">{product.supplyAbility || 'Contact Supplier'}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <Truck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">Shipping & Delivery</p>
                      <p className="text-sm text-slate-600">Lead time: {product.leadTime || '15-30 days'}</p>
                      {product.incoterms && product.incoterms.length > 0 && (
                        <p className="text-sm text-slate-600 mt-1">
                          Supported Terms: {product.incoterms.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                  <Link href={`/rfq?product=${product.id}`} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-center px-6 py-3.5 rounded-xl font-bold transition-colors shadow-sm shadow-emerald-600/20">
                    Request Quote
                  </Link>
                  <button 
                    onClick={handleMessageSupplier}
                    disabled={creatingChat}
                    className="flex-1 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 px-6 py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <MessageSquare className="w-5 h-5" />
                    {creatingChat ? 'Opening...' : 'Message'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Product Description & Specifications */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" /> Product Details
                </h2>
                <div className="prose prose-slate max-w-none">
                  <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">{product.description}</p>
                </div>
              </div>

              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-6">Specifications</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex flex-col border-b border-slate-100 pb-2">
                        <span className="text-sm text-slate-500 mb-1">{key}</span>
                        <span className="font-medium text-slate-900">{value as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Supplier Info Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">About the Supplier</h3>
                
                {factory ? (
                  <>
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                        {factory.logo ? (
                          <Image src={factory.logo} alt={factory.companyName || factory.name} fill className="object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <Building2 className="w-8 h-8 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg leading-tight mb-1">
                          {factory.companyName || factory.name}
                        </h4>
                        <div className="flex items-center gap-1 text-sm text-slate-500">
                          <Globe2 className="w-4 h-4" /> {factory.country || 'Saudi Arabia'}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      {factory.isVerified && (
                        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
                          <ShieldCheck className="w-4 h-4" /> Verified Supplier
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-slate-600 px-3 py-2">
                        <CheckCircle2 className="w-4 h-4 text-slate-400" /> Export Ready
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 px-3 py-2">
                        <CheckCircle2 className="w-4 h-4 text-slate-400" /> Custom Manufacturing
                      </div>
                    </div>

                    <Link href={`/factories/${factory.id}`} className="block w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-900 px-4 py-2.5 rounded-lg font-semibold transition-colors text-sm">
                      View Factory Profile
                    </Link>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-slate-500 text-sm">Supplier information is currently unavailable.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
