'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, CheckCircle2, Info, Loader2, Lock } from 'lucide-react';
import { authApi } from '@/lib/api/endpoints';
import { getPasswordValidationMessage } from '@/lib/auth/password-rules';
import { useCompanyConfig } from '@/contexts/CompanyConfigContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
            return;
        }

        setError('Link invalido o expirado. Asegurate de ingresar desde el correo de recuperacion.');
    }, [searchParams]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);

        if (!token) {
            setError('El token de seguridad es invalido.');
            return;
        }

        const passwordError = getPasswordValidationMessage(newPassword);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        try {
            setIsLoading(true);
            const response = await authApi.resetPassword(token, newPassword);
            setSuccessMessage(response.data.message);
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
        <Card className="w-full max-w-md border-gray-200 shadow-sm">
            <CardHeader className="space-y-1">
                <div className="mb-6 flex justify-center">
                    {config?.logo_url ? (
                        <img src={config.logo_url} alt={config.name} className="h-16 object-contain" />
                    ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary shadow-lg">
                            <Building2 className="h-8 w-8 text-white" />
                        </div>
                    )}
                </div>
                <CardTitle className="text-center text-2xl font-bold">Nueva contraseña</CardTitle>
                <CardDescription className="text-center">
                    Crea una nueva contraseña segura
                </CardDescription>
            </CardHeader>

            <CardContent>
                {successMessage ? (
                    <div className="flex flex-col items-center justify-center space-y-4 py-4 text-center">
                        <CheckCircle2 className="h-16 w-16 text-green-500" />
                        <p className="font-medium text-gray-700">{successMessage}</p>
                        <p className="text-sm text-gray-500">Seras redirigido al login en unos segundos...</p>
                        <Link href="/login" className="w-full">
                            <Button variant="outline" className="mt-4 w-full">
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
                                    placeholder="********"
                                    className="pl-9"
                                    value={newPassword}
                                    onChange={(event) => setNewPassword(event.target.value)}
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
                                    placeholder="********"
                                    className="pl-9"
                                    value={confirmPassword}
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                    required
                                    disabled={isLoading || !token}
                                />
                            </div>
                        </div>

                        <Alert className="bg-blue-50 border-blue-200">
                            <Info className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="text-sm text-blue-800">
                                <strong>Requisitos de contraseña:</strong>
                                <ul className="list-disc list-inside mt-1 space-y-0.5">
                                    <li>Mínimo 8 caracteres</li>
                                    <li>Al menos una mayúscula</li>
                                    <li>Al menos una minúscula</li>
                                    <li>Al menos un número</li>
                                    <li>Al menos un carácter especial</li>
                                </ul>
                            </AlertDescription>
                        </Alert>

                        {error && (
                            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
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
                <CardFooter className="flex flex-col justify-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                        <Link href="/login" className="font-medium text-primary hover:underline">
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
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Suspense fallback={<div>Cargando...</div>}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}
