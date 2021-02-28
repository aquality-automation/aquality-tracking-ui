import { NgModule } from '@angular/core';
import { administrationChildRouting } from './administration.child.routing';
import { DatePipe } from '@angular/common';
import { SharedModule } from '../../../shared/shared.module';
import { ImportBodyPatternsComponent } from '../projects/importBodyPatterns/ImportBodyPatterns.component';
import { AppSettingsComponent } from '../global/app-settings/app-settings.component';
import { APITokenComponent } from '../projects/api-token/api-token.component';
import { AdministrationPermissionsComponent } from '../projects/permissions/administration.permissions.component';
import { AdministrationUsersComponent } from '../global/users/administration.users.component';
import { AdministrationResolutionsComponent } from '../projects/resolutions/administration.resolutions.component';
import { AdministrationProjectSettingsComponent } from '../projects/settings/administration.projectSettings.component';
import { ProjectService } from 'src/app/services/project/project.service';
import { PermissionsService } from 'src/app/services/permissions/current-permissions.service';
import { UserService } from 'src/app/services/user/user.services';
import { GuardService } from 'src/app/services/guard.service';
import { AdministrationProjectManagerGuard, AdministrationProjectGuard, AdministrationGlobalGuard } from 'src/app/shared/guards/administration-guard.service';
import { IntegrationSystemsComponent } from '../projects/integrations/systems/integration-systems.component';
import { IntegrationsComponent } from '../projects/integrations/integrations/integrations.component';
import { TtsStatusComponent } from '../projects/integrations/tts-status/tts-status.component';
import { WorkflowStatusesComponent } from '../projects/integrations/workflow-statuses/workflow-statuses.component';
import { SystemViewComponent } from '../projects/integrations/system-view/system-view.component';
@NgModule({
  imports: [
    administrationChildRouting,
    SharedModule
  ],
  declarations: [
    AppSettingsComponent,
    AdministrationPermissionsComponent,
    AdministrationUsersComponent,
    AdministrationResolutionsComponent,
    ImportBodyPatternsComponent,
    APITokenComponent,
    AdministrationProjectSettingsComponent,
    IntegrationSystemsComponent,
    IntegrationsComponent,
    TtsStatusComponent,
    WorkflowStatusesComponent,
    SystemViewComponent
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

export class AdministrationChildModule { }
