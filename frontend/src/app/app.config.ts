import { ApplicationConfig, ErrorHandler, Injectable } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    const chunkFailedMessage = /Loading chunk [\d]+ failed/;
    const dynamicImportFailedMessage = /Failed to fetch dynamically imported module/;
    
    if (chunkFailedMessage.test(error.message) || dynamicImportFailedMessage.test(error.message) || (error.message && error.message.includes('dynamically imported module'))) {
      window.location.reload();
    }
    console.error('Error from global error handler', error);
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: ErrorHandler, useClass: GlobalErrorHandler }
  ],
};
