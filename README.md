# InstaPilot Dashboard

Dashboard para gestionar múltiples cuentas de Instagram, planificar publicaciones diarias y seleccionar la IA de generación de imágenes por cuenta/post.

## Stack
- Next.js + React + TypeScript
- Tailwind CSS
- Prisma + SQLite

## Funciones incluidas
- Conexión de cuentas reales de Instagram vía OAuth (`/api/instagram/connect`)
- Planificación diaria por cuenta
- Selección de proveedor IA por publicación (OPENAI, REPLICATE, STABILITY, MIDJOURNEY, FLUX)
- Estado del contenido (planned/generated/scheduled/published/skipped)
- Métricas rápidas del dashboard
- Endpoint de generación (mock) que simula creación de imagen IA

## Variables de entorno (Instagram OAuth)
- `INSTAGRAM_APP_ID`
- `INSTAGRAM_APP_SECRET`
- `INSTAGRAM_REDIRECT_URI` (debe coincidir exactamente con la configurada en Meta)

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
