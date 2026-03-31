'use client';

import { useState, useEffect } from 'react';
import { companyApi, predictionVariablesApi, adminCompetitionsApi } from '@/lib/api/endpoints';
import { Competition, PredictionVariable, CompanyArea, Prode } from '@/lib/types';
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
import { Switch } from '@/components/ui/switch';

interface EditProdeModalProps {
    prode: Prode | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function EditProdeModal({ prode, open, onOpenChange, onSuccess }: EditProdeModalProps) {
    const [step, setStep] = useState(1);
    
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [participationMode, setParticipationMode] = useState<'general' | 'by_area' | 'both'>('general');
    
    // Config states
    const [enableAreaRanking, setEnableAreaRanking] = useState(false);
    const [areaRankingCalculation, setAreaRankingCalculation] = useState<'sum' | 'average'>('average');

    // Rewards
    const [winnerCount, setWinnerCount] = useState<number>(1);
    const [individualPrize, setIndividualPrize] = useState('');
    const [rewardAreaWinner, setRewardAreaWinner] = useState(false);
    const [areaPrize, setAreaPrize] = useState('');

    const [predictionVariables, setPredictionVariables] = useState<PredictionVariable[]>([]);
    const [selectedVariables, setSelectedVariables] = useState<Map<string, number>>(new Map());

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingVariables, setIsLoadingVariables] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initializer
    useEffect(() => {
        if (open && prode) {
            setStep(1);
            setName(prode.name);
            setDescription(prode.description || '');
            setIsActive(prode.is_active ?? true);
            setParticipationMode(prode.participation_mode ?? 'general');
            
            setEnableAreaRanking(prode.prode_ranking_config?.show_area_ranking ?? false);
            setAreaRankingCalculation(prode.prode_ranking_config?.area_ranking_calculation ?? 'average');

            setWinnerCount(prode.winner_count ?? 1);
            setIndividualPrize(prode.individual_prize || '');
            setRewardAreaWinner(prode.reward_area_winner ?? false);
            setAreaPrize(prode.area_prize || '');

            const initialVars = new Map<string, number>();
            if (prode.prode_variable_configs) {
                prode.prode_variable_configs.forEach(pc => {
                    initialVars.set(pc.predictionVariableId || pc.prediction_variable.id, pc.points);
                });
            }
            setSelectedVariables(initialVars);

            loadPredictionVariables();
        }
    }, [open, prode]);

