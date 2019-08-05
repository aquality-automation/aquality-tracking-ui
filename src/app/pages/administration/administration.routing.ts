import { Routes, RouterModule} from '@angular/router';
import { AdministrationGuard, AuthGuard } from '../../shared/guards/auth-guard.service';
import { AdministrationComponent } from './administration.component';


const administrationRoutes: Routes = [
  { path: 'administration', canActivate: [AdministrationGuard, AuthGuard],
    children: [
      { path: '', component: AdministrationComponent, loadChildren: './administration.childs.module#AdministrationChildsModule' }]
  }
];

export const administrationRouting = RouterModule.forChild(administrationRoutes);
