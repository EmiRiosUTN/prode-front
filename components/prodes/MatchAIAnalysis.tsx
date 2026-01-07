'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, TrendingUp } from 'lucide-react';
import { employeeApi } from '@/lib/api/endpoints';

interface MatchAnalysis {
    teamA_win_probability: number;
    teamB_win_probability: number;
    draw_probability: number;
    expected_yellow_cards: { min: number; max: number };
    expected_red_cards: { min: number; max: number };
    generated_at: string;
}

interface MatchAIAnalysisProps {
    matchId: string;
    teamAName: string;
    teamBName: string;
    teamAFlagUrl?: string;
    teamBFlagUrl?: string;
    teamACode?: string;
    teamBCode?: string;
}

export function MatchAIAnalysis({ matchId, teamAName, teamBName, teamAFlagUrl, teamBFlagUrl, teamACode, teamBCode }: MatchAIAnalysisProps) {
    const [analysis, setAnalysis] = useState<MatchAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isExpanded && !analysis && !error) {
            loadAnalysis();
        }
    }, [isExpanded]);

    const loadAnalysis = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await employeeApi.getMatchAnalysis(matchId);
            setAnalysis(response.data);
        } catch (err: any) {
            console.error('Error loading AI analysis:', err);
            setError('No se pudo cargar el análisis de IA');
        } finally {
            setIsLoading(false);
        }
    };

    const ProbabilityBar = ({ label, percentage, color }: { label: string; percentage: number; color: string }) => (
        <div className="space-y-1">
            <div className="flex justify-between text-sm">
                <span className="font-medium">{label}</span>
                <span className="font-bold">{percentage}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );

    return (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Análisis con IA</CardTitle>
                    </div>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-sm text-primary hover:underline font-medium"
                    >
                        {isExpanded ? 'Ocultar' : 'Ver análisis'}
                    </button>
                </div>
                <CardDescription>
                    Probabilidades y predicciones generadas por inteligencia artificial
                </CardDescription>
            </CardHeader>

            {isExpanded && (
                <CardContent className="space-y-4">
                    {isLoading && (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <span className="ml-2 text-sm text-muted-foreground">Generando análisis...</span>
                        </div>
                    )}

                    {error && (
                        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    {analysis && !isLoading && (
                        <div className="space-y-4">
                            {/* Win Probabilities */}
                            <div className="space-y-3">
                                <h4 className="font-semibold text-sm flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" />
                                    Probabilidad de victoria
                                </h4>
                                <ProbabilityBar
                                    label={teamAName}
                                    percentage={analysis.teamA_win_probability}
                                    color="bg-blue-500"
                                />
                                <ProbabilityBar
                                    label="Empate"
                                    percentage={analysis.draw_probability}
                                    color="bg-gray-500"
                                />
                                <ProbabilityBar
                                    label={teamBName}
                                    percentage={analysis.teamB_win_probability}
                                    color="bg-green-500"
                                />
                            </div>

                            {/* Card Predictions */}
                            <div className="space-y-2 pt-2 border-t">
                                <h4 className="font-semibold text-sm">Tarjetas esperadas</h4>
                                <div className="flex items-center justify-around gap-6">
                                    {/* Yellow Cards */}
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs text-muted-foreground">Amarillas:</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                {teamAFlagUrl ? (
                                                    <img src={teamAFlagUrl} alt={teamAName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-[8px] font-bold text-gray-600">{teamACode || 'A'}</span>
                                                )}
                                            </div>
                                            <p className="text-sm font-semibold">
                                                {analysis.expected_yellow_cards.min} - {analysis.expected_yellow_cards.max}
                                            </p>
                                            <div className="w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                {teamBFlagUrl ? (
                                                    <img src={teamBFlagUrl} alt={teamBName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-[8px] font-bold text-gray-600">{teamBCode || 'B'}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Red Cards */}
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs text-muted-foreground">Rojas:</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                {teamAFlagUrl ? (
                                                    <img src={teamAFlagUrl} alt={teamAName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-[8px] font-bold text-gray-600">{teamACode || 'A'}</span>
                                                )}
                                            </div>
                                            <p className="text-sm font-semibold">
                                                {analysis.expected_red_cards.min} - {analysis.expected_red_cards.max}
                                            </p>
                                            <div className="w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                {teamBFlagUrl ? (
                                                    <img src={teamBFlagUrl} alt={teamBName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-[8px] font-bold text-gray-600">{teamBCode || 'B'}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-muted-foreground italic pt-2 border-t">
                                * Este análisis es generado por IA y debe usarse solo como referencia
                            </p>
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}
