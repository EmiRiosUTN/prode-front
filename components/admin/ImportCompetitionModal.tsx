'use client';

import { useState } from 'react';
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
import { apiFootballApi, ImportCompetitionResponse } from '@/lib/api/endpoints';
import { getErrorMessage } from '@/lib/api/client';
import { Loader2, Trophy, CheckCircle2, AlertCircle, Download } from 'lucide-react';

interface ImportCompetitionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type ModalState = 'form' | 'loading' | 'success' | 'error';

export function ImportCompetitionModal({ isOpen, onClose, onSuccess }: ImportCompetitionModalProps) {
    const [leagueId, setLeagueId] = useState('');
    const [season, setSeason] = useState(new Date().getFullYear().toString());
    const [competitionName, setCompetitionName] = useState('');
    const [state, setState] = useState<ModalState>('form');
    const [result, setResult] = useState<ImportCompetitionResponse | null>(null);
    const [errorMsg, setErrorMsg] = useState('');

    const handleClose = () => {
        if (state === 'loading') return;
        setState('form');
        setLeagueId('');
        setSeason(new Date().getFullYear().toString());
        setCompetitionName('');
        setResult(null);
        setErrorMsg('');
        onClose();
    };

    const handleImport = async () => {
        if (!leagueId || !season) return;

        setState('loading');
        try {
            const response = await apiFootballApi.importCompetition({
                apiFootballLeagueId: parseInt(leagueId),
                apiFootballSeason: parseInt(season),
                competitionName: competitionName.trim() || undefined,
            });
            setResult(response.data);
            setState('success');
            onSuccess();
        } catch (err) {
            setErrorMsg(getErrorMessage(err));
            setState('error');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5 text-primary" />
                        Importar desde API-Football
                    </DialogTitle>
                    <DialogDescription>
                        Ingresá el ID de la liga y la temporada para importar automáticamente
                        la competencia, los equipos con sus logos y todos los partidos.
                    </DialogDescription>
                </DialogHeader>

                {state === 'form' && (
                    <div className="space-y-4 py-2">
                        {/* League ID */}
                        <div className="space-y-2">
                            <Label htmlFor="leagueId">
                                ID de Liga (API-Football) <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="leagueId"
                                type="number"
                                placeholder="Ej: 1 (World Cup), 128 (Liga Argentina)"
                                value={leagueId}
                                onChange={(e) => setLeagueId(e.target.value)}
                                min={1}
                            />
                            <p className="text-xs text-muted-foreground">
                                Encontrás el ID en{' '}
                                <a
                                    href="https://www.api-football.com/documentation-v3#tag/Leagues"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline"
                                >
                                    api-football.com
                                </a>
                                . Mundial = 1.
                            </p>
                        </div>

                        {/* Season */}
                        <div className="space-y-2">
                            <Label htmlFor="season">
                                Temporada / Año <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="season"
                                type="number"
                                placeholder="Ej: 2026"
                                value={season}
                                onChange={(e) => setSeason(e.target.value)}
                                min={1900}
                                max={2100}
                            />
                        </div>

                        {/* Optional name override */}
                        <div className="space-y-2">
                            <Label htmlFor="competitionName">
                                Nombre personalizado{' '}
                                <span className="text-muted-foreground text-xs">(opcional)</span>
                            </Label>
                            <Input
                                id="competitionName"
                                placeholder="Si está vacío se usa el nombre de la API"
                                value={competitionName}
                                onChange={(e) => setCompetitionName(e.target.value)}
                            />
                        </div>

                        <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground space-y-1">
                            <p className="font-medium text-foreground">¿Qué hace esto?</p>
                            <ul className="list-disc list-inside space-y-0.5">
                                <li>Crea la competencia automáticamente</li>
                                <li>Importa todos los equipos con sus logos/banderas</li>
                                <li>Importa todos los partidos con fechas y rondas</li>
                                <li>Si ya existe la competencia, agrega los partidos faltantes</li>
                            </ul>
                        </div>
                    </div>
                )}

                {state === 'loading' && (
                    <div className="flex flex-col items-center justify-center py-10 space-y-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <div className="text-center">
                            <p className="font-medium">Importando competencia...</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Esto puede tardar unos segundos
                            </p>
                        </div>
                    </div>
                )}

                {state === 'success' && result && (
                    <div className="space-y-4 py-2">
                        <div className="flex flex-col items-center text-center space-y-2">
                            <CheckCircle2 className="h-12 w-12 text-green-500" />
                            <p className="text-lg font-semibold">
                                {result.competitionCreated ? '¡Competencia creada!' : '¡Fixtures actualizados!'}
                            </p>
                            <p className="text-sm text-muted-foreground font-medium flex items-center gap-1">
                                <Trophy className="h-4 w-4" />
                                {result.competitionName}
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-md border p-3 text-center">
                                <p className="text-2xl font-bold">{result.total}</p>
                                <p className="text-xs text-muted-foreground">Total partidos</p>
                            </div>
                            <div className="rounded-md border p-3 text-center">
                                <p className="text-2xl font-bold text-green-600">{result.created}</p>
                                <p className="text-xs text-muted-foreground">Creados</p>
                            </div>
                            <div className="rounded-md border p-3 text-center">
                                <p className="text-2xl font-bold text-yellow-600">{result.skipped}</p>
                                <p className="text-xs text-muted-foreground">Ya existían</p>
                            </div>
                        </div>

                        {result.resultsImported > 0 && (
                            <p className="text-sm text-center text-muted-foreground">
                                También se importaron {result.resultsImported} resultado(s) de partidos ya jugados.
                            </p>
                        )}

                        {result.errors > 0 && (
                            <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800">
                                {result.errors} partido(s) tuvieron errores al importar.
                            </div>
                        )}
                    </div>
                )}

                {state === 'error' && (
                    <div className="space-y-4 py-2">
                        <div className="flex flex-col items-center text-center space-y-2">
                            <AlertCircle className="h-12 w-12 text-destructive" />
                            <p className="text-lg font-semibold">Error al importar</p>
                            <p className="text-sm text-muted-foreground">{errorMsg}</p>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    {state === 'form' && (
                        <>
                            <Button variant="outline" onClick={handleClose}>
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleImport}
                                disabled={!leagueId || !season}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Importar
                            </Button>
                        </>
                    )}
                    {state === 'success' && (
                        <Button onClick={handleClose} className="w-full">
                            Cerrar
                        </Button>
                    )}
                    {state === 'error' && (
                        <>
                            <Button variant="outline" onClick={() => setState('form')}>
                                Reintentar
                            </Button>
                            <Button variant="outline" onClick={handleClose}>
                                Cerrar
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
