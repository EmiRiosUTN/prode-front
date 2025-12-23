'use client';

import { useState, useEffect } from 'react';
import { prodeApi } from '@/lib/api/endpoints';
import { RankingResponse, IndividualRankingEntry } from '@/lib/types'; // Backend types
import { getErrorMessage } from '@/lib/api/client';
import { Loader2, Trophy, Medal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';

interface RankingTabProps {
    prodeId: string;
}

export function RankingTab({ prodeId }: RankingTabProps) {
    const [rankingData, setRankingData] = useState<RankingResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadRanking();
    }, [prodeId]);

    const loadRanking = async () => {
        try {
            setIsLoading(true);
            const response = await prodeApi.getRankings(prodeId, 'general');
            setRankingData(response.data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const getPositionBadge = (position: number) => {
        switch (position) {
            case 1:
                return <Medal className="h-6 w-6 text-yellow-500" />;
            case 2:
                return <Medal className="h-6 w-6 text-gray-400" />;
            case 3:
                return <Medal className="h-6 w-6 text-amber-700" />;
            default:
                return <span className="text-muted-foreground font-mono font-bold w-6 text-center">{position}</span>;
        }
    };

    const getRowStyle = (position: number) => {
        if (position === 1) return "bg-yellow-50/50 hover:bg-yellow-50";
        if (position === 2) return "bg-gray-50/50 hover:bg-gray-50";
        if (position === 3) return "bg-orange-50/50 hover:bg-orange-50";
        return "";
    }

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-destructive/10 text-destructive rounded-md">
                No se pudo cargar el ranking: {error}
            </div>
        );
    }

    if (!rankingData || rankingData.ranking.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Aún no hay participantes en el ranking.</p>
            </div>
        );
    }

    return (
        <Card className="border-none shadow-none">
            <CardHeader className="px-0 pt-0 pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">Tabla de Posiciones</CardTitle>
                        <CardDescription>
                            Total participantes: {rankingData.metadata.totalParticipants}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="rounded-md border overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[60px] text-center">#</TableHead>
                                <TableHead>Participante</TableHead>
                                <TableHead className="hidden sm:table-cell">Área</TableHead>
                                <TableHead className="text-right">Puntos</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rankingData.ranking.map((entry) => (
                                <TableRow key={entry.employeeId} className={getRowStyle(entry.position)}>
                                    <TableCell className="font-medium text-center py-3">
                                        <div className="flex justify-center">
                                            {getPositionBadge(entry.position)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-sm">{entry.employeeName}</span>
                                            <span className="text-xs text-muted-foreground sm:hidden">{entry.areaName}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                                        {entry.areaName}
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-lg">
                                        {entry.totalPoints}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-4">
                    Última actualización: {new Date(rankingData.metadata.lastUpdated).toLocaleString()}
                </p>
            </CardContent>
        </Card>
    );
}
