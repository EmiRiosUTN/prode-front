'use client';

import { ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { LogOut, Trophy, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProdesLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const companyColor = user?.employee?.company?.primary_color || '#3b82f6';

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const getInitials = (firstName?: string, lastName?: string) => {
        if (!firstName && !lastName) return user?.email?.charAt(0).toUpperCase() || '?';
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

    return (
        <ProtectedRoute allowedRoles={['empleado']}>
            <div className="min-h-screen bg-slate-50">
                {/* Header */}
                {/* Header */}
                <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                    <div className="h-1" style={{ backgroundColor: companyColor }} />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center space-x-10">
                                <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => router.push('/prodes')}>
                                    {user?.employee?.company?.logo_url ? (
                                        <div className="flex-shrink-0 w-9 h-9 relative p-1 bg-white rounded-lg shadow-sm border border-slate-100 group-hover:scale-105 transition-transform">
                                            <img
                                                src={user.employee.company.logo_url}
                                                alt={`${user.employee.company.name} logo`}
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).parentElement!.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform border border-primary/20">
                                            <Building2 className="h-5 w-5" />
                                        </div>
                                    )}
                                    <h1 className="text-lg font-bold bg-clip-text text-transparent bg-linear-to-r from-slate-900 to-slate-600">
                                        {user?.employee?.company?.name}
                                    </h1>
                                </div>
                                <nav className="hidden lg:flex items-center space-x-1">
                                    <button
                                        onClick={() => router.push('/prodes')}
                                        className={cn(
                                            "flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                                            pathname === '/prodes' || pathname.startsWith('/prodes/') 
                                                ? "text-primary bg-primary/5 border border-primary/10" 
                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                                        )}
                                    >
                                        <Trophy className={cn("h-4 w-4", (pathname === '/prodes' || pathname.startsWith('/prodes/')) ? "text-primary" : "text-slate-400")} />
                                        <span>Mis prodes</span>
                                    </button>
                                </nav>
                            </div>
                            <div className="flex items-center space-x-6">
                                <div className="hidden sm:flex items-center space-x-3 pl-4 border-l border-slate-200">
                                    <div className="text-right">
                                        <p className="text-xs font-semibold text-slate-900 leading-none">
                                            {user?.employee?.first_name} {user?.employee?.last_name}
                                        </p>
                                        <p className="text-[10px] text-slate-500 mt-1 leading-none">{user?.employee?.company?.name}</p>
                                    </div>
                                    <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 border border-slate-200 shadow-xs">
                                        <span className="text-xs font-bold">{getInitials(user?.employee?.first_name, user?.employee?.last_name)}</span>
                                    </div>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={handleLogout}
                                    className="text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="h-4 w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Salir</span>
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
