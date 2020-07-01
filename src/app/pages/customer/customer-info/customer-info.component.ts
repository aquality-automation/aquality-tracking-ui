import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Customer } from '../../../shared/models/customer';
import { User } from '../../../shared/models/user';
import { Project } from '../../../shared/models/project';
import { TFColumn, TFOrder, TFColumnType } from 'src/app/elements/table-filter/tfColumn';
import { PermissionsService, EGlobalPermissions } from 'src/app/services/permissions/current-permissions.service';
import { UserService } from 'src/app/services/user/user.services';
import { CustomerService } from 'src/app/services/customer/customer.service';
import { ProjectService } from 'src/app/services/project/project.service';

@Component({
    templateUrl: 'customer-info.component.html',
    styleUrls: ['customer-info.component.scss']
})
export class CustomerInfoComponent implements OnInit {
    customer: Customer;
    coordinators: User[];
    accountManagers: User[];
    URL: string;
    canEdit: boolean;
    users: User[];
    allowCreate: boolean;
    public columns: TFColumn[];
    public defSort = { property: 'name', order: TFOrder.desc };

    constructor(
        private permissions: PermissionsService,
        private userService: UserService,
        public route: ActivatedRoute,
        private router: Router,
        private customerService: CustomerService,
        private projectService: ProjectService
    ) { }

    async ngOnInit() {
        this.URL = `/customer/attachment?customer_id=${this.route.snapshot.params.customer_id}`;
        const isAdmin = await this.permissions.hasPermissions([EGlobalPermissions.admin]);
        this.users = await this.userService.getUsers({});
        this.coordinators = this.users.filter(user => user.unit_coordinator === 1);
        this.customer = (await this.customerService.getCustomer(+this.route.snapshot.params.customer_id, true))[0];
        this.columns = [
            {
                name: 'Name', property: 'name', filter: true,
                sorting: true, type: TFColumnType.text, editable: isAdmin,
                creation: {
                    required: true
                }
            },
            {
                name: 'Created', property: 'created', filter: true, sorting: true, type: TFColumnType.date, class: 'ft-date-width'
            }
        ];
        this.canEdit = await this.permissions.hasPermissions([EGlobalPermissions.unit_coordinator, EGlobalPermissions.head]);
        this.allowCreate = await this.permissions.hasPermissions([EGlobalPermissions.admin, EGlobalPermissions.manager]);
    }

    handleAction($event) {
        if ($event.action === 'create') {
            this.createProject($event.entity);
        }
    }

    rowClicked($event) {
        this.router.navigate([`/project/${$event.id}`]);
    }

    async createProject(event: Project) {
        event.customer = this.customer;
        await this.projectService.createProjects(event);
        for (const prop of Object.keys(event)) {
            delete event[prop];
        }
        this.getProjects();
    }

    async getProjects() {
        this.customer.projects = (await this.customerService.getCustomer(this.customer.id,  true))[0].projects;
    }

    async updateCustomer() {
        await this.customerService.createOrUpdateCustomer(this.customer);
        this.customerService.handleSuccess('Customer was saved.');
    }

    nameError() {
        this.customerService.handleSimpleError('Name is invalid', 'Customer name can\'t be empty or less than 3 symbols!');
    }

    IsFormValid() {
        return this.customer.coordinator && this.customer.name;
    }

    async updateProj(project: Project) {
        try {
            await this.projectService.createProjects({ id: project.id, name: project.name, customer: project.customer });
            this.projectService.handleSuccess(`${project.name} was updated.`);
        } catch (err) {
            this.getProjects();
        }
    }
}
