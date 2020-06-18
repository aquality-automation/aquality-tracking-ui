import { Component, OnInit } from '@angular/core';
import { Project } from '../../../shared/models/project';
import { ActivatedRoute, Router } from '@angular/router';
import { Audit, Service } from '../../../shared/models/audit';
import { TFColumn, TFOrder, TFColumnType } from 'src/app/elements/table-filter/tfColumn';
import { ProjectService } from 'src/app/services/project/project.service';
import { AuditService } from 'src/app/services/audit/audits.service';
import { PermissionsService, EGlobalPermissions } from 'src/app/services/permissions/current-permissions.service';

@Component({
  templateUrl: './audit.project.component.html'
})
export class AuditProjectComponent implements OnInit {
  services: Service[];
  project: Project;
  redirect: any;
  isAuditAdmin: boolean;
  public data: Audit[];
  public columns: TFColumn[];
  public defSort = { property: 'created', order: TFOrder.asc };

  constructor(
    private router: Router,
    public auditService: AuditService,
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private permissions: PermissionsService
  ) { }

  async ngOnInit() {
    this.isAuditAdmin = await this.permissions.hasPermissions([EGlobalPermissions.audit_admin]);
    this.project = { id: this.route.snapshot.params.projectId };
    this.project = (await this.projectService.getProjects(this.project))[0];
    this.services = await this.auditService.getServices();
    if (!this.project) {
      this.router.navigate(['**']);
    } else {
      this.data = await this.auditService.getAudits({ project: { id: this.project.id } });
      this.columns = [
        {
          name: 'Service',
          property: 'service',
          filter: true,
          sorting: true,
          type: TFColumnType.colored,
          lookup: {
            values: this.services,
            propToShow: ['name']
          },
          class: 'fit'
        },
        { name: 'Status', property: 'status.name', type: TFColumnType.text },
        { name: 'Created', property: 'created', sorting: true, type: TFColumnType.date },
        { name: 'Started', property: 'started', sorting: true, type: TFColumnType.date },
        { name: 'Progress Finished', property: 'progress_finished', sorting: true, type: TFColumnType.date },
        { name: 'Submitted', property: 'submitted', sorting: true, type: TFColumnType.date },
        {
          name: 'Result',
          property: 'result',
          sorting: true,
          type: TFColumnType.percent
        },
        {
          name: 'Auditors',
          property: 'auditors',
          type: TFColumnType.multiselect,
          lookup: {
            values: this.services,
            propToShow: ['first_name', 'second_name'],
          }
        }
      ];
    }
  }

  async rowClicked(audit: Audit) {
    const canNavigate =
      (await this.permissions.hasPermissions([EGlobalPermissions.auditor, EGlobalPermissions.audit_admin, EGlobalPermissions.manager]))
      || audit.status.id === 3
      || audit.status.id === 4;

    if (canNavigate) {
      this.router.navigate([`/audit/${this.project.id}/info/${audit.id}`]);
    } else {
      this.auditService.handleWarning('Access denied', 'You can only see audits having Submitted and In Review statuses.');
    }
  }
}
