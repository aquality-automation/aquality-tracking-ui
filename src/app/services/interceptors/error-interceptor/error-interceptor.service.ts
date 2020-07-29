import {
    HttpEvent,
    HttpHandler,
    HttpRequest,
    HttpErrorResponse,
    HttpInterceptor
} from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { NotificationsService } from 'angular2-notifications';
import { AuthService } from '../../auth/auth.service';
import { ATError } from 'src/app/shared/models/error';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { throwError } from 'rxjs/internal/observable/throwError';

@Injectable()
export class ErrorInterceptorService implements HttpInterceptor {
    constructor(
        private notificationsService: NotificationsService,
        private auth: AuthService
    ) { }
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request)
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    const errorMessage: ATError = error.error;
                    if (errorMessage.message && errorMessage.message.startsWith('Duplicate entry')) {
                        const matches = errorMessage.message.match(/'([^']+)'/);
                        errorMessage.message = `The '${matches[1]}' value is duplicated by another entity!`;
                    }
                    if (+error.status === 401) {
                        this.auth.logOut();
                    }
                    this.notificationsService.error(
                        `Ooops! ${error.status} code`,
                        errorMessage.message
                    );
                    return throwError(errorMessage);
                })
            );
    }
}
