import { Routes, RouterModule } from '@angular/router';
import { AuditComponent } from './audit-list/audit.component';
import { AuditProjectComponent } from './audit-project-list/audit.project.component';
import { AuditInfoComponent } from './audit-view/audit.info.component';
import { AuditCreateComponent } from './audit-create/audit.create.component';
import { AuditCreateGuard, AuditProjectGuard, AuditDashboardGuard} from '../../shared/guards/audit-guard.service';
import { AuthGuard } from '../../shared/guards/login-guard.service';

const auditRoutes: Routes = [
  {
    path: 'audit', canActivate: [AuthGuard],
    children: [
      { path: '', component: AuditComponent, canActivate: [AuditDashboardGuard]},
      {
        path: ':projectId', canActivate: [AuditProjectGuard], children: [
          { path: '', component: AuditProjectComponent },
          { path: 'create', component: AuditCreateComponent, canActivate: [AuditCreateGuard] },
          { path: 'info/:auditId', component: AuditInfoComponent }
        ]
      }
    ]
  }
];

export const auditRouting = RouterModule.forChild(auditRoutes);
