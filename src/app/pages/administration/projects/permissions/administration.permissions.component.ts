import { Component, OnInit } from '@angular/core';
import { Project } from '../../../../shared/models/project';
import { User } from '../../../../shared/models/user';
import { LocalPermissions } from 'src/app/shared/models/local-permissions';
import { TFColumn, TFColumnType } from 'src/app/elements/table-filter/tfColumn';
import { ProjectService } from 'src/app/services/project/project.service';
import { UserService } from 'src/app/services/user/user.services';

@Component({
  templateUrl: './administration.permissions.component.html'
})
export class AdministrationPermissionsComponent implements OnInit {

  hideModal = true;
  removeModalTitle: string;
  removeModalMessage: string;
  permissionsToRemove: LocalPermissions;
  projects: Project[];
  public selectedProject: Project;
  public projectUsers: LocalPermissions[];
  public externalUsers: User[];
  public tbCols: TFColumn[];

  constructor(
    private projectService: ProjectService,
    public userService: UserService
  ) {
  }

  async ngOnInit() {
    this.projects = await this.projectService.getProjects({});
    this.selectedProject = this.projects[0];
    this.projectUsers = await this.userService.getProjectUsers(this.selectedProject.id);
    this.externalUsers = await this.userService.getUsers({});
    this.tbCols = [
      {
        name: 'Username',
        property: 'user',
        filter: true,
        sorting: true,
        type: TFColumnType.autocomplete,
        lookup: {
          propToShow: ['user_name'],
          values: this.externalUsers,
        },
        creation: {
          required: true
        }
      },
      {
        name: 'Admin', property: 'admin', filter: true, sorting: true, type: TFColumnType.checkbox, editable: true,
        creation: {
          required: true
        }
      },
      {
        name: 'Manager', property: 'manager', filter: true, sorting: true, type: TFColumnType.checkbox, editable: true,
        creation: {
          required: true
        }
      },
      {
        name: 'Engineer', property: 'engineer', filter: true, sorting: true, type: TFColumnType.checkbox, editable: true,
        creation: {
          required: true
        }
      }
    ];
  }

  onProjectChange(newProject: Project) {
    this.selectedProject = newProject;
    this.reloadUsers();
  }

  handleAction(event: { action: string; entity: LocalPermissions; }) {
    if (event.action === 'create') {
      this.createUser(event.entity);
    } else if (event.action === 'remove') {
      this.removeUser(event.entity);
    }
  }

  async updateUser(permissions: LocalPermissions): Promise<boolean> {
    try {
      await this.userService.createOrUpdateProjectUser(this.castPermissionsToFlatObject(permissions));
      this.reloadUsers();
      return true;
    } catch (error) {
      this.userService.handleSimpleError('Oops!', 'Was not able to update Permissions!');
      return false;
    }
  }

  async createUser(permissions: LocalPermissions) {
    permissions.project_id = this.selectedProject.id;
    if (await this.updateUser(permissions)) {
      for (const prop of Object.keys(permissions)) {
        delete permissions[prop];
      }
    }
  }

  castPermissionsToFlatObject(permissions: LocalPermissions): LocalPermissions {
    return {
      user_id: permissions.user.id,
      project_id: permissions.project_id,
      admin: +permissions.admin,
      manager: +permissions.manager,
      engineer: +permissions.engineer
    };
  }

  removeUser($event: LocalPermissions) {
    this.permissionsToRemove = $event;
    this.removeModalTitle = `Remove Permissions: ${$event.user.user_name}`;
    this.removeModalMessage =
      `Are you sure that you want to delete the '${$event.user.user_name}' permissions? This action cannot be undone.`;
    this.hideModal = false;
  }

  async reloadUsers() {
    this.projectUsers = await this.userService.getProjectUsers(this.selectedProject.id);
    const allUsers = await this.userService.getUsers({});
    this.externalUsers = allUsers.filter(x => this.projectUsers.findIndex(y => y.user.user_name === x.user_name) === -1);
  }

  async execute($event) {
    if (await $event) {
      await this.userService.removeProjectUser(this.permissionsToRemove);
      this.reloadUsers();
    }
    this.hideModal = true;
  }

  wasClosed() {
    this.hideModal = true;
  }
}
