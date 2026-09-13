# Amigo Invisible — Frontend

App Angular (standalone components) que consume la API del backend Spring Boot.

## Requisitos

- Node.js 20+
- El backend corriendo en `http://localhost:8080` (ver `environment.ts` si lo cambiás de puerto)

## Puesta en marcha

```bash
npm install
npm start
```

La app queda en `http://localhost:4200`.

## Estructura

```
core/
  models/        -> interfaces TypeScript que reflejan los DTOs del backend
  services/      -> AuthService, RoomService, WishlistService, QuestionService
  guards/        -> authGuard (protege rutas privadas)
  interceptors/  -> agrega el token a cada request, y desloguea en un 401

features/
  auth/          -> login, registro
  rooms/
    room-list/    -> Home: "Mis salas"
    room-create/  -> Crear sala (muestra el código generado al confirmar)
    room-join/    -> Unirse con código (con preview antes de confirmar)
    room-lobby/   -> Contenedor con tabs: Resumen, Mi amigo invisible, Tablón, Preguntas
      participants-list/     -> lista + botón de sorteo (admin)
      exclusions-manager/    -> restricciones antes del sorteo (admin)
      secret-friend-card/    -> el toggle del ojo, oculta/revela la asignación
      wishlist-board/        -> tablón de sugerencias, CRUD del propio
      questions-wall/        -> preguntas privadas (a tu amigo invisible asignado)
      budget-vote/            -> votación de presupuesto con desempate del admin
```

Cada componente tiene sus 3 archivos separados: `.component.ts` (lógica),
`.component.html` (template) y `.component.css` (estilos, con CSS nativo).

## Identidad visual

CSS nativo (sin Tailwind), con variables globales en `src/styles.css`
(`--primary`, `--canvas`, `--surface`, `--surface-dim`, `--fg`, `--fg-muted`,
`--accent`, `--success`, `--danger`, y sus variantes `-dark`). Cada componente
las usa vía `var(--nombre)` en su propio `.component.css`. Los nombres son por
**rol** (qué hacen), no por apariencia, para que sigan teniendo sentido si el
color real cambia.

Paleta actual: ciruela + papel + dorado, pensada como un ticket/invitación
sellada — el corazón de la app es el secreto y la revelación, no un dashboard
genérico.

## Notas

- El token de sesión se guarda en `localStorage` (ver `AuthService`). Si el backend
  responde `401`, el `authErrorInterceptor` desloguea y redirige a `/login` automáticamente.
- El flujo completo es: `/login` → `/rooms` (home) → `/rooms/new` o `/rooms/join` →
  `/rooms/:id` (lobby).

## PWA (instalable en el celu)

La app ahora es instalable: en Android/Chrome aparece un cartel de "Agregar a la
pantalla de inicio", y en iOS/Safari se puede agregar manualmente desde el botón
Compartir → "Agregar a inicio". Una vez instalada, abre en su propia ventana sin
la barra de direcciones del navegador.

**Importante**: el service worker (lo que hace posible instalarla) solo se activa
en el build de producción, nunca con `npm start`. Si querés probarlo en tu máquina
antes de deployar:

```bash
npm run build
npx http-server dist/amigo-invisible-frontend/browser -p 8081
```

y abrís `http://localhost:8081`. En Vercel no hace falta hacer nada especial: como
ya deploya con `ng build` en modo producción, la PWA queda activa automáticamente
en cada deploy.

Los íconos están en `src/assets/icons/` — si en algún momento querés cambiar el
diseño (hoy son las iniciales "AI" en dorado sobre fondo ciruela), simplemente
reemplazá esos archivos PNG manteniendo los mismos nombres y tamaños.
