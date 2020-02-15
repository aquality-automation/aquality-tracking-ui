import { Component, OnInit } from '@angular/core';
import { Project } from '../../../shared/models/project';
import { SimpleRequester } from '../../../services/simple-requester';
import { ProjectService } from '../../../services/project.service';
import { UserService } from '../../../services/user.services';
import { PermissionsService, ELocalPermissions, EGlobalPermissions } from '../../../services/current-permissions.service';

@Component({
  templateUrl: './administration.component.html',
  styleUrls: ['administration.component.css'],
  providers: [
    ProjectService,
    SimpleRequester,
    UserService,
  ]
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
  ) {
    this.projectService.getProjects(this.project).subscribe(result => {
      this.projects = result;
    }, error => this.projectService.handleError(error));
  }

  async ngOnInit() {
    this.globalEditor = await this.permissionsService.hasPermissions([EGlobalPermissions.admin, EGlobalPermissions.manager]);
    this.admin = await this.permissionsService.hasPermissions([EGlobalPermissions.admin]);
    this.localEditor = await this.permissionsService.hasPermissions([EGlobalPermissions.manager, EGlobalPermissions.admin],
      [ELocalPermissions.admin, ELocalPermissions.manager, ELocalPermissions.engineer]);
    this.localManager = await this.permissionsService.hasPermissions([EGlobalPermissions.manager, EGlobalPermissions.admin],
      [ELocalPermissions.admin, ELocalPermissions.manager]);
  }
}
