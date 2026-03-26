'use client';

import ProtectedRoute from '@/components/ProtectedRoute';

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['factory', 'admin']}>
      {children}
    </ProtectedRoute>
  );
}
