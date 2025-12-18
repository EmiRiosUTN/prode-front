'use client';

import { useEffect, useState } from 'react';
import { companyApi } from '@/lib/api/endpoints';
import { Prode } from '@/lib/types';
import { getErrorMessage } from '@/lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Trophy, Plus, Calendar, Users, Edit, Trash2 } from 'lucide-react';
import { CreateProdeModal } from '@/components/company/CreateProdeModal';
import { EditProdeModal } from '@/components/company/EditProdeModal';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function CompanyProdesPage() {
    const [prodes, setProdes] = useState<Prode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editingProde, setEditingProde] = useState<Prode | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [prodeToDelete, setProdeToDelete] = useState<Prode | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        loadProdes();
    }, []);

    const loadProdes = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await companyApi.getProdes();
            setProdes(response.data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = (prode: Prode) => {
        setProdeToDelete(prode);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!prodeToDelete) return;

        setIsDeleting(true);
        try {
            await companyApi.deleteProde(prodeToDelete.id);
            setDeleteDialogOpen(false);
            setProdeToDelete(null);
            loadProdes();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsDeleting(false);
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
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Prodes de la Empresa</h2>
                    <p className="text-muted-foreground">
                        Gestiona los prodes de tu empresa
                    </p>
                </div>
                <Button onClick={() => setCreateModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Prode
                </Button>
            </div>

            {prodes.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No hay prodes registrados</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Crea un prode para que tus empleados puedan participar
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                                    {prode.competition && (
                                        <div className="text-sm">
                                            <span className="font-medium">Competición:</span>{' '}
                                            {prode.competition.name}
                                        </div>
                                    )}

                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        {new Date(prode.startDate).toLocaleDateString('es-AR')} -{' '}
                                        {new Date(prode.endDate).toLocaleDateString('es-AR')}
                                    </div>

                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Users className="h-4 w-4 mr-2" />
                                        {prode._count?.participants || 0} participantes
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${prode.is_active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {prode.is_active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>

                                    <div className="pt-2 flex space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => setEditingProde(prode)}
                                        >
                                            <Edit className="h-4 w-4 mr-1" />
                                            Editar
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleDeleteClick(prode)}
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            Eliminar
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <CreateProdeModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
                onSuccess={loadProdes}
            />

            <EditProdeModal
                prode={editingProde}
                open={!!editingProde}
                onOpenChange={(open) => !open && setEditingProde(null)}
                onSuccess={() => {
                    loadProdes();
                    setEditingProde(null);
                }}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará el prode "{prodeToDelete?.name}".
                            {prodeToDelete?._count?.participants && prodeToDelete._count.participants > 0 && (
                                <span className="block mt-2 text-destructive font-medium">
                                    Este prode tiene {prodeToDelete._count.participants} participante(s).
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Eliminando...
                                </>
                            ) : (
                                'Eliminar'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
