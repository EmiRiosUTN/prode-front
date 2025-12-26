'use client';

import { useState, useEffect } from 'react';
import { companyApi } from '@/lib/api/endpoints';
import { getErrorMessage } from '@/lib/api/client';
import { CompanyArea } from '@/lib/types';
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

interface EditAreaModalProps {
    area: CompanyArea | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function EditAreaModal({ area, open, onOpenChange, onSuccess }: EditAreaModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (area) {
            setName(area.name);
            setDescription(area.description || '');
            // Prevent uncontrolled component warning by ensuring default
            setIsActive(area.is_active ?? true);
        }
    }, [area]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!area) return;

        setError(null);
        setIsLoading(true);

        try {
            await companyApi.updateArea(area.id, { name, description, isActive });

            // Close modal and trigger refresh
            onOpenChange(false);
            onSuccess();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    if (!area) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Editar Área</DialogTitle>
                    <DialogDescription>
                        Modifica los detalles del área
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Nombre *</Label>
                            <Input
                                id="edit-name"
                                placeholder="Nombre del área"
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
                                placeholder="Descripción del área"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={isLoading}
                                rows={3}
                            />
                        </div>

                        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border">
                            <div className="space-y-0.5">
                                <Label htmlFor="edit-active">Estado del Área</Label>
                                <div className="text-xs text-muted-foreground">
                                    {isActive ? 'El área está visible y activa' : 'El área está oculta e inactiva'}
                                </div>
                            </div>
                            <Switch
                                id="edit-active"
                                checked={isActive}
                                onCheckedChange={setIsActive}
                                disabled={isLoading}
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
