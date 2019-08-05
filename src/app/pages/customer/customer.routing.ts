import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../shared/guards/auth-guard.service';
import { CustomerDashboardGuard, CustomerCreateGuard } from '../../shared/guards/can-activate-customers';
import { CustomerComponent } from './customer.component';
import { CustomerCreateComponent } from './customer-create/customer-create.component';
import { CustomerInfoComponent } from './customer-info/customer-info.component';


const customerRoutes: Routes = [
  {
    path: 'customer', canActivate: [AuthGuard],
    children: [
      { path: '', component: CustomerComponent, canActivate: [CustomerDashboardGuard]},
      { path: 'create', component: CustomerCreateComponent, canActivate: [CustomerCreateGuard]},
      { path: ':customer_id', component: CustomerInfoComponent, canActivate: [CustomerDashboardGuard]}

    ]
  }
];


export const customerRouting = RouterModule.forChild(customerRoutes);
