'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, Lock, Building2 } from 'lucide-react';
import { companyApi } from '@/lib/api/endpoints';
import { Company } from '@/lib/types';
import { toast } from 'sonner';

export default function LoginPage() {
    const router = useRouter();
    const { login, error } = useAuth();
    const [config, setConfig] = useState<Company | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                // Skip config fetch for admin subdomain
                const hostname = window.location.hostname;
                const subdomain = hostname.split('.')[0];

                if (subdomain === 'admin') {
                    // Admin subdomain doesn't need company branding
                    return;
                }

                // Fetch public config (logo, colors) for branding
                const response = await companyApi.getPublicConfig();
                setConfig(response.data);
                if (response.data.primary_color) {
                    document.documentElement.style.setProperty('--primary', response.data.primary_color);
                }
            } catch (error) {
                console.error("Error loading company config:", error);
                // Non-blocking error, user can still login
            }
        };
        fetchConfig();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError(null);
        setIsLoading(true);

        try {
            await login({ email, password });

            // Get user from localStorage to determine redirect
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);

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
                        router.push('/');
                }
            }
        } catch (err) {
            setLoginError(err instanceof Error ? err.message : 'Error al iniciar sesión');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Left Column - Branding (Only visible on large screens) */}
            <div className="hidden lg:flex w-1/2 bg-slate-400 items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10 text-white text-center max-w-lg">
                    {config?.logo_url ? (
                        <img src={config.logo_url} alt={config.name} className="h-24 mx-auto mb-8 object-contain" />
                    ) : (
                        <Building2 className="h-24 w-24 mx-auto mb-8 opacity-90" />
                    )}
                    <h1 className="text-4xl font-bold mb-4">
                        {config ? `Bienvenido a ${config.name}` : 'Bienvenido a Prode'}
                    </h1>
                    <p className="text-lg opacity-90">
                        Ingresa a la plataforma para gestionar tus pronósticos y competir.
                    </p>
                </div>
            </div>

            {/* Right Column - Form */}
            <div className="flex-1 flex items-center justify-center p-4 lg:p-8 overflow-y-auto">
                <Card className="w-full max-w-md border-none shadow-none bg-transparent">
                    <CardHeader className="space-y-1">
                        <div className="lg:hidden flex justify-center mb-4">
                            {config?.logo_url ? (
                                <img src={config.logo_url} alt={config.name} className="h-12 object-contain" />
                            ) : (
                                <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
                                    <Building2 className="h-6 w-6 text-white" />
                                </div>
                            )}
                        </div>
                        <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
                        <CardDescription className="text-center">
                            Ingresa tus credenciales para acceder
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Corporativo</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="tu@email.com"
                                        className="pl-9"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Contraseña</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-9"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {(loginError || error) && (
                                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                                    {loginError || error}
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Iniciando sesión...
                                    </>
                                ) : (
                                    'Ingresar'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center flex-col space-y-2">
                        <p className="text-sm text-muted-foreground">
                            ¿No tienes cuenta?{' '}
                            <Link href="/register" className="text-primary hover:underline font-medium">
                                Regístrate aquí
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
