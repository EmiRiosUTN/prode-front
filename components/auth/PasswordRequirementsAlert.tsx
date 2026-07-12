import { Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function PasswordRequirementsAlert() {
    return (
        <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-800">
                <strong>Requisitos de contraseña:</strong>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                    <li>Mínimo 8 caracteres</li>
                    <li>Al menos una mayúscula</li>
                    <li>Al menos una minúscula</li>
                    <li>Al menos un número</li>
                    <li>Al menos un caracter especial</li>
                </ul>
            </AlertDescription>
        </Alert>
    );
}
