import { Prode } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, Clock, Trophy } from 'lucide-react';

interface RulesTabProps {
    prode: Prode;
}

export function RulesTab({ prode }: RulesTabProps) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        <CardTitle>Sistema de Puntuación</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Sumarás puntos por cada acierto en tus predicciones según la siguiente tabla:
                    </p>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Variable</TableHead>
                                <TableHead>Descripción</TableHead>
                                <TableHead className="text-right">Puntos</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {prode.prode_variable_configs && prode.prode_variable_configs.length > 0 ? (
                                prode.prode_variable_configs
                                    .filter(config => config.is_active)
                                    .map((config) => (
                                        <TableRow key={config.id}>
                                            <TableCell className="font-medium">
                                                {config.prediction_variable.name}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {config.prediction_variable.description}
                                            </TableCell>
                                            <TableCell className="text-right font-bold">
                                                {config.points} pts
                                            </TableCell>
                                        </TableRow>
                                    ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                                        No hay reglas de puntuación configuradas.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-blue-500" />
                        <CardTitle>Reglas Generales</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                            <h4 className="font-medium">Cierre de predicciones</h4>
                            <p className="text-sm text-muted-foreground">
                                Las predicciones pueden cargarse o modificarse hasta el inicio exacto del partido.
                                Una vez comenzado el encuentro, la predicción se bloqueará y no podrá ser editada.
                            </p>
                        </div>
                    </div>

                    {/* Placeholder for future rules */}
                    <div className="flex items-start gap-3">
                        <Trophy className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                            <h4 className="font-medium">Criterios de desempate</h4>
                            <p className="text-sm text-muted-foreground">
                                En caso de empate en el ranking global, la posición se compartirá entre los participantes.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
