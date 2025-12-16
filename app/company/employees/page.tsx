'use client';

import { useEffect, useState } from 'react';
import { companyApi } from '@/lib/api/endpoints';
import { Employee, CompanyArea } from '@/lib/types';
import { getErrorMessage } from '@/lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, Mail, Phone, Building2, Eye, Ban, CheckCircle, Filter } from 'lucide-react';
import { EmployeeDetailsModal } from '@/components/company/EmployeeDetailsModal';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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

export default function CompanyEmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [areas, setAreas] = useState<CompanyArea[]>([]);
    const [selectedArea, setSelectedArea] = useState<string>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [blockDialogOpen, setBlockDialogOpen] = useState(false);
    const [employeeToBlock, setEmployeeToBlock] = useState<Employee | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    useEffect(() => {
        loadAreas();
    }, []);

    useEffect(() => {
        loadEmployees();
    }, [selectedArea]);

    const loadAreas = async () => {
        try {
            const response = await companyApi.getAreas();
            setAreas(response.data);
        } catch (err) {
            console.error('Error loading areas:', err);
        }
    };

    const loadEmployees = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const areaId = selectedArea === 'all' ? undefined : selectedArea;
            const response = await companyApi.getEmployees(areaId);
            setEmployees(response.data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewDetails = (employee: Employee) => {
        setSelectedEmployee(employee);
        setDetailsModalOpen(true);
    };

    const handleToggleBlockClick = (employee: Employee) => {
        if (employee.isBlocked) {
            // Unblock directly without confirmation
            handleToggleBlock(employee);
        } else {
            // Show confirmation dialog for blocking
            setEmployeeToBlock(employee);
            setBlockDialogOpen(true);
        }
    };

    const handleToggleBlock = async (employee: Employee) => {
        setTogglingId(employee.id);
        try {
            if (employee.isBlocked) {
                await companyApi.unblockEmployee(employee.id);
            } else {
                await companyApi.blockEmployee(employee.id);
            }
            loadEmployees();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setTogglingId(null);
        }
    };

    const handleBlockConfirm = async () => {
        if (!employeeToBlock) return;

        const employee = employeeToBlock;
        setEmployeeToBlock(null);
        setBlockDialogOpen(false);
        await handleToggleBlock(employee);
    };

    if (isLoading && employees.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error && employees.length === 0) {
        return (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                Error al cargar empleados: {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Empleados</h2>
                    <p className="text-muted-foreground">
                        Gestiona los empleados de tu empresa
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filtrar por área:</span>
                </div>
                <Select value={selectedArea} onValueChange={setSelectedArea}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Todas las áreas" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas las áreas</SelectItem>
                        {areas.map((area) => (
                            <SelectItem key={area.id} value={area.id}>
                                {area.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {employees.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Users className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                            {selectedArea === 'all'
                                ? 'No hay empleados registrados'
                                : 'No hay empleados en esta área'
                            }
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Los empleados se registran desde la página de registro
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {employees.map((employee) => (
                        <Card key={employee.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">
                                            {employee.firstName} {employee.lastName}
                                        </CardTitle>
                                        {employee.area && (
                                            <CardDescription className="mt-1 flex items-center">
                                                <Building2 className="h-3 w-3 mr-1" />
                                                {employee.area.name}
                                            </CardDescription>
                                        )}
                                    </div>
                                    <Users className="h-8 w-8 text-primary" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {employee.user?.email && (
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Mail className="h-4 w-4 mr-2" />
                                            <span className="truncate">{employee.user.email}</span>
                                        </div>
                                    )}

                                    {employee.phone && (
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Phone className="h-4 w-4 mr-2" />
                                            <span>{employee.phone}</span>
                                        </div>
                                    )}

                                    <div className="pt-2">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${employee.isBlocked
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-green-100 text-green-800'
                                                }`}
                                        >
                                            {employee.isBlocked ? 'Bloqueado' : 'Activo'}
                                        </span>
                                    </div>

                                    <div className="pt-2 flex space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleViewDetails(employee)}
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            Detalles
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleToggleBlockClick(employee)}
                                            disabled={togglingId === employee.id}
                                        >
                                            {togglingId === employee.id ? (
                                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                            ) : employee.isBlocked ? (
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                            ) : (
                                                <Ban className="h-4 w-4 mr-1" />
                                            )}
                                            {employee.isBlocked ? 'Activar' : 'Bloquear'}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <EmployeeDetailsModal
                employee={selectedEmployee}
                open={detailsModalOpen}
                onOpenChange={setDetailsModalOpen}
            />

            <AlertDialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Estás a punto de bloquear a{' '}
                            <span className="font-semibold">
                                {employeeToBlock?.firstName} {employeeToBlock?.lastName}
                            </span>
                            . El empleado no podrá acceder al sistema hasta que sea desbloqueado.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBlockConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Bloquear Empleado
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
