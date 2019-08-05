import { Component, OnInit } from '@angular/core';
import { AuditStat, Service } from '../../shared/models/audit';
import { AuditService } from '../../services/audits.service';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../shared/models/user';
import { UserService } from '../../services/user.services';
import BlobUtils from '../../shared/utils/blob.utils';

@Component({
  templateUrl: './audit.component.html',
  providers: [
    AuditService,
    UserService
  ]
})
export class AuditComponent implements OnInit {
  services: Service[];
  coordinators: User[];
  stats: AuditStat[];
  auditors: User[];
  defSort = { property: 'last_created_due_date', order: 'desc' };
  rowColors: any[] = [{
    property: 'last_created_due_date',
    color: 'warning',
    higher: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(0, 0, 0, 0)),
    lower: new Date(new Date(new Date().setDate(new Date().getDate() + 15)).setHours(0, 0, 0, 0))
  }, {
    property: 'hasOpened',
    color: 'none'
  }, {
    property: 'last_created_due_date',
    color: 'danger',
    lower: new Date(new Date(new Date().setDate(new Date().getDate())).setHours(0, 0, 0, 0))
  }];
  columns;
  linkNames: string[] = [];

  constructor(
    public route: ActivatedRoute,
    private router: Router,
    public auditService: AuditService,
    public userService: UserService,
  ) { }

  ngOnInit() {
    this.auditService.getAuditStats().subscribe(res => {
      this.stats = res;
      this.userService.getUsersWithFilter({ unit_coordinator: 1 }).subscribe(users => this.coordinators = users);
      this.userService.getUsers().subscribe(users => {
        this.auditors = users.filter(user => user.auditor === 1);
        this.userService.IsAuditAdmin() ? this.linkNames.push('Create New') : this.linkNames.push('Not created');
        this.stats.forEach(stat => {
          if (stat.last_submitted_date || stat.last_created_due_date) {
            stat.last_created_due_date = stat.last_submitted_id !== stat.last_created_id
              ? new Date(stat.last_created_due_date)
              : this.auditService.createDueDate(new Date(stat.last_submitted_date));
          } else {
            stat.last_created_due_date = this.auditService.createDueDate(new Date(stat.created));
          }

          if (stat.last_created_id && (stat.last_submitted_id !== stat.last_created_id)) {
            stat['next_action'] = { text: stat.status_name, link: `/audit/${stat.id}/info/${stat.last_created_id}` };
            if (stat.status_name !== 'Open') { stat['hasOpened'] = true; }
            if (!this.linkNames.includes(stat.status_name) && stat.status_name) { this.linkNames.push(stat.status_name); }
          } else if (this.userService.IsAuditAdmin()) {
            stat['next_action'] = { text: 'Create New', link: `/audit/${stat.id}/create` };
          } else {
            stat['next_action'] = { text: 'Not created' };
          }
        });
        this.auditService.getServices().subscribe(services => {
          this.services = services;
          this.columns = [
            { name: 'Project', property: 'name', filter: true, sorting: true, type: 'text', editable: false },
            {
              name: 'Unit Coordinator',
              property: 'project.customer.coordinator',
              entity: 'project.customer.coordinator',
              filter: true,
              sorting: false,
              type: 'lookup-autocomplete',
              propToShow: ['first_name', 'second_name'],
              values: this.coordinators,
              editable: false,
              class: 'ft-width-150'
            },
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
            {
              name: 'Last Audit Result, %',
              property: 'result',
              filter: true,
              sorting: true,
              type: 'percent',
              editable: false,
              link: {
                template: '/audit/{id}/info/{last_submitted_id}',
                properties: ['id', 'last_submitted_id']
              }
            },
            {
              name: 'Submitted Audit',
              property: 'last_submitted_date',
              filter: true,
              orting: true,
              type: 'date',
              editable: false,
              class: 'ft-date-width'
            },
            {
              name: 'Last Auditors',
              property: 'auditors_last',
              filter: true,
              sorting: false,
              type: 'multiselect',
              propToShow: ['first_name', 'second_name'],
              values: this.auditors,
              editable: false,
              class: 'ft-width-250'
            },
            {
              name: 'Next Due Date',
              property: 'last_created_due_date',
              filter: true,
              sorting: true,
              type: 'date',
              format: 'dd/MM/yy',
              editable: false,
              class: 'fit'
            },
            {
              name: 'Next Project Audit',
              property: 'next_action',
              filter: true,
              sorting: false,
              type: 'link',
              values: this.linkNames,
              editable: false,
              class: 'ft-width-120'
            },
            {
              name: 'Next Auditors',
              property: 'auditors_next',
              filter: true,
              sorting: false,
              type: 'multiselect',
              propToShow: ['first_name', 'second_name'],
              values: this.auditors,
              editable: false,
              class: 'ft-width-250'
            },
          ];
        });
      });
    });
  }

  download(all: boolean) {
    this.auditService.downloadSubmittedAuditExports('xlsx', all).subscribe(result => {
      BlobUtils.download(result.blob, result.fileName);
    });
  }

  rowClicked($event) {
    this.router.navigate([`/audit/${$event.id}`]);
  }
}
