import { Component, OnInit } from '@angular/core';
import { Project } from '../../../shared/models/project';
import { ProjectService } from 'src/app/services/project/project.service';
import { ELocalPermissions, PermissionsService, EGlobalPermissions } from 'src/app/services/permissions/current-permissions.service';
import { UserService } from 'src/app/services/user/user.services';
import { ProjectSettingItem } from '../projects/project-setting-item';

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

  projectSettingItems: ProjectSettingItem[] = [
    { id: 'projectSettings-administration', name: 'Settings', routerLink: 'project/projectSettings' },
    { id: 'permissions-administration', name: 'Permissions', routerLink: 'project/permissions' },
    { id: 'resolutions-administration', name: 'Resolutions', routerLink: 'project/resolutions' },
    { id: 'body-pattern-administration', name: 'Unique Body Patterns', routerLink: 'project/importBodyPatterns' },
    { id: 'api-token-administration', name: 'API Token', routerLink: 'project/apiToken' },
    { id: 'integrations-administration', name: 'Integrations', routerLink: 'project/integrations' }
  ]

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
