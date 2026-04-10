'use client';

import { useState, useEffect } from 'react';
import { adminCompaniesApi } from '@/lib/api/endpoints';
import { Company } from '@/lib/types';
import { getErrorMessage } from '@/lib/api/client';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Edit, Building2, Mail, Globe, Palette, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface CompanyDetailsModalProps {
    company: Company | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CompanyDetailsModal({ company, open, onOpenChange, onSuccess }: CompanyDetailsModalProps) {
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form fields
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [corporateDomain, setCorporateDomain] = useState('');
    const [requireCorporateEmail, setRequireCorporateEmail] = useState(false);
    const [logoUrl, setLogoUrl] = useState('');
    const [primaryColor, setPrimaryColor] = useState('');
    const [secondaryColor, setSecondaryColor] = useState('');
    const [aiEnabled, setAiEnabled] = useState(true);

    useEffect(() => {
        if (company) {
            setName(company.name);
            setSlug(company.slug);
            setCorporateDomain(company.corporate_domain || '');
            setRequireCorporateEmail(company.require_corporate_email || false);
            setLogoUrl(company.logo_url || '');
            setPrimaryColor(company.primary_color || '#1976d2');
            setSecondaryColor(company.secondary_color || '#424242');
            setAiEnabled(company.ai_enabled ?? true);
            setIsEditMode(false);
            setError(null);
        }
    }, [company]);

    const handleSave = async () => {
        if (!company) return;

        setIsLoading(true);
        setError(null);

        try {
            await adminCompaniesApi.update(company.id, {
                name,
                slug,
                corporateDomain,
                requireCorporateEmail,
                logoUrl,
                primaryColor,
                secondaryColor,
                aiEnabled,
            });

            setIsEditMode(false);
            toast.success('Empresa actualizada correctamente');
            onSuccess();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!company) return;
        const actionDescriptor = company.is_active ? "desactivará todo y bloqueará el acceso a sus usuarios (Soft Delete)" : "ELIMINARÁ FÍSICAMENTE de la base de datos la empresa sin posibilidad de recuperarla (Hard Delete)";
        if (!confirm(`¿Estás seguro de que querés borrar a la empresa "${company.name}"? Esto ${actionDescriptor}.`)) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await adminCompaniesApi.delete(company.id);
            toast.success('Empresa eliminada correctamente.');
            setIsEditMode(false);
            onOpenChange(false);
            onSuccess();
        } catch (err) {
            setError(getErrorMessage(err));
            toast.error(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        if (company) {
            setName(company.name);
            setSlug(company.slug);
            setCorporateDomain(company.corporate_domain || '');
            setRequireCorporateEmail(company.require_corporate_email || false);
            setLogoUrl(company.logo_url || '');
            setPrimaryColor(company.primary_color || '#1976d2');
            setSecondaryColor(company.secondary_color || '#424242');
            setAiEnabled(company.ai_enabled ?? true);
        }
        setIsEditMode(false);
        setError(null);
    };

    if (!company) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Detalles de la empresa</span>
                        {!isEditMode && (
                            <div className="flex space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsEditMode(true)}
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleDelete}
                                    disabled={isLoading}
                                    title={company.is_active ? "Eliminar (Soft Delete)" : "Eliminar Permanentemente (Hard Delete)"}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    {company.is_active ? 'Borrar' : 'Eliminar Definitivamente'}
                                </Button>
                            </div>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode ? 'Edita la información de la empresa' : 'Información completa de la empresa'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center">
                            <Building2 className="h-4 w-4 mr-2" />
                            Nombre
                        </Label>
                        {isEditMode ? (
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isLoading}
                            />
                        ) : (
                            <p className="text-base font-semibold">{company.name}</p>
                        )}
                    </div>

                    {/* Slug */}
                    <div className="space-y-2">
                        <Label htmlFor="slug" className="flex items-center">
                            <Globe className="h-4 w-4 mr-2" />
                            Slug (URL)
                        </Label>
                        {isEditMode ? (
                            <Input
                                id="slug"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                disabled={isLoading}
                                placeholder="ejemplo-empresa"
                            />
                        ) : (
                            <p className="text-base font-mono">{company.slug}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Domain */}
                        <div className="space-y-2">
                            <Label htmlFor="corporateDomain" className="flex items-center">
                                <Mail className="h-4 w-4 mr-2" />
                                Dominio Corporativo
                            </Label>
                            {isEditMode ? (
                                <Input
                                    id="corporateDomain"
                                    value={corporateDomain}
                                    onChange={(e) => setCorporateDomain(e.target.value)}
                                    disabled={isLoading}
                                    placeholder="empresa.com"
                                />
                            ) : (
                                <p className="text-base">{company.corporate_domain || 'No configurado'}</p>
                            )}
                        </div>

                        {/* Require Corporate Email */}
                        <div className="flex items-center space-x-2 pt-8">
                            {isEditMode ? (
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="requireCorporateEmail"
                                        checked={requireCorporateEmail}
                                        onChange={(e) => setRequireCorporateEmail(e.target.checked)}
                                        disabled={isLoading}
                                        className="h-4 w-4 rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                                    />
                                    <Label htmlFor="requireCorporateEmail" className="cursor-pointer">
                                        Requerir email corporativo
                                    </Label>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2 text-sm">
                                    <span className={company.require_corporate_email ? "text-green-600" : "text-muted-foreground"}>
                                        {company.require_corporate_email ? "Email corporativo: Requerido" : "Email corporativo: No requerido"}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* AI Module Toggle */}
                        <div className="flex items-center space-x-2 pt-8 border-l pl-4">
                            {isEditMode ? (
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="aiEnabled"
                                        checked={aiEnabled}
                                        onChange={(e) => setAiEnabled(e.target.checked)}
                                        disabled={isLoading}
                                        className="h-4 w-4 rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                                    />
                                    <Label htmlFor="aiEnabled" className="cursor-pointer font-bold text-indigo-600">
                                        Habilitar Módulo IA
                                    </Label>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2 text-sm">
                                    <span className={company.ai_enabled ? "text-indigo-600 font-bold" : "text-muted-foreground"}>
                                        {company.ai_enabled ? "IA: Habilitada" : "IA: Deshabilitada"}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Logo URL */}
                    <div className="space-y-2">
                        <Label htmlFor="logoUrl" className="flex items-center">
                            <Building2 className="h-4 w-4 mr-2" />
                            URL del Logo
                        </Label>
                        {isEditMode ? (
                            <Input
                                id="logoUrl"
                                value={logoUrl}
                                onChange={(e) => setLogoUrl(e.target.value)}
                                disabled={isLoading}
                                placeholder="https://ejemplo.com/logo.png"
                            />
                        ) : (
                            <div className="flex items-center space-x-4">
                                {company.logo_url ? (
                                    <img src={company.logo_url} alt="Logo" className="h-10 object-contain border rounded p-1" />
                                ) : (
                                    <p className="text-base text-muted-foreground italic">Sin logo</p>
                                )}
                                <span className="text-xs truncate max-w-[300px]">{company.logo_url}</span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Primary Color */}
                        <div className="space-y-2">
                            <Label htmlFor="primaryColor" className="flex items-center">
                                <Palette className="h-4 w-4 mr-2" />
                                Color primario
                            </Label>
                            {isEditMode ? (
                                <div className="flex space-x-2">
                                    <Input
                                        type="color"
                                        value={primaryColor}
                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                        className="w-12 h-10 p-1"
                                        disabled={isLoading}
                                    />
                                    <Input
                                        value={primaryColor}
                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                        className="font-mono"
                                        disabled={isLoading}
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <div
                                        className="w-8 h-8 rounded border"
                                        style={{ backgroundColor: company.primary_color }}
                                    />
                                    <span className="font-mono">{company.primary_color}</span>
                                </div>
                            )}
                        </div>

                        {/* Secondary Color */}
                        <div className="space-y-2">
                            <Label htmlFor="secondaryColor" className="flex items-center">
                                <Palette className="h-4 w-4 mr-2" />
                                Color secundario
                            </Label>
                            {isEditMode ? (
                                <div className="flex space-x-2">
                                    <Input
                                        type="color"
                                        value={secondaryColor}
                                        onChange={(e) => setSecondaryColor(e.target.value)}
                                        className="w-12 h-10 p-1"
                                        disabled={isLoading}
                                    />
                                    <Input
                                        value={secondaryColor}
                                        onChange={(e) => setSecondaryColor(e.target.value)}
                                        className="font-mono"
                                        disabled={isLoading}
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <div
                                        className="w-8 h-8 rounded border"
                                        style={{ backgroundColor: company.secondary_color }}
                                    />
                                    <span className="font-mono">{company.secondary_color}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {!isEditMode && (
                        <div className="pt-4 border-t">
                            <h4 className="font-semibold mb-2">Estadísticas</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Áreas:</span>{' '}
                                    <span className="font-medium">{company._count?.areas || 0}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Empleados:</span>{' '}
                                    <span className="font-medium">{company._count?.employees || 0}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Prodes:</span>{' '}
                                    <span className="font-medium">{company._count?.prodes || 0}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Estado:</span>{' '}
                                    <span className={`font-medium ${company.is_active ? 'text-green-600' : 'text-red-600'}`}>
                                        {company.is_active ? 'Activa' : 'Inactiva'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                            {error}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {isEditMode ? (
                        <>
                            <Button
                                variant="ghost"
                                onClick={handleCancel}
                                disabled={isLoading}
                                className="bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="bg-slate-900 text-white hover:bg-slate-800"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    'Guardar cambios'
                                )}
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="secondary"
                            onClick={() => onOpenChange(false)}
                            className="bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                        >
                            Cerrar
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
