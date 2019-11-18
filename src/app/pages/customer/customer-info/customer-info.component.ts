import { Component, OnInit } from '@angular/core';
import { CustomerService } from '../../../services/customer.service';
import { SimpleRequester } from '../../../services/simple-requester';
import { Router, ActivatedRoute } from '@angular/router';
import { Customer } from '../../../shared/models/customer';
import { User } from '../../../shared/models/user';
import { UserService } from '../../../services/user.services';
import { Project } from '../../../shared/models/project';
import { ProjectService } from '../../../services/project.service';
import { TransformationsService } from '../../../services/transformations.service';

@Component({
    templateUrl: 'customer-info.component.html',
    styleUrls: ['customer-info.component.css'],
    providers: [
        CustomerService,
        SimpleRequester,
        UserService,
        TransformationsService
    ]
})
export class CustomerInfoComponent implements OnInit {
    customer: Customer;
    coordinators: User[];
    accountManagers: User[];
    URL;
    canEdit: boolean;
    users: User[];
    public columns;
    public defSort = { property: 'name', order: 'desc' };

    constructor(
        private userService: UserService,
        public route: ActivatedRoute,
        private router: Router,
        private customerService: CustomerService,
        private projectService: ProjectService
    ) { }

    ngOnInit() {
        this.URL = `/customer/attachment?customer_id=${this.route.snapshot.params['customer_id']}`;
        this.userService.getUsers({ unit_coordinator: 1 }).subscribe(result => {
            this.coordinators = result.filter(x => x.unit_coordinator === 1);
        });
        this.userService.getUsers({}).subscribe(result => {
            this.users = result;
        });
        this.customerService.getCustomer(+this.route.snapshot.params['customer_id'], true).subscribe(res => {
            this.customer = res[0];
            this.columns = [
                { name: 'Name', property: 'name', filter: true, sorting: true, type: 'text', editable: this.userService.IsAdmin() },
                { name: 'Created', property: 'created', filter: true, sorting: true, type: 'date', editable: false, class: 'ft-date-width' }
            ];
        });
        this.canEdit = this.userService.IsUnitCoordinator() || this.userService.IsHead();
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

    getProjects() {
        this.customerService.getCustomer(+this.route.snapshot.params['customer_id'], true).subscribe(customers =>
            this.customer.projects = customers[0].projects);
    }

    updateCustomer() {
        this.customerService.createOrUpdateCustomer(this.customer).subscribe(res => {
            this.customerService.handleSuccess('Customer was saved.');
        });
    }

    nameError(event) {
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
