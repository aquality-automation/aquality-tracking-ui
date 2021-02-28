import { Routes, RouterModule } from '@angular/router';
import { ImportBodyPatternsComponent } from '../projects/importBodyPatterns/ImportBodyPatterns.component';
import { AppSettingsComponent } from '../global/app-settings/app-settings.component';
import { APITokenComponent } from '../projects/api-token/api-token.component';
import { AdministrationPermissionsComponent } from '../projects/permissions/administration.permissions.component';
import { AdministrationResolutionsComponent } from '../projects/resolutions/administration.resolutions.component';
import { AdministrationUsersComponent } from '../global/users/administration.users.component';
import { IntegrationsComponent } from '../projects/integrations/integrations/integrations.component'
import {
  AdministrationProjectManagerGuard,
  AdministrationGlobalGuard,
  AdministrationProjectGuard
} from '../../../shared/guards/administration-guard.service';
import { AdministrationProjectSettingsComponent } from '../projects/settings/administration.projectSettings.component';


const administrationChildRoutes: Routes = [
  { path: '', redirectTo: 'global/users' },
  {
    path: 'project', canActivate: [AdministrationProjectGuard],
    children: [
      { path: 'permissions', component: AdministrationPermissionsComponent, canActivate: [AdministrationProjectManagerGuard] },
      { path: 'resolutions', component: AdministrationResolutionsComponent, canActivate: [AdministrationProjectManagerGuard] },
      { path: 'importBodyPatterns', component: ImportBodyPatternsComponent, canActivate: [AdministrationProjectManagerGuard] },
      { path: 'apiToken', component: APITokenComponent, canActivate: [AdministrationProjectManagerGuard] },
      { path: 'projectSettings', component: AdministrationProjectSettingsComponent, canActivate: [AdministrationProjectManagerGuard] },
      { path: 'integrations', component: IntegrationsComponent, canActivate: [AdministrationProjectManagerGuard] }
    ]
  }, {
    path: 'global', canActivate: [AdministrationGlobalGuard],
    children: [
      { path: 'appSettings', component: AppSettingsComponent },
      { path: 'users', component: AdministrationUsersComponent }
    ]
  }
];

export const administrationChildRouting = RouterModule.forChild(administrationChildRoutes);
