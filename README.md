# InstaPilot Dashboard

Dashboard para gestionar múltiples cuentas de Instagram, planificar publicaciones diarias y seleccionar la IA de generación de imágenes por cuenta/post.

## Stack
- Next.js + React + TypeScript
- Tailwind CSS
- Prisma + SQLite

## Funciones incluidas
- Alta de cuentas Instagram (handle, nicho, IA por defecto, prompt base)
- Planificación diaria por cuenta
- Selección de proveedor IA por publicación (OPENAI, REPLICATE, STABILITY, MIDJOURNEY, FLUX)
- Estado del contenido (planned/generated/scheduled/published/skipped)
- Métricas rápidas del dashboard
- Endpoint de generación (mock) que simula creación de imagen IA

## Ejecutar en local
```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:push
npm run db:seed
npm run dev
```

## Producción
```bash
npm run build
npm run start -- --port 3003
```

## API
- `GET/POST /api/accounts`
- `PATCH/DELETE /api/accounts/:id`
- `GET/POST /api/plans`
- `PATCH/DELETE /api/plans/:id`
- `POST /api/generate` (simulación)
