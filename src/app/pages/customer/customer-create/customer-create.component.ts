import { Component, OnInit } from '@angular/core';
import { User } from '../../../shared/models/user';
import { Customer } from '../../../shared/models/customer';
import { UserService } from '../../../services/user.services';
import { CustomerService } from '../../../services/customer.service';
import { Router } from '@angular/router';
import { TransformationsService } from '../../../services/transformations.service';

@Component({
    templateUrl: 'customer-create.component.html',
    styleUrls: ['customer-create.component.css'],
    providers: [
        UserService,
        CustomerService,
        TransformationsService
    ]
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

    ngOnInit() {
        this.userService.getUsers().subscribe(result => {
            this.users = result;
            this.accountManagers = result.filter(x => x.account_manager === 1);
            this.coordinators = result.filter(x => x.unit_coordinator === 1);
        });
    }

    processCustomerCreation() {
        this.customer.accounting = +this.customer.accounting;
        if (this.customer.accounting === 0) {
            this.customer.account_manager = undefined;
            this.customer.account_team = [];
        }
        this.customerService.createOrUpdateCustomer(this.customer).subscribe(res => {
            const customerId = res.id;
            if (this.customer.account_team) {
                this.customerService.updateAccountMembers(customerId, this.customer.account_team).subscribe(() => {});
            }
            this.router.navigate([`/customer/${customerId}`]);
            this.customerService.handleSuccess(`'${this.customer.name}' customer is created!`);
        });
    }

    IsFormValid() {
        return this.customer.coordinator && (this.customer.accounting ? this.customer.account_manager : true);
    }

    updateAccountTeam($event) {
        this.customer.account_team = $event;
    }
}
