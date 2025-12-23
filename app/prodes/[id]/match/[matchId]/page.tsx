'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { prodeApi } from '@/lib/api/endpoints';
import { Match, Prode } from '@/lib/types';
import { PredictionForm } from '@/components/predictions/PredictionForm';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function MatchPredictionPage() {
    const params = useParams();
    const router = useRouter();
    const prodeId = params.id as string;
    const matchId = params.matchId as string;

    const [prode, setProde] = useState<Prode | null>(null);
    const [match, setMatch] = useState<Match & { myPrediction?: any } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodeRes, matchesRes] = await Promise.all([
                    prodeApi.getById(prodeId),
                    prodeApi.getMatches(prodeId)
                ]);

                setProde(prodeRes.data);

                // Find the specific match
                const foundMatch = matchesRes.data.find((m: any) => m.id === matchId);
                if (foundMatch) {
                    const isLocked = foundMatch.isLocked || foundMatch.status !== 'scheduled' || new Date() >= new Date(foundMatch.match_date);
                    if (isLocked) {
                        toast.warning('El partido ya ha comenzado');
                        router.push(`/prodes/${prodeId}`);
                        return;
                    }
                    setMatch(foundMatch);
                } else {
                    toast.error('Partido no encontrado');
                    router.push(`/prodes/${prodeId}`);
                }

            } catch (error) {
                console.error(error);
                toast.error('Error al cargar datos');
            } finally {
                setLoading(false);
            }
        };

        if (prodeId && matchId) {
            fetchData();
        }
    }, [prodeId, matchId, router]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!prode || !match) return null;

    return (
        <div className="container ">
            <Button
                variant="ghost"
                className="mb-6 pl-0 hover:pl-2 transition-all"
                onClick={() => router.push(`/prodes/${prodeId}`)}
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al prode
            </Button>

            <div className="mb-8 text-center">
                <Badge variant="outline" className="mb-2">{match.stage}</Badge>
                <p className="text-md font-medium">{formatDate(match.match_date)}</p>
                {match.location && <p className="text-sm text-muted-foreground">{match.location}</p>}
            </div>

            <PredictionForm
                prodeId={prodeId}
                match={match}
                variableConfigs={prode.prode_variable_configs || []}
                onSuccess={() => router.push(`/prodes/${prodeId}`)}
            />
        </div>
    );
}
