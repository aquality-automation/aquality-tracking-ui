import { NgModule } from '@angular/core';
import { AdministrationGuard } from '../../shared/guards/auth-guard.service';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { ProjectService } from '../../services/project.service';
import { UserService } from '../../services/user.services';
import { administrationRouting } from './administration.routing';
import { AdministrationComponent } from './administration.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    administrationRouting,
    CommonModule,
    BrowserModule,
    SharedModule
  ],
  declarations: [
      AdministrationComponent
  ],
  providers: [ ProjectService,
  UserService,
  AdministrationGuard ],
})

export class AdministrationModule {}
