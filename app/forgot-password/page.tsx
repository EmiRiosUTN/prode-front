'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, Building2, CheckCircle2 } from 'lucide-react';
import { authApi } from '@/lib/api/endpoints';
import { useCompanyConfig } from '@/contexts/CompanyConfigContext';

export default function ForgotPasswordPage() {
    const { config } = useCompanyConfig();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const res = await authApi.forgotPassword(email);
            setSuccessMessage(res.data.message);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Error al intentar recuperar la contraseña');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-50 items-center justify-center p-4">
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
                    <CardTitle className="text-2xl font-bold text-center">Recuperar Contraseña</CardTitle>
                    <CardDescription className="text-center">
                        Ingresa tu email y te enviaremos las instrucciones
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {successMessage ? (
                        <div className="flex flex-col items-center justify-center text-center space-y-4 py-4">
                            <CheckCircle2 className="h-16 w-16 text-green-500" />
                            <p className="text-gray-700 font-medium">{successMessage}</p>
                            <Link href="/login" className="w-full">
                                <Button variant="outline" className="w-full mt-4">
                                    Volver al login
                                </Button>
                            </Link>
                        </div>
                    ) : (
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

                            {error && (
                                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                                    {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    'Enviar Instrucciones'
                                )}
                            </Button>
                        </form>
                    )}
                </CardContent>
                
                {!successMessage && (
                    <CardFooter className="flex justify-center">
                        <p className="text-sm text-muted-foreground">
                            ¿Recordaste tu contraseña?{' '}
                            <Link href="/login" className="text-primary hover:underline font-medium">
                                Iniciar sesión
                            </Link>
                        </p>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
