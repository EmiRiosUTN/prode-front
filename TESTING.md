# 🧪 Guía de Pruebas - MundialPro Frontend

Esta guía te ayudará a probar el frontend del sistema MundialPro desde cero, sin necesidad de tener credenciales previas.

## 📋 Requisitos Previos

1. **Backend ejecutándose**: Asegúrate de que el backend esté corriendo en `http://localhost:3001`
2. **Frontend ejecutándose**: El frontend debe estar corriendo en `http://localhost:3000`
3. **Base de datos inicializada**: Ejecuta el seed para tener datos de prueba

### Inicializar la Base de Datos (Seed)

Si aún no has ejecutado el seed, hazlo con:

```bash
cd d:\Trabajo\Prode\prode-backend\prode-backend
npm run seed
```

Esto creará:
- ✅ Un admin global
- ✅ Una competición (Mundial 2026)
- ✅ Equipos y partidos de ejemplo
- ✅ Una empresa de prueba (Tech Corp)
- ✅ Áreas y empleados

---

## 🚀 Opción 1: Usar Credenciales Pre-creadas (Más Rápido)

El seed ya creó usuarios de prueba. Puedes usar cualquiera de estos:

### 👑 Admin Global
- **URL**: `http://localhost:3000/login`
- **Email**: `admin@mundialpro.com`
- **Password**: `Admin123!MundialPro`
- **Acceso a**: Gestión de empresas, competiciones y partidos

### 🏢 Admin de Empresa (Tech Corp)
- **URL**: `http://localhost:3000/login`
- **Email**: `admin@techcorp.com`
- **Password**: `Admin123!`
- **Acceso a**: Gestión de su empresa, áreas, empleados y prodes

### 👤 Empleado
- **URL**: `http://localhost:3000/login`
- **Email**: `employee1@techcorp.com` (o employee2, employee3... hasta employee12)
- **Password**: `Employee123!`
- **Acceso a**: Ver prodes y hacer predicciones

---

## 🆕 Opción 2: Crear Tu Propia Empresa y Usuario

Si quieres crear tu propia empresa desde cero:

### Paso 1: Ir a la página de creación de usuarios
Abre tu navegador y ve a:
```
http://localhost:3000/create-user
```

### Paso 2: Completar el formulario

Llena los siguientes campos:

| Campo | Ejemplo | Descripción |
|-------|---------|-------------|
| **Nombre de la Empresa** | `Mi Empresa SA` | El nombre completo de tu empresa |
| **Slug de la Empresa** | `miempresa` | Solo minúsculas, sin espacios (se usa para la URL) |
| **Email del Administrador** | `admin@miempresa.com` | Email del admin de la empresa |
| **Contraseña del Administrador** | `MiPassword123!` | Mínimo 6 caracteres |

### Paso 3: Crear la empresa
Haz clic en **"Crear Empresa y Usuario"**

Si todo sale bien, verás un mensaje de éxito con tus credenciales.

### Paso 4: Iniciar sesión
Ve a `http://localhost:3000/login` y usa las credenciales que acabas de crear.

---

## 🗺️ Mapa de Rutas del Frontend

Una vez que hayas iniciado sesión, estas son las rutas disponibles según tu rol:

### 🏠 Rutas Públicas
- `/` - Página principal
- `/login` - Iniciar sesión
- `/create-user` - Crear empresa y usuario (requiere admin global)
- `/diagnostic` - Diagnóstico del sistema

### 👤 Rutas para Empleados
- `/prodes` - Lista de prodes disponibles
- `/prodes/[id]` - Ver un prode específico
- `/prodes/[id]/predictions` - Hacer predicciones

### 🏢 Rutas para Admin de Empresa
- `/company/config` - Configuración de la empresa
- `/company/areas` - Gestión de áreas
- `/company/employees` - Gestión de empleados
- `/company/prodes` - Gestión de prodes de la empresa

### 👑 Rutas para Admin Global
- `/admin/companies` - Gestión de empresas
- `/admin/competitions` - Gestión de competiciones
- `/admin/matches` - Gestión de partidos

---

## 🎯 Flujos de Prueba Recomendados

### Flujo 1: Probar como Empleado

1. **Login**: `http://localhost:3000/login`
   - Email: `employee1@techcorp.com`
   - Password: `Employee123!`

2. **Ver prodes**: `http://localhost:3000/prodes`
   - Deberías ver el "Prode Mundial 2026"

3. **Hacer predicciones**: Haz clic en un prode y completa tus predicciones

4. **Ver ranking**: Revisa tu posición en el ranking

### Flujo 2: Probar como Admin de Empresa

1. **Login**: `http://localhost:3000/login`
   - Email: `admin@techcorp.com`
   - Password: `Admin123!`

2. **Gestionar áreas**: `http://localhost:3000/company/areas`
   - Crea, edita o elimina áreas

3. **Gestionar empleados**: `http://localhost:3000/company/employees`
   - Agrega nuevos empleados

4. **Gestionar prodes**: `http://localhost:3000/company/prodes`
   - Crea nuevos prodes o edita existentes

### Flujo 3: Probar como Admin Global

1. **Login**: `http://localhost:3000/login`
   - Email: `admin@mundialpro.com`
   - Password: `Admin123!MundialPro`

2. **Gestionar empresas**: `http://localhost:3000/admin/companies`
   - Crea, edita o elimina empresas

3. **Gestionar competiciones**: `http://localhost:3000/admin/competitions`
   - Administra competiciones globales

4. **Gestionar partidos**: `http://localhost:3000/admin/matches`
   - Carga resultados de partidos

---

## 🔧 Solución de Problemas

### El backend no está en el puerto correcto
Si ves errores de conexión, verifica que el backend esté corriendo en el puerto `3001`. Revisa el archivo `.env` del backend:
```
PORT=3001
```

### Error "Module not found"
Si ves errores de módulos faltantes, instala las dependencias:
```bash
cd d:\Trabajo\Prode\prode-front
npm install
```

### La base de datos está vacía
Ejecuta el seed nuevamente:
```bash
cd d:\Trabajo\Prode\prode-backend\prode-backend
npm run seed
```

### No puedo crear usuarios
Asegúrate de que:
1. El backend esté corriendo
2. La base de datos esté inicializada con el seed (necesitas el admin global)
3. Estés usando la ruta correcta: `http://localhost:3000/create-user`

---

## 📝 Notas Importantes

- **Multitenancy**: Cada empresa tiene sus propios datos aislados
- **Roles**: Los permisos varían según el rol (empleado, empresa_admin, admin_global)
- **Datos de prueba**: El seed crea datos de ejemplo para facilitar las pruebas
- **Desarrollo**: Estos son datos de prueba, no uses contraseñas reales

---

## 🎉 ¡Listo para Probar!

Ahora tienes todo lo necesario para probar el frontend. Comienza con el flujo que más te interese y explora las diferentes funcionalidades del sistema.

**¿Dudas?** Revisa los logs del backend y frontend para más información sobre errores.
