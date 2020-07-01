import { Routes, RouterModule } from '@angular/router';
import { AdministrationComponent } from './administration.component';
import { AdministrationGuard } from '../../../shared/guards/administration-guard.service';
import { AuthGuard } from '../../../shared/guards/login-guard.service';


const administrationRoutes: Routes = [
  {
    path: 'administration', canActivate: [AdministrationGuard, AuthGuard],
    children: [
      {
        path: '',
        component: AdministrationComponent,
        loadChildren: () => import('./administration.child.module').then(m => m.AdministrationChildModule)
      }]
  }
];

export const administrationRouting = RouterModule.forChild(administrationRoutes);
