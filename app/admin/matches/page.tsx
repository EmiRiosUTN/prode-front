'use client';

import { useEffect, useState } from 'react';
import { adminMatchesApi, adminCompetitionsApi } from '@/lib/api/endpoints';
import { Match, Competition } from '@/lib/types';
import { getErrorMessage } from '@/lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Calendar, MapPin } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { CreateMatchModal } from '@/components/admin/CreateMatchModal';
import { MatchDetailsModal } from '@/components/admin/MatchDetailsModal';

export default function AdminMatchesPage() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [selectedCompetition, setSelectedCompetition] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

    useEffect(() => {
        loadCompetitions();
    }, []);

    useEffect(() => {
        loadMatches();
    }, [selectedCompetition]);

    const loadCompetitions = async () => {
        try {
            const response = await adminCompetitionsApi.getAll();
            setCompetitions(response.data);
        } catch (err) {
            console.error('Error loading competitions:', err);
        }
    };

    const loadMatches = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await adminMatchesApi.getAll(selectedCompetition || undefined);
            setMatches(response.data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                Error al cargar partidos: {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Partidos</h2>
                    <p className="text-muted-foreground">
                        Gestiona los partidos de las competiciones
                    </p>
                </div>
                <Button onClick={() => setCreateModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Partido
                </Button>
            </div>

            {/* Filter by Competition */}
            {competitions.length > 0 && (
                <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium">Filtrar por competición:</label>
                    <select
                        value={selectedCompetition}
                        onChange={(e) => setSelectedCompetition(e.target.value)}
                        className="flex h-9 w-64 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                        <option value="">Todas las competiciones</option>
                        {competitions.map((comp) => (
                            <option key={comp.id} value={comp.id}>
                                {comp.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Matches List */}
            {matches.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No hay partidos registrados</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {matches.map((match) => (
                        <Card key={match.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">
                                            {match.team_a?.name || 'Equipo A'} vs {match.team_b?.name || 'Equipo B'}
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            {match.competition?.name} - {match.stage}
                                        </CardDescription>
                                    </div>
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${match.status === 'finished'
                                            ? 'bg-green-100 text-green-800'
                                            : match.status === 'in_progress'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-slate-100 text-slate-800'
                                            }`}
                                    >
                                        {match.status === 'finished'
                                            ? 'Finalizado'
                                            : match.status === 'in_progress'
                                                ? 'En Curso'
                                                : 'Programado'}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {/* Match Info */}
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center text-muted-foreground">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            <span>{formatDateTime(match.match_date)}</span>
                                        </div>
                                        {match.location && (
                                            <div className="flex items-center text-muted-foreground">
                                                <MapPin className="h-4 w-4 mr-2" />
                                                <span>{match.location}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Result if available */}
                                    {match.match_result && (
                                        <div className="bg-slate-50 rounded-md p-3">
                                            <div className="flex items-center justify-center space-x-8 text-lg font-semibold">
                                                <span>{match.team_a?.name}</span>
                                                <span className="text-2xl">
                                                    {match.match_result.goalsTeamA} - {match.match_result.goalsTeamB}
                                                </span>
                                                <span>{match.team_b?.name}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="pt-2 flex space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedMatch(match);
                                                setDetailsModalOpen(true);
                                            }}
                                        >
                                            Ver Detalles
                                        </Button>
                                        {match.status !== 'finished' && (
                                            <Button variant="outline" size="sm">
                                                Cargar Resultado
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Match Modal */}
            <CreateMatchModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
                onSuccess={loadMatches}
            />

            {/* Match Details Modal */}
            <MatchDetailsModal
                match={selectedMatch}
                open={detailsModalOpen}
                onOpenChange={setDetailsModalOpen}
                onSuccess={loadMatches}
            />
        </div>
    );
}
