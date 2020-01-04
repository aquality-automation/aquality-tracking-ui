import { Component } from '@angular/core';
import { Project } from '../../../shared/models/project';
import { SimpleRequester } from '../../../services/simple-requester';
import { ProjectService } from '../../../services/project.service';
import { UserService } from '../../../services/user.services';
import { CurrentPermissionsService, Permissions } from '../../../services/current-permissions.service';

@Component({
  templateUrl: './administration.component.html',
  styleUrls: ['administration.component.css'],
  providers: [
    ProjectService,
    SimpleRequester,
    UserService,
  ]
})
export class AdministrationComponent {
  projects: Project[];
  project: Project;

  constructor(
    private projectService: ProjectService,
    public userService: UserService,
    private permissionsService: CurrentPermissionsService
  ) {
    this.projectService.getProjects(this.project).subscribe(result => {
      this.projects = result;
    }, error => this.projectService.handleError(error));
  }

  IsAdmin(): boolean {
    return this.permissionsService.IsAdmin();
  }

  IsGlobalEditor(): boolean {
    return this.permissionsService.IsManager() || this.permissionsService.IsAdmin();
  }

  async IsLocalManager(): Promise<boolean> {
    const local = await this.permissionsService.hasLocalPermissions([Permissions.admin, Permissions.manager]);
    return this.permissionsService.IsManager() || this.permissionsService.IsAdmin() || local;
  }

  async IsLocalEditor(): Promise<boolean> {
    return this.IsGlobalEditor() || await this.permissionsService.isLocalEngineer();
  }
}
