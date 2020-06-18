import { NgModule } from '@angular/core';
import { administrationRouting } from './administration.routing';
import { AdministrationComponent } from './administration.component';
import { SharedModule } from '../../../shared/shared.module';
import { AdministrationGuard } from '../../../shared/guards/administration-guard.service';
import { ProjectService } from 'src/app/services/project/project.service';
import { UserService } from 'src/app/services/user/user.services';
import { PermissionsService } from 'src/app/services/permissions/current-permissions.service';
import { GuardService } from 'src/app/services/guard.service';

@NgModule({
  imports: [
    administrationRouting,
    SharedModule
  ],
  declarations: [
    AdministrationComponent
  ],
  providers: [
    ProjectService,
    UserService,
    PermissionsService,
    AdministrationGuard,
    GuardService
  ],
})

export class AdministrationModule { }
