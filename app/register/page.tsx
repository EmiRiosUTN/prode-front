'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Mail, Lock, Phone, Building2, ArrowRight, CheckCircle2, Info } from 'lucide-react';
import { companyApi, authApi } from '@/lib/api/endpoints';
import { Company, RegistrationFieldConfig, DEFAULT_REGISTRATION_FIELDS } from '@/lib/types';
import { toast } from 'sonner';
import { PasswordRequirementsAlert } from '@/components/auth/PasswordRequirementsAlert';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

type PublicConfig = Company & { areas: { id: string; name: string }[] };

// ─── build Zod schema dynamically based on registration_fields ───────────────
function buildSchema(fields: RegistrationFieldConfig[]) {
    const getField = (key: string) => fields.find(f => f.key === key);
    const isRequired = (key: string) => {
        const field = getField(key);
        return field ? field.visible && field.required : true;
    };

    const phoneField = getField('phone');
    const areaField = getField('companyAreaId');

    // Collect custom fields
    const customFields = fields.filter(f => f.isCustom && f.visible);

    const customShape: Record<string, z.ZodTypeAny> = {};
    for (const f of customFields) {
        customShape[f.key] = f.required
            ? z.string().min(1, `${f.label} es obligatorio`)
            : z.string().optional();
    }

    return z.object({
        firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
        lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
        email: z.string().email('Email inválido'),
        phone: phoneField?.visible
            ? (isRequired('phone')
                ? z.string().min(6, 'Número de teléfono inválido')
                : z.string().optional())
            : z.string().optional(),
        password: z.string()
            .min(8, 'La contraseña debe tener al menos 8 caracteres')
            .regex(/[a-z]/, 'Debe contener al menos una minúscula')
            .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
            .regex(/\d/, 'Debe contener al menos un número'),
        confirmPassword: z.string(),
        companyAreaId: areaField?.visible
            ? (isRequired('companyAreaId')
                ? z.string().min(1, 'Debes seleccionar un área')
                : z.string().optional())
            : z.string().optional(),
        acceptTerms: z.boolean().refine(val => val === true, {
            message: "Debes aceptar las políticas y términos de uso"
        }),
        ...customShape,
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
    });
}

// ─── default values ──────────────────────────────────────────────────────────
function buildDefaultValues(fields: RegistrationFieldConfig[]) {
    const customDefaults: Record<string, string> = {};
    for (const f of fields.filter(f => f.isCustom && f.visible)) {
        customDefaults[f.key] = '';
    }
    return {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        companyAreaId: '',
        acceptTerms: false,
        ...customDefaults,
    };
}

