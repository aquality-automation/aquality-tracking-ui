import { Component, OnInit } from '@angular/core';
import { User } from '../../../shared/models/user';
import { Customer } from '../../../shared/models/customer';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user/user.services';
import { CustomerService } from 'src/app/services/customer/customer.service';

@Component({
    templateUrl: 'customer-create.component.html',
    styleUrls: ['customer-create.component.scss']
})
export class CustomerCreateComponent implements OnInit {
    customer: Customer = {};
    coordinators: User[];
    users: User[];
    accountManagers: User[];

    constructor(
        private userService: UserService,
        private customerService: CustomerService,
        private router: Router,
    ) {}

    async ngOnInit() {
        this.users = await this.userService.getUsers({});
        this.accountManagers = this.users.filter(x => x.account_manager === 1);
        this.coordinators = this.users.filter(x => x.unit_coordinator === 1);
    }

    async processCustomerCreation() {
        const customerId = (await this.customerService.createOrUpdateCustomer(this.customer)).id;
        this.router.navigate([`/customer/${customerId}`]);
        this.customerService.handleSuccess(`'${this.customer.name}' customer is created!`);
    }

    IsFormValid() {
        return this.customer.coordinator;
    }
}
