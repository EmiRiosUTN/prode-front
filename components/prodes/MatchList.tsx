'use client';

import { useState, useEffect } from 'react';
import { Match, Prediction, ProdeVariableConfig } from '@/lib/types';
import { prodeApi } from '@/lib/api/endpoints';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ChevronRight, Ban, CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { getErrorMessage } from '@/lib/api/client';
import { useRouter } from 'next/navigation';

interface MatchListProps {
    prodeId: string;
    variableConfigs?: ProdeVariableConfig[];
}

interface MatchWithPrediction extends Match {
    myPrediction?: Prediction | null;
    isLocked?: boolean;
}

export function MatchList({ prodeId, variableConfigs }: MatchListProps) {
    const router = useRouter();
    const [matches, setMatches] = useState<MatchWithPrediction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadMatches();
    }, [prodeId]);

    const loadMatches = async () => {
        try {
            setIsLoading(true);
            const response = await prodeApi.getMatches(prodeId);
            setMatches(response.data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-destructive/10 text-destructive rounded-md">
                Error al cargar partidos: {error}
            </div>
        );
    }

    if (matches.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                No hay partidos programados para este prode.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {matches.map(match => {
                const isLocked = match.isLocked || match.status !== 'scheduled' || new Date() >= new Date(match.match_date);
                const hasPrediction = !!match.myPrediction;
                const prediction = match.myPrediction;

                return (
                    <Card key={match.id} className="overflow-hidden hover:shadow-md transition-all duration-200 border-slate-200 flex flex-col md:flex-row group mb-3">
                        {/* Status Bar */}
                        <div className={`
                            h-1 md:h-auto md:w-1.5 
                            ${match.status === 'finished' ? 'bg-slate-400' :
                                match.status === 'in_progress' ? 'bg-blue-500 animate-pulse' :
                                    isLocked ? 'bg-orange-500' : 'bg-green-500'}
                        `} />

                        <CardContent className="flex-1 p-0 flex flex-col md:flex-row">
                            {/* Match Details Section */}
                            <div className="flex-1 p-3 md:p-4 flex flex-col justify-center">
                                {/* Header: Stage & Date */}
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                        {match.stage}
                                    </span>
                                    <div className="flex items-center text-[10px] font-semibold text-slate-400">
                                        <span className={match.status === 'in_progress' ? 'text-blue-600' : ''}>
                                            {formatDate(match.match_date)}
                                        </span>
                                        {match.location && (
                                            <>
                                                <span className="mx-1.5">•</span>
                                                <span className="truncate max-w-[120px]">{match.location}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Teams & Scoreboard */}
                                <div className="flex items-center justify-between px-2">
                                    {/* Team A */}
                                    <div className="flex items-center gap-3 w-[40%] group-team justify-end">
                                        <span className="text-right font-bold text-xs md:text-sm leading-tight text-slate-800 line-clamp-2">
                                            {match.team_a?.name || 'Equipo A'}
                                        </span>
                                        <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center font-bold text-xs text-slate-700 shadow-sm border border-slate-200">
                                            {match.team_a?.code}
                                        </div>
                                    </div>

                                    {/* VS / Score */}
                                    <div className="flex flex-col items-center justify-center w-[20%] min-w-[60px]">
                                        {match.match_result ? (
                                            <div className="flex flex-col items-center">
                                                <div className="flex items-center space-x-1.5">
                                                    <span className="text-xl md:text-2xl font-black text-slate-900">{match.match_result.goals_team_a}</span>
                                                    <span className="text-slate-300 text-lg">-</span>
                                                    <span className="text-xl md:text-2xl font-black text-slate-900">{match.match_result.goals_team_b}</span>
                                                </div>
                                                {match.status === 'finished' && (
                                                    <span className="text-[9px] uppercase font-bold text-slate-400 mt-0.5">Final</span>
                                                )}

                                                {/* Actual Match Cards */}
                                                <div className="flex gap-1.5 mt-1.5">
                                                    {((match.match_result.yellow_cards_team_a || 0) + (match.match_result.yellow_cards_team_b || 0)) > 0 && (
                                                        <div className="flex items-center text-[9px] bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-100" title="Total Tarjetas Amarillas">
                                                            <div className="w-1.5 h-2 bg-yellow-400 rounded-[1px] mr-1"></div>
                                                            {(match.match_result.yellow_cards_team_a || 0) + (match.match_result.yellow_cards_team_b || 0)}
                                                        </div>
                                                    )}
                                                    {((match.match_result.red_cards_team_a || 0) + (match.match_result.red_cards_team_b || 0)) > 0 && (
                                                        <div className="flex items-center text-[9px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded border border-red-100" title="Total Tarjetas Rojas">
                                                            <div className="w-1.5 h-2 bg-red-500 rounded-[1px] mr-1"></div>
                                                            {(match.match_result.red_cards_team_a || 0) + (match.match_result.red_cards_team_b || 0)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <span className="text-lg font-black text-slate-200">VS</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Team B */}
                                    <div className="flex items-center gap-3 w-[40%] group-team">
                                        <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center font-bold text-xs text-slate-700 shadow-sm border border-slate-200">
                                            {match.team_b?.code}
                                        </div>
                                        <span className="text-left font-bold text-xs md:text-sm leading-tight text-slate-800 line-clamp-2">
                                            {match.team_b?.name || 'Equipo B'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* User Prediction Section (Right side) */}
                            <div className="md:w-48 bg-slate-50/50 border-t md:border-t-0 md:border-l border-slate-200 p-3 md:p-4 flex flex-col justify-center items-center">
                                {hasPrediction ? (
                                    <div className="flex flex-col items-center w-full">
                                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                                            Tu Pronóstico
                                        </span>
                                        <div className="flex items-center justify-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-100 mb-2 w-full max-w-[120px]">
                                            <span className="text-lg font-bold text-slate-900">{prediction?.predicted_goals_team_a}</span>
                                            <span className="text-slate-300 text-sm">-</span>
                                            <span className="text-lg font-bold text-slate-900">{prediction?.predicted_goals_team_b}</span>
                                        </div>

                                        {/* Prediction Badges (Cards) */}
                                        <div className="flex gap-1.5 mb-3">
                                            {(prediction?.predicted_yellow_cards_team_a || 0) + (prediction?.predicted_yellow_cards_team_b || 0) > 0 && (
                                                <div className="flex items-center text-[10px] bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-100" title="Tarjetas Amarillas">
                                                    <span className="w-1.5 h-2 bg-yellow-400 rounded-[1px] mr-1"></span>
                                                    {(prediction?.predicted_yellow_cards_team_a || 0) + (prediction?.predicted_yellow_cards_team_b || 0)}
                                                </div>
                                            )}
                                            {(prediction?.predicted_red_cards_team_a || 0) + (prediction?.predicted_red_cards_team_b || 0) > 0 && (
                                                <div className="flex items-center text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded border border-red-100" title="Tarjetas Rojas">
                                                    <span className="w-1.5 h-2 bg-red-500 rounded-[1px] mr-1"></span>
                                                    {(prediction?.predicted_red_cards_team_a || 0) + (prediction?.predicted_red_cards_team_b || 0)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-[10px] uppercase font-bold text-slate-300 mb-3">Sin Pronóstico</span>
                                )}

                                <Button
                                    onClick={() => {
                                        if (isLocked) return;
                                        router.push(`/prodes/${prodeId}/match/${match.id}`);
                                    }}
                                    disabled={isLocked}
                                    variant={hasPrediction ? "ghost" : "default"}
                                    size="sm"
                                    className={`w-full h-8 text-xs ${hasPrediction
                                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200 bg-white'
                                        : 'bg-slate-900 text-white hover:bg-slate-800'
                                        }`}
                                >
                                    {isLocked ? (
                                        <>
                                            <Ban className="h-3 w-3 mr-1.5" /> Cerrado
                                        </>
                                    ) : (
                                        <>
                                            {hasPrediction ? 'Editar' : 'Predecir'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
