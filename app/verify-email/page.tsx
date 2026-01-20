'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/endpoints';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setStatus('error');
            setMessage('Token de verificación no encontrado en la URL');
            return;
        }

        const verifyEmail = async () => {
            try {
                const response = await authApi.verifyEmail(token);
                setStatus('success');
                setMessage(response.data?.message || 'Email verificado exitosamente');

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } catch (error: any) {
                setStatus('error');
                setMessage(
                    error.response?.data?.message ||
                    error.message ||
                    'Error al verificar el email. Por favor intenta nuevamente.'
                );
            }
        };

        verifyEmail();
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        {status === 'loading' && (
                            <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
                        )}
                        {status === 'success' && (
                            <CheckCircle2 className="h-16 w-16 text-green-500" />
                        )}
                        {status === 'error' && (
                            <XCircle className="h-16 w-16 text-red-500" />
                        )}
                    </div>
                    <CardTitle className="text-2xl">
                        {status === 'loading' && 'Verificando Email...'}
                        {status === 'success' && '¡Email Verificado!'}
                        {status === 'error' && 'Error de Verificación'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <CardDescription className="text-base">
                        {message}
                    </CardDescription>

                    {status === 'success' && (
                        <p className="text-sm text-gray-500">
                            Redirigiendo al login en 3 segundos...
                        </p>
                    )}

                    {status === 'error' && (
                        <Button
                            onClick={() => router.push('/login')}
                            className="w-full"
                        >
                            Ir al Login
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
