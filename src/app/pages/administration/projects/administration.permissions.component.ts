import { Component } from '@angular/core';
import { Project } from '../../../shared/models/project';
import { SimpleRequester } from '../../../services/simple-requester';
import { ProjectService } from '../../../services/project.service';
import { UserService } from '../../../services/user.services';
import { LocalPermissions } from '../../../shared/models/LocalPermissions';
import { User } from '../../../shared/models/user';

@Component({
  templateUrl: './administration.permissions.component.html',
  providers: [
    ProjectService,
    SimpleRequester
  ]
})
export class AdministrationPermissionsComponent {

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
    this.projectService.getProjects({}).subscribe(result => {
      this.projects = result;
      this.selectedProject = this.projects[0];
      this.userService.getProjectUsers(this.selectedProject.id).subscribe(res => {
        this.users = res;
        this.userService.getUsers().subscribe(users => {
          this.externalUsers = users;
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
        }, error => console.log(error));
      }, error => console.log(error));
    }, error => console.log(error));
  }

  onProjectChange($event) {
    this.selectedProject = $event;
    this.reloadUsers();
  }

  handleAction($event) {
    if ($event.action === 'create') {
      this.createUser($event.entity);
    } else if ($event.action === 'remove') {
      this.removeUser($event.entity);
    }
  }

  updateUser($event) {
    this.userService.createOrUpdateProjectUser({
      user_id: $event.user.id,
      project_id: $event.project_id,
      admin: +$event.admin,
      manager: +$event.manager,
      engineer: +$event.engineer,
      viewer: +$event.viewer
    }).subscribe(res => {
      this.reloadUsers();
    });

  }

  createUser(user) {
    this.userService.createOrUpdateProjectUser({
      user_id: user.user.id,
      project_id: this.selectedProject.id,
      admin: user.admin === true ? 1 : 0,
      manager: user.manager === true ? 1 : 0,
      engineer: user.engineer === true ? 1 : 0
    }).subscribe(
      res => {
        for (const prop of Object.keys(user)) {
          delete user[prop];
        }
        this.reloadUsers();
      }
    );
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
      this.userService.getUsers().subscribe((users: User[]) => {
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
