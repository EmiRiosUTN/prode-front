'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '@/lib/api/endpoints';
import { getErrorMessage } from '@/lib/api/client';
import { getPasswordValidationMessage } from '@/lib/auth/password-rules';
import { PasswordRequirementsAlert } from '@/components/auth/PasswordRequirementsAlert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ChangePasswordPage() {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const passwordError = getPasswordValidationMessage(newPassword);
        if (passwordError) {
            toast.error(passwordError);
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Las nuevas contraseñas no coinciden.');
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await authApi.changePassword({ currentPassword, newPassword });
            toast.success(response.data.message);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <Button
                variant="ghost"
                onClick={() => router.push('/prodes')}
                className="px-0 text-slate-600 hover:text-slate-900"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a mis prodes
            </Button>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle>Cambiar contraseña</CardTitle>
                            <CardDescription>
                                Ingresa tu clave actual y define una nueva con la misma politica del registro.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Contraseña actual</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="currentPassword"
                                    type="password"
                                    className="pl-9"
                                    value={currentPassword}
                                    onChange={(event) => setCurrentPassword(event.target.value)}
                                    disabled={isSubmitting}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="newPassword">Nueva contraseña</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="newPassword"
                                    type="password"
                                    className="pl-9"
                                    value={newPassword}
                                    onChange={(event) => setNewPassword(event.target.value)}
                                    disabled={isSubmitting}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Repetir nueva contraseña</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    className="pl-9"
                                    value={confirmPassword}
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                    disabled={isSubmitting}
                                    required
                                />
                            </div>
                        </div>

                        <PasswordRequirementsAlert />

                        <div className="flex justify-end">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Guardar nueva contraseña
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