export default function RegisterPage() {
    const router = useRouter();
    const [config, setConfig] = useState<PublicConfig | null>(null);
    const [isLoadingConfig, setIsLoadingConfig] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [activeFields, setActiveFields] = useState<RegistrationFieldConfig[]>(DEFAULT_REGISTRATION_FIELDS);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const hostname = window.location.hostname;
                const subdomain = hostname.split('.')[0];

                if (subdomain === 'admin') {
                    setIsLoadingConfig(false);
                    return;
                }

                const response = await companyApi.getPublicConfig();
                const data = response.data as PublicConfig;
                setConfig(data);

                // Use company's registration_fields or fall back to defaults
                const fields = data.registration_fields && data.registration_fields.length > 0
                    ? data.registration_fields
                    : DEFAULT_REGISTRATION_FIELDS;
                setActiveFields(fields);

                // CSS variables are now handled globally by CompanyConfigProvider in layout.tsx
            } catch (error) {
                console.error("Error loading company config:", error);
                toast.error("Error al cargar la configuración de la empresa. Verifique que el enlace sea correcto.");
            } finally {
                setIsLoadingConfig(false);
            }
        };

        fetchConfig();
    }, []);

    const schema = buildSchema(activeFields);
    type FormValues = z.infer<typeof schema>;

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: buildDefaultValues(activeFields),
    });

    useEffect(() => {
        form.reset(buildDefaultValues(activeFields));
    }, [activeFields, form]);

    const onSubmit = async (values: FormValues) => {
        try {
            setIsSubmitting(true);

            // Separate core fields from custom extra data
            const { email, password, firstName, lastName, phone, companyAreaId, confirmPassword, acceptTerms, ...rest } = values as any;
            const customFields = activeFields.filter(f => f.isCustom && f.visible);
            const extraData: Record<string, string> = {};
            for (const f of customFields) {
                if (rest[f.key]) extraData[f.key] = rest[f.key];
            }

            const response = await authApi.register({
                email,
                password,
                firstName,
                lastName,
                phone: phone || undefined,
                companyAreaId: companyAreaId || undefined,
                ...(Object.keys(extraData).length > 0 ? { extraData } : {}),
            });

            setRegisteredEmail(email);
            setShowSuccessModal(true);
            const successMessage = (response.data as any).message || "Cuenta creada exitosamente";
            toast.success(successMessage);
        } catch (error: any) {
            console.error("Registration error:", error);
            const message = error.response?.data?.message || "Error al crear la cuenta";
            toast.error(Array.isArray(message) ? message[0] : message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper: get field config
    const getField = (key: string) => activeFields.find(f => f.key === key);
    const isVisible = (key: string) => {
        const f = getField(key);
        return f ? f.visible : true;
    };
    const getLabel = (key: string, fallback: string) => getField(key)?.label || fallback;

    if (isLoadingConfig) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!config) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle className="text-destructive">Error</CardTitle>
                        <CardDescription>
                            No se pudo identificar la empresa. Por favor asegúrate de estar accediendo desde el enlace correcto.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    const customFields = activeFields.filter(f => f.isCustom && f.visible);

    return (
        <div className="min-h-screen flex bg-gray-50">
            <div className="hidden lg:flex w-1/2 bg-slate-400 items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10 text-white text-center max-w-lg">
                    {config.logo_url ? (
                        <img src={config.logo_url} alt={config.name} className="h-36 mx-auto mb-8 object-contain" />
                    ) : (
                        <Building2 className="h-24 w-24 mx-auto mb-8 opacity-90" />
                    )}
                    <h1 className="text-4xl font-bold mb-4">Bienvenido a {config.name}</h1>
                    <p className="text-lg opacity-90">
                        Crea tu cuenta para participar en los prodes de la empresa y competir con tus compañeros.
                    </p>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-4 lg:p-8 overflow-y-auto">
                <Card className="w-full max-w-md border-none shadow-none bg-transparent">
                    <CardHeader className="space-y-1">
                        <div className="lg:hidden flex justify-center mb-4">
                            {config.logo_url ? (
                                <img src={config.logo_url} alt={config.name} className="h-12 object-contain" />
                            ) : (
                                <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
                                    <Building2 className="h-6 w-6 text-white" />
                                </div>
                            )}
                        </div>
                        <CardTitle className="text-2xl font-bold text-center">Crear cuenta</CardTitle>
                        <CardDescription className="text-center">
                            Ingresa tus datos para registrarte en la plataforma
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {config.slug === 'recrear' && (
                            <Alert className="mb-6 bg-blue-50 border-blue-200">
                                <Info className="h-4 w-4 text-blue-600" />
                                <AlertDescription className="text-sm text-blue-800 font-medium">
                                    El Mundial se vive mejor en equipo… y en familia. Un prode para jugar en familia. ⚽
                                </AlertDescription>
                            </Alert>
                        )}
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                {/* Nombre / Apellido — always visible */}
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="firstName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{getLabel('firstName', 'Nombre')}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Juan" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="lastName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{getLabel('lastName', 'Apellido')}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Pérez" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Email — always visible */}
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{getLabel('email', 'Email')}</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input placeholder="juan@empresa.com" className="pl-9" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Phone — conditionally visible */}
                                {isVisible('phone') && (
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{getLabel('phone', 'Teléfono')}</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input placeholder="+54 9 11 ..." className="pl-9" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                {/* Company Area — conditionally visible */}
                                {isVisible('companyAreaId') && (
                                    <FormField
                                        control={form.control}
                                        name="companyAreaId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{getLabel('companyAreaId', 'Área / Departamento')}</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecciona tu área" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {config.areas.map((area) => (
                                                            <SelectItem key={area.id} value={area.id}>
                                                                {area.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                {/* Custom fields */}
                                {customFields.map(f => (
                                    <FormField
                                        key={f.key}
                                        control={form.control}
                                        name={f.key as any}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {f.label}
                                                    {!f.required && <span className="text-muted-foreground text-xs ml-1">(opcional)</span>}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder={f.label} {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ))}

                                {/* Password */}
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Contraseña</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input type="password" placeholder="******" className="pl-9" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confirmar</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input type="password" placeholder="******" className="pl-9" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Alert className="bg-blue-50 border-blue-200">
                                    <Info className="h-4 w-4 text-blue-600" />
                                    <AlertDescription className="text-sm text-blue-800">
                                        <strong>Requisitos de contraseña:</strong>
                                        <ul className="list-disc list-inside mt-1 space-y-0.5">
                                            <li>Mínimo 8 caracteres</li>
                                            <li>Al menos una mayúscula</li>
                                            <li>Al menos una minúscula</li>
                                            <li>Al menos un número</li>
                                            <li>Al menos un caracter especial</li>
                                        </ul>
                                    </AlertDescription>
                                </Alert>

                                <FormField
                                    control={form.control}
                                    name="acceptTerms"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-white">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                    Acepto las{' '}
                                                    <Link href="/politicas-de-privacidad" target="_blank" className="text-primary hover:underline">
                                                        Políticas de Privacidad
                                                    </Link>{' '}
                                                    y los{' '}
                                                    <Link href="/terminos-y-condiciones" target="_blank" className="text-primary hover:underline">
                                                        Términos y Condiciones de Uso
                                                    </Link>
                                                </FormLabel>
                                                <FormMessage />
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <Button className="w-full" type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Crear cuenta
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <p className="text-sm text-muted-foreground">
                            ¿Ya tienes cuenta?{' '}
                            <Link href="/login" className="text-primary hover:underline font-medium">
                                Iniciar sesión
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-md bg-white">
                        <CardHeader className="text-center">
                            <div className="flex justify-center mb-4">
                                <CheckCircle2 className="h-16 w-16 text-green-500" />
                            </div>
                            <CardTitle className="text-2xl">¡Cuenta Creada!</CardTitle>
                            <CardDescription className="text-base mt-2">
                                Tu cuenta ha sido creada exitosamente
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {config?.require_email_confirmation !== false ? (
                                <>
                                    <Alert className="bg-blue-50 border-blue-200">
                                        <Mail className="h-4 w-4 text-blue-600" />
                                        <AlertDescription className="text-sm text-blue-800">
                                            Hemos enviado un correo de verificación a <strong>{registeredEmail}</strong>
                                        </AlertDescription>
                                    </Alert>
                                    <div className="text-sm text-gray-600 space-y-2">
                                        <p><strong>Próximos pasos:</strong></p>
                                        <ol className="list-decimal list-inside space-y-1 ml-2">
                                            <li>Revisa tu bandeja de entrada</li>
                                            <li>Haz click en el enlace de verificación</li>
                                            <li>Inicia sesión con tus credenciales</li>
                                        </ol>
                                        <p className="text-xs text-gray-500 mt-3">
                                            El enlace expirará en 24 horas. Si no recibes el correo, revisa tu carpeta de spam.
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="text-sm text-gray-600 space-y-4 text-center">
                                    <p>Ya puedes iniciar sesión con tu correo <strong>{registeredEmail}</strong> y la contraseña que creaste.</p>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                onClick={() => router.push('/login')}
                            >
                                Ir al Login
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    );
}
