import { NgModule } from '@angular/core';
import { CustomerComponent } from './customer-list/customer.component';
import { SharedModule } from '../../shared/shared.module';
import { customerRouting } from './customer.routing';
import { CustomerCreateComponent } from './customer-create/customer-create.component';
import { CustomerInfoComponent } from './customer-info/customer-info.component';
import { GuardService } from 'src/app/services/guard.service';
import { CustomerDashboardGuard, CustomerCreateGuard } from 'src/app/shared/guards/customer-guard.service';

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
