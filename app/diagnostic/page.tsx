'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';

export default function DiagnosticPage() {
    const [apiUrl, setApiUrl] = useState('http://localhost:3000/api');
    const [isChecking, setIsChecking] = useState(false);
    const [result, setResult] = useState<{
        status: 'success' | 'error' | 'warning';
        message: string;
        details?: string;
    } | null>(null);

    const checkConnection = async () => {
        setIsChecking(true);
        setResult(null);

        try {
            const response = await fetch(`${apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: 'admin@mundialpro.com',
                    password: 'Admin123!MundialPro',
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setResult({
                    status: 'success',
                    message: 'Conexión exitosa con el backend!',
                    details: `Usuario: ${data.data.user.email}\nRol: ${data.data.user.role}`,
                });
            } else if (response.status === 404) {
                setResult({
                    status: 'error',
                    message: 'Error 404: Endpoint no encontrado',
                    details: `El backend no está respondiendo en ${apiUrl}\n\nVerifica que:\n1. El backend esté corriendo\n2. La URL sea correcta\n3. El endpoint /auth/login exista`,
                });
            } else if (response.status === 401) {
                setResult({
                    status: 'warning',
                    message: 'Backend conectado pero credenciales incorrectas',
                    details: 'El backend está funcionando pero las credenciales de prueba no son válidas.',
                });
            } else {
                const errorData = await response.json().catch(() => ({}));
                setResult({
                    status: 'error',
                    message: `Error ${response.status}: ${response.statusText}`,
                    details: JSON.stringify(errorData, null, 2),
                });
            }
        } catch (error) {
            setResult({
                status: 'error',
                message: 'No se puede conectar al backend',
                details: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}\n\nPosibles causas:\n1. El backend no está corriendo\n2. La URL es incorrecta\n3. Problema de CORS\n4. Firewall bloqueando la conexión`,
            });
        } finally {
            setIsChecking(false);
        }
    };

    const commonUrls = [
        'http://localhost:3000/api',
        'http://localhost:3001/api',
        'http://localhost:4000/api',
        'http://localhost:5000/api',
    ];

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl">🔍 Diagnóstico de Conexión</CardTitle>
                    <CardDescription>
                        Verifica la conexión con el backend de Prode
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* URL Input */}
                    <div className="space-y-2">
                        <Label htmlFor="apiUrl">URL del Backend</Label>
                        <div className="flex space-x-2">
                            <Input
                                id="apiUrl"
                                value={apiUrl}
                                onChange={(e) => setApiUrl(e.target.value)}
                                placeholder="http://localhost:3000/api"
                                disabled={isChecking}
                            />
                            <Button onClick={checkConnection} disabled={isChecking}>
                                {isChecking ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verificando...
                                    </>
                                ) : (
                                    'Verificar'
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>URLs Comunes:</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {commonUrls.map((url) => (
                                <Button
                                    key={url}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setApiUrl(url)}
                                    disabled={isChecking}
                                >
                                    {url.replace('http://localhost:', ':')}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {result && (
                        <div
                            className={`p-4 rounded-lg border-2 ${result.status === 'success'
                                    ? 'bg-green-50 border-green-200'
                                    : result.status === 'warning'
                                        ? 'bg-yellow-50 border-yellow-200'
                                        : 'bg-red-50 border-red-200'
                                }`}
                        >
                            <div className="flex items-start space-x-3">
                                {result.status === 'success' ? (
                                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                                ) : result.status === 'warning' ? (
                                    <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1">
                                    <p className="font-semibold mb-2">{result.message}</p>
                                    {result.details && (
                                        <pre className="text-sm whitespace-pre-wrap bg-white/50 p-3 rounded border">
                                            {result.details}
                                        </pre>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold mb-2 flex items-center">
                            <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
                            Instrucciones para iniciar el backend:
                        </h3>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700">
                            <li>Abre una nueva terminal</li>
                            <li>Navega a la carpeta del backend: <code className="bg-white px-1 rounded">cd d:\Trabajo\Prode\prode-back\backend</code></li>
                            <li>Ejecuta: <code className="bg-white px-1 rounded">npm run start:dev</code></li>
                            <li>Espera a que inicie (verás: "Application is running on...")</li>
                            <li>Vuelve aquí y haz clic en "Verificar"</li>
                        </ol>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4 text-sm">
                        <h3 className="font-semibold mb-2">Configuración Actual:</h3>
                        <div className="space-y-1 text-slate-600">
                            <p>
                                <span className="font-medium">Frontend:</span> http://localhost:3000
                            </p>
                            <p>
                                <span className="font-medium">Backend esperado:</span> {apiUrl}
                            </p>
                            <p>
                                <span className="font-medium">Variable de entorno:</span>{' '}
                                {process.env.NEXT_PUBLIC_API_BASE_URL || 'No configurada (usando default)'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
