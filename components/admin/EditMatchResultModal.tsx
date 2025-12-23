'use client';

import { useState, useEffect } from 'react';
import { adminMatchesApi } from '@/lib/api/endpoints';
import { Match } from '@/lib/types';
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
import { Loader2, Trophy } from 'lucide-react';

interface EditMatchResultModalProps {
    match: Match | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function EditMatchResultModal({ match, open, onOpenChange, onSuccess }: EditMatchResultModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form fields
    const [goalsTeamA, setGoalsTeamA] = useState(0);
    const [goalsTeamB, setGoalsTeamB] = useState(0);
    const [yellowCardsTeamA, setYellowCardsTeamA] = useState(0);
    const [yellowCardsTeamB, setYellowCardsTeamB] = useState(0);
    const [redCardsTeamA, setRedCardsTeamA] = useState(0);
    const [redCardsTeamB, setRedCardsTeamB] = useState(0);

    useEffect(() => {
        if (match && open) {
            // Initialize with existing result or defaults
            const result = match.match_result;
            setGoalsTeamA(result?.goals_team_a ?? 0);
            setGoalsTeamB(result?.goals_team_b ?? 0);
            setYellowCardsTeamA(result?.yellow_cards_team_a ?? 0);
            setYellowCardsTeamB(result?.yellow_cards_team_b ?? 0);
            setRedCardsTeamA(result?.red_cards_team_a ?? 0);
            setRedCardsTeamB(result?.red_cards_team_b ?? 0);
            setError(null);
        }
    }, [match, open]);

    const handleSave = async () => {
        if (!match) return;

        setIsLoading(true);
        setError(null);

        try {
            await adminMatchesApi.loadResult(match.id, {
                goalsTeamA,
                goalsTeamB,
                yellowCardsTeamA,
                yellowCardsTeamB,
                redCardsTeamA,
                redCardsTeamB,
            });

            onSuccess();
            onOpenChange(false);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    if (!match) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-white">
                <DialogHeader>
                    <DialogTitle>Cargar resultado</DialogTitle>
                    <DialogDescription>
                        Ingresa los goles y tarjetas para finalizar el partido.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {/* Scoreboard Header */}
                    <div className="flex items-center justify-between mb-8 px-2">
                        <div className="text-center w-1/3">
                            <h3 className="font-bold text-lg leading-tight">{match.team_a?.name}</h3>
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">{match.team_a?.code}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Input
                                type="number"
                                min="0"
                                value={goalsTeamA}
                                onChange={(e) => setGoalsTeamA(parseInt(e.target.value) || 0)}
                                className="w-16 h-16 text-center text-3xl font-bold p-0 border-2 focus-visible:ring-offset-0"
                            />
                            <span className="text-2xl font-light text-muted-foreground">-</span>
                            <Input
                                type="number"
                                min="0"
                                value={goalsTeamB}
                                onChange={(e) => setGoalsTeamB(parseInt(e.target.value) || 0)}
                                className="w-16 h-16 text-center text-3xl font-bold p-0 border-2 focus-visible:ring-offset-0"
                            />
                        </div>
                        <div className="text-center w-1/3">
                            <h3 className="font-bold text-lg leading-tight">{match.team_b?.name}</h3>
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">{match.team_b?.code}</span>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-6 space-y-6">
                        {/* Yellow Cards Row */}
                        <div className="flex items-center justify-between">
                            <Input
                                type="number"
                                min="0"
                                value={yellowCardsTeamA}
                                onChange={(e) => setYellowCardsTeamA(parseInt(e.target.value) || 0)}
                                className="w-16 text-center font-medium bg-white"
                            />
                            <div className="flex flex-col items-center px-4">
                                <div className="w-6 h-8 bg-yellow-400 rounded-sm shadow-sm border border-yellow-500 mb-1" />
                                <span className="text-xs font-medium text-muted-foreground uppercase">Amarillas</span>
                            </div>
                            <Input
                                type="number"
                                min="0"
                                value={yellowCardsTeamB}
                                onChange={(e) => setYellowCardsTeamB(parseInt(e.target.value) || 0)}
                                className="w-16 text-center font-medium bg-white"
                            />
                        </div>

                        {/* Red Cards Row */}
                        <div className="flex items-center justify-between">
                            <Input
                                type="number"
                                min="0"
                                value={redCardsTeamA}
                                onChange={(e) => setRedCardsTeamA(parseInt(e.target.value) || 0)}
                                className="w-16 text-center font-medium bg-white"
                            />
                            <div className="flex flex-col items-center px-4">
                                <div className="w-6 h-8 bg-red-500 rounded-sm shadow-sm border border-red-600 mb-1" />
                                <span className="text-xs font-medium text-muted-foreground uppercase">Rojas</span>
                            </div>
                            <Input
                                type="number"
                                min="0"
                                value={redCardsTeamB}
                                onChange={(e) => setRedCardsTeamB(parseInt(e.target.value) || 0)}
                                className="w-16 text-center font-medium bg-white"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 text-sm text-center text-destructive bg-destructive/10 p-2 rounded-md">
                            {error}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                        disabled={isLoading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        className="bg-slate-900 text-white hover:bg-slate-950"
                        onClick={handleSave} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            'Guardar resultado'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
