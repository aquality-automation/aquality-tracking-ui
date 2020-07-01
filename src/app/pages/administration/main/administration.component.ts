import { Component, OnInit } from '@angular/core';
import { Project } from '../../../shared/models/project';
import { ProjectService } from 'src/app/services/project/project.service';
import { ELocalPermissions, PermissionsService, EGlobalPermissions } from 'src/app/services/permissions/current-permissions.service';
import { UserService } from 'src/app/services/user/user.services';

@Component({
  templateUrl: './administration.component.html',
  styleUrls: ['administration.component.scss'],
})
export class AdministrationComponent implements OnInit {
  projects: Project[];
  project: Project;
  globalEditor: boolean;
  admin: boolean;
  localManager: boolean;
  localEditor: boolean;

  constructor(
    private projectService: ProjectService,
    public userService: UserService,
    private permissionsService: PermissionsService
  ) { }


  async ngOnInit() {
    this.projects = await this.projectService.getProjects(this.project);
    this.globalEditor = await this.permissionsService.hasPermissions([EGlobalPermissions.admin, EGlobalPermissions.manager]);
    this.admin = await this.permissionsService.hasPermissions([EGlobalPermissions.admin]);
    this.localEditor = await this.permissionsService.hasPermissions([EGlobalPermissions.manager, EGlobalPermissions.admin],
      [ELocalPermissions.admin, ELocalPermissions.manager, ELocalPermissions.engineer]);
    this.localManager = await this.permissionsService.hasPermissions([EGlobalPermissions.manager, EGlobalPermissions.admin],
      [ELocalPermissions.admin, ELocalPermissions.manager]);
  }
}
