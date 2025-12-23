'use client';

import { useState, useEffect } from 'react';
import { adminCompetitionsApi } from '@/lib/api/endpoints';
import { Competition } from '@/lib/types';
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
import { Loader2, Edit, Trophy, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface CompetitionDetailsModalProps {
    competition: Competition | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CompetitionDetailsModal({ competition, open, onOpenChange, onSuccess }: CompetitionDetailsModalProps) {
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form fields
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [sportType, setSportType] = useState('futbol');

    useEffect(() => {
        if (competition) {
            setName(competition.name);
            setSlug(competition.slug);
            // Convert ISO dates to datetime-local format
            setStartDate(competition.start_date ? new Date(competition.start_date).toISOString().slice(0, 16) : '');
            setEndDate(competition.end_date ? new Date(competition.end_date).toISOString().slice(0, 16) : '');
            setSportType(competition.sport_type || 'futbol');
            setIsEditMode(false);
            setError(null);
        }
    }, [competition]);

    const handleSave = async () => {
        if (!competition) return;

        setIsLoading(true);
        setError(null);

        try {
            await adminCompetitionsApi.update(competition.id, {
                name,
                startDate,
                endDate,
                sportType,
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
        if (competition) {
            setName(competition.name);
            setSlug(competition.slug);
            setStartDate(competition.start_date ? new Date(competition.start_date).toISOString().slice(0, 16) : '');
            setEndDate(competition.end_date ? new Date(competition.end_date).toISOString().slice(0, 16) : '');
            setSportType(competition.sport_type || 'futbol');
        }
        setIsEditMode(false);
        setError(null);
    };

    if (!competition) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Detalles de la Competición</span>
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
                        {isEditMode ? 'Edita la información de la competición' : 'Información completa de la competición'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center">
                            <Trophy className="h-4 w-4 mr-2" />
                            Nombre
                        </Label>
                        {isEditMode ? (
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isLoading}
                            />
                        ) : (
                            <p className="text-base font-semibold">{competition.name}</p>
                        )}
                    </div>

                    {/* Slug */}
                    <div className="space-y-2">
                        <Label htmlFor="slug">Slug (URL)</Label>
                        {isEditMode ? (
                            <Input
                                id="slug"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                disabled={isLoading}
                            />
                        ) : (
                            <p className="text-base">{competition.slug}</p>
                        )}
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate" className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2" />
                                Fecha de Inicio
                            </Label>
                            {isEditMode ? (
                                <Input
                                    id="startDate"
                                    type="datetime-local"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    disabled={isLoading}
                                />
                            ) : (
                                <p className="text-base">{formatDate(competition.start_date)}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="endDate">Fecha de Fin</Label>
                            {isEditMode ? (
                                <Input
                                    id="endDate"
                                    type="datetime-local"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    disabled={isLoading}
                                />
                            ) : (
                                <p className="text-base">{formatDate(competition.end_date)}</p>
                            )}
                        </div>
                    </div>

                    {/* Sport Type */}
                    <div className="space-y-2">
                        <Label htmlFor="sportType">Deporte</Label>
                        {isEditMode ? (
                            <select
                                id="sportType"
                                value={sportType}
                                onChange={(e) => setSportType(e.target.value)}
                                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                                disabled={isLoading}
                            >
                                <option value="futbol">Fútbol</option>
                                <option value="basketball">Basketball</option>
                                <option value="rugby">Rugby</option>
                                <option value="hockey">Hockey</option>
                                <option value="tennis">Tenis</option>
                            </select>
                        ) : (
                            <p className="text-base capitalize">{competition.sport_type}</p>
                        )}
                    </div>

                    {/* Stats */}
                    {!isEditMode && (
                        <div className="pt-4 border-t">
                            <h4 className="font-semibold mb-2">Estadísticas</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Partidos:</span>{' '}
                                    <span className="font-medium">{competition._count?.matches || 0}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Prodes:</span>{' '}
                                    <span className="font-medium">{competition._count?.prodes || 0}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Estado:</span>{' '}
                                    <span className={`font-medium ${competition.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                        {competition.isActive ? 'Activa' : 'Inactiva'}
                                    </span>
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
                                variant="ghost"
                                onClick={handleCancel}
                                disabled={isLoading}
                                className="bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="bg-slate-900 text-white hover:bg-slate-800"
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
