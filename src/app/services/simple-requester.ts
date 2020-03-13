import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, XHRBackend, Response, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import { CookieService } from 'angular2-cookie/core';
import { environment } from '../../environments/environment';
import { NotificationsService } from 'angular2-notifications';
import { Router, ActivatedRoute } from '@angular/router';
import { GlobalDataService } from './globaldata.service';

@Injectable()
export class SimpleRequester extends Http {
  public pendingRequests = 0;
  public showLoading = false;
  public withChildsQP = 'withChildren=1';
  public api: string = environment.host ? environment.host : `${location.origin}/api`;

  constructor(
    protected route: ActivatedRoute,
    private notificationsService: NotificationsService,
    private backend: XHRBackend,
    private defaultOptions: RequestOptions,
    protected globaldata: GlobalDataService,
    protected router: Router,
    protected cookieService: CookieService) {
    super(backend, defaultOptions);
  }

  public isAuthHeaderExists() {
    return !!this.cookieService.get('iio78');
  }

  public handleError(err) {
    let errorMessage: string = err.headers.get('errormessage');
    if (errorMessage.startsWith('Duplicate entry')) {
      const matches = errorMessage.match(/'([^']+)'/);
      errorMessage = `The '${matches[1]}' value is duplicated by another entity!`;
    }
    if (+err.status === 401) {
      this.cookieService.remove('iio78');
    }
    this.notificationsService.error(
      `Ooops! ${err.status} code`,
      errorMessage
    );
  }

  public handleSimpleError(header: string, message: string) {
    this.notificationsService.error(
      header,
      message
    );
  }

  public handleWarning(header: string, message: string) {
    this.notificationsService.warn(
      header, message
    );
  }

  public handleSuccess(message: string) {
    this.notificationsService.success(
      `Successful`,
      message
    );
  }

  public handleInfo(message: string) {
    this.notificationsService.info(
      `Information`,
      message
    );
  }

  protected doPost(url: string, object?, params: { [key: string]: any | any[]; } = null, showLoading: boolean = false) {
    let jsonString = JSON.stringify(object);
    if (typeof jsonString === 'undefined') { jsonString = '{}'; }
    const headers = new Headers();
    this.createAuthorizationHeader(headers);
    return this.intercept(super.post(this.api + url, jsonString, { headers: headers, params }), showLoading);
  }

  protected doPut(url: string, object?) {
    let jsonString = JSON.stringify(object);
    if (typeof jsonString === 'undefined') { jsonString = '{}'; }
    const headers = new Headers();
    this.createAuthorizationHeader(headers);
    return this.intercept(super.put(this.api + url, jsonString, { headers: headers }), true);
  }

  protected doDelete(url: string, params: { [key: string]: any | any[]; } = null) {
    const headers = new Headers();
    this.createAuthorizationHeader(headers);
    return this.intercept(super.delete(this.api + url, { headers, params }), false);
  }

  protected doPostFiles(url: string, fileList: File[], params: { [key: string]: any | any[]; }) {
    this.turnOnModal();
    const formData: FormData = new FormData();
    let i = 0;
    for (const file of fileList) {
      formData.append('uploadFile' + i, file, file.name);
      i++;
    }
    const headers = new Headers();
    this.createAuthorizationHeader(headers);
    return this.intercept(super.post(this.api + url, formData, { headers: headers, params: params }), true);
  }

  protected doGetWithoutAuthHeader(url: string) {
    return this.intercept(super.get(this.api + url), false);
  }

  protected doGet(url: string, params: { [key: string]: any | any[]; } = null, showLoading: boolean = false, handleError: boolean = true) {
    const headers = new Headers();
    this.createAuthorizationHeader(headers);
    return this.intercept(super.get(this.api + url, { headers: headers, params: params }), showLoading, handleError);
  }

  protected doDownload(url: string) {
    const headers = new Headers();
    this.createAuthorizationHeader(headers);
    return this.intercept(super.get(this.api + url, { headers: headers, responseType: ResponseContentType.Blob }), false);
  }

  private createAuthorizationHeader(headers: Headers) {
    if (this.cookieService.get('iio78')) {
      headers.append('Authorization', 'Basic ' + this.cookieService.get('iio78'));
    }
  }

  private intercept(observable: Observable<Response>, showLoading: boolean, handleError: boolean = true): Observable<Response> {
    if (showLoading) {
      this.globaldata.requestQuery++;
      this.turnOnModal();
    }
    return observable
      .catch((err, source) => {
        if (handleError) {
          this.handleError(err);
        }
        return Observable.throw(err.statusText);
      })
      .do((res: Response) => {
      }, (err: any) => { })
      .finally(() => {
        const timer = Observable.timer(1);
        timer.subscribe(t => {
          if (showLoading) {
            this.globaldata.requestQuery--;
            this.turnOffModal();
          }
        });
      });
  }

  private turnOnModal() {
    this.globaldata.setLoaderVisibility(true);
  }

  private turnOffModal() {
    if (this.globaldata.requestQuery === 0) {
      this.globaldata.setLoaderVisibility(false);
    }
  }
}
