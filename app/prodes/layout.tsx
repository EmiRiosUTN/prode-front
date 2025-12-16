'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { LogOut, Trophy, BarChart3 } from 'lucide-react';

export default function ProdesLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const { logout, user } = useAuth();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <ProtectedRoute allowedRoles={['empleado']}>
            <div className="min-h-screen bg-slate-50">
                {/* Header */}
                <header className="bg-white border-b border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center space-x-8">
                                <h1 className="text-xl font-bold">Prode</h1>
                                <nav className="hidden md:flex space-x-4">
                                    <button
                                        onClick={() => router.push('/prodes')}
                                        className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                                    >
                                        <Trophy className="h-4 w-4" />
                                        <span>Mis Prodes</span>
                                    </button>
                                </nav>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <p className="text-sm font-medium">{user?.employee?.firstName} {user?.employee?.lastName}</p>
                                    <p className="text-xs text-slate-500">{user?.employee?.company?.name}</p>
                                </div>
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
