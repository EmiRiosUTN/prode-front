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
    const [prodes, setProdes] = useState<Prode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadProdes();
    }, []);

    const loadProdes = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await prodeApi.getAll();
            setProdes(response.data);
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Mis Prodes</h2>
                <p className="text-muted-foreground">
                    Participa en los prodes de tu empresa y compite con tus compañeros
                </p>
            </div>

            {/* Prodes Grid */}
            {prodes.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No hay prodes disponibles</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {prodes.map((prode) => (
                        <Card key={prode.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">{prode.name}</CardTitle>
                                        {prode.description && (
                                            <CardDescription className="mt-1">
                                                {prode.description}
                                            </CardDescription>
                                        )}
                                    </div>
                                    <Trophy className="h-8 w-8 text-primary" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {/* Competition Info */}
                                    <div className="text-sm">
                                        <p className="font-medium">{prode.competition?.name}</p>
                                        <p className="text-muted-foreground capitalize">
                                            {prode.competition?.sportType}
                                        </p>
                                    </div>

                                    {/* Dates */}
                                    <div className="space-y-1 text-sm text-muted-foreground">
                                        <div className="flex items-center">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            <span>Inicio: {formatDate(prode.startDate)}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            <span>Fin: {formatDate(prode.endDate)}</span>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="flex items-center justify-between">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${prode.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {prode.isActive ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="pt-2">
                                        <Button
                                            className="w-full"
                                            onClick={() => router.push(`/prodes/${prode.id}`)}
                                        >
                                            Ver Prode
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
