'use client';

import { useState, useEffect } from 'react';
import { Prode } from '@/lib/types';
import { companyApi } from '@/lib/api/endpoints';
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

interface EditProdeModalProps {
    prode: Prode | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function EditProdeModal({ prode, open, onOpenChange, onSuccess }: EditProdeModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (prode && open) {
            setName(prode.name);
            setDescription(prode.description || '');
            // Backend sends snake_case is_active, defaulting to true if undefined to prevent uncontrolled component warning
            setIsActive(prode.is_active ?? true);
            setError(null);
        }
    }, [prode, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prode) return;

        setError(null);
        setIsLoading(true);

        try {
            await companyApi.updateProde(prode.id, {
                name,
                description,
                isActive,
            });

            onOpenChange(false);
            onSuccess();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    if (!prode) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Editar Prode</DialogTitle>
                    <DialogDescription>
                        Actualiza la información del prode
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Nombre *</Label>
                            <Input
                                id="edit-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Descripción</Label>
                            <Textarea
                                id="edit-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={isLoading}
                                rows={3}
                            />
                        </div>

                        <div className="flex items-center justify-between space-x-2 border p-3 rounded-md">
                            <div className="space-y-0.5">
                                <Label htmlFor="edit-active">Estado</Label>
                                <p className="text-xs text-muted-foreground">
                                    {isActive ? 'El prode está visible para los empleados' : 'El prode está oculto'}
                                </p>
                            </div>
                            <Switch
                                id="edit-active"
                                checked={isActive}
                                onCheckedChange={setIsActive}
                                disabled={isLoading}
                                className="data-[state=checked]:bg-green-600"
                            />
                        </div>

                        {error && (
                            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                                {error}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            className="bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                'Guardar Cambios'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
