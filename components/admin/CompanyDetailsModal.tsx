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

    // Form fields (only editable ones)
    const [name, setName] = useState('');
    const [primaryColor, setPrimaryColor] = useState('');
    useEffect(() => {
        if (company) {
            setName(company.name);
            setPrimaryColor(company.primary_color || '');
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
                primaryColor
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
            setPrimaryColor(company.primary_color || '');
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

                    {/* Corporate Domain - Read Only */}
                    <div className="space-y-2">
                        <Label className="flex items-center">
                            <Mail className="h-4 w-4 mr-2" />
                            Dominio Corporativo
                        </Label>
                        <p className="text-base">{company.corporate_domain || 'No configurado'}</p>
                    </div>

                    {/* Logo URL - Read Only */}
                    <div className="space-y-2">
                        <Label>URL del Logo</Label>
                        <p className="text-base">{company.logo_url || 'No configurado'}</p>
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
                                        style={{ backgroundColor: company.primary_color }}
                                    />
                                    <span className="text-base">{company.primary_color}</span>
                                </div>
                            )}
                        </div>

                        {/* Secondary Color - Read Only */}
                        <div className="space-y-2">
                            <Label>Color Secundario</Label>
                            <div className="flex items-center space-x-2">
                                <div
                                    className="w-8 h-8 rounded border"
                                    style={{ backgroundColor: company.secondary_color }}
                                />
                                <span className="text-base">{company.secondary_color}</span>
                            </div>
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
