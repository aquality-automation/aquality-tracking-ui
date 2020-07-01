import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Customer } from '../../../shared/models/customer';
import { User } from '../../../shared/models/user';
import { TFOrder, TFColumn, TFColumnType } from 'src/app/elements/table-filter/tfColumn';
import { UserService } from 'src/app/services/user/user.services';
import { CustomerService } from 'src/app/services/customer/customer.service';
import { PermissionsService, EGlobalPermissions } from 'src/app/services/permissions/current-permissions.service';

@Component({
    templateUrl: 'customer.component.html',
    styleUrls: ['customer.component.scss']
})
export class CustomerComponent implements OnInit {
    customers: Customer[];
    coordinators: User[];
    accountManagers: User[];
    users: User[];
    defSort = { property: 'name', order: TFOrder.desc };
    columns: TFColumn[];
    customerToRemove: Customer;
    hideModal = true;
    removeModalTitle: string;
    removeModalMessage: string;
    allowCreate: boolean;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        public userService: UserService,
        public customerService: CustomerService,
        private permissions: PermissionsService
    ) { }

    async ngOnInit() {
        this.allowCreate = await this.permissions.hasPermissions([EGlobalPermissions.head, EGlobalPermissions.unit_coordinator]);
        this.customers = await this.customerService.getCustomer(undefined, true);
        this.users = await this.userService.getUsers({});
        this.coordinators = this.users.filter(x => x.unit_coordinator === 1);
        this.accountManagers = this.users.filter(x => x.account_manager === 1);
        this.columns = [
            { name: 'Customer Name', property: 'name', filter: true, sorting: true, type: TFColumnType.text },
            {
                name: 'Unit Coordinator',
                property: 'coordinator',
                filter: true,
                type: TFColumnType.autocomplete,
                lookup: {
                    propToShow: ['first_name', 'second_name'],
                    values: this.coordinators,
                },
                class: 'ft-width-150'
            },
            {
                name: 'Number Of Projects',
                property: 'projects_count',
                filter: true,
                sorting: true,
                type: TFColumnType.number,
                class: 'fit'
            }
        ];
    }

    rowClicked($event) {
        this.router.navigate([`/customer/${$event.id}`]);
    }

    handleAction($event) {
        if ($event.action === 'remove') {
            this.removeCustomer($event.entity);
        }
    }

    removeCustomer(customer: Customer) {
        this.customerToRemove = customer;
        this.removeModalTitle = `Remove Customer: ${customer.name}`;
        this.removeModalMessage =
            `Are you sure that you want to delete the '${customer.name}' customer?
                All nested objects will also be removed! This action cannot be undone.`;
        this.hideModal = false;
    }

    async execute($event: any) {
        if (await $event) {
            await this.customerService.removeCustomer(this.customerToRemove);
            this.customers = this.customers.filter(x => x.id !== this.customerToRemove.id);
        }
        this.hideModal = true;
    }

    wasClosed() {
        this.hideModal = true;
    }
}
