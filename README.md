# Biblioteca SENA

Sistema de gestión bibliotecaria moderno y eficiente desarrollado para el SENA.

## Características

- 📚 **Gestión de Libros**
  - Catálogo completo de libros
  - Búsqueda por título, autor y código
  - Control de existencias
  - Categorización de libros

- 📋 **Sistema de Préstamos**
  - Registro de préstamos
  - Control de devoluciones
  - Alertas de vencimiento
  - Historial de préstamos por usuario

- 👥 **Gestión de Usuarios**
  - Registro de usuarios
  - Perfiles de usuario
  - Control de préstamos activos
  - Historial de actividades

- 🔔 **Sistema de Alertas**
  - Notificaciones de vencimiento
  - Alertas de devolución pendiente
  - Dashboard con estadísticas

## Tecnologías Utilizadas

- **Frontend:**
  - Next.js 14
  - React
  - TypeScript
  - Tailwind CSS
  - Shadcn/ui

- **Backend:**
  - Firebase
  - Firestore
  - Firebase Authentication

- **Testing:**
  - Vitest
  - React Testing Library

## Requisitos Previos

- Node.js 18.0 o superior
- npm o yarn
- Cuenta de Firebase

## Configuración del Proyecto

1. Clonar el repositorio:
```bash
git clone [URL_DEL_REPOSITORIO]
cd biblioteca-sena
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
Crear un archivo `.env.local` con las siguientes variables:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

## Desarrollo

Iniciar el servidor de desarrollo:
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Crea la versión de producción
- `npm start` - Inicia la versión de producción
- `npm test` - Ejecuta los tests
- `npm run lint` - Ejecuta el linter
- `npm run validate` - Ejecuta todas las validaciones (lint, type-check, tests)

## Estructura del Proyecto

```
biblioteca-sena/
├── src/
│   ├── app/           # Páginas y rutas
│   ├── components/    # Componentes React
│   ├── hooks/         # Hooks personalizados
│   ├── lib/          # Utilidades y configuración
│   ├── types/        # Tipos TypeScript
│   └── __tests__/    # Tests
├── public/           # Archivos estáticos
└── ...
```

## Despliegue

1. Ejecutar las validaciones:
```bash
npm run validate
```

2. Crear la versión de producción:
```bash
npm run build
```

3. El proyecto está listo para ser desplegado en plataformas como Vercel, Netlify o Firebase Hosting.

## Características de Seguridad

- Autenticación de usuarios
- Protección de rutas
- Validación de tokens
- Control de acceso basado en roles
- Manejo seguro de sesiones

## Mantenimiento

- Actualización regular de dependencias
- Backups automáticos de la base de datos
- Monitoreo de errores
- Logs de actividad

## Soporte

Para reportar problemas o solicitar nuevas características, por favor crear un issue en el repositorio.

## Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.
