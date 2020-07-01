import { Component, OnInit } from '@angular/core';
import { Audit, AuditStat, Service, Auditor } from '../../../shared/models/audit';
import { Router, ActivatedRoute } from '@angular/router';
import { Project } from '../../../shared/models/project';
import { TransformationsService } from '../../../services/transformations.service';
import { AuditService } from 'src/app/services/audit/audits.service';
import { UserService } from 'src/app/services/user/user.services';
import { ProjectService } from 'src/app/services/project/project.service';

@Component({
  templateUrl: './audit.create.component.html'
})
export class AuditCreateComponent implements OnInit {
  dateUpdated = false;
  auditors: Auditor[];
  hiddenServices: Service[] = [];
  auditStatsByProject: AuditStat[];
  services: Service[];
  audit: Audit = {};
  project: Project;
  // options: DatepickerOptions = {
  //   locale: enLocale,
  //   minYear: new Date().getFullYear(),
  //   displayFormat: 'MM/DD/YY',
  //   barTitleFormat: 'MMMM YYYY',
  //   firstCalendarDay: 1,
  //   minDate: new Date(new Date().setDate(new Date().getDate() - 1))
  // };

  constructor(
    private router: Router,
    public auditService: AuditService,
    public userService: UserService,
    private projectService: ProjectService,
    private route: ActivatedRoute
  ) { }

  async ngOnInit() {
    const [auditors, services, project, auditStats] = await Promise.all([
      this.userService.getUsers({auditor: 1}),
      this.auditService.getServices(),
      this.projectService.getProjects({ id: this.route.snapshot.params['projectId'] }),
      this.auditService.getAuditStats()
    ]);

    this.auditors = auditors;
    this.services = services;
    this.project = project[0];
    this.auditStatsByProject = auditStats.filter((x: AuditStat) => x.id === this.project.id);

    const lastAuditStat = this.auditStatsByProject[0];
    this.audit.due_date = lastAuditStat.last_submitted_date
      ? this.auditService.createDueDate(new Date(lastAuditStat.last_submitted_date))
      : this.auditService.createDueDate(new Date(lastAuditStat.created));
    this.audit.project = { id: this.project.id };
    this.filterServicesList();
    this.audit.service = this.services.find(x => x.id === 1) || this.services[0];
  }

  validate() {
    if (this.audit) {
      return !this.audit.due_date || !this.audit.auditors || this.audit.auditors.length < 1 || !this.audit.service;
    }
    return false;
  }

  dateUpdate($event) {
    this.dateUpdated = true;
    this.audit.due_date = new Date(new Date($event).setHours(0, 0, 0, 0));
  }

  async createAudit() {
    const newAudit = await this.auditService.createOrUpdateAudit(this.audit);
    await this.auditService.updateAuditors(this.audit.auditors, newAudit.id);
    this.router.navigate([`/audit/${this.route.snapshot.params['projectId']}/info/${newAudit.id}`]);
  }

  serviceUpdate() {
    if (!this.dateUpdated) {
      const stat = this.auditStatsByProject.find(x => !x.service || x.service.id === this.audit.service.id);
      if (stat) {
        this.audit.due_date = stat.last_submitted_date
          ? this.auditService.createDueDate(new Date(stat.last_submitted_date))
          : this.auditService.createDueDate(new Date(stat.created));
      } else {
        this.audit.due_date = this.auditService.createDueDate(new Date(this.project.created));
      }
    }
  }

  filterServicesList() {
    this.auditStatsByProject.forEach(auditStat => {
      if (auditStat.last_created_id !== auditStat.last_submitted_id) {
        this.services = this.services.filter(x => {
          if (x.id === auditStat.service.id) {
            this.hiddenServices.push(x);
            return false;
          }
          return true;
        });
      }
    });
  }

  getHiddenServices(): string {
    const row: string[] = [];
    this.hiddenServices.forEach(x => row.push(x.name));
    return row.join(', ');
  }
}
