'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, ChevronDown, ChevronUp, Loader2, Trophy, Users } from 'lucide-react';
import { prodeApi } from '@/lib/api/endpoints';
import { getErrorMessage } from '@/lib/api/client';
import { Prode } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProdesPage() {
    const router = useRouter();
    const [myProdes, setMyProdes] = useState<Prode[]>([]);
    const [availableProdes, setAvailableProdes] = useState<Prode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});

    useEffect(() => {
        void loadProdes();
    }, []);

    const loadProdes = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const [myProdesRes, availableProdesRes] = await Promise.all([
                prodeApi.getAll(),
                prodeApi.getAvailable(),
            ]);

            setMyProdes(myProdesRes.data || myProdesRes);
            setAvailableProdes(availableProdesRes.data || availableProdesRes);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoinProde = async (prodeId: string) => {
        try {
            await prodeApi.join(prodeId);
            await loadProdes();
        } catch (err) {
            alert(getErrorMessage(err));
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-md bg-destructive/10 p-4 text-destructive">
                Error al cargar prodes: {error}
            </div>
        );
    }

    const toggleDescription = (prodeId: string) => {
        setExpandedDescriptions((current) => ({
            ...current,
            [prodeId]: !current[prodeId],
        }));
    };

    const renderDescription = (prode: Prode) => {
        if (!prode.description) {
            return null;
        }

        const isExpanded = !!expandedDescriptions[prode.id];

        return (
            <div className="mt-2 space-y-2">
                <CardDescription
                    className={`max-w-full overflow-hidden text-sm break-all ${isExpanded ? 'whitespace-pre-wrap' : 'line-clamp-2'}`}
                >
                    {prode.description}
                </CardDescription>
                <button
                    type="button"
                    onClick={() => toggleDescription(prode.id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary underline-offset-4 hover:underline"
                >
                    {isExpanded ? (
                        <>
                            Ver menos
                            <ChevronUp className="h-3.5 w-3.5" />
                        </>
                    ) : (
                        <>
                            Ver descripcion completa
                            <ChevronDown className="h-3.5 w-3.5" />
                        </>
                    )}
                </button>
            </div>
        );
    };

    const renderProdeCard = (prode: Prode, isAvailable: boolean) => (
        <Card
            key={prode.id}
            className="group flex flex-col overflow-hidden border-slate-200 transition-all duration-200 hover:shadow-lg"
        >
            <div
                className={`h-2 bg-gradient-to-r ${
                    prode.competition?.sport_type === 'futbol'
                        ? 'from-green-500 to-emerald-600'
                        : prode.competition?.sport_type === 'basketball'
                          ? 'from-orange-500 to-red-600'
                          : 'from-slate-700 to-slate-900'
                }`}
            />

            <CardHeader className="pb-3 pt-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-1 overflow-hidden">
                        <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {prode.competition?.name}
                            </span>
                            {isAvailable && (
                                <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                                    Nuevo
                                </span>
                            )}
                        </div>
                        <CardTitle className="text-xl font-bold text-slate-900 transition-colors group-hover:text-primary">
                            {prode.name}
                        </CardTitle>
                    </div>
                    <div className={`rounded-lg p-2 ${isAvailable ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                        <Trophy className="h-5 w-5" />
                    </div>
                </div>
                {renderDescription(prode)}
            </CardHeader>

            <CardContent className="flex-1 pb-6">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex flex-col rounded border border-slate-100 bg-slate-50 p-2">
                            <span className="mb-1 text-[10px] font-bold uppercase text-slate-400">Inicio</span>
                            <div className="flex items-center font-medium text-slate-700">
                                <Calendar className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
                                {prode.competition?.start_date ? formatDate(prode.competition.start_date) : '-'}
                            </div>
                        </div>
                        <div className="flex flex-col rounded border border-slate-100 bg-slate-50 p-2">
                            <span className="mb-1 text-[10px] font-bold uppercase text-slate-400">Fin</span>
                            <div className="flex items-center font-medium text-slate-700">
                                <Calendar className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
                                {prode.competition?.end_date ? formatDate(prode.competition.end_date) : '-'}
                            </div>
                        </div>
                    </div>

                    {!isAvailable && (
                        <div className="flex items-center justify-between pt-2">
                            <span className="text-xs font-medium text-muted-foreground">Estado</span>
                            <span
                                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${
                                    prode.is_active
                                        ? 'border-green-200 bg-green-100 text-green-700'
                                        : 'border-red-200 bg-red-100 text-red-700'
                                }`}
                            >
                                <span
                                    className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                                        prode.is_active ? 'bg-green-500' : 'bg-red-500'
                                    }`}
                                />
                                {prode.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                    )}
                </div>
            </CardContent>

            <div className="mt-auto border-t border-slate-100 bg-slate-50 p-4">
                {isAvailable ? (
                    <Button
                        className="w-full shadow-sm"
                        style={{
                            backgroundColor: 'hsl(var(--primary))',
                            color: 'hsl(var(--primary-foreground))',
                        }}
                        onClick={() => handleJoinProde(prode.id)}
                    >
                        Unirse al Prode
                    </Button>
                ) : (
                    <Button
                        className="w-full shadow-sm hover:opacity-90"
                        style={{
                            backgroundColor: 'hsl(var(--primary))',
                            color: 'hsl(var(--primary-foreground))',
                        }}
                        onClick={() => router.push(`/prodes/${prode.id}`)}
                    >
                        Ver Prode
                    </Button>
                )}
            </div>
        </Card>
    );

    return (
        <div className="space-y-10 pb-10">
                <div
                    className="relative mb-8 overflow-hidden rounded-2xl p-8 text-white md:p-12"
                    style={{
                        background: 'linear-gradient(to bottom right, hsl(var(--primary)), hsl(var(--primary)) 60%, hsl(var(--primary)) 90%)',
                    }}
                >
                    <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/5 to-black/10" />
                    <div className="relative z-10 max-w-2xl">
                        <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                            Tus Prodes
                        </h1>
                        <p className="text-lg leading-relaxed text-white/90">
                            Gestiona tus torneos, realiza predicciones y compite con tus companeros para ver quien sabe mas de deportes.
                        </p>
                    </div>
                </div>

                <section className="space-y-6">
                    <div className="flex items-center justify-between border-b pb-4">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Mis Prodes</h2>
                            <p className="text-sm text-muted-foreground">
                                Torneos en los que estas participando
                            </p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                            {myProdes.length}
                        </span>
                    </div>

                    {myProdes.length === 0 ? (
                        <Card className="border-2 border-dashed bg-slate-50/50">
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="mb-4 rounded-full bg-white p-4 shadow-sm">
                                    <Trophy className="h-8 w-8 text-slate-400" />
                                </div>
                                <h3 className="mb-1 text-lg font-semibold text-slate-900">No participas en ningun prode</h3>
                                <p className="mb-6 max-w-sm text-slate-500">
                                    Unete a uno de los prodes disponibles abajo para comenzar a jugar.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                            {myProdes.map((prode) => renderProdeCard(prode, false))}
                        </div>
                    )}
                </section>

                <section className="space-y-6">
                    <div className="flex items-center justify-between border-b pb-4">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Prodes disponibles</h2>
                            <p className="text-sm text-muted-foreground">
                                Nuevos torneos a los que puedes unirte
                            </p>
                        </div>
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600">
                            {availableProdes.length}
                        </span>
                    </div>

                    {availableProdes.length === 0 ? (
                        <Card className="border-2 border-dashed bg-slate-50/50">
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="mb-4 rounded-full bg-white p-4 shadow-sm">
                                    <Users className="h-8 w-8 text-slate-400" />
                                </div>
                                <h3 className="mb-1 text-lg font-semibold text-slate-900">No hay nuevos prodes disponibles</h3>
                                <p className="max-w-sm text-slate-500">
                                    Vuelve mas tarde para ver si se han creado nuevos torneos.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                            {availableProdes.map((prode) => renderProdeCard(prode, true))}
                        </div>
                    )}
                </section>
        </div>
    );
}
