'use client';

import { Employee } from '@/lib/types';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Building2, User } from 'lucide-react';

interface EmployeeDetailsModalProps {
    employee: Employee | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EmployeeDetailsModal({ employee, open, onOpenChange }: EmployeeDetailsModalProps) {
    if (!employee) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Detalles del Empleado</DialogTitle>
                    <DialogDescription>
                        Información completa del empleado
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Name */}
                    <div className="flex items-start space-x-3">
                        <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-muted-foreground">Nombre Completo</p>
                            <p className="text-base font-semibold">
                                {employee.first_name} {employee.last_name}
                            </p>
                        </div>
                    </div>

                    {/* Email */}
                    {employee.user?.email && (
                        <div className="flex items-start space-x-3">
                            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground">Email</p>
                                <p className="text-base">{employee.user.email}</p>
                            </div>
                        </div>
                    )}

                    {/* Phone */}
                    {employee.phone && (
                        <div className="flex items-start space-x-3">
                            <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                                <p className="text-base">{employee.phone}</p>
                            </div>
                        </div>
                    )}

                    {/* Area */}
                    {employee.area && (
                        <div className="flex items-start space-x-3">
                            <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground">Área</p>
                                <p className="text-base">{employee.area.name}</p>
                                {employee.area.description && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {employee.area.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Status */}
                    <div className="flex items-start space-x-3">
                        <div className="h-5 w-5 flex items-center justify-center mt-0.5">
                            <div className={`h-3 w-3 rounded-full ${employee.is_blocked ? 'bg-red-500' : 'bg-green-500'}`} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-muted-foreground">Estado</p>
                            <p className="text-base font-semibold">
                                {employee.is_blocked ? 'Bloqueado' : 'Activo'}
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="secondary"
                        onClick={() => onOpenChange(false)}
                        className="bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                    >
                        Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
