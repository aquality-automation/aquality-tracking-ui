import { Injectable } from '@angular/core';
import { User } from '../shared/models/user';
import { LocalPermissions } from '../shared/models/LocalPermissions';
import { Project } from '../shared/models/project';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class GlobalDataService {
  currentUser: User;
  auditModule: boolean;
  localPermissions: LocalPermissions;
  loading = false;
  anyLocalPermissions: LocalPermissions[];
  currentProject: Project;
  public requestQuery = 0;
  public returnURL: string;
  public teamMember: boolean;
  public isLoaderShown: boolean;
  public showLoader: Subject<boolean> = new Subject<boolean>();

  constructor()  {
    this.showLoader.subscribe((value) => {
        this.isLoaderShown = value;
    });
}

  setLoaderVisibility(value: boolean) {
    this.showLoader.next(value);
  }

  Clear() {
    this.currentUser = undefined;
    this.auditModule = undefined;
    this.localPermissions = undefined;
    this.loading = false;
    this.anyLocalPermissions = undefined;
    this.currentProject = undefined;
    this.requestQuery = 0;
    this.returnURL = undefined;
    this.teamMember = undefined;
  }
}
