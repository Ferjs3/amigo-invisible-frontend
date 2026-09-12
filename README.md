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
      questions-wall/        -> preguntas anónimas por muro
```

## Identidad visual

Paleta ciruela + papel + dorado (`styles.css` / `tailwind.config.js`), pensada como un
ticket/invitación sellada: el corazón de la app es el secreto y la revelación, no un
dashboard genérico. Si querés ajustar colores o tipografía, están centralizados en esos
dos archivos.

## Notas

- El token de sesión se guarda en `localStorage` (ver `AuthService`). Si el backend
  responde `401`, el `authErrorInterceptor` desloguea y redirige a `/login` automáticamente.
- El flujo completo es: `/login` → `/rooms` (home) → `/rooms/new` o `/rooms/join` →
  `/rooms/:id` (lobby).
