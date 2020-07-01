import { Injectable } from '@angular/core';
import { BaseHttpService } from '../base-http/base-http.service';
import { Customer } from 'src/app/shared/models/customer';


@Injectable()
export class CustomerService extends BaseHttpService {

  getCustomer(customer_id?: number, withChildren: boolean = false) {
    let params = '?';
    if (customer_id) { params += `id=${customer_id}`; }
    if (withChildren) { params += `&withChildren=${withChildren}`; }
    return this.http.get<Customer[]>(`/customer`, {
      params: this.convertToParams(
        { id: customer_id?.toString(), withChildren: String(withChildren) })
    }).toPromise();
  }

  createOrUpdateCustomer(customer: Customer) {
    customer.coordinator_id = customer.coordinator ? customer.coordinator.id : undefined;
    return this.http.post<Customer>('/customer', customer).toPromise();
  }

  async removeCustomer(customer: Customer) {
    await this.http.delete(`/customer`, { params: { id: customer.id.toString() } }).toPromise();
    this.handleSuccess(`'${customer.name}' customer was deleted`);
  }
}
