'use client';

import { useState, useEffect } from 'react';
import { companyApi, adminCompetitionsApi } from '@/lib/api/endpoints';
import { Competition } from '@/lib/types';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface CreateProdeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreateProdeModal({ open, onOpenChange, onSuccess }: CreateProdeModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [competitionId, setCompetitionId] = useState('');
    const [participationMode, setParticipationMode] = useState<'general' | 'by_area' | 'both'>('general');
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingCompetitions, setIsLoadingCompetitions] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            loadCompetitions();
        }
    }, [open]);

    const loadCompetitions = async () => {
        try {
            setIsLoadingCompetitions(true);
            const response = await adminCompetitionsApi.getAll();
            setCompetitions(response.data);
        } catch (err) {
            console.error('Error loading competitions:', err);
        } finally {
            setIsLoadingCompetitions(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await companyApi.createProde({
                name,
                description,
                competitionId,
                participationMode,
            });

            // Reset form
            setName('');
            setDescription('');
            setCompetitionId('');
            setParticipationMode('general');

            // Close modal and trigger refresh
            onOpenChange(false);
            onSuccess();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Nuevo Prode</DialogTitle>
                    <DialogDescription>
                        Crea un nuevo prode para tu empresa
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre *</Label>
                            <Input
                                id="name"
                                placeholder="Ej: Mundial Qatar 2022"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea
                                id="description"
                                placeholder="Descripción opcional del prode"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={isLoading}
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="competition">Competición *</Label>
                            {isLoadingCompetitions ? (
                                <div className="flex items-center justify-center py-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="ml-2 text-sm text-muted-foreground">Cargando competiciones...</span>
                                </div>
                            ) : (
                                <Select
                                    value={competitionId}
                                    onValueChange={setCompetitionId}
                                    disabled={isLoading}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una competición" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {competitions.map((competition) => (
                                            <SelectItem key={competition.id} value={competition.id}>
                                                {competition.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="participationMode">Modo de Participación *</Label>
                            <Select
                                value={participationMode}
                                onValueChange={(value: 'general' | 'by_area' | 'both') => setParticipationMode(value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="general">General (Ranking único)</SelectItem>
                                    <SelectItem value="by_area">Por Área (Ranking por área)</SelectItem>
                                    <SelectItem value="both">Ambos (General + Por Área)</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Define cómo se organizarán los rankings
                            </p>
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
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading || !competitionId}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creando...
                                </>
                            ) : (
                                'Crear Prode'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
