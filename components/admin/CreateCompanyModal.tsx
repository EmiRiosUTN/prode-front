'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

interface CreateCompanyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CompanyFormData) => Promise<void>;
}

export interface CompanyFormData {
    name: string;
    slug: string;
    corporateDomain?: string;
    requireCorporateEmail: boolean;
    adminEmail: string;
    adminPassword: string;
    adminFirstName?: string;
    adminLastName?: string;
    primaryColor: string;
    secondaryColor: string;
    logoUrl?: string;
}

export function CreateCompanyModal({ isOpen, onClose, onSubmit }: CreateCompanyModalProps) {
    const [formData, setFormData] = useState<CompanyFormData>({
        name: '',
        slug: '',
        corporateDomain: '',
        requireCorporateEmail: false,
        adminEmail: '',
        adminPassword: '',
        adminFirstName: '',
        adminLastName: '',
        primaryColor: '#1976d2',
        secondaryColor: '#424242',
        logoUrl: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await onSubmit(formData);
            // Reset form
            setFormData({
                name: '',
                slug: '',
                corporateDomain: '',
                requireCorporateEmail: false,
                adminEmail: '',
                adminPassword: '',
                adminFirstName: '',
                adminLastName: '',
                primaryColor: '#1976d2',
                secondaryColor: '#424242',
                logoUrl: '',
            });
            onClose();
        } catch (err: any) {
            setError(err.message || 'Error al crear empresa');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNameChange = (name: string) => {
        setFormData({
            ...formData,
            name,
            // Auto-generate slug from name
            slug: name
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, ''),
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">Nueva Empresa</h2>
                        <button
                            onClick={onClose}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Nombre de la Empresa *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                placeholder="Ej: Acme Corporation"
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        <div>
                            <Label htmlFor="slug">Slug (Subdominio) *</Label>
                            <Input
                                id="slug"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                placeholder="Ej: acme"
                                required
                                disabled={isSubmitting}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Se usará como subdominio: {formData.slug || 'slug'}.mundialpro.com
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="corporateDomain">Dominio Corporativo (opcional)</Label>
                            <Input
                                id="corporateDomain"
                                value={formData.corporateDomain}
                                onChange={(e) => setFormData({ ...formData, corporateDomain: e.target.value })}
                                placeholder="Ej: acme.com"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="requireCorporateEmail"
                                checked={formData.requireCorporateEmail}
                                onChange={(e) => setFormData({ ...formData, requireCorporateEmail: e.target.checked })}
                                className="rounded border-input"
                                disabled={isSubmitting}
                            />
                            <Label htmlFor="requireCorporateEmail" className="cursor-pointer">
                                Requerir email corporativo para registro
                            </Label>
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-3">Administrador de la Empresa</h3>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="adminFirstName">Nombre *</Label>
                                        <Input
                                            id="adminFirstName"
                                            value={formData.adminFirstName}
                                            onChange={(e) => setFormData({ ...formData, adminFirstName: e.target.value })}
                                            placeholder="Juan"
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="adminLastName">Apellido *</Label>
                                        <Input
                                            id="adminLastName"
                                            value={formData.adminLastName}
                                            onChange={(e) => setFormData({ ...formData, adminLastName: e.target.value })}
                                            placeholder="Pérez"
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="adminEmail">Email del Admin *</Label>
                                    <Input
                                        id="adminEmail"
                                        type="email"
                                        value={formData.adminEmail}
                                        onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                                        placeholder="admin@acme.com"
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="adminPassword">Contraseña del Admin *</Label>
                                    <Input
                                        id="adminPassword"
                                        type="password"
                                        value={formData.adminPassword}
                                        onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                                        placeholder="Mínimo 6 caracteres"
                                        required
                                        minLength={6}
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-3">Personalización (opcional)</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="primaryColor">Color Primario</Label>
                                    <div className="flex space-x-2">
                                        <Input
                                            id="primaryColor"
                                            type="color"
                                            value={formData.primaryColor}
                                            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                            className="w-16 h-10"
                                            disabled={isSubmitting}
                                        />
                                        <Input
                                            value={formData.primaryColor}
                                            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                            placeholder="#1976d2"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="secondaryColor">Color Secundario</Label>
                                    <div className="flex space-x-2">
                                        <Input
                                            id="secondaryColor"
                                            type="color"
                                            value={formData.secondaryColor}
                                            onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                                            className="w-16 h-10"
                                            disabled={isSubmitting}
                                        />
                                        <Input
                                            value={formData.secondaryColor}
                                            onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                                            placeholder="#424242"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <Label htmlFor="logoUrl">URL del Logo (opcional)</Label>
                                <Input
                                    id="logoUrl"
                                    value={formData.logoUrl}
                                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                                    placeholder="https://ejemplo.com/logo.png"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end space-x-3 pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                className="bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </Button>
                            <Button
                                className="bg-slate-900 text-white hover:bg-slate-950"
                                type="submit"
                                disabled={isSubmitting}>
                                {isSubmitting ? 'Creando...' : 'Crear Empresa'}
                            </Button>
                        </div>
                    </form>
                </div>
            </Card>
        </div>
    );
}
