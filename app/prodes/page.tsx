'use client';

import { useEffect, useState } from 'react';
import { prodeApi } from '@/lib/api/endpoints';
import { Prode } from '@/lib/types';
import { getErrorMessage } from '@/lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Loader2, Calendar, Users } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function ProdesPage() {
    const router = useRouter();
    const [myProdes, setMyProdes] = useState<Prode[]>([]);
    const [availableProdes, setAvailableProdes] = useState<Prode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadProdes();
    }, []);

    const loadProdes = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const [myProdesRes, availableProdesRes] = await Promise.all([
                prodeApi.getAll(),
                prodeApi.getAvailable()
            ]);
            setMyProdes(myProdesRes.data || myProdesRes); // Handle case where response might be wrapped or just array
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
            // Refresh prodes list
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
            <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                Error al cargar prodes: {error}
            </div>
        );
    }

    const renderProdeCard = (prode: Prode, isAvailable: boolean) => (
        <Card key={prode.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 border-slate-200 flex flex-col group">
            {/* Gradient Header */}
            <div className={`h-2 bg-gradient-to-r ${prode.competition?.sport_type === 'futbol' ? 'from-green-500 to-emerald-600' :
                    prode.competition?.sport_type === 'basketball' ? 'from-orange-500 to-red-600' :
                        'from-slate-700 to-slate-900'
                }`} />

            <CardHeader className="pb-3 pt-5">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {prode.competition?.name}
                            </span>
                            {isAvailable && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-100">
                                    Nuevo
                                </span>
                            )}
                        </div>
                        <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">
                            {prode.name}
                        </CardTitle>
                    </div>
                    <div className={`p-2 rounded-lg ${isAvailable ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                        <Trophy className="h-5 w-5" />
                    </div>
                </div>
                {prode.description && (
                    <CardDescription className="line-clamp-2 text-sm mt-2">
                        {prode.description}
                    </CardDescription>
                )}
            </CardHeader>

            <CardContent className="flex-1 pb-6">
                <div className="space-y-4">
                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex flex-col bg-slate-50 p-2 rounded border border-slate-100">
                            <span className="text-[10px] uppercase text-slate-400 font-bold mb-1">Inicio</span>
                            <div className="flex items-center text-slate-700 font-medium">
                                <Calendar className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                                {prode.competition?.start_date ? formatDate(prode.competition.start_date) : '-'}
                            </div>
                        </div>
                        <div className="flex flex-col bg-slate-50 p-2 rounded border border-slate-100">
                            <span className="text-[10px] uppercase text-slate-400 font-bold mb-1">Fin</span>
                            <div className="flex items-center text-slate-700 font-medium">
                                <Calendar className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                                {prode.competition?.end_date ? formatDate(prode.competition.end_date) : '-'}
                            </div>
                        </div>
                    </div>

                    {/* Status for joined prodes */}
                    {!isAvailable && (
                        <div className="flex items-center justify-between pt-2">
                            <span className="text-xs text-muted-foreground font-medium">Estado</span>
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${prode.is_active
                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                    : 'bg-red-100 text-red-700 border border-red-200'
                                    }`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${prode.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                                {prode.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                    )}
                </div>
            </CardContent>

            {/* Actions Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto">
                {isAvailable ? (
                    <Button
                        className="w-full bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
                        onClick={() => handleJoinProde(prode.id)}
                    >
                        Unirse al Prode
                    </Button>
                ) : (
                    <Button
                        className="w-full bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 shadow-sm"
                        variant="ghost"
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
            {/* Header Section with Pattern */}
            <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-8 md:p-12 mb-8">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                        Tus Prodes
                    </h1>
                    <p className="text-slate-300 text-lg leading-relaxed">
                        Gestiona tus torneos, realiza predicciones y compite con tus compañeros para ver quién sabe más de deportes.
                    </p>
                </div>
            </div>

            {/* My Prodes Section */}
            <section className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Mis Prodes</h2>
                        <p className="text-muted-foreground text-sm">
                            Torneos en los que estás participando
                        </p>
                    </div>
                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full">
                        {myProdes.length}
                    </span>
                </div>

                {myProdes.length === 0 ? (
                    <Card className="border-dashed border-2 bg-slate-50/50">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                                <Trophy className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="font-semibold text-lg text-slate-900 mb-1">No participas en ningún prode</h3>
                            <p className="text-slate-500 max-w-sm mb-6">
                                Únete a uno de los prodes disponibles abajo para comenzar a jugar.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                        {myProdes.map(prode => renderProdeCard(prode, false))}
                    </div>
                )}
            </section>

            {/* Available Prodes Section */}
            <section className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Prodes Disponibles</h2>
                        <p className="text-muted-foreground text-sm">
                            Nuevos torneos a los que puedes unirte
                        </p>
                    </div>
                    <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-full">
                        {availableProdes.length}
                    </span>
                </div>

                {availableProdes.length === 0 ? (
                    <Card className="border-dashed border-2 bg-slate-50/50">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                                <Users className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="font-semibold text-lg text-slate-900 mb-1">No hay nuevos prodes disponibles</h3>
                            <p className="text-slate-500 max-w-sm">
                                Vuelve más tarde para ver si se han creado nuevos torneos.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                        {availableProdes.map(prode => renderProdeCard(prode, true))}
                    </div>
                )}
            </section>
        </div>
    );
}
