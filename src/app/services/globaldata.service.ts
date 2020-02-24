import { Injectable } from '@angular/core';
import { User } from '../shared/models/user';
import { Project } from '../shared/models/project';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class GlobalDataService {
  private currentProjectSource = new BehaviorSubject<Project>({});
  currentUser: User;
  auditModule: boolean;
  loading = false;
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

  clear() {
    this.currentUser = undefined;
    this.auditModule = undefined;
    this.loading = false;
    this.requestQuery = 0;
    this.returnURL = undefined;
    this.teamMember = undefined;
  }
}
