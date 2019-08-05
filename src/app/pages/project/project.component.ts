import { Component } from '@angular/core';
import { ProjectService } from '../../services/project.service';
import { SimpleRequester } from '../../services/simple-requester';
import { Project } from '../../shared/models/project';
import { UserService } from '../../services/user.services';
import { Router } from '@angular/router';
import { User } from '../../shared/models/user';
import { Customer } from '../../shared/models/customer';
import { CustomerService } from '../../services/customer.service';
import { GlobalDataService } from '../../services/globaldata.service';

@Component({
  templateUrl: './project.component.html',
  providers: [
    ProjectService,
    SimpleRequester,
    GlobalDataService,
  ]
})
export class ProjectComponent {
  hideModal = true;
  removeModalTitle: string;
  removeModalMessage: string;
  customers: Customer[];
  projects: Project[];
  project: Project;
  projectToRemove: Project;
  columns;
  users: User[];
  public defSort = { property: 'name', order: 'desc' };

  constructor(
    private projectService: ProjectService,
    public userService: UserService,
    private router: Router,
    private customerService: CustomerService
  ) {
    this.projectService.getProjects(this.project).subscribe(projects => {
      this.projects = projects;
      this.userService.getUsersWithFilter({ unit_coordinator: 1 }).subscribe(result => {
        this.users = result;
        if (userService.IsAdmin() || userService.IsHead() || userService.IsManager() || userService.IsUnitCoordinator()) {
          this.customerService.getCustomer().subscribe(res => {
            this.customers = res;
            this.columns = [
              { name: 'Name', property: 'name', filter: true, sorting: true, type: 'text', editable: this.userService.IsAdmin() },
              {
                name: 'Customer',
                property: 'customer',
                entity: 'customer',
                filter: true,
                type: 'lookup-autocomplete',
                propToShow: ['name'],
                editable: userService.IsAdmin() || userService.IsHead() || userService.IsManager() || userService.IsUnitCoordinator(),
                values: this.customers,
                class: 'fit'
              },
              {
                name: 'Unit Coordinator',
                property: 'customer.coordinator',
                entity: 'customer.coordinator',
                filter: true,
                type: 'lookup-autocomplete',
                propToShow: ['first_name', 'second_name'],
                editable: false,
                values: this.users,
                class: 'fit'
              },
              { name: 'Created', property: 'created', filter: true, sorting: true, type: 'date', editable: false, class: 'ft-date-width' }
            ];
          });
        } else {
          this.columns = [
            { name: 'Name', property: 'name', filter: true, sorting: true, type: 'text', editable: this.userService.IsAdmin() },
            {
              name: 'Customer',
              property: 'customer',
              entity: 'customer',
              filter: false,
              type: 'lookup-autocomplete',
              propToShow: ['name'],
              editable: false,
              class: 'fit'
            },
            {
              name: 'Unit Coordinator',
              property: 'customer.coordinator',
              entity: 'customer.coordinator',
              filter: true,
              type: 'lookup-autocomplete',
              propToShow: ['first_name', 'second_name'],
              editable: false,
              values: this.users,
              class: 'fit'
            },
            { name: 'Created', property: 'created', filter: true, sorting: true, type: 'date', editable: false, class: 'ft-date-width' }
          ];
        }
      });
    }, error => console.log(error));
  }

  rowClicked($event) {
    this.router.navigate([`/project/${$event.id}`]);
  }

  async updateProj($event) {
    await this.projectService.createProjects({ id: $event.id, name: $event.name, customer: $event.customer });
    this.projectService.handleSuccess(`${$event.name} was updated.`);
  }

  handleAction($event) {
    if ($event.action === 'remove') {
      this.removeProject($event.entity);
    }
  }

  removeProject(project: Project) {
    this.projectToRemove = project;
    this.removeModalTitle = `Remove Project: ${project.name}`;
    this.removeModalMessage = `Are you sure that you want to delete the '${project.name}' project? This action cannot be undone.`;
    this.hideModal = false;
  }

  async execute($event) {
    if (await $event) {
      this.projectService.removeProject(this.projectToRemove).subscribe(() =>
        this.projects = this.projects.filter(x => x.id !== this.projectToRemove.id));
    }
    this.hideModal = true;
  }

  wasClosed($event) {
    this.hideModal = $event;
  }
}
