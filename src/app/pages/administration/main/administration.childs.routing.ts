import { Routes, RouterModule } from '@angular/router';
import { ImportBodyPatternsComponent } from '../projects/importBodyPatterns/ImportBodyPatterns.component';
import { AppSettingsComponent } from '../global/app-settings/app-settings.component';
import { APITokenComponent } from '../projects/api-token/api-token.component';
import { AdministrationPermissionsComponent } from '../projects/permissions/administration.permissions.component';
import { AdministrationResolutionsComponent } from '../projects/resolutions/administration.resolutions.component';
import { AdministrationUsersComponent } from '../global/users/administration.users.component';
import { AdministrationProjectGuard, AdministrationGlobalGuard } from '../../../shared/guards/administration-guard.service';
import { AdministrationProjectSettingsComponent } from '../projects/settings/administration.projectSettings.component';


const administrationChildsRoutes: Routes = [
  { path: '', redirectTo: 'global/users'},
  {
    path: 'project', canActivate: [AdministrationProjectGuard],
    children: [
      { path: 'permissions', component: AdministrationPermissionsComponent },
      { path: 'resolutions', component: AdministrationResolutionsComponent },
      { path: 'importBodyPatterns', component: ImportBodyPatternsComponent },
      { path: 'apiToken', component: APITokenComponent },
      { path: 'projectSettings', component: AdministrationProjectSettingsComponent}
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
