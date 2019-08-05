import { Routes, RouterModule} from '@angular/router';
import { AdministrationProjectGuard, AdministrationGlobalGuard } from '../../shared/guards/auth-guard.service';
import { AdministrationPermissionsComponent } from './projects/administration.permissions.component';
import { AdministrationUsersComponent } from './global/administration.users.component';
import { AdministrationResolutionsComponent } from './projects/administration.resolutions.component';
import { ImportBodyPatternsComponent } from './projects/importBodyPatterns/ImportBodyPatterns.component';
import { AppSettingsComponent } from './global/app-settings/app-settings.component';
import { ImportTokenComponent } from './projects/import-token/import-token.component';


const administrationChildsRoutes: Routes = [
  { path: 'project', canActivate: [AdministrationProjectGuard],
    children: [
        { path: 'permissions', component: AdministrationPermissionsComponent },
        { path: 'resolutions', component: AdministrationResolutionsComponent },
        { path: 'importBodyPatterns', component: ImportBodyPatternsComponent },
        { path: 'importToken', component: ImportTokenComponent }
      ]
  }, {
    path: 'global', canActivate: [AdministrationGlobalGuard],
    children: [
        { path: 'appSettings', component: AppSettingsComponent },
        { path: 'users', component: AdministrationUsersComponent }
      ]
  }
];


export const administrationChildsRouting = RouterModule.forChild(administrationChildsRoutes);
