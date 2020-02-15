import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../../services/project.service';
import { SimpleRequester } from '../../../services/simple-requester';
import { Project } from '../../../shared/models/project';
import { UserService } from '../../../services/user.services';
import { Router } from '@angular/router';
import { User } from '../../../shared/models/user';
import { Customer } from '../../../shared/models/customer';
import { CustomerService } from '../../../services/customer.service';
import { GlobalDataService } from '../../../services/globaldata.service';
import { TFColumn, TFColumnType } from '../../../elements/table/tfColumn';
import { PermissionsService, EGlobalPermissions } from '../../../services/current-permissions.service';

@Component({
  templateUrl: './project.component.html',
  providers: [
    ProjectService,
    SimpleRequester,
    GlobalDataService,
  ]
})
export class ProjectComponent implements OnInit {
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
  public defSort = { property: 'name', order: 'desc' };

  constructor(
    private permissions: PermissionsService,
    private projectService: ProjectService,
    public userService: UserService,
    private router: Router,
    private customerService: CustomerService
  ) { }

  async ngOnInit() {
    this.canCreate = await this.permissions.hasPermissions([EGlobalPermissions.admin]);
    this.projects = await this.projectService.getProjects(this.project).toPromise();
    this.users = await this.userService.getUsers({ unit_coordinator: 1 }).toPromise();
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
      this.projectService.removeProject(this.projectToRemove).subscribe(() =>
        this.projects = this.projects.filter(x => x.id !== this.projectToRemove.id));
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
      this.customerService.getCustomer().subscribe(res => {
        this.customers = res;
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
              entity: 'customer',
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
              entity: 'customer.coordinator',
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
            class: 'ft-date-width'
          }
        ];
      });
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
            entity: 'customer',
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
            entity: 'customer.coordinator',
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
