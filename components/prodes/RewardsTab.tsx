'use client';

import { Trophy, Gift, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RewardsTabProps {
    winnerCount: number;
    individualPrize?: string;
    rewardAreaWinner: boolean;
    areaPrize?: string;
}

export function RewardsTab({ winnerCount, individualPrize, rewardAreaWinner, areaPrize }: RewardsTabProps) {
    const hasRewards = individualPrize || (rewardAreaWinner && areaPrize);

    if (!hasRewards) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <Trophy className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">No hay premios configurados</h3>
                <p className="text-sm text-muted-foreground mt-2">
                    Este prode no tiene premios definidos actualmente
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Individual Winners Section */}
            {individualPrize && (
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500/10 rounded-lg">
                                <Trophy className="h-6 w-6 text-primary text-red-500" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Premios individuales</CardTitle>
                                <CardDescription>
                                    Para los {winnerCount === 1 ? 'ganador' : `${winnerCount} ganadores`} del ranking general
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-start gap-3 bg-white/50 p-4 rounded-lg border">
                            <Gift className="h-5 w-5 text-primary flex-shrink-0 mt-0.5 text-red-500" />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="secondary" className="text-xs bg-red-200 text-red-500">
                                        Top {winnerCount}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">recibirá:</span>
                                </div>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {individualPrize}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Area Winner Section */}
            {rewardAreaWinner && areaPrize && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/10 rounded-lg">
                                <Users className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Premio al área ganadora</CardTitle>
                                <CardDescription>
                                    Para el área con mejor desempeño general
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-start gap-3 bg-white/50 p-4 rounded-lg border border-green-500/20">
                            <Gift className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                        Área #1
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">recibirá:</span>
                                </div>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {areaPrize}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
