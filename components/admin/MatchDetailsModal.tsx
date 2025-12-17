'use client';

import { useState, useEffect } from 'react';
import { adminMatchesApi } from '@/lib/api/endpoints';
import { Match, MatchStatus } from '@/lib/types';
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
import { Loader2, Edit, Trophy, Calendar, MapPin } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

interface MatchDetailsModalProps {
    match: Match | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function MatchDetailsModal({ match, open, onOpenChange, onSuccess }: MatchDetailsModalProps) {
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form fields
    const [matchDate, setMatchDate] = useState('');
    const [stage, setStage] = useState('');
    const [location, setLocation] = useState('');
    const [status, setStatus] = useState<MatchStatus>('scheduled');

    useEffect(() => {
        if (match) {
            // Convert ISO date to datetime-local format
            setMatchDate(match.match_date ? new Date(match.match_date).toISOString().slice(0, 16) : '');
            setStage(match.stage || '');
            setLocation(match.location || '');
            setStatus(match.status);
            setIsEditMode(false);
            setError(null);
        }
    }, [match]);

    const handleSave = async () => {
        if (!match) return;

        setIsLoading(true);
        setError(null);

        try {
            await adminMatchesApi.update(match.id, {
                matchDate,
                stage,
                location: location || undefined,
                status,
            });

            setIsEditMode(false);
            onSuccess();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        if (match) {
            setMatchDate(match.match_date ? new Date(match.match_date).toISOString().slice(0, 16) : '');
            setStage(match.stage || '');
            setLocation(match.location || '');
            setStatus(match.status);
        }
        setIsEditMode(false);
        setError(null);
    };

    if (!match) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Detalles del Partido</span>
                        {!isEditMode && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEditMode(true)}
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                            </Button>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode ? 'Edita la información del partido' : 'Información completa del partido'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Teams */}
                    <div className="space-y-2">
                        <Label className="flex items-center">
                            <Trophy className="h-4 w-4 mr-2" />
                            Equipos
                        </Label>
                        <div className="flex items-center justify-center space-x-4 text-lg font-semibold">
                            <span>{match.team_a?.name || 'Equipo A'}</span>
                            <span className="text-muted-foreground">vs</span>
                            <span>{match.team_b?.name || 'Equipo B'}</span>
                        </div>
                    </div>

                    {/* Competition */}
                    <div className="space-y-2">
                        <Label>Competición</Label>
                        <p className="text-base">{match.competition?.name || 'N/A'}</p>
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <Label htmlFor="matchDate" className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            Fecha y Hora
                        </Label>
                        {isEditMode ? (
                            <Input
                                id="matchDate"
                                type="datetime-local"
                                value={matchDate}
                                onChange={(e) => setMatchDate(e.target.value)}
                                disabled={isLoading}
                            />
                        ) : (
                            <p className="text-base">{formatDateTime(match.match_date)}</p>
                        )}
                    </div>

                    {/* Stage */}
                    <div className="space-y-2">
                        <Label htmlFor="stage">Fase/Etapa</Label>
                        {isEditMode ? (
                            <Input
                                id="stage"
                                value={stage}
                                onChange={(e) => setStage(e.target.value)}
                                placeholder="Ej: Fase de Grupos, Octavos, Final"
                                disabled={isLoading}
                            />
                        ) : (
                            <p className="text-base">{match.stage}</p>
                        )}
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <Label htmlFor="location" className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            Estadio
                        </Label>
                        {isEditMode ? (
                            <Input
                                id="location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Ej: Estadio Monumental"
                                disabled={isLoading}
                            />
                        ) : (
                            <p className="text-base">{match.location || 'No especificado'}</p>
                        )}
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <Label htmlFor="status">Estado</Label>
                        {isEditMode ? (
                            <Select
                                value={status}
                                onValueChange={(value) => setStatus(value as MatchStatus)}
                                disabled={isLoading}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="scheduled">Programado</SelectItem>
                                    <SelectItem value="in_progress">En Progreso</SelectItem>
                                    <SelectItem value="finished">Finalizado</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <p className="text-base">
                                {match.status === 'finished' ? 'Finalizado' :
                                    match.status === 'in_progress' ? 'En Progreso' : 'Programado'}
                            </p>
                        )}
                    </div>

                    {/* Result if available */}
                    {!isEditMode && match.match_result && (
                        <div className="pt-4 border-t">
                            <h4 className="font-semibold mb-2">Resultado</h4>
                            <div className="bg-slate-50 rounded-md p-3">
                                <div className="flex items-center justify-center space-x-8 text-lg font-semibold">
                                    <span>{match.team_a?.name}</span>
                                    <span className="text-2xl">
                                        {match.match_result.goalsTeamA} - {match.match_result.goalsTeamB}
                                    </span>
                                    <span>{match.team_b?.name}</span>
                                </div>
                            </div>
                        </div>
                    )}

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
                                variant="outline"
                                onClick={handleCancel}
                                disabled={isLoading}
                            >
                                Cancelar
                            </Button>
                            <Button onClick={handleSave} disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    'Guardar Cambios'
                                )}
                            </Button>
                        </>
                    ) : (
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cerrar
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
