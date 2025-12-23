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
import { EditMatchResultModal } from '@/components/admin/EditMatchResultModal';

export default function AdminMatchesPage() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [selectedCompetition, setSelectedCompetition] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [resultModalOpen, setResultModalOpen] = useState(false);
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
                <Button
                    className="bg-slate-500 text-white hover:bg-slate-600"
                    onClick={() => setCreateModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo partido
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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {matches.map((match) => (
                        <Card key={match.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 border-slate-200 flex flex-col">
                            {/* Card Header: Competition & Status */}
                            <div className="flex justify-between items-center bg-slate-50/80 px-4 py-3 border-b">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate max-w-[60%]">
                                    {match.competition?.name}
                                </span>
                                <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${match.status === 'finished'
                                        ? 'bg-green-100 text-green-700 border border-green-200'
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

                            <CardContent className="p-0 flex-1 flex flex-col justify-center min-h-[160px]">
                                <div className="p-6 flex flex-col items-center w-full">
                                    <div className="flex items-start justify-between w-full mb-6">
                                        {/* Team A */}
                                        <div className="flex flex-col items-center w-1/3 group">
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-bold text-slate-700 mb-3 shadow-sm border border-slate-300 group-hover:scale-105 transition-transform">
                                                {match.team_a?.code}
                                            </div>
                                            <span className="text-center font-bold text-sm leading-tight text-slate-800 line-clamp-2">{match.team_a?.name}</span>
                                        </div>

                                        {/* Score / VS Center */}
                                        <div className="w-1/3 flex flex-col items-center justify-center pt-2">
                                            {match.match_result ? (
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-3xl font-black text-slate-900">{match.match_result.goals_team_a}</span>
                                                    <span className="text-slate-300 text-xl">-</span>
                                                    <span className="text-3xl font-black text-slate-900">{match.match_result.goals_team_b}</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <span className="text-2xl font-black text-slate-200">VS</span>
                                                </div>
                                            )}
                                            <div className="mt-2 text-[10px] font-medium text-muted-foreground bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                                                {match.stage}
                                            </div>
                                        </div>

                                        {/* Team B */}
                                        <div className="flex flex-col items-center w-1/3 group">
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-bold text-slate-700 mb-3 shadow-sm border border-slate-300 group-hover:scale-105 transition-transform">
                                                {match.team_b?.code}
                                            </div>
                                            <span className="text-center font-bold text-sm leading-tight text-slate-800 line-clamp-2">{match.team_b?.name}</span>
                                        </div>
                                    </div>

                                    {/* Metadata */}
                                    <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground w-full pt-4 border-t border-dashed">
                                        <div className="flex items-center bg-slate-50 px-2 py-1 rounded">
                                            <Calendar className="w-3 h-3 mr-1.5 text-slate-400" />
                                            {formatDateTime(match.match_date)}
                                        </div>
                                        {match.location && (
                                            <div className="flex items-center bg-slate-50 px-2 py-1 rounded">
                                                <MapPin className="w-3 h-3 mr-1.5 text-slate-400" />
                                                <span className="truncate max-w-[100px]">{match.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>

                            {/* Actions Footer */}
                            <div className="p-3 bg-slate-50 flex gap-3 border-t">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 font-medium"
                                    onClick={() => {
                                        setSelectedMatch(match);
                                        setDetailsModalOpen(true);
                                    }}
                                >
                                    Ver detalles
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 bg-slate-900 text-white hover:bg-slate-800 hover:text-white border-transparent"
                                    onClick={() => {
                                        setSelectedMatch(match);
                                        setResultModalOpen(true);
                                    }}
                                >
                                    {match.match_result ? 'Editar resultado' : 'Cargar resultado'}
                                </Button>
                            </div>
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

            {/* Edit Result Modal */}
            <EditMatchResultModal
                match={selectedMatch}
                open={resultModalOpen}
                onOpenChange={setResultModalOpen}
                onSuccess={loadMatches}
            />
        </div>
    );
}
