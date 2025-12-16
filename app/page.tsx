'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        // Redirect based on role
        switch (user.role) {
          case 'admin_global':
            router.push('/admin/companies');
            break;
          case 'empresa_admin':
            router.push('/company/prodes');
            break;
          case 'empleado':
            router.push('/prodes');
            break;
          default:
            router.push('/login');
        }
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
