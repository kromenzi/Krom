'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Users, Search, Shield, UserX, UserCheck, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AdminUsersDashboard() {
  const { profile } = useAuth();
  const { t, dir } = useLanguage();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!profile || profile.role !== 'admin') return;
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [profile]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(t('admin.confirm_role').replace('{role}', newRole))) return;
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error('Error updating role:', error);
      alert(t('admin.role_error'));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm(t('admin.confirm_delete'))) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(t('admin.delete_error'));
    }
  };

  if (!profile || profile.role !== 'admin') return null;

  return (
    <div className="space-y-6" dir={dir}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('admin.users_title')}</h1>
          <p className="text-slate-600 mt-1">{t('admin.users_subtitle')}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder={t('admin.search_users')} 
              className="w-full px-9 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-inline-start border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="p-4 text-inline-start">{t('admin.user')}</th>
                  <th className="p-4 text-inline-start">{t('admin.role')}</th>
                  <th className="p-4 text-inline-start">{t('admin.joined')}</th>
                  <th className="p-4 text-inline-end">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-slate-900">{user.name || t('common.unnamed_user')}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        user.role === 'factory' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {user.role === 'admin' && <Shield className="w-3 h-3" />}
                        {user.role === 'admin' ? t('admin.admin') : user.role === 'factory' ? t('admin.factory') : t('admin.buyer')}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : t('common.unknown')}
                    </td>
                    <td className="p-4 text-inline-end">
                      <div className="flex justify-end gap-2">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="text-sm border border-slate-300 rounded-md px-2 py-1 bg-white focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          <option value="buyer">{t('admin.buyer')}</option>
                          <option value="factory">{t('admin.factory')}</option>
                          <option value="admin">{t('admin.admin')}</option>
                        </select>
                        <button onClick={() => handleDeleteUser(user.id)} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50" title={t('common.delete')}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">{t('admin.no_users')}</h3>
            <p className="text-slate-500">{t('admin.no_users_desc')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
