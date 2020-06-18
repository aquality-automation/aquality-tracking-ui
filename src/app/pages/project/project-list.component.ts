import { Component, OnInit } from '@angular/core';
import { Customer } from 'src/app/shared/models/customer';
import { Project } from 'src/app/shared/models/project';
import { TFColumn, TFOrder, TFColumnType } from 'src/app/elements/table-filter/tfColumn';
import { User } from 'src/app/shared/models/user';
import { PermissionsService, EGlobalPermissions } from 'src/app/services/permissions/current-permissions.service';
import { ProjectService } from 'src/app/services/project/project.service';
import { UserService } from 'src/app/services/user/user.services';
import { Router } from '@angular/router';
import { CustomerService } from 'src/app/services/customer/customer.service';

@Component({
  templateUrl: './project-list.component.html',
  providers: [CustomerService]
})
export class ProjectListComponent implements OnInit {
  canCreate: boolean;
  hideModal = true;
  removeModalTitle: string;
  removeModalMessage: string;
  customers: Customer[];
  projects: Project[];
  project: Project;
  projectToRemove: Project;
  columns: TFColumn[];
  users: User[];
  public defSort = { property: 'name', order: TFOrder.desc };

  constructor(
    private permissions: PermissionsService,
    private projectService: ProjectService,
    public userService: UserService,
    private router: Router,
    private customerService: CustomerService
  ) { }

  async ngOnInit() {
    this.canCreate = await this.permissions.hasPermissions([EGlobalPermissions.admin]);
    this.projects = await this.projectService.getProjects(this.project);
    this.users = await this.userService.getUsers({ unit_coordinator: 1 });
    await this.buildColumns();
  }

  rowClicked(project: Project) {
    this.router.navigate([`/project/${project.id}`]);
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
      await this.projectService.removeProject(this.projectToRemove);
      this.projects = this.projects.filter(x => x.id !== this.projectToRemove.id);
    }
    this.hideModal = true;
  }

  wasClosed() {
    this.hideModal = true;
  }

  private async buildColumns() {
    const extended = await this.permissions
      .hasPermissions([EGlobalPermissions.admin, EGlobalPermissions.head, EGlobalPermissions.manager, EGlobalPermissions.unit_coordinator]);
    const admin = await this.permissions.hasPermissions([EGlobalPermissions.admin]);

    if (extended) {
      this.customers = await this.customerService.getCustomer();
      this.columns = [
        {
          name: 'Name',
          property: 'name',
          filter: true,
          sorting: true,
          type: TFColumnType.text,
          editable: admin
        },
        {
          name: 'Customer',
          property: 'customer',
          lookup: {
            values: this.customers,
            propToShow: ['name'],
          },
          filter: true,
          type: TFColumnType.autocomplete,
          editable: extended,
          class: 'fit'
        },
        {
          name: 'Unit Coordinator',
          property: 'customer.coordinator',
          lookup: {
            values: this.users,
            propToShow: ['first_name', 'second_name'],
          },
          filter: true,
          type: TFColumnType.autocomplete,
          class: 'fit'
        },
        {
          name: 'Created',
          property: 'created',
          filter: true,
          sorting: true,
          type: TFColumnType.date,
          class: 'fit'
        }
      ];
    } else {
      this.columns = [
        {
          name: 'Name',
          property: 'name',
          filter: true,
          sorting: true,
          type: TFColumnType.text,
        },
        {
          name: 'Customer',
          property: 'customer',
          lookup: {
            values: this.customers,
            propToShow: ['name'],
          },
          type: TFColumnType.autocomplete,
          class: 'fit'
        },
        {
          name: 'Unit Coordinator',
          property: 'customer.coordinator',
          lookup: {
            values: this.users,
            propToShow: ['first_name', 'second_name'],
          },
          filter: true,
          type: TFColumnType.autocomplete,
          class: 'fit'
        },
        { name: 'Created', property: 'created', filter: true, sorting: true, type: TFColumnType.date, class: 'ft-date-width' }
      ];
    }
  }
}
