'use client';

import { useEffect, useState } from 'react';
import { companyApi } from '@/lib/api/endpoints';
import { CompanyArea } from '@/lib/types';
import { getErrorMessage } from '@/lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Building2, Plus, Edit, Trash2 } from 'lucide-react';
import { CreateAreaModal } from '@/components/company/CreateAreaModal';
import { EditAreaModal } from '@/components/company/EditAreaModal';
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

export default function CompanyAreasPage() {
    const [areas, setAreas] = useState<CompanyArea[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedArea, setSelectedArea] = useState<CompanyArea | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [areaToDelete, setAreaToDelete] = useState<CompanyArea | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        loadAreas();
    }, []);

    const loadAreas = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await companyApi.getAreas();
            setAreas(response.data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (area: CompanyArea) => {
        setSelectedArea(area);
        setEditModalOpen(true);
    };

    const handleDeleteClick = (area: CompanyArea) => {
        setAreaToDelete(area);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!areaToDelete) return;

        setIsDeleting(true);
        try {
            await companyApi.deleteArea(areaToDelete.id);
            setDeleteDialogOpen(false);
            setAreaToDelete(null);
            loadAreas();
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
                Error al cargar áreas: {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Áreas</h2>
                    <p className="text-muted-foreground">
                        Gestiona las áreas de tu empresa
                    </p>
                </div>
                <Button onClick={() => setCreateModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Área
                </Button>
            </div>

            {areas.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No hay áreas registradas</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Crea áreas para organizar a tus empleados
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {areas.map((area) => (
                        <Card key={area.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">{area.name}</CardTitle>
                                        {area.description && (
                                            <CardDescription className="mt-1">
                                                {area.description}
                                            </CardDescription>
                                        )}
                                    </div>
                                    <Building2 className="h-8 w-8 text-primary" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="text-sm text-muted-foreground">
                                        {area._count?.employees && area._count.employees > 1 || area._count?.employees === 0 ? (
                                            <span>{area._count?.employees} empleados</span>
                                        ) : (
                                            <span>{area._count?.employees} empleado</span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${area.is_active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-slate-100 text-slate-800'
                                                }`}
                                        >
                                            {area.is_active ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </div>

                                    <div className="pt-2 flex space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleEdit(area)}
                                        >
                                            <Edit className="h-4 w-4 mr-1" />
                                            Editar
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleDeleteClick(area)}
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

            <CreateAreaModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
                onSuccess={loadAreas}
            />

            <EditAreaModal
                area={selectedArea}
                open={editModalOpen}
                onOpenChange={setEditModalOpen}
                onSuccess={loadAreas}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará <strong>permanentemente</strong> el área "{areaToDelete?.name}".
                            Si solo quieres ocultarla, edita el área y márcala como "Inactiva".
                            {areaToDelete?._count?.employees && areaToDelete._count.employees > 0 ? (
                                <span className="block mt-2 text-destructive font-medium">
                                    Esta área tiene {areaToDelete._count.employees} empleado(s) asignado(s).
                                </span>
                            ) : null}
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
