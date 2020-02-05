import { NgModule } from '@angular/core';

import { CustomerComponent } from './customer-list/customer.component';
import { SharedModule } from '../../shared/shared.module';
import { CustomerDashboardGuard, CustomerCreateGuard } from '../../shared/guards/can-activate-customers';
import { customerRouting } from './customer.routing';
import { CustomerCreateComponent } from './customer-create/customer-create.component';
import { CustomerInfoComponent } from './customer-info/customer-info.component';
import { GuardService } from '../../shared/guards/guard.service';

@NgModule({
    imports: [
        SharedModule,
        customerRouting
    ],
    declarations: [
        CustomerComponent,
        CustomerCreateComponent,
        CustomerInfoComponent
    ],
    providers: [
      CustomerDashboardGuard,
      CustomerCreateGuard,
      GuardService
    ]
})
export class CustomerModule {
}
