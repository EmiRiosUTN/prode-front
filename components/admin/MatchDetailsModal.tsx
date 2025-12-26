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
    const [teamAFlagUrl, setTeamAFlagUrl] = useState('');
    const [teamBFlagUrl, setTeamBFlagUrl] = useState('');

    const getLocalDateString = (dateStr: string) => {
        const date = new Date(dateStr);
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - offset * 60000);
        return localDate.toISOString().slice(0, 16);
    };

    useEffect(() => {
        if (match) {
            // Convert ISO date to datetime-local format (Local Time)
            setMatchDate(match.match_date ? getLocalDateString(match.match_date) : '');
            setStage(match.stage || '');
            setLocation(match.location || '');
            setStatus(match.status);
            setTeamAFlagUrl(match.team_a?.flag_url || '');
            setTeamBFlagUrl(match.team_b?.flag_url || '');
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
                matchDate: matchDate ? new Date(matchDate).toISOString() : undefined,
                stage,
                location: location || undefined,
                status,
                teamAFlagUrl: teamAFlagUrl || undefined,
                teamBFlagUrl: teamBFlagUrl || undefined,
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
            setTeamAFlagUrl(match.team_a?.flag_url || '');
            setTeamBFlagUrl(match.team_b?.flag_url || '');
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
                        <span>Detalles del partido</span>
                        {!isEditMode && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEditMode(true)}
                                className="mt-2 mr-2"
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
                    {/* Teams Header */}
                    <div className="flex items-center justify-between mb-6 p-4">
                        <div className="flex flex-col items-center w-1/3">
                            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 mb-2 shadow-sm border border-slate-300 overflow-hidden">
                                {match.team_a?.flag_url ? (
                                    <img
                                        src={match.team_a.flag_url}
                                        alt={match.team_a.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    match.team_a?.code
                                )}
                            </div>
                            <span className="text-center font-bold text-sm leading-tight text-slate-800">{match.team_a?.name}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className=" text-xs font-normal uppercase mb-1">vs</span>
                        </div>
                        <div className="flex flex-col items-center w-1/3">
                            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 mb-2 shadow-sm border border-slate-300 overflow-hidden">
                                {match.team_b?.flag_url ? (
                                    <img
                                        src={match.team_b.flag_url}
                                        alt={match.team_b.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    match.team_b?.code
                                )}
                            </div>
                            <span className="text-center font-bold text-sm leading-tight text-slate-800">{match.team_b?.name}</span>
                        </div>
                    </div>

                    {/* Competition */}
                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Competición</Label>
                        <p className="text-sm font-medium text-slate-900">{match.competition?.name || 'N/A'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Date */}
                        <div className="space-y-1">
                            <Label htmlFor="matchDate" className="text-xs text-muted-foreground uppercase tracking-wider font-bold flex items-center">
                                <Calendar className="h-3 w-3 mr-1.5" />
                                Fecha y Hora
                            </Label>
                            {isEditMode ? (
                                <Input
                                    id="matchDate"
                                    type="datetime-local"
                                    value={matchDate}
                                    onChange={(e) => setMatchDate(e.target.value)}
                                    disabled={isLoading}
                                    className="h-9 text-sm"
                                />
                            ) : (
                                <p className="text-sm font-medium text-slate-900">{formatDateTime(match.match_date)}</p>
                            )}
                        </div>

                        {/* Location */}
                        <div className="space-y-1">
                            <Label htmlFor="location" className="text-xs text-muted-foreground uppercase tracking-wider font-bold flex items-center">
                                <MapPin className="h-3 w-3 mr-1.5" />
                                Estadio
                            </Label>
                            {isEditMode ? (
                                <Input
                                    id="location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Ej: Estadio Monumental"
                                    disabled={isLoading}
                                    className="h-9 text-sm"
                                />
                            ) : (
                                <p className="text-sm font-medium text-slate-900">{match.location || 'No especificado'}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Stage */}
                        <div className="space-y-1">
                            <Label htmlFor="stage" className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Fase / Etapa</Label>
                            {isEditMode ? (
                                <Input
                                    id="stage"
                                    value={stage}
                                    onChange={(e) => setStage(e.target.value)}
                                    placeholder="Ej: Fase de Grupos"
                                    disabled={isLoading}
                                    className="h-9 text-sm"
                                />
                            ) : (
                                <p className="text-sm font-medium text-slate-900">{match.stage}</p>
                            )}
                        </div>

                        {/* Status */}
                        <div className="space-y-1">
                            <Label htmlFor="status" className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Estado</Label>
                            {isEditMode ? (
                                <Select
                                    value={status}
                                    onValueChange={(value) => setStatus(value as MatchStatus)}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className="h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="scheduled">Programado</SelectItem>
                                        <SelectItem value="in_progress">En curso</SelectItem>
                                        <SelectItem value="finished">Finalizado</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div>
                                    <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${match.status === 'finished'
                                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                            : match.status === 'in_progress'
                                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                                            }`}
                                    >
                                        {match.status === 'finished'
                                            ? 'Finalizado'
                                            : match.status === 'in_progress'
                                                ? 'En curso'
                                                : 'Programado'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Flag URLs - Only in edit mode */}
                    {isEditMode && (
                        <div className="grid grid-cols-2 gap-4">
                            {/* Team A Flag URL */}
                            <div className="space-y-1">
                                <Label htmlFor="teamAFlagUrl" className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
                                    Bandera {match.team_a?.name}
                                </Label>
                                <Input
                                    id="teamAFlagUrl"
                                    value={teamAFlagUrl}
                                    onChange={(e) => setTeamAFlagUrl(e.target.value)}
                                    placeholder="https://..."
                                    disabled={isLoading}
                                    className="h-9 text-sm"
                                />
                            </div>

                            {/* Team B Flag URL */}
                            <div className="space-y-1">
                                <Label htmlFor="teamBFlagUrl" className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
                                    Bandera {match.team_b?.name}
                                </Label>
                                <Input
                                    id="teamBFlagUrl"
                                    value={teamBFlagUrl}
                                    onChange={(e) => setTeamBFlagUrl(e.target.value)}
                                    placeholder="https://..."
                                    disabled={isLoading}
                                    className="h-9 text-sm"
                                />
                            </div>
                        </div>
                    )}

                    {/* Result if available */}
                    {!isEditMode && match.match_result && (
                        <div className="pt-4 border-t border-dashed mt-4">
                            <h4 className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-3">Resultado final</h4>
                            <div className="bg-slate-50 border border-slate-100 rounded-lg p-4">
                                <div className="flex items-center justify-center space-x-8">
                                    <span className="text-3xl font-black text-slate-900">{match.match_result.goals_team_a}</span>
                                    <span className="text-slate-800 text-xl">-</span>
                                    <span className="text-3xl font-black text-slate-900">{match.match_result.goals_team_b}</span>
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

                <DialogFooter className="gap-2 sm:gap-0">
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
                                className="bg-slate-900 text-white hover:bg-slate-800"
                                onClick={handleSave}
                                disabled={isLoading}
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
