import { NgModule } from '@angular/core';

import { ProjectService } from '../../services/project.service';
import { UserService } from '../../services/user.services';
import { SharedModule } from '../../shared/shared.module';
import { auditRouting } from './audit.routing';
import { AuditComponent } from './audit.component';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { AuditCreateComponent } from './audit.create.component';
import { AuditInfoComponent } from './audit.info.component';
import { AuditProjectComponent } from './audit.project.component';
import { AuditCreateGuard, AuditProjectGuard, AuditDashboardGuard } from '../../shared/guards/can-activate-audits';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    SharedModule,
    auditRouting
  ],
  declarations: [
    AuditCreateComponent,
    AuditInfoComponent,
    AuditProjectComponent,
    AuditComponent
  ],
  providers: [
    AuditCreateGuard,
    AuditProjectGuard,
    AuditDashboardGuard
  ]
})

export class AuditModule {}
