import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { GlobalDataService } from '../../globaldata.service';
import { finalize } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';

@Injectable()
export class LoaderInterceptorService implements HttpInterceptor {

  constructor(
    protected globaldata: GlobalDataService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let delayExpired = false;

    const timeout = setTimeout(() => {
      delayExpired = true;
      this.turnOnModal();
    }, 500);

    return next.handle(req).pipe(
      finalize(() => {
        clearTimeout(timeout);
        if (delayExpired) {
          this.turnOffModal();
        }
      }));
  }

  private turnOnModal() {
    this.globaldata.requestQuery++;
    this.globaldata.setLoaderVisibility(true);
  }

  private turnOffModal() {
    this.globaldata.requestQuery--;
    if (this.globaldata.requestQuery === 0) {
      this.globaldata.setLoaderVisibility(false);
    }
  }
}
