'use client';

import { useEffect, useState } from 'react';
import { adminCompetitionsApi } from '@/lib/api/endpoints';
import { Competition } from '@/lib/types';
import { getErrorMessage } from '@/lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trophy, Loader2, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { CreateCompetitionModal, type CompetitionFormData } from '@/components/admin/CreateCompetitionModal';
import { CompetitionDetailsModal } from '@/components/admin/CompetitionDetailsModal';

export default function AdminCompetitionsPage() {
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);

    useEffect(() => {
        loadCompetitions();
    }, []);

    const loadCompetitions = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await adminCompetitionsApi.getAll();
            setCompetitions(response.data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateCompetition = async (data: CompetitionFormData) => {
        try {
            await adminCompetitionsApi.create(data);
            await loadCompetitions(); // Reload list
        } catch (err) {
            throw new Error(getErrorMessage(err));
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
                Error al cargar competiciones: {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Competiciones</h2>
                    <p className="text-muted-foreground">
                        Gestiona las competiciones deportivas
                    </p>
                </div>
                <Button 
                className="bg-slate-500 text-white hover:bg-slate-600"
                onClick={() => setIsModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva competición
                </Button>
            </div>

            {/* Competitions List */}
            {competitions.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No hay competiciones registradas</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {competitions.map((competition) => (
                        <Card key={competition.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">{competition.name}</CardTitle>
                                        <CardDescription className="mt-1">
                                            {competition.slug}
                                        </CardDescription>
                                    </div>
                                    <Trophy className="h-8 w-8 text-primary" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {/* Dates */}
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center text-muted-foreground">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            <span>Inicio: {formatDate(competition.start_date)}</span>
                                        </div>
                                        <div className="flex items-center text-muted-foreground">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            <span>Fin: {formatDate(competition.end_date)}</span>
                                        </div>
                                    </div>

                                    {/* Sport Type */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground capitalize">
                                            {competition.sport_type}
                                        </span>
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${competition.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {competition.isActive ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="pt-2 flex space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => {
                                                setSelectedCompetition(competition);
                                                setDetailsModalOpen(true);
                                            }}
                                        >
                                            Ver Detalles
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
            {/* Create Competition Modal */}
            <CreateCompetitionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateCompetition}
            />

            {/* Competition Details Modal */}
            <CompetitionDetailsModal
                competition={selectedCompetition}
                open={detailsModalOpen}
                onOpenChange={setDetailsModalOpen}
                onSuccess={loadCompetitions}
            />
        </div>
    );
}
