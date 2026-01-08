'use client';


import { useState, useEffect, useRef } from 'react';
import { prodeApi } from '@/lib/api/endpoints';
import { useAuth } from '@/contexts/AuthContext';
import { RankingResponse, IndividualRankingEntry, AreaRankingEntry, Prode } from '@/lib/types'; // Backend types
import { getErrorMessage } from '@/lib/api/client';
import { Loader2, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface RankingTabProps {
    prodeId: string;
    prode: Prode;
}

type RankingType = 'general' | 'my-area' | 'areas';

export function RankingTab({ prodeId, prode }: RankingTabProps) {
    // Determine default tab based on config
    const config = prode.prode_ranking_config;
    const defaultTab = config?.show_individual_general ? 'general' :
        config?.show_individual_by_area ? 'my-area' :
            config?.show_area_ranking ? 'areas' : 'general';

    const [activeTab, setActiveTab] = useState<RankingType>(defaultTab as RankingType);
    const [rankingData, setRankingData] = useState<RankingResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        loadRanking(activeTab);
    }, [prodeId, activeTab]);

    const loadRanking = async (type: RankingType) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await prodeApi.getRankings(prodeId, type);
            setRankingData(response.data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const getPositionBadge = (position: number) => {
        return <span className="text-muted-foreground font-mono font-bold w-6 text-center">{position}</span>;
    };

    const getRowStyle = (position: number) => {
        if (position === 1) return "bg-yellow-50/50 hover:bg-yellow-50";
        if (position === 2) return "bg-gray-50/50 hover:bg-gray-50";
        if (position === 3) return "bg-orange-50/50 hover:bg-orange-50";
        return "";
    }

    const [isUserRowVisible, setIsUserRowVisible] = useState(false);
    const [headerHeight, setHeaderHeight] = useState(48);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const userRowRef = useRef<HTMLTableRowElement>(null);
    const headerRef = useRef<HTMLTableSectionElement>(null);

    // Measure header height on mount and resize
    useEffect(() => {
        const header = headerRef.current;
        if (!header) return;

        const measureHeight = () => {
            const height = header.getBoundingClientRect().height;
            setHeaderHeight(height);
        };

        measureHeight();
        window.addEventListener('resize', measureHeight);

        return () => {
            window.removeEventListener('resize', measureHeight);
        };
    }, [rankingData]);

    // Monitor user row visibility with scroll events
    useEffect(() => {
        const container = scrollContainerRef.current;
        const userRow = userRowRef.current;

        if (!container || !userRow) return;

        const checkVisibility = () => {
            const containerRect = container.getBoundingClientRect();
            const rowRect = userRow.getBoundingClientRect();

            const stickyUserRowPosition = containerRect.top + headerHeight;

            const tolerance = 10;
            const isAtStickyPosition = Math.abs(rowRect.top - stickyUserRowPosition) < tolerance;

            setIsUserRowVisible(isAtStickyPosition);
        };

        checkVisibility();

        let rafId: number;
        const handleScroll = () => {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(checkVisibility);
        };

        container.addEventListener('scroll', handleScroll);

        window.addEventListener('resize', checkVisibility);

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
            container.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', checkVisibility);
        };
    }, [rankingData, activeTab, headerHeight]);

    const renderIndividualTable = (entries: IndividualRankingEntry[]) => {
        const currentUserEntry = entries.find(e => e.employeeId === user?.employee?.id);

        return (
            <div
                ref={scrollContainerRef}
                className="relative max-h-[600px] min-h-[400px] overflow-auto"
            >
                <Table>
                    <TableHeader ref={headerRef} className="bg-muted/95 sticky top-0 z-30 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-muted/60">
                        <TableRow>
                            <TableHead className="w-[60px] text-center">#</TableHead>
                            <TableHead>Participante</TableHead>
                            <TableHead className="hidden sm:table-cell">Área</TableHead>
                            <TableHead className="text-right">Puntos</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentUserEntry && !isUserRowVisible && (
                            <TableRow
                                className="border-b-2 border-primary/20 sticky z-20 shadow-md"
                                style={{
                                    top: `${headerHeight}px`,
                                    backgroundColor: 'rgba(var(--primary-rgb, 59 130 246) / 0.05)',
                                    backdropFilter: 'blur(8px)',
                                }}
                            >
                                <TableCell
                                    className="font-medium text-center py-3 font-mono text-primary"
                                    style={{ backgroundColor: 'white' }}
                                >
                                    {currentUserEntry.position}
                                </TableCell>
                                <TableCell style={{ backgroundColor: 'white' }}>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm text-primary">{currentUserEntry.employeeName} (Tú)</span>
                                        <span className="text-xs text-muted-foreground sm:hidden">{currentUserEntry.areaName}</span>
                                    </div>
                                </TableCell>
                                <TableCell
                                    className="hidden sm:table-cell text-muted-foreground"
                                    style={{ backgroundColor: 'white' }}
                                >
                                    {currentUserEntry.areaName}
                                </TableCell>
                                <TableCell
                                    className="text-right font-bold text-lg text-primary"
                                    style={{ backgroundColor: 'white' }}
                                >
                                    {currentUserEntry.totalPoints}
                                </TableCell>
                            </TableRow>
                        )}
                        {entries.map((entry) => (
                            <TableRow
                                key={entry.employeeId}
                                ref={entry.employeeId === user?.employee?.id ? userRowRef : null}
                                className={getRowStyle(entry.position)}
                            >
                                <TableCell className="font-medium text-center py-3">
                                    <div className="flex justify-center">
                                        {getPositionBadge(entry.position)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className={`text-sm ${entry.employeeId === user?.employee?.id ? 'font-bold' : 'font-medium'}`}>
                                            {entry.employeeName}
                                            {entry.employeeId === user?.employee?.id && ' (Tú)'}
                                        </span>
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
        );
    };

    const renderAreaTable = (entries: AreaRankingEntry[]) => (
        <Table>
            <TableHeader className="bg-muted/50">
                <TableRow>
                    <TableHead className="w-[60px] text-center">#</TableHead>
                    <TableHead>Área</TableHead>
                    <TableHead className="text-center">Participantes</TableHead>
                    <TableHead className="text-right">Puntos {config?.area_ranking_calculation === 'average' ? '(Promedio)' : '(Total)'}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {entries.map((entry) => (
                    <TableRow key={entry.areaId} className={getRowStyle(entry.position)}>
                        <TableCell className="font-medium text-center py-3">
                            <div className="flex justify-center">
                                {getPositionBadge(entry.position)}
                            </div>
                        </TableCell>
                        <TableCell>
                            <span className="font-semibold text-sm">{entry.areaName}</span>
                            {/* Top employee tooltip could go here */}
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                            {entry.participantsCount}
                        </TableCell>
                        <TableCell className="text-right font-bold text-lg">
                            {entry.totalPoints}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

    return (
        <Card className="border-none shadow-none">
            <CardHeader className="px-0 pt-0 pb-4">
                <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Tabla de Posiciones</CardTitle>
                            <CardDescription>
                                {rankingData?.metadata ? `Total participantes: ${rankingData.metadata.totalParticipants}` : 'Cargando...'}
                            </CardDescription>
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={(v) => {
                        setActiveTab(v as RankingType);
                        setRankingData(null);
                    }} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            {config?.show_individual_general && (
                                <TabsTrigger value="general">General</TabsTrigger>
                            )}
                            {config?.show_individual_by_area && (
                                <TabsTrigger value="my-area">Mi Área</TabsTrigger>
                            )}
                            {config?.show_area_ranking && (
                                <TabsTrigger value="areas">Competencia de Áreas</TabsTrigger>
                            )}
                        </TabsList>
                    </Tabs>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : error ? (
                    <div className="p-4 bg-destructive/10 text-destructive rounded-md">
                        No se pudo cargar el ranking: {error}
                    </div>
                ) : !rankingData || rankingData.ranking.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <Trophy className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>Aún no hay participantes en este ranking.</p>
                    </div>
                ) : (
                    <div className="rounded-md border overflow-hidden">
                        {activeTab === 'areas'
                            ? renderAreaTable(rankingData.ranking as AreaRankingEntry[])
                            : renderIndividualTable(rankingData.ranking as IndividualRankingEntry[])
                        }
                    </div>
                )}

                {rankingData?.metadata && (
                    <p className="text-xs text-muted-foreground text-center mt-4">
                        Última actualización: {new Date(rankingData.metadata.lastUpdated).toLocaleString()}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
