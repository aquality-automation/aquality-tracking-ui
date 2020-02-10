import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../../services/project.service';
import { Project } from '../../../shared/models/project';
import { ActivatedRoute, Router } from '@angular/router';
import { AuditService } from '../../../services/audits.service';
import { Audit, Service } from '../../../shared/models/audit';
import { UserService } from '../../../services/user.services';
import { TFColumn, TFColumnType } from '../../../elements/table/tfColumn';

@Component({
  templateUrl: './audit.project.component.html',
  providers: [
    AuditService,
    UserService
  ]
})
export class AuditProjectComponent implements OnInit {
  services: Service[];
  project: Project;
  redirect: any;
  public data: Audit[];
  public columns: TFColumn[];
  public defSort = { property: 'created', order: 'asc' };

  constructor(
    private router: Router,
    public auditService: AuditService,
    private projectService: ProjectService,
    private route: ActivatedRoute,
    public userService: UserService
  ) { }

  ngOnInit() {
    this.project = { id: this.route.snapshot.params['projectId'] };
    this.projectService.getProjects(this.project).subscribe(projects => {
      this.project = projects[0];
      this.auditService.getServices().subscribe(services => {
        this.services = services;
        if (!this.project) {
          this.router.navigate(['**']);
        } else {
          this.auditService.getAudits({ project: { id: this.project.id } }).subscribe(audits => {
            this.data = audits;
            this.columns = [
              {
                name: 'Service',
                property: 'service.name',
                filter: true,
                sorting: true,
                type: TFColumnType.colored,
                lookup: {
                  entity: 'service',
                  values: this.services,
                  propToShow: ['name']
                },
                class: 'fit'
              },
              { name: 'Status', property: 'status.name', type: TFColumnType.text},
              { name: 'Created', property: 'created', sorting: true, type: TFColumnType.date },
              { name: 'Started', property: 'started', sorting: true, type: TFColumnType.date },
              { name: 'Progress Finished', property: 'progress_finished', sorting: true, type: TFColumnType.date },
              { name: 'Submitted', property: 'submitted', sorting: true, type: TFColumnType.date },
              {
                name: 'Result, %',
                property: 'result',
                sorting: true,
                type: TFColumnType.text
              },
              {
                name: 'Auditors',
                property: 'auditors',
                type: TFColumnType.multiselect,
                lookup: {
                  entity: 'auditors',
                  values: this.services,
                  propToShow: ['first_name', 'second_name'],
                }
              }
            ];
          });
        }
      });
    });
  }

  rowClicked($event) {
    if ($event.status.id === 3
      || $event.status.id === 4
      || this.userService.IsAuditor()
      || this.userService.IsAuditAdmin()
      || this.userService.IsManager()) {
      this.router.navigate([`/audit/${this.project.id}/info/${$event.id}`]);
    } else {
      this.auditService.handleWarning('Access denied', 'You can only see audits having Submitted and In Review statuses.');
    }
  }
}
