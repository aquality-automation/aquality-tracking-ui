import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../shared/models/project';
import { ActivatedRoute, Router } from '@angular/router';
import { AuditService } from '../../services/audits.service';
import { Audit, Service } from '../../shared/models/audit';
import { UserService } from '../../services/user.services';

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
  public columns;
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
                type: 'lookup-colored',
                entity: 'service',
                values: this.services,
                editable: false,
                class: 'fit'
              },
              { name: 'Status', property: 'status.name', filter: false, type: 'text', editable: false },
              { name: 'Created', property: 'created', filter: false, sorting: true, type: 'date', editable: false },
              { name: 'Started', property: 'started', filter: false, sorting: true, type: 'date', editable: false },
              { name: 'Progress Finished', property: 'progress_finished', filter: false, sorting: true, type: 'date', editable: false },
              { name: 'Submitted', property: 'submitted', filter: false, sorting: true, type: 'date', editable: false },
              {
                name: 'Result, %',
                property: 'result',
                filter: false,
                sorting: true,
                type: 'text',
                editable: false
              },
              {
                name: 'Auditors',
                property: 'auditors',
                filter: true,
                sorting: false,
                type: 'multiselect',
                propToShow: ['first_name', 'second_name'],
                editable: false
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
