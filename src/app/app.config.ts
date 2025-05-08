import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay, withHttpTransferCacheOptions  } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({
      eventCoalescing: true
      }),
      provideRouter(routes),
      provideClientHydration(
        withEventReplay(),
        withHttpTransferCacheOptions({
          // Configurações de cache para SSR
          includeHeaders: ['content-type'],
          includePostRequests: true
        })
      ),
      provideHttpClient(withFetch(), withInterceptors([])), // [ authInterceptor ]
    ]
};
