import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
// Importa 'withInterceptors' y tu nuevo interceptor
import { provideHttpClient, withInterceptors } from '@angular/common/http'; 
import { authInterceptor } from './interceptors/auth.interceptor';

import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    
    // Modifica esta línea para incluir el interceptor
    provideHttpClient(withInterceptors([
      authInterceptor
    ])),
    
    importProvidersFrom(CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }))
  ]
};