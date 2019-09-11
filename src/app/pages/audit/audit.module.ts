import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { auditRouting } from './audit.routing';
import { AuditComponent } from './audit-list/audit.component';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { AuditCreateComponent } from './audit-create/audit.create.component';
import { AuditInfoComponent } from './audit-view/audit.info.component';
import { AuditProjectComponent } from './audit-project-list/audit.project.component';
import { AuditCreateGuard, AuditProjectGuard, AuditDashboardGuard } from '../../shared/guards/audit-guard.service';

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
