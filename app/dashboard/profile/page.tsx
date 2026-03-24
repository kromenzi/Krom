'use client';

import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { Building2, Save, UploadCloud, MapPin, Globe, Phone, Mail, FileText, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function FactoryProfileDashboard() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    website: '',
    phone: '',
    email: '',
    yearEstablished: '',
    employeeCount: '',
    certifications: '',
    capabilities: '',
  });

  useEffect(() => {
    const fetchFactoryProfile = async () => {
      if (!profile || profile.role !== 'factory') return;
      
      try {
        const docRef = doc(db, 'factories', profile.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            name: data.name || '',
            description: data.description || '',
            address: data.address || '',
            website: data.website || '',
            phone: data.phone || '',
            email: data.email || '',
            yearEstablished: data.yearEstablished || '',
            employeeCount: data.employeeCount || '',
            certifications: data.certifications ? data.certifications.join(', ') : '',
            capabilities: data.capabilities ? data.capabilities.join(', ') : '',
          });
        }
      } catch (error) {
        console.error('Error fetching factory profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFactoryProfile();
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setSuccess(false);
    
    try {
      const certificationsArray = formData.certifications.split(',').map(s => s.trim()).filter(Boolean);
      const capabilitiesArray = formData.capabilities.split(',').map(s => s.trim()).filter(Boolean);
      
      await updateDoc(doc(db, 'factories', profile.uid), {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        website: formData.website,
        phone: formData.phone,
        email: formData.email,
        yearEstablished: formData.yearEstablished,
        employeeCount: formData.employeeCount,
        certifications: certificationsArray,
        capabilities: capabilitiesArray,
        updatedAt: new Date().toISOString(),
      });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating factory profile:', error);
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!profile || profile.role !== 'factory') return null;

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Factory Profile</h1>
        <p className="text-slate-600 mt-1">Manage your public factory profile and capabilities.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 border border-emerald-200">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{formData.name || 'Your Factory Name'}</h2>
            <p className="text-sm text-slate-500">Update your details to attract more buyers.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-2">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Factory Name *</label>
                <div className="relative">
                  <Building2 className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">About the Factory</label>
                <div className="relative">
                  <FileText className="absolute left-3 rtl:left-auto rtl:right-3 top-3 text-slate-400 w-4 h-4" />
                  <textarea
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                    placeholder="Describe your manufacturing capabilities, history, and specialties..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-2">Contact Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
                <div className="relative">
                  <Globe className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="https://"
                  />
                </div>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Physical Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 rtl:left-auto rtl:right-3 top-3 text-slate-400 w-4 h-4" />
                  <textarea
                    name="address"
                    rows={2}
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Capabilities */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-2">Capabilities & Certifications</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Year Established</label>
                <input
                  type="text"
                  name="yearEstablished"
                  value={formData.yearEstablished}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g., 1995"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Employee Count</label>
                <input
                  type="text"
                  name="employeeCount"
                  value={formData.employeeCount}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g., 100-500"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Certifications (comma separated)</label>
                <input
                  type="text"
                  name="certifications"
                  value={formData.certifications}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="ISO 9001, CE, SASO..."
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Core Capabilities (comma separated)</label>
                <input
                  type="text"
                  name="capabilities"
                  value={formData.capabilities}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="CNC Machining, Injection Molding, Assembly..."
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
            {success && (
              <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" /> Profile updated
              </span>
            )}
            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-6 rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
