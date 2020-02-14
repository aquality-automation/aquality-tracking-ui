import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../services/user.services';
import { CustomerService } from '../../../services/customer.service';
import { Customer } from '../../../shared/models/customer';
import { User } from '../../../shared/models/user';
import { TFColumn, TFColumnType } from '../../../elements/table/tfColumn';
import { PermissionsService, EGlobalPermissions } from '../../../services/current-permissions.service';

@Component({
    templateUrl: 'customer.component.html',
    styleUrls: ['customer.component.css']
})
export class CustomerComponent implements OnInit {
    customers: Customer[];
    coordinators: User[];
    accountManagers: User[];
    users: User[];
    defSort = { property: 'name', order: 'desc' };
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
        this.customerService.getCustomer(undefined, true).subscribe(res => {
            this.customers = res;
            this.userService.getUsers({}).subscribe(result => {
                this.users = result;
                this.coordinators = result.filter(x => x.unit_coordinator === 1);
                this.accountManagers = result.filter(x => x.account_manager === 1);
                this.columns = [
                    { name: 'Customer Name', property: 'name', filter: true, sorting: true, type: TFColumnType.text },
                    {
                        name: 'Unit Coordinator',
                        property: 'coordinator',
                        filter: true,
                        type: TFColumnType.autocomplete,
                        lookup: {
                            entity: 'coordinator',
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
                        type: TFColumnType.percent,
                        class: 'fit'
                    }
                ];
            });
        });
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

    async execute($event) {
        if (await $event) {
            this.customerService.removeCustomer(this.customerToRemove).subscribe(() =>
                this.customers = this.customers.filter(x => x.id !== this.customerToRemove.id));
        }
        this.hideModal = true;
    }

    wasClosed() {
        this.hideModal = true;
    }
}
