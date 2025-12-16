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
import { Loader2, Edit, Building2, Mail, Globe, Palette } from 'lucide-react';

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
    const [logoUrl, setLogoUrl] = useState('');
    const [primaryColor, setPrimaryColor] = useState('#1976d2');
    const [secondaryColor, setSecondaryColor] = useState('#424242');

    useEffect(() => {
        if (company) {
            setName(company.name);
            setSlug(company.slug);
            setCorporateDomain(company.corporateDomain || '');
            setLogoUrl(company.logoUrl || '');
            setPrimaryColor(company.primaryColor || '#1976d2');
            setSecondaryColor(company.secondaryColor || '#424242');
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
                corporateDomain: corporateDomain || undefined,
                logoUrl: logoUrl || undefined,
                primaryColor,
                secondaryColor,
            });

            setIsEditMode(false);
            onSuccess();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        if (company) {
            setName(company.name);
            setSlug(company.slug);
            setCorporateDomain(company.corporateDomain || '');
            setLogoUrl(company.logoUrl || '');
            setPrimaryColor(company.primaryColor || '#1976d2');
            setSecondaryColor(company.secondaryColor || '#424242');
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
                        <span>Detalles de la Empresa</span>
                        {!isEditMode && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEditMode(true)}
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                            </Button>
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
                            Slug (Subdominio)
                        </Label>
                        {isEditMode ? (
                            <Input
                                id="slug"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                disabled={isLoading}
                            />
                        ) : (
                            <p className="text-base">{company.slug}</p>
                        )}
                    </div>

                    {/* Corporate Domain */}
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
                                placeholder="ejemplo.com"
                                disabled={isLoading}
                            />
                        ) : (
                            <p className="text-base">{company.corporateDomain || 'No configurado'}</p>
                        )}
                    </div>

                    {/* Logo URL */}
                    <div className="space-y-2">
                        <Label htmlFor="logoUrl">URL del Logo</Label>
                        {isEditMode ? (
                            <Input
                                id="logoUrl"
                                value={logoUrl}
                                onChange={(e) => setLogoUrl(e.target.value)}
                                placeholder="https://ejemplo.com/logo.png"
                                disabled={isLoading}
                            />
                        ) : (
                            <p className="text-base">{company.logoUrl || 'No configurado'}</p>
                        )}
                    </div>

                    {/* Colors */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="primaryColor" className="flex items-center">
                                <Palette className="h-4 w-4 mr-2" />
                                Color Primario
                            </Label>
                            {isEditMode ? (
                                <div className="flex space-x-2">
                                    <Input
                                        type="color"
                                        value={primaryColor}
                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                        className="w-16 h-10"
                                        disabled={isLoading}
                                    />
                                    <Input
                                        value={primaryColor}
                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <div
                                        className="w-8 h-8 rounded border"
                                        style={{ backgroundColor: company.primaryColor || '#1976d2' }}
                                    />
                                    <span className="text-base">{company.primaryColor || '#1976d2'}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="secondaryColor">Color Secundario</Label>
                            {isEditMode ? (
                                <div className="flex space-x-2">
                                    <Input
                                        type="color"
                                        value={secondaryColor}
                                        onChange={(e) => setSecondaryColor(e.target.value)}
                                        className="w-16 h-10"
                                        disabled={isLoading}
                                    />
                                    <Input
                                        value={secondaryColor}
                                        onChange={(e) => setSecondaryColor(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <div
                                        className="w-8 h-8 rounded border"
                                        style={{ backgroundColor: company.secondaryColor || '#424242' }}
                                    />
                                    <span className="text-base">{company.secondaryColor || '#424242'}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
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
                                    <span className={`font-medium ${company.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                        {company.isActive ? 'Activa' : 'Inactiva'}
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
                                variant="outline"
                                onClick={handleCancel}
                                disabled={isLoading}
                            >
                                Cancelar
                            </Button>
                            <Button onClick={handleSave} disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    'Guardar Cambios'
                                )}
                            </Button>
                        </>
                    ) : (
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cerrar
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
