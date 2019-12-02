import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { SimpleRequester } from './simple-requester';
import { Customer } from '../shared/models/customer';


@Injectable()
export class CustomerService extends SimpleRequester {

  getCustomer(customer_id?: number, withChildren?: boolean) {
    let params = '?';
    if (customer_id) { params += `id=${customer_id}`; }
    if (withChildren) { params += `&withChildren=${withChildren}`; }
    return this.doGet(`/customer${params}`).map(res => res.json());
  }

  createOrUpdateCustomer(customer: Customer) {
    customer.coordinator_id = customer.coordinator ? customer.coordinator.id : undefined;
    return this.doPost('/customer', customer).map(res => res.json());
  }

  removeCustomer(customer: Customer) {
    return this.doDelete(`/customer?id=${customer.id}`).map(res => this.handleSuccess(`'${customer.name}' customer was deleted`));
  }
}
