import { Routes, RouterModule } from '@angular/router';
import { CustomerDashboardGuard, CustomerCreateGuard } from '../../shared/guards/customer-guard.service';
import { CustomerComponent } from './customer-list/customer.component';
import { CustomerCreateComponent } from './customer-create/customer-create.component';
import { CustomerInfoComponent } from './customer-info/customer-info.component';
import { AuthGuard } from '../../shared/guards/login-guard.service';


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
