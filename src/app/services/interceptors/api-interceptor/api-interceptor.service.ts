import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable()
export class APIInterceptorService implements HttpInterceptor {
  constructor() { }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const clonedReq = req.clone({
      url: `${environment.host ? environment.host : `${location.origin}/api`}${req.url}`
    });
    return next.handle(clonedReq);
  }
}

