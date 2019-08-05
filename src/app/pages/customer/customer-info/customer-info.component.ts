import { Component, OnInit } from '@angular/core';
import { CustomerService } from '../../../services/customer.service';
import { SimpleRequester } from '../../../services/simple-requester';
import { Router, ActivatedRoute } from '@angular/router';
import { Customer, CustomerAttachment, CustomerComment } from '../../../shared/models/customer';
import { User } from '../../../shared/models/user';
import { UserService } from '../../../services/user.services';
import { BaseComment } from '../../../shared/models/general';
import { Project } from '../../../shared/models/project';
import { ProjectService } from '../../../services/project.service';
import { TransformationsService } from '../../../services/transformations.service';
import BlobUtils from '../../../shared/utils/blob.utils';

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
        this.userService.getUsersWithFilter({ unit_coordinator: 1 }).subscribe(result => {
            this.coordinators = result.filter(x => x.unit_coordinator === 1);
        });
        this.userService.getUsers().subscribe(result => {
            this.users = result;
        });
        this.userService.getUsersWithFilter({ account_manager: 1 }).subscribe(result => {
            this.accountManagers = result.filter(x => x.account_manager === 1);
        });
        this.customerService.getCustomer(+this.route.snapshot.params['customer_id'], true).subscribe(res => {
            this.customer = res[0];
            this.columns = [
                { name: 'Name', property: 'name', filter: true, sorting: true, type: 'text', editable: this.userService.IsAdmin() },
                { name: 'Created', property: 'created', filter: true, sorting: true, type: 'date', editable: false, class: 'ft-date-width' }
            ];
        });
        this.canEdit = this.userService.IsUnitCoordinator() || this.userService.IsHead() || this.userService.IsAccountManager();
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

    getAttachName(attach: CustomerAttachment) {
        return attach.path.split('\\').pop().split('/').pop();
    }

    getAttachments() {
        this.customerService.getCustomer(+this.route.snapshot.params['customer_id'], true).subscribe(customers =>
            this.customer.attachments = customers[0].attachments);
    }

    removeAttachment(id) {
        this.customerService.removeCustomerAttachment(id, this.customer.id).subscribe(res => {
            this.getAttachments();
        });
    }

    downloadAttach(attach) {
        this.customerService.downloadCustomerAttachment(attach.id, this.customer.id).subscribe(blob => {
            BlobUtils.download(blob, this.getAttachName(attach));
        }, () => this.getAttachments());
    }

    getComments() {
        this.customerService.getCustomer(+this.route.snapshot.params['customer_id'], true).subscribe(customers =>
            this.customer.comments = customers[0].comments);
    }

    getProjects() {
        this.customerService.getCustomer(+this.route.snapshot.params['customer_id'], true).subscribe(customers =>
            this.customer.projects = customers[0].projects);
    }

    addComment(comment: BaseComment) {
        const customerComment: CustomerComment = comment;
        customerComment.customer_id = this.customer.id;
        this.customerService.createOrUpdateCustomerComment(customerComment).subscribe(
            res => this.getComments()
        );
    }

    updateAccountTeam($event) {
        this.customer.account_team = $event;
    }

    updateCustomer() {
        this.customerService.updateAccountMembers(this.customer.id, this.customer.account_team).subscribe();
        this.customer.accounting = +this.customer.accounting;
        if (this.customer.accounting === 0) {
            this.customer.account_manager = undefined;
            this.customer.account_team = [];
        }
        this.customerService.createOrUpdateCustomer(this.customer).subscribe(res => {
            this.customerService.handleSuccess('Customer was saved.');
        });
    }

    nameError($event) {
        this.customerService.handleSimpleError('Name is invalid', 'Customer name can\'t be empty or less than 3 symbols!');
    }

    IsFormValid() {
        return this.customer.coordinator && (this.customer.accounting ? this.customer.account_manager : true) && this.customer.name;
    }

    async updateProj($event) {
        try {
            await this.projectService.createProjects({ id: $event.id, name: $event.name, customer: $event.customer });
            this.projectService.handleSuccess(`${$event.name} was updated.`);
        } catch (err) {
            this.getProjects();
        }
    }
}