    const loadPredictionVariables = async () => {
        try {
            setIsLoadingVariables(true);
            const response = await predictionVariablesApi.getAll();
            const data = (response as any).data;

            if (Array.isArray(response.data)) {
                setPredictionVariables(response.data);
            } else if (data && Array.isArray(data.data)) {
                setPredictionVariables(data.data);
            } else if (data && Array.isArray(data)) {
                setPredictionVariables(data);
            } else {
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
            newSelected.set(variableId, 3);
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
        if (!prode) return;

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

            await companyApi.updateProde(prode.id, {
                name,
                description,
                isActive,
                participationMode,
                showAreaRanking: enableAreaRanking,
                areaRankingCalculation: enableAreaRanking ? areaRankingCalculation : undefined,
                winnerCount,
                individualPrize: individualPrize || undefined,
                rewardAreaWinner,
                areaPrize: areaPrize || undefined,
                variableConfigs,
            });

            onOpenChange(false);
            onSuccess();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    if (!prode) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>
                        {step === 1 ? 'Editar Prode - Información Básica' : 'Editar Prode - Configurar Variables'}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 1
                            ? 'Paso 1 de 2: Define los detalles generales del prode'
                            : 'Paso 2 de 2: Configura las variables (Afectará los puntajes retroactivamente si hay partidos finalizados)'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="py-4 overflow-y-auto flex-1 px-1">
                        {step === 1 ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre *</Label>
                                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required disabled={isLoading} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Descripción</Label>
                                    <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} disabled={isLoading} rows={2} />
                                </div>
                                
                                <div className="flex items-center justify-between space-x-2 border p-3 rounded-md">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="edit-active">Estado</Label>
                                        <p className="text-xs text-muted-foreground">
                                            {isActive ? 'El prode está visible para los empleados' : 'El prode está oculto'}
                                        </p>
                                    </div>
                                    <Switch
                                        id="edit-active"
                                        checked={isActive}
                                        onCheckedChange={setIsActive}
                                        disabled={isLoading}
                                        className="data-[state=checked]:bg-green-600"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="participationMode">Modo de Participación *</Label>
                                    <Select value={participationMode} onValueChange={(value: any) => setParticipationMode(value)} disabled={isLoading}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="general">General (Ranking único)</SelectItem>
                                            <SelectItem value="by_area">Por Área (Ranking por área)</SelectItem>
                                            <SelectItem value="both">Ambos (General + Por Área)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {(!prode.company_area_id || prode.company_area_id === 'none') && (
                                    <div className="space-y-4 pt-2 border-t">
                                        <div className="flex items-start space-x-2">
                                            <Checkbox
                                                id="areaRanking"
                                                checked={enableAreaRanking}
                                                onCheckedChange={(checked) => setEnableAreaRanking(checked as boolean)}
                                                disabled={isLoading}
                                            />
                                            <div className="grid gap-1.5 leading-none">
                                                <Label htmlFor="areaRanking" className="text-sm font-medium leading-none cursor-pointer">
                                                    Habilitar Competencia entre Áreas
                                                </Label>
                                            </div>
                                        </div>

                                        {enableAreaRanking && (
                                            <div className="space-y-2 pl-6">
                                                <Label htmlFor="calculationMode">Método de Cálculo</Label>
                                                <Select value={areaRankingCalculation} onValueChange={(value: any) => setAreaRankingCalculation(value)} disabled={isLoading}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="average">Promedio (Recomendado)</SelectItem>
                                                        <SelectItem value="sum">Suma total</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-4 pt-4 border-t">
                                    <div>
                                        <h3 className="text-sm font-semibold mb-2">Configuración de Premios</h3>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="winnerCount">Cantidad de Ganadores</Label>
                                        <Select value={winnerCount.toString()} onValueChange={(value) => setWinnerCount(parseInt(value))} disabled={isLoading}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">Top 1 (Solo el primero)</SelectItem>
                                                <SelectItem value="3">Top 3 (Los 3 primeros)</SelectItem>
                                                <SelectItem value="5">Top 5 (Los 5 primeros)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="individualPrize">Premio Individual (Opcional)</Label>
                                        <Textarea id="individualPrize" value={individualPrize} onChange={(e) => setIndividualPrize(e.target.value)} disabled={isLoading} rows={2} />
                                    </div>

                                    {enableAreaRanking && (
                                        <>
                                            <div className="flex items-start space-x-2">
                                                <Checkbox id="rewardAreaWinner" checked={rewardAreaWinner} onCheckedChange={(checked) => setRewardAreaWinner(checked as boolean)} disabled={isLoading} />
                                                <div className="grid gap-1.5 leading-none">
                                                    <Label htmlFor="rewardAreaWinner" className="text-sm font-medium leading-none cursor-pointer">Premiar al Área Ganadora</Label>
                                                </div>
                                            </div>

                                            {rewardAreaWinner && (
                                                <div className="space-y-2 pl-6">
                                                    <Label htmlFor="areaPrize">Premio para Área Ganadora</Label>
                                                    <Textarea id="areaPrize" value={areaPrize} onChange={(e) => setAreaPrize(e.target.value)} disabled={isLoading} rows={2} />
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <Label>Variables de predicción *</Label>
                                <div className="text-xs text-amber-600 mb-2 font-medium bg-amber-50 p-2 rounded border border-amber-200">
                                    ⚠️ Modificar las variables o sus puntos iniciará un recálculo masivo y automático de los puntajes para todos los partidos cerrados.
                                </div>
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
                                                    <label htmlFor={variable.id} className="text-sm font-medium leading-none cursor-pointer">{variable.name}</label>
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
                            </div>
                        )}

                        {error && <div className="mt-4 text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
                    </div>

                    <DialogFooter className="flex justify-between sm:justify-between">
                        {step === 1 ? (
                            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancelar</Button>
                        ) : (
                            <Button type="button" variant="outline" onClick={handleBack} disabled={isLoading}>Atrás</Button>
                        )}
                        <Button type="submit" disabled={isLoading} className="hover:opacity-90 bg-primary text-primary-foreground">
                            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{step === 1 ? 'Cargando...' : 'Guardando...'}</> : (step === 1 ? 'Siguiente' : 'Guardar Cambios')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
