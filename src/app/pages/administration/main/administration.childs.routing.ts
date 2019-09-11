import { Routes, RouterModule } from '@angular/router';
import { ImportBodyPatternsComponent } from '../projects/importBodyPatterns/ImportBodyPatterns.component';
import { AppSettingsComponent } from '../global/app-settings/app-settings.component';
import { ImportTokenComponent } from '../projects/import-token/import-token.component';
import { AdministrationPermissionsComponent } from '../projects/permissions/administration.permissions.component';
import { AdministrationResolutionsComponent } from '../projects/resolutions/administration.resolutions.component';
import { AdministrationUsersComponent } from '../global/users/administration.users.component';
import { AdministrationProjectGuard, AdministrationGlobalGuard } from '../../../shared/guards/administration-guard.service';


const administrationChildsRoutes: Routes = [
  { path: '', redirectTo: 'global/users'},
  {
    path: 'project', canActivate: [AdministrationProjectGuard],
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
