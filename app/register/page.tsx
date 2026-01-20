'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Mail, Lock, User as UserIcon, Phone, Building2, ArrowRight, CheckCircle2, Info } from 'lucide-react';
import { companyApi, authApi } from '@/lib/api/endpoints';
import { Company } from '@/lib/types';
import { toast } from 'sonner';

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
    firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    phone: z.string().min(6, 'Número de teléfono inválido'),
    password: z.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .regex(/[a-z]/, 'Debe contener al menos una minúscula')
        .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
        .regex(/\d/, 'Debe contener al menos un número'),
    confirmPassword: z.string(),
    companyAreaId: z.string().min(1, 'Debes seleccionar un área'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

type PublicConfig = Company & { areas: { id: string; name: string }[] };

export default function RegisterPage() {
    const router = useRouter();
    const [config, setConfig] = useState<PublicConfig | null>(null);
    const [isLoadingConfig, setIsLoadingConfig] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                // Skip config fetch for admin subdomain
                const hostname = window.location.hostname;
                const subdomain = hostname.split('.')[0];

                if (subdomain === 'admin') {
                    // Admin subdomain doesn't have company config
                    setIsLoadingConfig(false);
                    return;
                }

                const response = await companyApi.getPublicConfig();
                setConfig(response.data);
                // Set CSS variables for theming if needed, or just use inline styles for primary color
                if (response.data.primary_color) {
                    document.documentElement.style.setProperty('--primary', response.data.primary_color);
                }
            } catch (error) {
                console.error("Error loading company config:", error);
                toast.error("Error al cargar la configuración de la empresa. Verifique que el enlace sea correcto.");
            } finally {
                setIsLoadingConfig(false);
            }
        };

        fetchConfig();
    }, []);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
            companyAreaId: '',
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setIsSubmitting(true);
            const response = await authApi.register({
                email: values.email,
                password: values.password,
                firstName: values.firstName,
                lastName: values.lastName,
                phone: values.phone,
                companyAreaId: values.companyAreaId,
            });

            setRegisteredEmail(values.email);
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

    return (
        <div className="min-h-screen flex bg-gray-50">
            <div className="hidden lg:flex w-1/2 bg-slate-400 items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10 text-white text-center max-w-lg">
                    {config.logo_url ? (
                        <img src={config.logo_url} alt={config.name} className="h-24 mx-auto mb-8 object-contain" />
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
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="firstName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nombre</FormLabel>
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
                                                <FormLabel>Apellido</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Pérez" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email Corporativo</FormLabel>
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

                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Teléfono</FormLabel>
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

                                <FormField
                                    control={form.control}
                                    name="companyAreaId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Área / Departamento</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                        </ul>
                                    </AlertDescription>
                                </Alert>

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
