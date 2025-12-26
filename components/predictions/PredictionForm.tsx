'use client';

import { useState, useEffect } from 'react';
import { Match, Prediction, ProdeVariableConfig } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { predictionApi } from '@/lib/api/endpoints';
import { getErrorMessage } from '@/lib/api/client';
import { useRouter } from 'next/navigation';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface PredictionFormProps {
    prodeId: string;
    match: Match & { myPrediction?: Prediction | null };
    variableConfigs: ProdeVariableConfig[];
    onSuccess?: () => void;
}



export function PredictionForm({ prodeId, match, variableConfigs, onSuccess }: PredictionFormProps) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);

    const initialValues = {
        home: match.myPrediction?.predicted_goals_team_a?.toString() || '',
        away: match.myPrediction?.predicted_goals_team_b?.toString() || '',
        homeYellow: match.myPrediction?.predicted_yellow_cards_team_a?.toString() || '',
        awayYellow: match.myPrediction?.predicted_yellow_cards_team_b?.toString() || '',
        homeRed: match.myPrediction?.predicted_red_cards_team_a?.toString() || '',
        awayRed: match.myPrediction?.predicted_red_cards_team_b?.toString() || '',
    };



    const [values, setValues] = useState(initialValues);
    const [availableCopies, setAvailableCopies] = useState<Array<{
        prodeId: string;
        prodeName: string;
        prediction: any;
    }>>([]);
    const [loadingCopies, setLoadingCopies] = useState(false);

    const isLocked = match.isLocked || match.status !== 'scheduled' || new Date() >= new Date(match.match_date);

    // Fetch available predictions to copy
    useEffect(() => {
        const fetchAvailableCopies = async () => {
            try {
                setLoadingCopies(true);
                const response = await predictionApi.getAvailableCopies(match.id, prodeId);
                setAvailableCopies(response.data.availablePredictions);
            } catch (err) {
                console.error('Error fetching available copies:', err);
            } finally {
                setLoadingCopies(false);
            }
        };

        if (!isLocked) {
            fetchAvailableCopies();
        }
    }, [match.id, prodeId, isLocked]);

    const handleCopyPrediction = (sourceProdeId: string) => {
        const source = availableCopies.find(c => c.prodeId === sourceProdeId);
        if (!source) return;

        const pred = source.prediction;
        setValues({
            home: pred.predicted_goals_team_a?.toString() || '',
            away: pred.predicted_goals_team_b?.toString() || '',
            homeYellow: pred.predicted_yellow_cards_team_a?.toString() || '',
            awayYellow: pred.predicted_yellow_cards_team_b?.toString() || '',
            homeRed: pred.predicted_red_cards_team_a?.toString() || '',
            awayRed: pred.predicted_red_cards_team_b?.toString() || '',
        });

        toast.success(`Predicción copiada desde "${source.prodeName}"`);
    };

    const hasVariable = (code: string) => {
        return variableConfigs.some(c => c.prediction_variable.code === code && c.is_active);
    };

    const handleChange = (field: keyof typeof initialValues, value: string) => {
        if (value && !/^\d*$/.test(value)) return;
        setValues(prev => ({ ...prev, [field]: value }));
    };





    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isLocked) return;

        if (values.home === '' || values.away === '') {
            toast.error('Goles son requeridos');
            return;
        }

        try {
            setSaving(true);
            const payload = {
                prodeId,
                matchId: match.id,
                homeScore: parseInt(values.home),
                awayScore: parseInt(values.away),
                homeYellowCards: values.homeYellow ? parseInt(values.homeYellow) : undefined,
                awayYellowCards: values.awayYellow ? parseInt(values.awayYellow) : undefined,
                homeRedCards: values.homeRed ? parseInt(values.homeRed) : undefined,
                awayRedCards: values.awayRed ? parseInt(values.awayRed) : undefined,
            };

            await predictionApi.upsert(payload);
            toast.success('Predicción guardada');
            if (onSuccess) onSuccess();
            else router.push(`/prodes/${prodeId}`);

        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mx-auto justify-center">
            {isLocked && (
                <div className="bg-orange-50 border border-orange-200 text-orange-800 rounded-lg p-4 flex items-center gap-3 mb-4">
                    <span className="text-xl">⚠️</span>
                    <div>
                        <p className="font-medium">El partido ya ha comenzado</p>
                        <p className="text-sm opacity-90">Ya no es posible realizar o modificar predicciones.</p>
                    </div>
                </div>
            )}

            {/* Copy from other prode */}
            {!isLocked && availableCopies.length > 0 && (
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <Copy className="h-5 w-5 text-blue-600" />
                            <div className="flex-1">
                                <Label className="text-sm font-medium text-blue-900">Copiar desde otro prode</Label>
                                <p className="text-xs text-blue-700 mt-1">Tienes predicciones para este partido en otros prodes</p>
                            </div>
                            <Select onValueChange={handleCopyPrediction}>
                                <SelectTrigger className="w-[200px] bg-white">
                                    <SelectValue placeholder="Seleccionar prode" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableCopies.map(copy => (
                                        <SelectItem key={copy.prodeId} value={copy.prodeId}>
                                            {copy.prodeName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Goles - Always visible */}
            <Card>
                <CardContent className="p-4 flex justify-between items-center gap-4">
                    <CardTitle className="text-sm font-medium">Predicción de goles</CardTitle>
                    <div className="flex items-center gap-6 flex-1 justify-center">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground hidden sm:flex items-center justify-end min-w-[80px] h-10">{match.team_a?.name}</span>
                            <Input
                                value={values.home}
                                onChange={e => handleChange('home', e.target.value)}
                                className="w-14 h-10 text-center text-lg"
                                placeholder="-"
                                inputMode="numeric"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Input
                                value={values.away}
                                onChange={e => handleChange('away', e.target.value)}
                                className="w-14 h-10 text-center text-lg"
                                placeholder="-"
                                inputMode="numeric"
                            />
                            <span className="text-sm text-muted-foreground hidden sm:flex items-center justify-start min-w-[80px] h-10">{match.team_b?.name}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tarjetas Amarillas */}
            {hasVariable('yellow_cards') && (
                <Card>
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                        <CardTitle className="text-sm font-medium w-32 shrink-0">Tarjetas amarillas</CardTitle>
                        <div className="flex items-center gap-6 flex-1 justify-center">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground hidden sm:flex items-center justify-end min-w-[80px] h-10">{match.team_a?.name}</span>
                                <Input
                                    value={values.homeYellow}
                                    onChange={e => handleChange('homeYellow', e.target.value)}
                                    className="w-14 h-10 text-center text-lg border-yellow-400 focus:ring-yellow-400 focus:border-yellow-500 bg-yellow-50/50"
                                    placeholder="0"
                                    disabled={isLocked}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Input
                                    value={values.awayYellow}
                                    onChange={e => handleChange('awayYellow', e.target.value)}
                                    className="w-14 h-10 text-center text-lg border-yellow-400 focus:ring-yellow-400 focus:border-yellow-500 bg-yellow-50/50"
                                    placeholder="0"
                                    disabled={isLocked}
                                />
                                <span className="text-sm text-muted-foreground hidden sm:flex items-center justify-start min-w-[80px] h-10">{match.team_b?.name}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Tarjetas Rojas */}
            {hasVariable('red_cards') && (
                <Card>
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                        <CardTitle className="text-sm font-medium w-32 shrink-0">Tarjetas rojas</CardTitle>
                        <div className="flex items-center gap-6 flex-1 justify-center">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground hidden sm:flex items-center justify-end min-w-[80px] h-10">{match.team_a?.name}</span>
                                <Input
                                    value={values.homeRed}
                                    onChange={e => handleChange('homeRed', e.target.value)}
                                    className="w-14 h-10 text-center text-lg border-red-400 focus:ring-red-400 focus:border-red-500 bg-red-50/50"
                                    placeholder="0"
                                    disabled={isLocked}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Input
                                    value={values.awayRed}
                                    onChange={e => handleChange('awayRed', e.target.value)}
                                    className="w-14 h-10 text-center text-lg border-red-400 focus:ring-red-400 focus:border-red-500 bg-red-50/50"
                                    placeholder="0"
                                    disabled={isLocked}
                                />
                                <span className="text-sm text-muted-foreground hidden sm:flex items-center justify-start min-w-[80px] h-10">{match.team_b?.name}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}



            <Button
                type="submit"
                className={`w-full h-12 text-md font-light transition-all ${isLocked
                    ? "bg-slate-200 text-slate-500 cursor-not-allowed hover:bg-slate-200"
                    : "bg-green-600 hover:bg-green-700 text-white hover:cursor-pointer"
                    }`}
                disabled={saving || isLocked}
            >
                {saving ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : isLocked ? (
                    <>
                        <span className="mr-2">🔒</span>
                        Predicción cerrada (Partido comenzado)
                    </>
                ) : (
                    <>
                        <Save className="mr-2 h-5 w-5" />
                        Guardar predicción
                    </>
                )}
            </Button>
        </form>
    );
}
