'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

interface CreateCompetitionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CompetitionFormData) => Promise<void>;
}

export interface CompetitionFormData {
    name: string;
    slug: string;
    startDate: string;
    endDate: string;
    sportType: string;
}

export function CreateCompetitionModal({ isOpen, onClose, onSubmit }: CreateCompetitionModalProps) {
    const [formData, setFormData] = useState<CompetitionFormData>({
        name: '',
        slug: '',
        startDate: '',
        endDate: '',
        sportType: 'futbol',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await onSubmit(formData);
            // Reset form
            setFormData({
                name: '',
                slug: '',
                startDate: '',
                endDate: '',
                sportType: 'futbol',
            });
            onClose();
        } catch (err: any) {
            setError(err.message || 'Error al crear competición');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNameChange = (name: string) => {
        setFormData({
            ...formData,
            name,
            // Auto-generate slug from name
            slug: name
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, ''),
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">Nueva Competición</h2>
                        <button
                            onClick={onClose}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Nombre de la Competición *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                placeholder="Ej: Copa Mundial 2026"
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        <div>
                            <Label htmlFor="slug">Slug (URL) *</Label>
                            <Input
                                id="slug"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                placeholder="Ej: mundial-2026"
                                required
                                disabled={isSubmitting}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Se genera automáticamente del nombre, pero puedes editarlo
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="startDate">Fecha de Inicio *</Label>
                                <Input
                                    id="startDate"
                                    type="datetime-local"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div>
                                <Label htmlFor="endDate">Fecha de Fin *</Label>
                                <Input
                                    id="endDate"
                                    type="datetime-local"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="sportType">Deporte *</Label>
                            <select
                                id="sportType"
                                value={formData.sportType}
                                onChange={(e) => setFormData({ ...formData, sportType: e.target.value })}
                                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                                required
                                disabled={isSubmitting}
                            >
                                <option value="futbol">Fútbol</option>
                                <option value="basketball">Basketball</option>
                                <option value="rugby">Rugby</option>
                                <option value="hockey">Hockey</option>
                                <option value="tennis">Tenis</option>
                            </select>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end space-x-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Creando...' : 'Crear Competición'}
                            </Button>
                        </div>
                    </form>
                </div>
            </Card>
        </div>
    );
}
