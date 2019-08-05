import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { SimpleRequester } from './simple-requester';
import { User } from '../shared/models/user';
import { Customer, CustomerComment } from '../shared/models/customer';


@Injectable()
export class CustomerService extends SimpleRequester {

  getCustomer(customer_id?: number, withChildren?: boolean) {
    let params = '?';
    if (customer_id) { params += `id=${customer_id}`; }
    if (withChildren) { params += `&withChildren=${withChildren}`; }
    return this.doGet(`/customer${params}`).map(res => res.json());
  }

  createOrUpdateCustomer(customer: Customer) {
    customer.account_manager_id = customer.account_manager ? customer.account_manager.id : undefined;
    customer.coordinator_id = customer.coordinator ? customer.coordinator.id : undefined;
    return this.doPost('/customer', customer).map(res => res.json());
  }

  removeCustomer(customer: Customer) {
    return this.doDelete(`/customer?id=${customer.id}`).map(res => this.handleSuccess(`'${customer.name}' customer was deleted`));
  }

  createOrUpdateCustomerComment(comment: CustomerComment) {
    return this.doPost(`/customer/comment`, comment).map(res => this.handleSuccess(`Comment was added.`));
  }

  removeCustomerAttachment(id: number, customer_id: number) {
    return this.doDelete(`/customer/attachment?id=${id}&customer_id=${customer_id}`).map(() =>
       this.handleSuccess(`Customer attachment was deleted.`));
  }

  downloadCustomerAttachment(id: number, customer_id: number): Observable<Blob> {
    return this.doDownload(`/customer/attachment?id=${id}&customer_id=${customer_id}`).map(res => {
      return new Blob([res.blob()], {type: res.headers.get('Content-Type')});
    });
  }

  getAccountMembers(customer_id: number) {
    return this.doGet(`/customer/member?customer_id=${customer_id}`).map(res => res.json());
  }

  updateAccountMembers(customer_id: number, members: User[]) {
    return this.doPost(`/customer/member?customer_id=${customer_id}`, members).map(res => res);
  }
}
