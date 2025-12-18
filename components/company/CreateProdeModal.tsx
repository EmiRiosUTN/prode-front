'use client';

import { useState, useEffect } from 'react';
import { companyApi, predictionVariablesApi, adminCompetitionsApi } from '@/lib/api/endpoints';
import { Competition, PredictionVariable } from '@/lib/types';
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
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface CreateProdeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreateProdeModal({ open, onOpenChange, onSuccess }: CreateProdeModalProps) {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [competitionId, setCompetitionId] = useState('');
    const [participationMode, setParticipationMode] = useState<'general' | 'by_area' | 'both'>('general');
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [predictionVariables, setPredictionVariables] = useState<PredictionVariable[]>([]);
    const [selectedVariables, setSelectedVariables] = useState<Map<string, number>>(new Map());
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingCompetitions, setIsLoadingCompetitions] = useState(false);
    const [isLoadingVariables, setIsLoadingVariables] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setStep(1); // Reset to step 1
            loadCompetitions();
            loadPredictionVariables();
        }
    }, [open]);

    const loadCompetitions = async () => {
        try {
            setIsLoadingCompetitions(true);
            const response = await adminCompetitionsApi.getAllPublic();
            setCompetitions(response.data);
        } catch (err) {
            console.error('Error loading competitions:', err);
        } finally {
            setIsLoadingCompetitions(false);
        }
    };

    const loadPredictionVariables = async () => {
        try {
            setIsLoadingVariables(true);
            const response = await predictionVariablesApi.getAll();
            // Handle potential double wrapping of the response
            const data = (response as any).data;

            if (Array.isArray(response.data)) {
                setPredictionVariables(response.data);
            } else if (data && Array.isArray(data.data)) {
                setPredictionVariables(data.data);
            } else if (data && Array.isArray(data)) {
                setPredictionVariables(data);
            } else {
                console.log('Unexpected response structure:', response);
                setPredictionVariables([]);
            }
        } catch (err) {
            console.error('Error loading prediction variables:', err);
            setPredictionVariables([]);
        } finally {
            setIsLoadingVariables(false);
        }
    };

    const handleVariableToggle = (variableId: string, checked: boolean) => {
        const newSelected = new Map(selectedVariables);
        if (checked) {
            newSelected.set(variableId, 3); // Default 3 points
        } else {
            newSelected.delete(variableId);
        }
        setSelectedVariables(newSelected);
    };

    const handlePointsChange = (variableId: string, points: number) => {
        const newSelected = new Map(selectedVariables);
        newSelected.set(variableId, points);
        setSelectedVariables(newSelected);
    };

    const handleNext = () => {
        if (step === 1) {
            if (!name.trim()) {
                setError('El nombre es obligatorio');
                return;
            }
            if (!competitionId) {
                setError('Debes seleccionar una competición');
                return;
            }
            setError(null);
            setStep(2);
        }
    };

    const handleBack = () => {
        setError(null);
        setStep(step - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (step === 1) {
            handleNext();
            return;
        }

        if (selectedVariables.size === 0) {
            setError('Debes seleccionar al menos una variable de predicción');
            return;
        }

        setIsLoading(true);

        try {
            const variableConfigs = Array.from(selectedVariables.entries()).map(([id, points]) => ({
                predictionVariableId: id,
                points,
                isActive: true,
            }));

            await companyApi.createProde({
                name,
                description,
                competitionId,
                participationMode,
                variableConfigs,
            });

            // Reset form
            setName('');
            setDescription('');
            setCompetitionId('');
            setParticipationMode('general');
            setSelectedVariables(new Map());
            setStep(1);

            // Close modal and trigger refresh
            onOpenChange(false);
            onSuccess();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>
                        {step === 1 ? 'Nuevo Prode - Información Básica' : 'Nuevo Prode - Configurar Variables'}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 1
                            ? 'Paso 1 de 2: Define los detalles generales del prode'
                            : 'Paso 2 de 2: Selecciona las variables que los usuarios podrán predecir'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="py-4">
                        {step === 1 ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre *</Label>
                                    <Input
                                        id="name"
                                        placeholder="Ej: Mundial Qatar 2022"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Descripción</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Descripción opcional del prode"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        disabled={isLoading}
                                        rows={3}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="competition">Competición *</Label>
                                    {isLoadingCompetitions ? (
                                        <div className="flex items-center justify-center py-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span className="ml-2 text-sm text-muted-foreground">Cargando competiciones...</span>
                                        </div>
                                    ) : (
                                        <Select
                                            value={competitionId}
                                            onValueChange={setCompetitionId}
                                            disabled={isLoading}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona una competición" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {competitions.map((competition) => (
                                                    <SelectItem key={competition.id} value={competition.id}>
                                                        {competition.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="participationMode">Modo de Participación *</Label>
                                    <Select
                                        value={participationMode}
                                        onValueChange={(value: 'general' | 'by_area' | 'both') => setParticipationMode(value)}
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="general">General (Ranking único)</SelectItem>
                                            <SelectItem value="by_area">Por Área (Ranking por área)</SelectItem>
                                            <SelectItem value="both">Ambos (General + Por Área)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        Define cómo se organizarán los rankings
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <Label>Variables de Predicción *</Label>
                                {isLoadingVariables ? (
                                    <div className="flex items-center justify-center py-4">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span className="ml-2 text-muted-foreground">Cargando variables...</span>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-[400px] overflow-y-auto border rounded-md p-3">
                                        {Array.isArray(predictionVariables) && predictionVariables.map((variable) => (
                                            <div key={variable.id} className="flex items-start space-x-3 p-2 hover:bg-accent rounded-md">
                                                <Checkbox
                                                    id={variable.id}
                                                    checked={selectedVariables.has(variable.id)}
                                                    onCheckedChange={(checked) => handleVariableToggle(variable.id, checked as boolean)}
                                                    disabled={isLoading}
                                                />
                                                <div className="flex-1 space-y-1">
                                                    <label
                                                        htmlFor={variable.id}
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                    >
                                                        {variable.name}
                                                    </label>
                                                    {variable.description && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {variable.description}
                                                        </p>
                                                    )}
                                                </div>
                                                {selectedVariables.has(variable.id) && (
                                                    <div className="flex items-center space-x-2">
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={selectedVariables.get(variable.id) || 3}
                                                            onChange={(e) => handlePointsChange(variable.id, parseInt(e.target.value) || 0)}
                                                            className="w-16 h-8"
                                                            disabled={isLoading}
                                                        />
                                                        <span className="text-xs text-muted-foreground">pts</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <p>Selecciona al menos una variable</p>
                                    <p>{selectedVariables.size} seleccionada{selectedVariables.size !== 1 ? 's' : ''}</p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mt-4 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                                {error}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="flex justify-between sm:justify-between">
                        {step === 1 ? (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                            >
                                Cancelar
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleBack}
                                disabled={isLoading}
                            >
                                Atrás
                            </Button>
                        )}

                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {step === 1 ? 'Cargando...' : 'Creando...'}
                                </>
                            ) : (
                                step === 1 ? 'Siguiente' : 'Crear Prode'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
