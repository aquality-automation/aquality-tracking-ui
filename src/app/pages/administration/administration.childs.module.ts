import { NgModule } from '@angular/core';
import { AdministrationProjectGuard, AdministrationGlobalGuard } from '../../shared/guards/auth-guard.service';
import { ProjectService } from '../../services/project.service';
import { UserService } from '../../services/user.services';
import { administrationChildsRouting } from './administration.childs.routing';
import { AdministrationPermissionsComponent } from './projects/administration.permissions.component';
import { AdministrationUsersComponent } from './global/administration.users.component';
import { DataTableModule } from 'angular2-datatable';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { AdministrationResolutionsComponent } from './projects/administration.resolutions.component';
import { SharedModule } from '../../shared/shared.module';
import { ImportBodyPatternsComponent } from './projects/importBodyPatterns/ImportBodyPatterns.component';
import { AppSettingsComponent } from './global/app-settings/app-settings.component';
import { ImportTokenComponent } from './projects/import-token/import-token.component';



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
    ImportTokenComponent
  ],
  providers: [ProjectService,
    UserService,
    AdministrationProjectGuard, AdministrationGlobalGuard,
    DatePipe],
})

export class AdministrationChildsModule { }
