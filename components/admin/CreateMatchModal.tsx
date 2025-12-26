'use client';

import { useState, useEffect } from 'react';
import { adminMatchesApi, adminCompetitionsApi } from '@/lib/api/endpoints';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface CreateMatchModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreateMatchModal({ open, onOpenChange, onSuccess }: CreateMatchModalProps) {
    const [competitionId, setCompetitionId] = useState('');
    const [teamA, setTeamA] = useState('');
    const [teamB, setTeamB] = useState('');
    const [teamAFlagUrl, setTeamAFlagUrl] = useState('');
    const [teamBFlagUrl, setTeamBFlagUrl] = useState('');
    const [matchDate, setMatchDate] = useState('');
    const [stage, setStage] = useState('');
    const [location, setLocation] = useState('');
    const [status, setStatus] = useState<'scheduled' | 'in_progress' | 'finished'>('scheduled');

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
            await adminMatchesApi.create({
                competitionId,
                teamA,
                teamB,
                teamAFlagUrl: teamAFlagUrl || undefined,
                teamBFlagUrl: teamBFlagUrl || undefined,
                matchDate,
                stage,
                location: location || undefined,
                status,
            });

            // Reset form
            setCompetitionId('');
            setTeamA('');
            setTeamB('');
            setTeamAFlagUrl('');
            setTeamBFlagUrl('');
            setMatchDate('');
            setStage('');
            setLocation('');
            setStatus('scheduled');

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
                    <DialogTitle>Nuevo Partido</DialogTitle>
                    <DialogDescription>
                        Carga un nuevo partido de fútbol
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="competition">Competición *</Label>
                            {isLoadingCompetitions ? (
                                <div className="flex items-center justify-center py-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="ml-2 text-sm text-muted-foreground">Cargando...</span>
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

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="teamA">Equipo local *</Label>
                                <Input
                                    id="teamA"
                                    placeholder="Ej: Argentina"
                                    value={teamA}
                                    onChange={(e) => setTeamA(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="teamB">Equipo visitante *</Label>
                                <Input
                                    id="teamB"
                                    placeholder="Ej: Brasil"
                                    value={teamB}
                                    onChange={(e) => setTeamB(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="teamAFlagUrl">URL Bandera local (opcional)</Label>
                                <Input
                                    id="teamAFlagUrl"
                                    placeholder="https://..."
                                    value={teamAFlagUrl}
                                    onChange={(e) => setTeamAFlagUrl(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="teamBFlagUrl">URL Bandera visitante (opcional)</Label>
                                <Input
                                    id="teamBFlagUrl"
                                    placeholder="https://..."
                                    value={teamBFlagUrl}
                                    onChange={(e) => setTeamBFlagUrl(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="matchDate">Fecha y hora *</Label>
                            <Input
                                id="matchDate"
                                type="datetime-local"
                                value={matchDate}
                                onChange={(e) => setMatchDate(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="stage">Fase/Etapa *</Label>
                            <Input
                                id="stage"
                                placeholder="Ej: Fase de Grupos, Octavos, Final"
                                value={stage}
                                onChange={(e) => setStage(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Estadio (opcional)</Label>
                            <Input
                                id="location"
                                placeholder="Ej: Estadio Monumental"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Estado *</Label>
                            <Select
                                value={status}
                                onValueChange={(value: 'scheduled' | 'in_progress' | 'finished') => setStatus(value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="scheduled">Programado</SelectItem>
                                    <SelectItem value="in_progress">En progreso</SelectItem>
                                    <SelectItem value="finished">Finalizado</SelectItem>
                                </SelectContent>
                            </Select>
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
                        <Button
                            className="bg-slate-900 text-white hover:bg-slate-950"
                            type="submit"
                            disabled={isLoading || !competitionId}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creando...
                                </>
                            ) : (
                                'Crear partido'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
