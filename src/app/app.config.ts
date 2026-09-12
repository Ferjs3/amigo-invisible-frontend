import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { routes } from './app.routes';
import { tokenInterceptor } from './core/interceptors/token.interceptor';
import { authErrorInterceptor } from './core/interceptors/auth-error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([tokenInterceptor, authErrorInterceptor])),
    // El service worker solo se activa en el build de produccion (npm run build),
    // nunca en "npm start" / desarrollo, para no complicar el trabajo local.
    // "registerWhenStable:30000" espera a que la app este quieta (o pasen 30s)
    // antes de registrarlo, asi no compite con la carga inicial.
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
