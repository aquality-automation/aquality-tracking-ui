import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.services';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../shared/models/customer';
import { User } from '../../shared/models/user';

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
    columns;
    customerToRemove: Customer;
    hideModal = true;
    removeModalTitle: string;
    removeModalMessage: string;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        public userService: UserService,
        public customerService: CustomerService
    ) { }

    ngOnInit() {
        this.customerService.getCustomer(undefined, true).subscribe(res => {
            this.customers = res;
            this.userService.getUsers().subscribe(result => {
                this.users = result;
                this.coordinators = result.filter(x => x.unit_coordinator === 1);
                this.accountManagers = result.filter(x => x.account_manager === 1);
                this.columns = [
                    { name: 'Customer Name', property: 'name', filter: true, sorting: true, type: 'text', editable: false },
                    {
                        name: 'Unit Coordinator',
                        property: 'coordinator',
                        entity: 'coordinator',
                        filter: true,
                        sorting: false,
                        type: 'lookup-autocomplete',
                        propToShow: ['first_name', 'second_name'],
                        values: this.coordinators,
                        editable: false,
                        class: 'ft-width-150'
                    },
                    {
                        name: 'Number Of Projects',
                        property: 'projects_count',
                        filter: true,
                        sorting: true,
                        type: 'percent',
                        editable: false,
                        class: 'fit'
                    },
                    { name: 'Accounting', property: 'accounting', filter: false, sorting: true, type: 'checkbox', editable: false },
                    {
                        name: 'Account Manager',
                        property: 'account_manager',
                        entity: 'account_manager',
                        filter: true,
                        sorting: false,
                        type: 'lookup-autocomplete',
                        propToShow: ['first_name', 'second_name'],
                        values: this.accountManagers,
                        editable: false,
                        class: 'ft-width-150'
                    },
                    {
                        name: 'Account Team',
                        property: 'account_team',
                        filter: true,
                        sorting: false,
                        type: 'multiselect',
                        propToShow: ['first_name', 'second_name'],
                        values: this.users,
                        editable: false,
                        class: 'ft-width-250'
                    },
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

    wasClosed($event) {
        this.hideModal = $event;
    }
}
