import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { auditRouting } from './audit.routing';
import { AuditComponent } from './audit-list/audit.component';
import { AuditCreateComponent } from './audit-create/audit.create.component';
import { AuditInfoComponent } from './audit-view/audit.info.component';
import { AuditProjectComponent } from './audit-project-list/audit.project.component';
import { AuditCreateGuard, AuditProjectGuard, AuditDashboardGuard } from '../../shared/guards/audit-guard.service';
import { GuardService } from 'src/app/services/guard.service';
import { BaseHttpService } from 'src/app/services/base-http/base-http.service';

@NgModule({
  imports: [
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
    BaseHttpService,
    AuditCreateGuard,
    AuditProjectGuard,
    AuditDashboardGuard,
    GuardService
  ]
})

export class AuditModule {}
