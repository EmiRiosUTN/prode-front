'use client';

import { useEffect, useState } from 'react';
import { Ban, Building2, CheckCircle, Eye, Filter, Loader2, Mail, Phone, Search, Users } from 'lucide-react';
import { companyApi } from '@/lib/api/endpoints';
import { getErrorMessage } from '@/lib/api/client';
import { CompanyArea, Employee } from '@/lib/types';
import { EmployeeDetailsModal } from '@/components/company/EmployeeDetailsModal';
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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function CompanyEmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [areas, setAreas] = useState<CompanyArea[]>([]);
    const [selectedArea, setSelectedArea] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
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
            const filteredEmployees = response.data.filter((employee: Employee) => employee.user?.role !== 'empresa_admin');
            setEmployees(filteredEmployees);
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
        if (employee.is_blocked) {
            void handleToggleBlock(employee);
            return;
        }

        setEmployeeToBlock(employee);
        setBlockDialogOpen(true);
    };

    const handleToggleBlock = async (employee: Employee) => {
        setTogglingId(employee.id);
        try {
            if (employee.is_blocked) {
                await companyApi.unblockEmployee(employee.id);
            } else {
                await companyApi.blockEmployee(employee.id);
            }
            await loadEmployees();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setTogglingId(null);
        }
    };

    const handleBlockConfirm = async () => {
        if (!employeeToBlock) {
            return;
        }

        const employee = employeeToBlock;
        setEmployeeToBlock(null);
        setBlockDialogOpen(false);
        await handleToggleBlock(employee);
    };

    const normalizedSearch = searchTerm.trim().toLowerCase();
    const visibleEmployees = employees.filter((employee) => {
        if (!normalizedSearch) {
            return true;
        }

        const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase();
        const email = employee.user?.email?.toLowerCase() || '';

        return fullName.includes(normalizedSearch) || email.includes(normalizedSearch);
    });

    if (isLoading && employees.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error && employees.length === 0) {
        return (
            <div className="rounded-md bg-destructive/10 p-4 text-destructive">
                Error al cargar empleados: {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Empleados</h2>
                    <p className="text-muted-foreground">
                        Gestiona los empleados de tu empresa
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Filtrar por area:</span>
                    </div>
                    <Select value={selectedArea} onValueChange={setSelectedArea}>
                        <SelectTrigger className="w-full sm:w-[220px]">
                            <SelectValue placeholder="Todas las areas" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas las areas</SelectItem>
                            {areas.map((area) => (
                                <SelectItem key={area.id} value={area.id}>
                                    {area.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="relative w-full lg:max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Buscar por nombre o mail"
                        className="pl-9"
                    />
                </div>
            </div>

            {visibleEmployees.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Users className="mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">
                            {employees.length === 0
                                ? (selectedArea === 'all' ? 'No hay empleados registrados' : 'No hay empleados en esta area')
                                : 'No encontramos empleados con esa busqueda'}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {employees.length === 0
                                ? 'Los empleados se registran desde la pagina de registro'
                                : 'Prueba con otro nombre o correo electronico'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {visibleEmployees.map((employee) => (
                        <Card key={employee.id} className="flex flex-col transition-shadow hover:shadow-lg">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">
                                            {employee.first_name} {employee.last_name}
                                        </CardTitle>
                                        {employee.area && (
                                            <CardDescription className="mt-1 flex items-center">
                                                <Building2 className="mr-1 h-3 w-3" />
                                                {employee.area.name}
                                            </CardDescription>
                                        )}
                                    </div>
                                    <Users className="h-8 w-8 text-primary" />
                                </div>
                            </CardHeader>
                            <CardContent className="flex flex-1 flex-col justify-between">
                                <div className="space-y-2">
                                    {employee.user?.email && (
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Mail className="mr-2 h-4 w-4" />
                                            <span className="truncate">{employee.user.email}</span>
                                        </div>
                                    )}

                                    {employee.phone && (
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Phone className="mr-2 h-4 w-4" />
                                            <span>{employee.phone}</span>
                                        </div>
                                    )}

                                    <div className="pt-2">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                employee.is_blocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                            }`}
                                        >
                                            {employee.is_blocked ? 'Bloqueado' : 'Activo'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex space-x-2 pt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => handleViewDetails(employee)}
                                    >
                                        <Eye className="mr-1 h-4 w-4" />
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
                                            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                        ) : employee.is_blocked ? (
                                            <CheckCircle className="mr-1 h-4 w-4" />
                                        ) : (
                                            <Ban className="mr-1 h-4 w-4" />
                                        )}
                                        {employee.is_blocked ? 'Activar' : 'Bloquear'}
                                    </Button>
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
                        <AlertDialogTitle>Estas seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Estas a punto de bloquear a{' '}
                            <span className="font-semibold">
                                {employeeToBlock?.first_name} {employeeToBlock?.last_name}
                            </span>.
                            El empleado no podra acceder al sistema hasta que sea desbloqueado.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBlockConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Bloquear empleado
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
