import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { NotificationsService } from 'angular2-notifications';
import { Router, ActivatedRoute } from '@angular/router';
import { GlobalDataService } from '../globaldata.service';
import { Subscription } from 'rxjs/internal/Subscription';

@Injectable()
export class BaseHttpService implements OnDestroy {

  protected projectSubscription: Subscription;
  protected currentProjectId: number;
  constructor(
    protected http: HttpClient,
    protected notificationsService: NotificationsService,
    protected router: Router,
    protected route: ActivatedRoute,
    protected globalData: GlobalDataService
  ) {
    this.projectSubscription = this.globalData.currentProject$.subscribe(project => {
      this.currentProjectId = project ? project.id : undefined;
    });
  }

  ngOnDestroy(): void {
    this.projectSubscription.unsubscribe();
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


  protected convertToParams(object: object): HttpParams | { [param: string]: string | string[]; } {
    if (!object) {
      return {};
    }
    return JSON.parse(JSON.stringify(this.clean(object)));
  }

  private clean(object: object) {
    for (const propName in object) {
      if (object[propName] === null || object[propName] === undefined) {
        delete object[propName];
      }
    }
    return object;
  }
}
