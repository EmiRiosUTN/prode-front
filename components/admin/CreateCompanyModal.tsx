'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { X, Plus, Trash2 } from 'lucide-react';
import { RegistrationFieldConfig, DEFAULT_REGISTRATION_FIELDS } from '@/lib/types';

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
    requireEmailConfirmation: boolean;
    adminEmail: string;
    adminPassword: string;
    adminFirstName?: string;
    adminLastName?: string;
    primaryColor: string;
    secondaryColor: string;
    logoUrl?: string;
    sendVerificationEmail?: boolean;
    aiEnabled: boolean;
    registrationFields?: RegistrationFieldConfig[];
}

const SYSTEM_FIELDS_META: { key: string; defaultLabel: string; canHide: boolean }[] = [
    { key: 'firstName',     defaultLabel: 'Nombre',             canHide: false },
    { key: 'lastName',      defaultLabel: 'Apellido',           canHide: false },
    { key: 'email',         defaultLabel: 'Email Corporativo',  canHide: false },
    { key: 'phone',         defaultLabel: 'Teléfono',           canHide: true  },
    { key: 'companyAreaId', defaultLabel: 'Área / Departamento', canHide: true  },
];

function buildDefaultFields(): RegistrationFieldConfig[] {
    return SYSTEM_FIELDS_META.map(f => ({
        key: f.key,
        label: f.defaultLabel,
        visible: true,
        required: true,
        isCustom: false,
    }));
}

