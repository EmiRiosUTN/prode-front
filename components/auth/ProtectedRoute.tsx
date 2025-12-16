'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/types';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const router = useRouter();
    const { isAuthenticated, user, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
                return;
            }

            if (user && !allowedRoles.includes(user.role)) {
                // Redirect to appropriate page based on role
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
            }
        }
    }, [isAuthenticated, user, isLoading, allowedRoles, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
        return null;
    }

    return <>{children}</>;
}
