import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptorService } from './auth-interceptor/auth-interceptor.service';
import { APIInterceptorService } from './api-interceptor/api-interceptor.service';
import { ErrorInterceptorService } from './error-interceptor/error-interceptor.service';
import { LoaderInterceptorService } from './loader-interceptor/loader-interceptor.service';

export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: APIInterceptorService, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptorService, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptorService, multi: true },
];
