'use client';

import { useEffect, useState } from 'react';
import { adminCompaniesApi } from '@/lib/api/endpoints';
import { Company } from '@/lib/types';
import { getErrorMessage } from '@/lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Building2, Users, Trophy, Loader2, Eye } from 'lucide-react';
import { CreateCompanyModal, type CompanyFormData } from '@/components/admin/CreateCompanyModal';
import { CompanyDetailsModal } from '@/components/admin/CompanyDetailsModal';

export default function AdminCompaniesPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

    useEffect(() => {
        loadCompanies();
    }, []);

    const loadCompanies = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await adminCompaniesApi.getAll();
            setCompanies(response.data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateCompany = async (data: CompanyFormData) => {
        try {
            // Data is already in camelCase, pass it directly
            await adminCompaniesApi.create({
                name: data.name,
                slug: data.slug,
                corporateDomain: data.corporateDomain,
                requireCorporateEmail: data.requireCorporateEmail,
                logoUrl: data.logoUrl,
                primaryColor: data.primaryColor,
                secondaryColor: data.secondaryColor,
                adminEmail: data.adminEmail,
                adminPassword: data.adminPassword,
            });
            await loadCompanies(); // Reload list
        } catch (err) {
            throw new Error(getErrorMessage(err));
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
                Error al cargar empresas: {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Empresas</h2>
                    <p className="text-muted-foreground">
                        Gestiona las empresas registradas en la plataforma
                    </p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Empresa
                </Button>
            </div>

            {companies.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No hay empresas registradas</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {companies.map((company) => (
                        <Card key={company.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">{company.name}</CardTitle>
                                        <CardDescription className="mt-1">
                                            {company.slug}
                                        </CardDescription>
                                    </div>
                                    {company.logo_url && (
                                        <img
                                            src={company.logo_url}
                                            alt={company.name}
                                            className="h-10 w-10 rounded object-contain"
                                        />
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {/* Stats */}
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center text-muted-foreground">
                                            <Users className="h-4 w-4 mr-1" />
                                            <span>{company._count?.employees || 0} empleados</span>
                                        </div>
                                        <div className="flex items-center text-muted-foreground">
                                            <Trophy className="h-4 w-4 mr-1" />
                                            <span>{company._count?.prodes || 0} prodes</span>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="flex items-center justify-between">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${company.is_active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {company.is_active ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </div>

                                    {(company.primary_color || company.secondary_color) && (
                                        <div className="flex items-center space-x-2">
                                            {company.primary_color && (
                                                <div
                                                    className="h-6 w-6 rounded border border-slate-200"
                                                    style={{ backgroundColor: company.primary_color }}
                                                    title="Color primario"
                                                />
                                            )}
                                            {company.secondary_color && (
                                                <div
                                                    className="h-6 w-6 rounded border border-slate-200"
                                                    style={{ backgroundColor: company.secondary_color }}
                                                    title="Color secundario"
                                                />
                                            )}
                                        </div>
                                    )}

                                    <div className="pt-2 flex space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => {
                                                setSelectedCompany(company);
                                                setDetailsModalOpen(true);
                                            }}
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            Ver Detalles
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
            {/* Create Company Modal */}
            <CreateCompanyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateCompany}
            />

            {/* Company Details Modal */}
            <CompanyDetailsModal
                company={selectedCompany}
                open={detailsModalOpen}
                onOpenChange={setDetailsModalOpen}
                onSuccess={loadCompanies}
            />
        </div>
    );
}
