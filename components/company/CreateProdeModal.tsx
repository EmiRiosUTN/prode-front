'use client';

import { useState, useEffect } from 'react';
import { companyApi, predictionVariablesApi, adminCompetitionsApi } from '@/lib/api/endpoints';
import { Competition, PredictionVariable, CompanyArea } from '@/lib/types';
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

const shouldHidePredictionVariable = (variable: any) => {
    const code = String(variable?.code || '').toLowerCase();
    const name = String(variable?.name || '').toLowerCase();
    const description = String(variable?.description || '').toLowerCase();

    return (
        ['scorers', 'goleador', 'goleadores', 'goal_scorer', 'goal_scorers'].includes(code) ||
        name.includes('goleador') ||
        description.includes('acertar jugador') ||
        description.includes('goleador')
    );
};

export function CreateProdeModal({ open, onOpenChange, onSuccess }: CreateProdeModalProps) {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [competitionId, setCompetitionId] = useState('');
    const [participationMode, setParticipationMode] = useState<'general' | 'by_area' | 'both'>('general');

    // New states for area ranking
    const [companyAreaId, setCompanyAreaId] = useState<string>('');
    const [enableAreaRanking, setEnableAreaRanking] = useState(false);
    const [areaRankingCalculation, setAreaRankingCalculation] = useState<'sum' | 'average'>('average');

    // Rewards configuration states
    const [individualPrizes, setIndividualPrizes] = useState<string[]>(['']);
    const [rewardAreaWinner, setRewardAreaWinner] = useState(false);
    const [areaPrizes, setAreaPrizes] = useState<string[]>(['']);

    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [areas, setAreas] = useState<CompanyArea[]>([]);
    const [predictionVariables, setPredictionVariables] = useState<PredictionVariable[]>([]);
    const [selectedVariables, setSelectedVariables] = useState<Map<string, number>>(new Map());

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingCompetitions, setIsLoadingCompetitions] = useState(false);
    const [isLoadingAreas, setIsLoadingAreas] = useState(false);
    const [isLoadingVariables, setIsLoadingVariables] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setStep(1); // Reset to step 1
            loadCompetitions();
            loadAreas();
            loadPredictionVariables();
        }
    }, [open]);

    const loadCompetitions = async () => {
        try {
            setIsLoadingCompetitions(true);
            const response = await adminCompetitionsApi.getAllPublic();
            const activeCompetitions = response.data.filter((c: any) => c.is_active || c.isActive);
            setCompetitions(activeCompetitions);
        } catch (err) {
            console.error('Error loading competitions:', err);
        } finally {
            setIsLoadingCompetitions(false);
        }
    };

    const loadAreas = async () => {
        try {
            setIsLoadingAreas(true);
            const response = await companyApi.getAreas();
            setAreas(response.data);
        } catch (err) {
            console.error('Error loading areas:', err);
        } finally {
            setIsLoadingAreas(false);
        }
    };

    const loadPredictionVariables = async () => {
        try {
            setIsLoadingVariables(true);
            const response = await predictionVariablesApi.getAll();
            // Handle potential double wrapping of the response
            const data = (response as any).data;

            if (Array.isArray(response.data)) {
                setPredictionVariables(response.data.filter((v: any) => !shouldHidePredictionVariable(v) && v.code !== 'goal_difference'));
            } else if (data && Array.isArray(data.data)) {
                setPredictionVariables(data.data.filter((v: any) => !shouldHidePredictionVariable(v) && v.code !== 'goal_difference'));
            } else if (data && Array.isArray(data)) {
                setPredictionVariables(data.filter((v: any) => !shouldHidePredictionVariable(v) && v.code !== 'goal_difference'));
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
                companyAreaId: participationMode === 'by_area' && companyAreaId ? companyAreaId : undefined,
                showAreaRanking: enableAreaRanking,
                areaRankingCalculation: enableAreaRanking ? areaRankingCalculation : undefined,
                winnerCount: individualPrizes.filter(p => p.trim() !== '').length > 0 ? individualPrizes.filter(p => p.trim() !== '').length : 1,
                individualPrize: individualPrizes.filter(p => p.trim() !== '').length > 0 ? JSON.stringify(individualPrizes.filter(p => p.trim() !== '')) : undefined,
                rewardAreaWinner,
                areaPrize: rewardAreaWinner && areaPrizes.filter(p => p.trim() !== '').length > 0 ? JSON.stringify(areaPrizes.filter(p => p.trim() !== '')) : undefined,
                variableConfigs,
            });

            // Reset form
            setName('');
            setDescription('');
            setCompetitionId('');
            setParticipationMode('general');
            setCompanyAreaId('');
            setEnableAreaRanking(false);
            setAreaRankingCalculation('average');
            setIndividualPrizes(['']);
            setRewardAreaWinner(false);
            setAreaPrizes(['']);
            setSelectedVariables(new Map());
            setStep(1);

            // Close modal and refresh
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
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
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

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="py-4 overflow-y-auto flex-1 px-1">
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

                                {participationMode === 'by_area' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="companyArea">Área Específica (Opcional)</Label>
                                        <Select
                                            value={companyAreaId}
                                            onValueChange={setCompanyAreaId}
                                            disabled={isLoading || isLoadingAreas}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona un área para prode privado" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Todas las áreas</SelectItem>
                                                {areas.map((area) => (
                                                    <SelectItem key={area.id} value={area.id}>
                                                        {area.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">
                                            Si seleccionas un área, solo los empleados de esa área podrán participar (Prode Privado).
                                        </p>
                                    </div>
                                )}

                                {(!companyAreaId || companyAreaId === 'none') && (
                                    <div className="space-y-4 pt-2 border-t">
                                        <div className="flex items-start space-x-2">
                                            <Checkbox
                                                id="areaRanking"
                                                checked={enableAreaRanking}
                                                onCheckedChange={(checked) => setEnableAreaRanking(checked as boolean)}
                                                disabled={isLoading}
                                            />
                                            <div className="grid gap-1.5 leading-none">
                                                <Label
                                                    htmlFor="areaRanking"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                >
                                                    Habilitar Competencia entre Áreas
                                                </Label>
                                                <p className="text-xs text-muted-foreground">
                                                    Genera un ranking adicional comparando el desempeño de cada área.
                                                </p>
                                            </div>
                                        </div>

                                        {enableAreaRanking && (
                                            <div className="space-y-2 pl-6">
                                                <Label htmlFor="calculationMode">Método de Cálculo</Label>
                                                <Select
                                                    value={areaRankingCalculation}
                                                    onValueChange={(value: 'sum' | 'average') => setAreaRankingCalculation(value)}
                                                    disabled={isLoading}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="average">Promedio (Recomendado)</SelectItem>
                                                        <SelectItem value="sum">Suma total</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <p className="text-xs text-muted-foreground">
                                                    Promedio: Suma de puntos / Cantidad de empleados (más justo para áreas chicas).
                                                    <br />
                                                    Suma total: Suma directa de puntos (favorece áreas con más empleados).
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Rewards Configuration Section */}
                                <div className="space-y-4 pt-4 border-t">
                                    <div>
                                        <h3 className="text-sm font-semibold mb-2">Configuración de Premios Individuales</h3>
                                        <p className="text-xs text-muted-foreground mb-3">Agrega tantos premios como desees (Top 1, Top 2, etc.)</p>
                                    </div>
                                    <div className="space-y-3">
                                        {individualPrizes.map((prize, idx) => (
                                            <div key={idx} className="flex flex-col gap-1">
                                                <Label className="text-xs text-muted-foreground">Premio #{idx + 1}</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        placeholder={"Ej: Giftcard de $10.000"}
                                                        value={prize}
                                                        onChange={(e) => {
                                                            const newPrizes = [...individualPrizes];
                                                            newPrizes[idx] = e.target.value;
                                                            setIndividualPrizes(newPrizes);
                                                        }}
                                                        disabled={isLoading}
                                                    />
                                                    {individualPrizes.length > 1 && (
                                                        <Button type="button" variant="outline" size="sm" onClick={() => setIndividualPrizes(individualPrizes.filter((_, i) => i !== idx))} className="text-destructive border-destructive px-2">
                                                            X
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        <Button type="button" variant="secondary" size="sm" onClick={() => setIndividualPrizes([...individualPrizes, ''])} disabled={isLoading}>
                                            + Agregar otro premio
                                        </Button>
                                    </div>

                                    {enableAreaRanking && (
                                        <>
                                            <div className="pt-4 mt-2 border-t flex items-start space-x-2">
                                                <Checkbox id="rewardAreaWinner" checked={rewardAreaWinner} onCheckedChange={(checked) => setRewardAreaWinner(checked as boolean)} disabled={isLoading} />
                                                <div className="grid gap-1.5 leading-none">
                                                    <Label htmlFor="rewardAreaWinner" className="text-sm font-medium leading-none cursor-pointer">Premiar al Área Ganadora</Label>
                                                    <p className="text-xs text-muted-foreground">Otorga premios al área con mejor desempeño</p>
                                                </div>
                                            </div>

                                            {rewardAreaWinner && (
                                                <div className="space-y-3 pl-6 mt-3">
                                                    {areaPrizes.map((prize, idx) => (
                                                        <div key={idx} className="flex flex-col gap-1">
                                                            <Label className="text-xs text-muted-foreground">Premio para Área #{idx + 1}</Label>
                                                            <div className="flex items-center gap-2">
                                                                <Input
                                                                    placeholder={"Ej: Almuerzo grupal"}
                                                                    value={prize}
                                                                    onChange={(e) => {
                                                                        const newPrizes = [...areaPrizes];
                                                                        newPrizes[idx] = e.target.value;
                                                                        setAreaPrizes(newPrizes);
                                                                    }}
                                                                    disabled={isLoading}
                                                                />
                                                                {areaPrizes.length > 1 && (
                                                                    <Button type="button" variant="outline" size="sm" onClick={() => setAreaPrizes(areaPrizes.filter((_, i) => i !== idx))} className="text-destructive border-destructive px-2">
                                                                        X
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <Button type="button" variant="secondary" size="sm" onClick={() => setAreaPrizes([...areaPrizes, ''])} disabled={isLoading}>
                                                        + Agregar premio de área
                                                    </Button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <Label>Variables de predicción *</Label>
                                {isLoadingVariables ? (
                                    <div className="flex items-center justify-center py-4">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span className="ml-2 text-muted-foreground">Cargando variables...</span>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-[400px] overflow-y-auto border rounded-md p-3">
                                        {Array.isArray(predictionVariables) && predictionVariables
                                            .filter((variable) => !shouldHidePredictionVariable(variable))
                                            .map((variable) => (
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
                                className="bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
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

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="hover:opacity-90"
                            style={{
                                backgroundColor: 'hsl(var(--primary))',
                                color: 'hsl(var(--primary-foreground))'
                            }}
                        >
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
