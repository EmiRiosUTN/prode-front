'use client';

import { useState, useEffect } from 'react';
import { adminCompaniesApi } from '@/lib/api/endpoints';
import { Company, RegistrationFieldConfig, DEFAULT_REGISTRATION_FIELDS } from '@/lib/types';
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
import { Loader2, Edit, Building2, Mail, Globe, Palette, Trash2, Plus, ClipboardList } from 'lucide-react';
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
    const [requireEmailConfirmation, setRequireEmailConfirmation] = useState(true);
    const [logoUrl, setLogoUrl] = useState('');
    const [primaryColor, setPrimaryColor] = useState('');
    const [secondaryColor, setSecondaryColor] = useState('');
    const [aiEnabled, setAiEnabled] = useState(true);
    const [registrationFields, setRegistrationFields] = useState<RegistrationFieldConfig[]>(DEFAULT_REGISTRATION_FIELDS);

    // New custom field inputs
    const [newFieldLabel, setNewFieldLabel] = useState('');
    const [newFieldRequired, setNewFieldRequired] = useState(true);

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

    useEffect(() => {
        if (company) {
            setName(company.name);
            setSlug(company.slug);
            setCorporateDomain(company.corporate_domain || '');
            setRequireCorporateEmail(company.require_corporate_email || false);
            setRequireEmailConfirmation(company.require_email_confirmation ?? true);
            setLogoUrl(company.logo_url || '');
            setPrimaryColor(company.primary_color || '#1976d2');
            setSecondaryColor(company.secondary_color || '#424242');
            setAiEnabled(company.ai_enabled ?? true);
            setRegistrationFields(
                company.registration_fields && company.registration_fields.length > 0
                    ? company.registration_fields
                    : buildDefaultFields()
            );
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
                requireEmailConfirmation,
                logoUrl,
                primaryColor,
                secondaryColor,
                aiEnabled,
                registrationFields,
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
            setRegistrationFields(
                company.registration_fields && company.registration_fields.length > 0
                    ? company.registration_fields
                    : buildDefaultFields()
            );
        }
        setIsEditMode(false);
        setError(null);
    };

    // Registration fields helpers
    const updateField = (key: string, changes: Partial<RegistrationFieldConfig>) => {
        setRegistrationFields(prev => prev.map(f => f.key === key ? { ...f, ...changes } : f));
    };

    const removeCustomField = (key: string) => {
        setRegistrationFields(prev => prev.filter(f => f.key !== key));
    };

    const addCustomField = () => {
        if (!newFieldLabel.trim()) return;
        const key = newFieldLabel
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');

        if (registrationFields.some(f => f.key === key)) {
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
        setRegistrationFields(prev => [...prev, newField]);
        setNewFieldLabel('');
        setNewFieldRequired(true);
        setError(null);
    };

    const systemFields = registrationFields.filter(f => !f.isCustom);
    const customFields = registrationFields.filter(f => f.isCustom);

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
                                <div className="flex flex-col space-y-4">
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
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="requireEmailConfirmation"
                                            checked={requireEmailConfirmation}
                                            onChange={(e) => setRequireEmailConfirmation(e.target.checked)}
                                            disabled={isLoading}
                                            className="h-4 w-4 rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                                        />
                                        <Label htmlFor="requireEmailConfirmation" className="cursor-pointer">
                                            Requerir confirmación de email
                                        </Label>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col space-y-2 text-sm">
                                    <span className={company.require_corporate_email ? "text-green-600" : "text-muted-foreground"}>
                                        {company.require_corporate_email ? "Email corporativo: Requerido" : "Email corporativo: No requerido"}
                                    </span>
                                    <span className={company.require_email_confirmation ?? true ? "text-green-600" : "text-muted-foreground"}>
                                        {(company.require_email_confirmation ?? true) ? "Confirmación email: Requerida" : "Confirmación email: No requerida"}
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

                    {/* Registration Fields Section */}
                    <div className="pt-4 border-t">
                        <h4 className="font-semibold mb-1 flex items-center gap-2">
                            <ClipboardList className="h-4 w-4" />
                            Formulario de Registro
                        </h4>
                        <p className="text-xs text-muted-foreground mb-3">
                            Campos que se pedirán a los usuarios al registrarse en esta empresa.
                        </p>

                        {isEditMode ? (
                            <>
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
                                                                disabled={isLoading || !field.visible}
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2 text-center">
                                                            {meta?.canHide ? (
                                                                <input
                                                                    type="checkbox"
                                                                    checked={field.visible}
                                                                    onChange={e => updateField(field.key, { visible: e.target.checked, required: e.target.checked ? field.required : false })}
                                                                    disabled={isLoading}
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
                                                                    disabled={isLoading || !field.visible}
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
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div className="flex items-center gap-1 pb-0.5">
                                        <input
                                            type="checkbox"
                                            id="newFieldRequiredEdit"
                                            checked={newFieldRequired}
                                            onChange={e => setNewFieldRequired(e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300"
                                        />
                                        <Label htmlFor="newFieldRequiredEdit" className="text-xs whitespace-nowrap cursor-pointer">Obligatorio</Label>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addCustomField}
                                        disabled={!newFieldLabel.trim() || isLoading}
                                        className="h-8"
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Agregar
                                    </Button>
                                </div>
                            </>
                        ) : (
                            /* View mode - show summary of configured fields */
                            <div className="space-y-1">
                                {registrationFields.map(field => (
                                    <div key={field.key} className="flex items-center gap-2 text-sm">
                                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${field.visible ? 'bg-green-500' : 'bg-gray-300'}`} />
                                        <span className={field.visible ? 'font-medium' : 'text-gray-400 line-through'}>
                                            {field.label}
                                        </span>
                                        {field.isCustom && (
                                            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">custom</span>
                                        )}
                                        {field.visible && (
                                            <span className={`text-xs px-1.5 py-0.5 rounded ml-auto ${field.required ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                                                {field.required ? 'obligatorio' : 'opcional'}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

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
