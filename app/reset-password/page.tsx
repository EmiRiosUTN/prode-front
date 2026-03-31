'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, Building2, CheckCircle2 } from 'lucide-react';
import { authApi } from '@/lib/api/endpoints';
import { useCompanyConfig } from '@/contexts/CompanyConfigContext';
import { Suspense } from 'react';

function ResetPasswordForm() {
    const { config } = useCompanyConfig();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const tokenParam = searchParams.get('token');
        if (tokenParam) {
            setToken(tokenParam);
        } else {
            setError("Link inválido o expirado. Asegúrate de haber ingresado desde el correo de recuperación.");
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!token) {
            setError("El token de seguridad es inválido.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        if (newPassword.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        setIsLoading(true);

        try {
            const res = await authApi.resetPassword(token, newPassword);
            setSuccessMessage(res.data.message);
            // Redirige después de 3 segundos
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Error al restablecer la contraseña.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md shadow-sm border-gray-200">
            <CardHeader className="space-y-1">
                <div className="flex justify-center mb-6">
                    {config?.logo_url ? (
                        <img src={config.logo_url} alt={config.name} className="h-16 object-contain" />
                    ) : (
                        <div className="h-16 w-16 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                            <Building2 className="h-8 w-8 text-white" />
                        </div>
                    )}
                </div>
                <CardTitle className="text-2xl font-bold text-center">Nueva Contraseña</CardTitle>
                <CardDescription className="text-center">
                    Crea una nueva contraseña segura
                </CardDescription>
            </CardHeader>

            <CardContent>
                {successMessage ? (
                    <div className="flex flex-col items-center justify-center text-center space-y-4 py-4">
                        <CheckCircle2 className="h-16 w-16 text-green-500" />
                        <p className="text-gray-700 font-medium">{successMessage}</p>
                        <p className="text-sm text-gray-500">Serás redirigido al login en unos segundos...</p>
                        <Link href="/login" className="w-full">
                            <Button variant="outline" className="w-full mt-4">
                                Ir al login
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Nueva contraseña</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-9"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    disabled={isLoading || !token}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-9"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={isLoading || !token}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={isLoading || !token}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                'Guardar nueva contraseña'
                            )}
                        </Button>
                    </form>
                )}
            </CardContent>
            
            {!successMessage && (
                <CardFooter className="flex justify-center flex-col space-y-2">
                    <p className="text-sm text-muted-foreground">
                        <Link href="/login" className="text-primary hover:underline font-medium">
                            Volver al login
                        </Link>
                    </p>
                </CardFooter>
            )}
        </Card>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex bg-gray-50 items-center justify-center p-4">
            <Suspense fallback={<div>Cargando...</div>}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}
