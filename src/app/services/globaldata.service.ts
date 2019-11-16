import { Injectable } from '@angular/core';
import { User } from '../shared/models/user';
import { LocalPermissions } from '../shared/models/LocalPermissions';
import { Project } from '../shared/models/project';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class GlobalDataService {
  private currentProjectSource = new Subject<Project>();
  currentUser: User;
  auditModule: boolean;
  localPermissions: LocalPermissions;
  loading = false;
  anyLocalPermissions: LocalPermissions[];
  public requestQuery = 0;
  public returnURL: string;
  public teamMember: boolean;
  public isLoaderShown: boolean;
  public showLoader: Subject<boolean> = new Subject<boolean>();
  currentProject$ = this.currentProjectSource.asObservable();

  constructor()  {
    this.showLoader.subscribe((value) => {
        this.isLoaderShown = value;
    });
}

  setLoaderVisibility(value: boolean) {
    this.showLoader.next(value);
  }

  announceCurrentProject(project: Project) {
    this.currentProjectSource.next(project);
  }

  Clear() {
    this.currentUser = undefined;
    this.auditModule = undefined;
    this.localPermissions = undefined;
    this.loading = false;
    this.anyLocalPermissions = undefined;
    this.requestQuery = 0;
    this.returnURL = undefined;
    this.teamMember = undefined;
  }
}
