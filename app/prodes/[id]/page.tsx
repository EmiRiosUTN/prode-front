'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { prodeApi } from '@/lib/api/endpoints';
import { Prode } from '@/lib/types';
import { getErrorMessage } from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Calendar, Trophy } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MatchList } from '@/components/prodes/MatchList';
import { RulesTab } from '@/components/prodes/RulesTab';
import { RankingTab } from '@/components/prodes/RankingTab';

export default function ProdeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [prode, setProde] = useState<Prode | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            loadProde();
        }
    }, [id]);

    const loadProde = async () => {
        try {
            setIsLoading(true);
            setError(null);
            // Assuming getById returns the prode with competition details
            const response = await prodeApi.getById(id);
            setProde(response.data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !prode) {
        return (
            <div className="space-y-4">
                <Button variant="ghost" onClick={() => router.push('/prodes')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver
                </Button>
                <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                    Error al cargar el prode: {error || 'Prode no encontrado'}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8">
            {/* Hero Header */}
            <div className={`relative overflow-hidden rounded-xl p-6 md:p-8 ${prode.competition?.sport_type === 'futbol' ? 'bg-gradient-to-br from-green-800 to-emerald-900' :
                prode.competition?.sport_type === 'basketball' ? 'bg-gradient-to-br from-orange-700 to-red-900' :
                    'bg-gradient-to-br from-slate-800 to-slate-900'
                } text-white shadow-lg`}>
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
                <div className="relative z-10">
                    <div className="flex items-center space-x-2 text-slate-300 text-xs mb-3">
                        <Button
                            variant="link"
                            className="text-slate-300 hover:text-white p-0 h-auto font-normal"
                            onClick={() => router.push('/prodes')}
                        >
                            <ArrowLeft className="mr-1 h-3 w-3" />
                            Mis Prodes
                        </Button>
                        <span>/</span>
                        <span className="text-white font-medium">{prode.competition?.name}</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
                                {prode.name}
                            </h1>
                            <p className="text-slate-200 text-sm md:text-base max-w-2xl leading-relaxed opacity-90 line-clamp-2">
                                {prode.description}
                            </p>
                        </div>

                        {/* Highlights / Stats */}
                        <div className="flex gap-3 bg-white/10 backdrop-blur-sm p-2 rounded-lg border border-white/20 self-start md:self-auto">
                            <div className="px-2 border-r border-white/20 text-center">
                                <span className="block text-[10px] uppercase tracking-wider text-slate-300 font-semibold">Inicio</span>
                                <span className="font-mono text-sm font-bold">
                                    {prode.competition?.start_date ? formatDate(prode.competition.start_date).split(' ')[0] : '-'}
                                </span>
                            </div>
                            <div className="px-2 text-center">
                                <span className="block text-[10px] uppercase tracking-wider text-slate-300 font-semibold">Fin</span>
                                <span className="font-mono text-sm font-bold">
                                    {prode.competition?.end_date ? formatDate(prode.competition.end_date).split(' ')[0] : '-'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="matches" className="space-y-4">
                <div className="border-b border-slate-200">
                    <TabsList className="bg-transparent h-auto p-0 space-x-6">
                        <TabsTrigger
                            value="matches"
                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-slate-900 rounded-none px-1 pb-2 text-slate-500 data-[state=active]:text-slate-900 font-medium text-sm hover:text-slate-800 transition-colors"
                        >
                            Partidos
                        </TabsTrigger>
                        <TabsTrigger
                            value="ranking"
                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-slate-900 rounded-none px-1 pb-2 text-slate-500 data-[state=active]:text-slate-900 font-medium text-sm hover:text-slate-800 transition-colors"
                        >
                            Ranking
                        </TabsTrigger>
                        <TabsTrigger
                            value="rules"
                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-slate-900 rounded-none px-1 pb-2 text-slate-500 data-[state=active]:text-slate-900 font-medium text-sm hover:text-slate-800 transition-colors"
                        >
                            Reglas
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="min-h-[400px]">
                    <TabsContent value="matches" className="mt-0 focus-visible:outline-none">
                        <MatchList prodeId={id} variableConfigs={prode.prode_variable_configs} />
                    </TabsContent>
                    <TabsContent value="ranking" className="mt-0 focus-visible:outline-none">
                        <RankingTab prodeId={id} prode={prode} />
                    </TabsContent>
                    <TabsContent value="rules" className="mt-0 focus-visible:outline-none">
                        <RulesTab prode={prode} />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
