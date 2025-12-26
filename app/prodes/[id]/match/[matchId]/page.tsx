'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { prodeApi } from '@/lib/api/endpoints';
import { Match, Prode } from '@/lib/types';
import { PredictionForm } from '@/components/predictions/PredictionForm';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function MatchPredictionPage() {
    const params = useParams();
    const router = useRouter();
    const prodeId = params.id as string;
    const matchId = params.matchId as string;

    const [prode, setProde] = useState<Prode | null>(null);
    const [match, setMatch] = useState<Match & { myPrediction?: any } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodeRes, matchesRes] = await Promise.all([
                    prodeApi.getById(prodeId),
                    prodeApi.getMatches(prodeId)
                ]);

                setProde(prodeRes.data);

                // Find the specific match
                const foundMatch = matchesRes.data.find((m: any) => m.id === matchId);
                if (foundMatch) {
                    const isLocked = foundMatch.isLocked || foundMatch.status !== 'scheduled' || new Date() >= new Date(foundMatch.match_date);
                    if (isLocked) {
                        toast.warning('El partido ya ha comenzado');
                        router.push(`/prodes/${prodeId}`);
                        return;
                    }
                    setMatch(foundMatch);
                } else {
                    toast.error('Partido no encontrado');
                    router.push(`/prodes/${prodeId}`);
                }

            } catch (error) {
                console.error(error);
                toast.error('Error al cargar datos');
            } finally {
                setLoading(false);
            }
        };

        if (prodeId && matchId) {
            fetchData();
        }
    }, [prodeId, matchId, router]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!prode || !match) return null;

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="container mx-auto py-8">
                <Button
                    variant="ghost"
                    className="mb-6"
                    onClick={() => router.push(`/prodes/${prodeId}`)}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al prode
                </Button>

                <div className="bg-card border rounded-lg shadow-lg overflow-hidden mb-6">
                    <div className="bg-primary/10 border-b px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Prode</p>
                                <h1 className="text-xl font-bold">{prode.name}</h1>
                            </div>
                            <Badge variant="outline" className="text-sm">
                                {match.stage || 'Fase de grupos'}
                            </Badge>
                        </div>
                    </div>

                    <div className="px-6 py-8">
                        <div className="flex items-center justify-center gap-8 mb-8">
                            <div className="flex-1 text-right">
                                <div className="inline-block">
                                    <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center mb-2 mx-auto border border-primary/20 overflow-hidden">
                                        {match.team_a?.flag_url ? (
                                            <img
                                                src={match.team_a.flag_url}
                                                alt={match.team_a.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-xl font-semibold text-primary/70">
                                                {match.team_a?.name?.substring(0, 3).toUpperCase() || 'A'}
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-lg font-semibold text-foreground/90">{match.team_a?.name || 'Equipo A'}</h2>
                                </div>
                            </div>

                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center border border-border">
                                    <span className="text-sm font-medium text-muted-foreground">VS</span>
                                </div>
                            </div>

                            <div className="flex-1 text-left">
                                <div className="inline-block">
                                    <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center mb-2 mx-auto border border-primary/20 overflow-hidden">
                                        {match.team_b?.flag_url ? (
                                            <img
                                                src={match.team_b.flag_url}
                                                alt={match.team_b.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-xl font-semibold text-primary/70">
                                                {match.team_b?.name?.substring(0, 3).toUpperCase() || 'B'}
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-lg font-semibold text-foreground/90">{match.team_b?.name || 'Equipo B'}</h2>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-2 text-center border-t pt-6">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="font-medium">{formatDate(match.match_date)}</span>
                            </div>
                            {match.location && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="text-sm">{match.location}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <PredictionForm
                    prodeId={prodeId}
                    match={match}
                    variableConfigs={prode.prode_variable_configs || []}
                    onSuccess={() => router.push(`/prodes/${prodeId}`)}
                />
            </div>
        </div>
    );
}
