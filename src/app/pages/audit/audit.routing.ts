import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../shared/guards/auth-guard.service';
import { AuditComponent } from './audit.component';
import { AuditProjectComponent } from './audit.project.component';
import { AuditInfoComponent } from './audit.info.component';
import { AuditCreateComponent } from './audit.create.component';
import { AuditCreateGuard, AuditProjectGuard, AuditDashboardGuard} from '../../shared/guards/can-activate-audits';


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
