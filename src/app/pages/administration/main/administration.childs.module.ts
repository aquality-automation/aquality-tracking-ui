import { NgModule } from '@angular/core';
import { ProjectService } from '../../../services/project.service';
import { UserService } from '../../../services/user.services';
import { administrationChildsRouting } from './administration.childs.routing';
import { DataTableModule } from 'angular2-datatable';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { SharedModule } from '../../../shared/shared.module';
import { ImportBodyPatternsComponent } from '../projects/importBodyPatterns/ImportBodyPatterns.component';
import { AppSettingsComponent } from '../global/app-settings/app-settings.component';
import { APITokenComponent } from '../projects/api-token/api-token.component';
import { AdministrationPermissionsComponent } from '../projects/permissions/administration.permissions.component';
import { AdministrationUsersComponent } from '../global/users/administration.users.component';
import { AdministrationResolutionsComponent } from '../projects/resolutions/administration.resolutions.component';
import { AdministrationGlobalGuard, AdministrationProjectGuard } from '../../../shared/guards/administration-guard.service';
import { AdministrationProjectSettingsComponent } from '../projects/settings/administration.projectSettings.component';

@NgModule({
  imports: [
    administrationChildsRouting,
    DataTableModule,
    FormsModule,
    CommonModule,
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
    UserService,
    AdministrationProjectGuard,
    AdministrationGlobalGuard,
    DatePipe
  ],
})

export class AdministrationChildsModule { }
