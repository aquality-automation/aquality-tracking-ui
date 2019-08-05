import { Injectable } from '@angular/core';
import { User } from '../shared/models/user';
import { LocalPermissions } from '../shared/models/LocalPermissions';
import { Project } from '../shared/models/project';

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
