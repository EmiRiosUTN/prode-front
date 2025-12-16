'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function CreateUserPage() {
    const [formData, setFormData] = useState({
        companyName: '',
        companySlug: '',
        adminEmail: '',
        adminPassword: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setResult(null);

        try {
            const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'admin@mundialpro.com',
                    password: 'Admin123!MundialPro',
                }),
            });

            if (!loginResponse.ok) {
                throw new Error('Error al autenticar como admin');
            }

            const loginData = await loginResponse.json();
            const adminToken = loginData.data.accessToken;

            const companyResponse = await fetch('http://localhost:3000/api/admin/companies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${adminToken}`,
                },
                body: JSON.stringify({
                    name: formData.companyName,
                    slug: formData.companySlug,
                    requireCorporateEmail: false,
                    adminEmail: formData.adminEmail,
                    adminPassword: formData.adminPassword,
                    primaryColor: '#3B82F6',
                    secondaryColor: '#1E40AF',
                }),
            });

            if (!companyResponse.ok) {
                const errorData = await companyResponse.json();
                throw new Error(errorData.message || 'Error al crear empresa');
            }

            const companyData = await companyResponse.json();

            setResult({
                success: true,
                message: `Empresa "${companyData.data.name}" creada exitosamente!\n\nCredenciales:\nEmail: ${formData.adminEmail}\nPassword: ${formData.adminPassword}`,
            });

            setFormData({
                companyName: '',
                companySlug: '',
                adminEmail: '',
                adminPassword: '',
            });
        } catch (error) {
            setResult({
                success: false,
                message: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl">Crear Usuario de Prueba</CardTitle>
                    <CardDescription>
                        Crea una nueva empresa con su usuario administrador
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="companyName">Nombre de la Empresa</Label>
                            <Input
                                id="companyName"
                                placeholder="Ej: Mi Empresa SA"
                                value={formData.companyName}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="companySlug">Slug de la Empresa</Label>
                            <Input
                                id="companySlug"
                                placeholder="Ej: miempresa (sin espacios, minúsculas)"
                                value={formData.companySlug}
                                onChange={(e) => setFormData({ ...formData, companySlug: e.target.value.toLowerCase() })}
                                required
                                disabled={isLoading}
                            />
                            <p className="text-xs text-muted-foreground">
                                Se usará para la URL: {formData.companySlug || 'slug'}.mundialpro.com
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="adminEmail">Email del Administrador</Label>
                            <Input
                                id="adminEmail"
                                type="email"
                                placeholder="admin@miempresa.com"
                                value={formData.adminEmail}
                                onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="adminPassword">Contraseña del Administrador</Label>
                            <Input
                                id="adminPassword"
                                type="password"
                                placeholder="Mínimo 6 caracteres"
                                value={formData.adminPassword}
                                onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                                required
                                disabled={isLoading}
                                minLength={6}
                            />
                        </div>

                        {result && (
                            <div
                                className={`p-4 rounded-md whitespace-pre-line ${result.success
                                        ? 'bg-green-50 text-green-800 border border-green-200'
                                        : 'bg-red-50 text-red-800 border border-red-200'
                                    }`}
                            >
                                {result.message}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creando...
                                </>
                            ) : (
                                'Crear Empresa y Usuario'
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 pt-6 border-t">
                        <h3 className="font-semibold mb-2">Credenciales Existentes:</h3>
                        <div className="space-y-2 text-sm">
                            <div className="bg-slate-50 p-3 rounded">
                                <p className="font-medium">Admin Global:</p>
                                <p className="text-muted-foreground">admin@mundialpro.com / Admin123!MundialPro</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded">
                                <p className="font-medium">Admin Acme:</p>
                                <p className="text-muted-foreground">admin@acme.com / Company123!</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
