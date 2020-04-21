import { NgModule } from '@angular/core';
import { ProjectService } from '../../../services/project.service';
import { UserService } from '../../../services/user.services';
import { administrationChildsRouting } from './administration.childs.routing';
import { DatePipe } from '@angular/common';
import { SharedModule } from '../../../shared/shared.module';
import { ImportBodyPatternsComponent } from '../projects/importBodyPatterns/ImportBodyPatterns.component';
import { AppSettingsComponent } from '../global/app-settings/app-settings.component';
import { APITokenComponent } from '../projects/api-token/api-token.component';
import { AdministrationPermissionsComponent } from '../projects/permissions/administration.permissions.component';
import { AdministrationUsersComponent } from '../global/users/administration.users.component';
import { AdministrationResolutionsComponent } from '../projects/resolutions/administration.resolutions.component';
import {
  AdministrationGlobalGuard,
  AdministrationProjectManagerGuard,
  AdministrationProjectGuard
} from '../../../shared/guards/administration-guard.service';
import { AdministrationProjectSettingsComponent } from '../projects/settings/administration.projectSettings.component';
import { PermissionsService } from '../../../services/current-permissions.service';
import { GuardService } from '../../../shared/guards/guard.service';

@NgModule({
  imports: [
    administrationChildsRouting,
    SharedModule
  ],
  declarations: [
    AppSettingsComponent,
    AdministrationPermissionsComponent,
    AdministrationUsersComponent,
    AdministrationResolutionsComponent,
    ImportBodyPatternsComponent,
    APITokenComponent,
    AdministrationProjectSettingsComponent
  ],
  providers: [
    ProjectService,
    PermissionsService,
    UserService,
    AdministrationProjectManagerGuard,
    AdministrationProjectGuard,
    AdministrationGlobalGuard,
    DatePipe,
    GuardService
  ],
})

export class AdministrationChildsModule { }
