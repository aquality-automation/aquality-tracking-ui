import { Component, OnInit } from '@angular/core';
import { Project } from '../../../../shared/models/project';
import { SimpleRequester } from '../../../../services/simple-requester';
import { ProjectService } from '../../../../services/project.service';
import { UserService } from '../../../../services/user.services';
import { LocalPermissions } from '../../../../shared/models/LocalPermissions';
import { User } from '../../../../shared/models/user';

@Component({
  templateUrl: './administration.permissions.component.html',
  providers: [
    ProjectService,
    SimpleRequester
  ]
})
export class AdministrationPermissionsComponent implements OnInit {

  hideModal = true;
  removeModalTitle: string;
  removeModalMessage: string;
  permissionsToRemove: LocalPermissions;
  projects: Project[];
  public selectedProject: Project;
  public users: LocalPermissions[];
  public externalUsers: User[];
  public tbCols: any[];

  constructor(
    private projectService: ProjectService,
    public userService: UserService
  ) {
  }

  async ngOnInit() {
    this.projects = await this.projectService.getProjects({}).toPromise();
    this.selectedProject = this.projects[0];
    this.users = await this.userService.getProjectUsers(this.selectedProject.id).toPromise();
    this.externalUsers = await this.userService.getUsers({}).toPromise();
    this.tbCols = [
      {
        name: 'Username',
        property: 'user.user_name',
        filter: true,
        sorting: true,
        type: 'lookup-autocomplete',
        propToShow: ['user_name'],
        entity: 'user',
        values: this.externalUsers,
        editable: false
      },
      { name: 'Admin', property: 'admin', filter: false, sorting: true, type: 'checkbox', editable: true },
      { name: 'Manager', property: 'manager', filter: false, sorting: true, type: 'checkbox', editable: true },
      { name: 'Engineer', property: 'engineer', filter: false, sorting: true, type: 'checkbox', editable: true }
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

  reloadUsers() {
    this.userService.getProjectUsers(this.selectedProject.id).subscribe(res => {
      this.users = res;
      this.userService.getUsers({}).subscribe((users: User[]) => {
        this.externalUsers = users.filter(x => this.users.findIndex(y => y.user.user_name === x.user_name) === -1);
      }, error => console.log(error));
    }, error => console.log(error));
  }

  async execute($event) {
    if (await $event) {
      this.userService.removeProjectUser(this.permissionsToRemove).subscribe(res => {
        this.reloadUsers();
      });
    }
    this.hideModal = true;
  }

  wasClosed($event) {
    this.hideModal = $event;
  }
}
