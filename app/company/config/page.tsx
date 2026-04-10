'use client';

import { useEffect, useState } from 'react';
import { companyApi } from '@/lib/api/endpoints';
import { Company } from '@/lib/types';
import { getErrorMessage } from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';

export default function CompanyConfigPage() {
    const [config, setConfig] = useState<Company | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await companyApi.getConfig();
            setConfig(response.data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!config) return;

        try {
            setIsSaving(true);
            setError(null);
            setSuccess(false);

            await companyApi.updateConfig({
                logoUrl: config.logo_url,
                primaryColor: config.primary_color,
                secondaryColor: config.secondary_color,
                aiEnabled: config.ai_enabled,
            });

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error && !config) {
        return (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                Error al cargar configuración: {error}
            </div>
        );
    }

    if (!config) return null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>
                <p className="text-muted-foreground">
                    Personaliza la apariencia de tu empresa
                </p>
            </div>

            {/* Success Message */}
            {success && (
                <div className="bg-green-50 text-green-800 p-3 rounded-md border border-green-200">
                    ✓ Configuración guardada exitosamente
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-md">
                    {error}
                </div>
            )}

            {/* Configuration Form */}
            <form onSubmit={handleSave}>
                <Card>
                    <CardHeader>
                        <CardTitle>Personalización de Marca</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Company Info (Read-only) */}
                        <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                            <div>
                                <Label>Nombre de la Empresa</Label>
                                <p className="text-lg font-semibold mt-1">{config.name}</p>
                            </div>
                            <div>
                                <Label>Slug</Label>
                                <p className="text-lg font-semibold mt-1">{config.slug}</p>
                            </div>
                        </div>

                        {/* Logo URL */}
                        <div>
                            <Label htmlFor="logoUrl">URL del Logo</Label>
                            <Input
                                id="logoUrl"
                                value={config.logo_url || ''}
                                onChange={(e) => setConfig({ ...config, logo_url: e.target.value })}
                                placeholder="https://ejemplo.com/logo.png"
                                disabled={isSaving}
                            />
                            {config.logo_url && (
                                <div className="mt-2">
                                    <img
                                        src={config.logo_url}
                                        alt="Logo preview"
                                        className="h-16 w-auto object-contain border rounded p-2"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Colors */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="primaryColor">Color Primario</Label>
                                <div className="flex space-x-2 mt-1">
                                    <Input
                                        id="primaryColor"
                                        type="color"
                                        value={config.primary_color || '#1976d2'}
                                        onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                                        className="w-16 h-10"
                                        disabled={isSaving}
                                    />
                                    <Input
                                        value={config.primary_color || '#1976d2'}
                                        onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                                        placeholder="#1976d2"
                                        disabled={isSaving}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="secondaryColor">Color Secundario</Label>
                                <div className="flex space-x-2 mt-1">
                                    <Input
                                        id="secondaryColor"
                                        type="color"
                                        value={config.secondary_color || '#424242'}
                                        onChange={(e) => setConfig({ ...config, secondary_color: e.target.value })}
                                        className="w-16 h-10"
                                        disabled={isSaving}
                                    />
                                    <Input
                                        value={config.secondary_color || '#424242'}
                                        onChange={(e) => setConfig({ ...config, secondary_color: e.target.value })}
                                        placeholder="#424242"
                                        disabled={isSaving}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* AI Module Settings */}
                        <div className="pt-6 border-t">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base font-bold text-indigo-600">Inteligencia Artificial</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Habilita o deshabilita el análisis predictivo de IA para todos los empleados.
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="aiEnabled"
                                        checked={config.ai_enabled}
                                        onChange={(e) => setConfig({ ...config, ai_enabled: e.target.checked })}
                                        disabled={isSaving}
                                        className="h-6 w-11 rounded-full border-gray-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                                    />
                                    <Label htmlFor="aiEnabled" className="font-semibold px-2 py-1 rounded bg-indigo-50 text-indigo-700">
                                        {config.ai_enabled ? 'Habilitado' : 'Deshabilitado'}
                                    </Label>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Guardar Cambios
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
