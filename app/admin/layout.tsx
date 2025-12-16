'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { LogOut, Building2, Trophy, Users } from 'lucide-react';

export default function AdminLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const { logout, user } = useAuth();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const navItems = [
        { label: 'Empresas', href: '/admin/companies', icon: Building2 },
        { label: 'Competiciones', href: '/admin/competitions', icon: Trophy },
        { label: 'Partidos', href: '/admin/matches', icon: Users },
    ];

    return (
        <ProtectedRoute allowedRoles={['admin_global']}>
            <div className="min-h-screen bg-slate-50">
                {/* Header */}
                <header className="bg-white border-b border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center space-x-8">
                                <h1 className="text-xl font-bold">Prode Admin</h1>
                                <nav className="hidden md:flex space-x-4">
                                    {navItems.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <button
                                                key={item.href}
                                                onClick={() => router.push(item.href)}
                                                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                                            >
                                                <Icon className="h-4 w-4" />
                                                <span>{item.label}</span>
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-slate-600">{user?.email}</span>
                                <Button variant="outline" size="sm" onClick={handleLogout}>
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Salir
                                </Button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}
