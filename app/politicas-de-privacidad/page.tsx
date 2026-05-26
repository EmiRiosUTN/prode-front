import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Page() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 shadow-sm rounded-lg border border-gray-100">
                <div className="mb-8">
                    <Button variant="ghost" asChild className="mb-4 -ml-4 hover:bg-gray-100/50">
                        <Link href="/register" className="flex items-center text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver al registro
                        </Link>
                    </Button>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 border-b pb-4">{ `Políticas de Privacidad` }</h1>
                </div>
                <div className="prose prose-blue max-w-none">
                    <p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `política de privacidad – prodemax` }</p>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `Última actualización: 18/04/2026` }</p>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `La presente Política de Privacidad describe cómo ProdeMax recopila, usa, almacena,` }</p>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `comparte y protege datos personales en relación con www.prodemax.com.ar, todos sus` }</p>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `subdominios, y los entornos digitales de ProdeMax habilitados para Empresas Cliente.` }</p>
<h2 className="text-xl font-bold mt-6 mb-2 text-primary">{ `1. alcance` }</h2>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `Esta Política aplica a:` }</p>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `visitantes del sitio principal;` }</li>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `personas usuarias registradas;` }</li>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `administradores de Empresas Cliente;` }</li>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `empleados, colaboradores, clientes o terceros participantes de un prode;` }</li>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `usuarios que interactúen en subdominios o instancias brandeadas.` }</li>
<h2 className="text-xl font-bold mt-6 mb-2 text-primary">{ `2. datos que podemos recolectar` }</h2>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `Podemos recolectar, según el caso:` }</p>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `nombre y apellido;` }</li>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `correo electrónico;` }</li>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `teléfono;` }</li>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `empresa, cargo o sector;` }</li>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `usuario, contraseña cifrada y credenciales de acceso;` }</li>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `IP, logs, identificadores técnicos, cookies y datos del dispositivo;` }</li>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `historial de uso de la Plataforma;` }</li>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `participación en prodes, pronósticos, puntajes, rankings y actividad dentro del` }</li>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `sistema;` }</p>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `información de soporte, consultas, incidencias y comunicaciones;` }</li>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `cualquier otro dato que la Empresa Cliente o el usuario cargue voluntariamente.` }</li>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `ProdeMax no solicita intencionalmente datos sensibles, salvo que resulten indispensables y` }</p>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `exista base legal suficiente. Si una Empresa Cliente cargara datos sensibles o categorías` }</p>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `especialmente protegidas, será de su exclusiva responsabilidad justificar su tratamiento y` }</p>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `comunicarlo adecuadamente a los titulares.` }</p>
<h2 className="text-xl font-bold mt-6 mb-2 text-primary">{ `3. finalidades del tratamiento` }</h2>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `Los datos podrán ser utilizados para:` }</p>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `habilitar accesos y administrar cuentas;` }</li>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `operar la Plataforma y sus subdominios;` }</li>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `crear, gestionar y personalizar entornos corporativos;` }</li>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `permitir participación en prodes y mostrar resultados;` }</li>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `brindar soporte técnico y atención;` }</li>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `auditar funcionamiento, prevenir fraude y reforzar seguridad;` }</li>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `realizar estadísticas, métricas internas y mejoras del servicio;` }</li>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `enviar comunicaciones operativas, contractuales, técnicas o de seguridad;` }</li>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `cumplir obligaciones legales, contractuales o requerimientos de autoridad` }</li>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `competente.` }</p>
<h2 className="text-xl font-bold mt-6 mb-2 text-primary">{ `4. base legal` }</h2>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `El tratamiento podrá fundarse, según corresponda, en:` }</p>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `el consentimiento del titular;` }</li>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `la ejecución de una relación contractual o precontractual;` }</li>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `el interés legítimo del Prestador en asegurar funcionamiento, seguridad, soporte y` }</li>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `mejora del servicio;` }</p>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `el cumplimiento de obligaciones legales.` }</li>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `Cuando la Empresa Cliente cargue datos personales de sus empleados, clientes o` }</p>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `participantes, declara contar con legitimación suficiente para hacerlo y asume la` }</p>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `responsabilidad de haber brindado la información correspondiente.` }</p>
<h2 className="text-xl font-bold mt-6 mb-2 text-primary">{ `5. datos provistos por empresas cliente` }</h2>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `Cuando una Empresa Cliente habilita un subdominio o un entorno corporativo, podrá cargar` }</p>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `o sincronizar datos de participantes. En esos casos:` }</p>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `la Empresa Cliente declara que dichos datos fueron obtenidos lícitamente;` }</li>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `garantiza que cuenta con autorización, base legal o vínculo suficiente para tratarlos;` }</li>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `asume la responsabilidad primaria frente a sus participantes respecto del uso interno` }</li>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `del prode, reglas, premios y comunicaciones asociadas.` }</p>
<h2 className="text-xl font-bold mt-6 mb-2 text-primary">{ `6. cookies y tecnologías similares` }</h2>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `ProdeMax puede utilizar cookies, tokens, píxeles, etiquetas, logs y tecnologías similares` }</p>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `para:` }</p>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `recordar sesiones;` }</li>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `autenticar usuarios;` }</li>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `mantener preferencias;` }</li>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `analizar tráfico y rendimiento;` }</li>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `detectar errores o incidentes de seguridad.` }</li>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `El usuario puede configurar su navegador para rechazar o eliminar cookies, aunque ello` }</p>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `puede afectar funcionalidades de la Plataforma.` }</p>
<h2 className="text-xl font-bold mt-6 mb-2 text-primary">{ `7. cesión y compartición de datos` }</h2>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `ProdeMax podrá compartir datos personales:` }</p>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `con la Empresa Cliente correspondiente, cuando el dato se vincule a su entorno o` }</li>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `subdominio;` }</p>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `con proveedores tecnológicos, hosting, analítica, soporte, mensajería,` }</li>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `almacenamiento, autenticación o infraestructura;` }</p>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `con asesores profesionales bajo deber de confidencialidad;` }</li>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `con autoridades administrativas o judiciales cuando exista obligación legal o` }</li>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `requerimiento válido;` }</p>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `en procesos de reorganización societaria, fusión, cesión de fondo de comercio o` }</li>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `activos, bajo resguardos razonables.` }</p>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `ProdeMax no vende datos personales como producto independiente.` }</p>
<h2 className="text-xl font-bold mt-6 mb-2 text-primary">{ `8. transferencias internacionales` }</h2>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `Determinados proveedores o infraestructuras utilizadas por ProdeMax pueden alojar o` }</p>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `procesar datos fuera de la República Argentina. En esos supuestos, ProdeMax procurará` }</p>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `implementar medidas contractuales y organizativas razonables para resguardar la` }</p>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `información conforme a la normativa aplicable. (Argentina.gob.ar)` }</p>
<h2 className="text-xl font-bold mt-6 mb-2 text-primary">{ `9. conservación de datos` }</h2>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `Los datos se conservarán por el tiempo necesario para:` }</p>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `prestar el servicio;` }</li>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `mantener cuentas activas;` }</li>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `cumplir obligaciones legales, fiscales, contables o contractuales;` }</li>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `resolver disputas;` }</li>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `prevenir fraude y acreditar operaciones.` }</li>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `Una vez cumplida la finalidad, los datos podrán ser eliminados, anonimizados o bloqueados,` }</p>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `salvo que una norma exija su conservación.` }</p>
<h2 className="text-xl font-bold mt-6 mb-2 text-primary">{ `10. seguridad de la información` }</h2>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `ProdeMax adopta medidas razonables de seguridad técnicas, administrativas y` }</p>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `organizativas para proteger los datos contra acceso no autorizado, pérdida, alteración,` }</p>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `divulgación o destrucción.` }</p>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `No obstante, el usuario reconoce que no existe sistema absolutamente invulnerable, por lo` }</p>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `que ProdeMax no puede garantizar seguridad absoluta.` }</p>
<h2 className="text-xl font-bold mt-6 mb-2 text-primary">{ `11. derechos de los titulares` }</h2>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `Los titulares de datos personales podrán ejercer los derechos de:` }</p>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `acceso;` }</li>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `rectificación;` }</li>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `actualización;` }</li>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `supresión, cuando corresponda;` }</li>
<li className="ml-4 mb-2 text-gray-700 leading-relaxed text-sm md:text-base">{ `retiro del consentimiento, en los casos aplicables.` }</li>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `Las solicitudes podrán enviarse a info@prodemax.com.ar acreditando identidad suficiente.` }</p>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `La normativa argentina reconoce estos derechos y prevé mecanismos de reclamo ante la` }</p>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `autoridad de control. (Argentina.gob.ar)` }</p>
<h2 className="text-xl font-bold mt-6 mb-2 text-primary">{ `12. autoridad de control` }</h2>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `La Agencia de Acceso a la Información Pública, en su carácter de órgano de control de` }</p>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `la Ley 25.326, tiene atribuciones para atender denuncias y reclamos vinculados al` }</p>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `incumplimiento de normas sobre protección de datos personales. (Argentina.gob.ar)` }</p>
<h2 className="text-xl font-bold mt-6 mb-2 text-primary">{ `13. menores de edad` }</h2>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `La Plataforma no está dirigida de manera principal a menores de edad. Si una Empresa` }</p>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `Cliente decidiera habilitar participación de menores, dicha Empresa Cliente será la exclusiva` }</p>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `responsable de obtener autorizaciones, consentimientos y resguardos legales adecuados,` }</p>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `así como de definir el tratamiento de datos correspondiente.` }</p>
<h2 className="text-xl font-bold mt-6 mb-2 text-primary">{ `14. confidencialidad` }</h2>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `Toda persona que intervenga en cualquier fase del tratamiento de datos personales se` }</p>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `obliga a respetar la confidencialidad y a adoptar las medidas necesarias para evitar su uso` }</p>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `indebido.` }</p>
<h2 className="text-xl font-bold mt-6 mb-2 text-primary">{ `15. enlaces a terceros` }</h2>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `La Plataforma puede contener enlaces a sitios, servicios o contenidos de terceros.` }</p>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `ProdeMax no controla ni responde por sus prácticas de privacidad, seguridad o contenido.` }</p>
<h2 className="text-xl font-bold mt-6 mb-2 text-primary">{ `16. cambios en esta política` }</h2>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `ProdeMax podrá actualizar esta Política de Privacidad en cualquier momento. La versión` }</p>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `vigente será la publicada en la Plataforma.` }</p>
<h2 className="text-xl font-bold mt-6 mb-2 text-primary">{ `17. contacto` }</h2>
<p className="mb-4 text-gray-700 leading-relaxed text-sm md:text-base">{ `Para consultas sobre privacidad o ejercicio de derechos: info@prodemax.com.ar.` }</p>
                </div>
            </div>
        </div>
    );
}