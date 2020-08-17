import { Injectable } from '@angular/core';
import { Project } from '../shared/models/project';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Subject } from 'rxjs/internal/Subject';
import { environment } from 'src/environments/environment';

@Injectable()
export class GlobalDataService {
  private currentProjectSource = new BehaviorSubject<Project>({});
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
    this.auditModule = undefined;
    this.loading = false;
    this.requestQuery = 0;
    this.returnURL = undefined;
    this.teamMember = undefined;
  }

  getApiUrl() {
    return environment.host ? environment.host : `${location.origin}/api`;
  }
}
