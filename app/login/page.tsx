'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const { login, error } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Prode</CardTitle>
                    <CardDescription className="text-center">
                        Ingresa tus credenciales para acceder
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
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
                                'Iniciar Sesión'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