export function CreateCompanyModal({ isOpen, onClose, onSubmit }: CreateCompanyModalProps) {
    const [formData, setFormData] = useState<CompanyFormData>({
        name: '',
        slug: '',
        corporateDomain: '',
        requireCorporateEmail: false,
        requireEmailConfirmation: true,
        adminEmail: '',
        adminPassword: '',
        adminFirstName: '',
        adminLastName: '',
        primaryColor: '#1976d2',
        secondaryColor: '#424242',
        logoUrl: '',
        sendVerificationEmail: true,
        aiEnabled: true,
        registrationFields: buildDefaultFields(),
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // New custom field inputs
    const [newFieldLabel, setNewFieldLabel] = useState('');
    const [newFieldRequired, setNewFieldRequired] = useState(true);

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
                requireEmailConfirmation: true,
                adminEmail: '',
                adminPassword: '',
                adminFirstName: '',
                adminLastName: '',
                primaryColor: '#1976d2',
                secondaryColor: '#424242',
                logoUrl: '',
                sendVerificationEmail: true,
                aiEnabled: true,
                registrationFields: buildDefaultFields(),
            });
            setNewFieldLabel('');
            setNewFieldRequired(true);
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
            slug: name
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, ''),
        });
    };

    // ----- Registration fields helpers -----
    const fields = formData.registrationFields ?? buildDefaultFields();

    const updateField = (key: string, changes: Partial<RegistrationFieldConfig>) => {
        setFormData(prev => ({
            ...prev,
            registrationFields: (prev.registrationFields ?? buildDefaultFields()).map(f =>
                f.key === key ? { ...f, ...changes } : f,
            ),
        }));
    };

    const removeCustomField = (key: string) => {
        setFormData(prev => ({
            ...prev,
            registrationFields: (prev.registrationFields ?? []).filter(f => f.key !== key),
        }));
    };

    const addCustomField = () => {
        if (!newFieldLabel.trim()) return;
        const key = newFieldLabel
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');

        // Avoid duplicate keys
        if (fields.some(f => f.key === key)) {
            setError(`Ya existe un campo con la clave "${key}"`);
            return;
        }

        const newField: RegistrationFieldConfig = {
            key,
            label: newFieldLabel.trim(),
            visible: true,
            required: newFieldRequired,
            isCustom: true,
        };

        setFormData(prev => ({
            ...prev,
            registrationFields: [...(prev.registrationFields ?? buildDefaultFields()), newField],
        }));
        setNewFieldLabel('');
        setNewFieldRequired(true);
        setError(null);
    };

    const systemFields = fields.filter(f => !f.isCustom);
    const customFields = fields.filter(f => f.isCustom);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">Nueva empresa</h2>
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
                            <Label htmlFor="name">Nombre de la empresa *</Label>
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
                                Se usará como subdominio: {formData.slug || 'slug'}.prodemax.com
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="corporateDomain">Dominio corporativo (opcional)</Label>
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

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="requireEmailConfirmation"
                                checked={formData.requireEmailConfirmation}
                                onChange={(e) => setFormData({ ...formData, requireEmailConfirmation: e.target.checked })}
                                className="rounded border-input"
                                disabled={isSubmitting}
                            />
                            <Label htmlFor="requireEmailConfirmation" className="cursor-pointer">
                                Requerir confirmación de email (los usuarios reciben link de activación)
                            </Label>
                        </div>

                        {/* Admin section */}
                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-3">Administrador de la empresa</h3>
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
                                <div className="flex items-center space-x-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="sendVerificationEmail"
                                        checked={formData.sendVerificationEmail !== false}
                                        onChange={(e) => setFormData({ ...formData, sendVerificationEmail: e.target.checked })}
                                        className="rounded border-input"
                                        disabled={isSubmitting}
                                    />
                                    <Label htmlFor="sendVerificationEmail" className="cursor-pointer font-normal">
                                        Enviar email de bienvenida y verificación al administrador
                                    </Label>
                                </div>
                            </div>
                        </div>

                        {/* Customization */}
                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-3">Personalización (opcional)</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="primaryColor">Color primario</Label>
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
                            </div>
                            <div className="mt-4">
                                <Label htmlFor="logoUrl">URL del logo</Label>
                                <Input
                                    id="logoUrl"
                                    value={formData.logoUrl}
                                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                                    placeholder="https://ejemplo.com/logo.png"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="flex items-center space-x-2 pt-4">
                                <input
                                    type="checkbox"
                                    id="aiEnabled"
                                    checked={formData.aiEnabled}
                                    onChange={(e) => setFormData({ ...formData, aiEnabled: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                                    disabled={isSubmitting}
                                />
                                <Label htmlFor="aiEnabled" className="cursor-pointer font-bold text-indigo-600">
                                    Habilitar Módulo IA
                                </Label>
                            </div>
                        </div>

                        {/* ===== REGISTRATION FIELDS SECTION ===== */}
                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-1">Formulario de Registro</h3>
                            <p className="text-xs text-muted-foreground mb-3">
                                Configurá qué datos se pedirán a los usuarios al registrarse en esta empresa.
                            </p>

                            {/* System fields table */}
                            <div className="bg-gray-50 rounded-lg border overflow-hidden mb-3">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-100 text-left">
                                            <th className="px-3 py-2 font-medium text-gray-600">Campo</th>
                                            <th className="px-3 py-2 font-medium text-gray-600">Etiqueta visible</th>
                                            <th className="px-3 py-2 font-medium text-gray-600 text-center">Visible</th>
                                            <th className="px-3 py-2 font-medium text-gray-600 text-center">Req.</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {systemFields.map(field => {
                                            const meta = SYSTEM_FIELDS_META.find(m => m.key === field.key);
                                            return (
                                                <tr key={field.key} className={!field.visible ? 'opacity-50' : ''}>
                                                    <td className="px-3 py-2 font-mono text-xs text-gray-500">
                                                        {meta?.defaultLabel || field.key}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input
                                                            value={field.label}
                                                            onChange={e => updateField(field.key, { label: e.target.value })}
                                                            className="h-7 text-sm"
                                                            disabled={isSubmitting || !field.visible}
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        {meta?.canHide ? (
                                                            <input
                                                                type="checkbox"
                                                                checked={field.visible}
                                                                onChange={e => updateField(field.key, { visible: e.target.checked, required: e.target.checked ? field.required : false })}
                                                                disabled={isSubmitting}
                                                                className="h-4 w-4 rounded border-gray-300"
                                                            />
                                                        ) : (
                                                            <span className="text-gray-400 text-xs">🔒</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        {!meta?.canHide ? (
                                                            <span className="text-gray-400 text-xs">🔒</span>
                                                        ) : (
                                                            <input
                                                                type="checkbox"
                                                                checked={field.required}
                                                                onChange={e => updateField(field.key, { required: e.target.checked })}
                                                                disabled={isSubmitting || !field.visible}
                                                                className="h-4 w-4 rounded border-gray-300"
                                                            />
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Custom fields */}
                            {customFields.length > 0 && (
                                <div className="mb-3 space-y-2">
                                    <p className="text-xs font-medium text-gray-600">Campos personalizados:</p>
                                    {customFields.map(field => (
                                        <div key={field.key} className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-md px-3 py-2">
                                            <span className="flex-1 text-sm font-medium">{field.label}</span>
                                            <span className="text-xs text-gray-500 font-mono">{field.key}</span>
                                            <span className={`text-xs px-1.5 py-0.5 rounded ${field.required ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {field.required ? 'obligatorio' : 'opcional'}
                                            </span>
                                            <input
                                                type="checkbox"
                                                checked={field.required}
                                                onChange={e => updateField(field.key, { required: e.target.checked })}
                                                title="Obligatorio"
                                                className="h-4 w-4 rounded border-gray-300"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeCustomField(field.key)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add custom field */}
                            <div className="flex gap-2 items-end">
                                <div className="flex-1">
                                    <Label className="text-xs">Nuevo campo personalizado</Label>
                                    <Input
                                        value={newFieldLabel}
                                        onChange={e => setNewFieldLabel(e.target.value)}
                                        placeholder="Ej: Colegio, DNI, Legajo..."
                                        className="h-8 text-sm"
                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomField())}
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div className="flex items-center gap-1 pb-0.5">
                                    <input
                                        type="checkbox"
                                        id="newFieldRequired"
                                        checked={newFieldRequired}
                                        onChange={e => setNewFieldRequired(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <Label htmlFor="newFieldRequired" className="text-xs whitespace-nowrap cursor-pointer">Obligatorio</Label>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addCustomField}
                                    disabled={!newFieldLabel.trim() || isSubmitting}
                                    className="h-8"
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Agregar
                                </Button>
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
                                {isSubmitting ? 'Creando...' : 'Crear empresa'}
                            </Button>
                        </div>
                    </form>
                </div>
            </Card>
        </div>
    );
}
