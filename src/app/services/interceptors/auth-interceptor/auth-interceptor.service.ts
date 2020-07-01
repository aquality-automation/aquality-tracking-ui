import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  constructor(
    private auth: AuthService,
    private cookieService: CookieService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    if (this.auth.hasAuthCookie()) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', this.createAuthorizationHeader())
      });
      return next.handle(authReq);
    }

    return next.handle(req);
  }

  private createAuthorizationHeader() {
    return 'Basic ' + this.cookieService.get('iio78');
  }
}
