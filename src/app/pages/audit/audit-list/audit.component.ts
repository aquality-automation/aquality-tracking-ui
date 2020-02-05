import { Component, OnInit } from '@angular/core';
import { AuditStat, Service } from '../../../shared/models/audit';
import { AuditService } from '../../../services/audits.service';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../../shared/models/user';
import { UserService } from '../../../services/user.services';
import BlobUtils from '../../../shared/utils/blob.utils';
import { TFColumn, TFColumnType } from '../../../elements/table/tfColumn';

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
  columns: TFColumn[];
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
      this.userService.getUsers({ unit_coordinator: 1 }).subscribe(users => this.coordinators = users);
      this.userService.getUsers({ auditor: 1}).subscribe(users => {
        this.auditors = users;
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
            { name: 'Project', property: 'name', filter: true, sorting: true, type: TFColumnType.text },
            {
              name: 'Unit Coordinator',
              property: 'project.customer.coordinator',
              filter: true,
              type: TFColumnType.autocomplete,
              lookup: {
                entity: 'project.customer.coordinator',
                propToShow: ['first_name', 'second_name'],
                values: this.coordinators,
              },
              class: 'ft-width-150'
            },
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
            {
              name: 'Last Audit Result, %',
              property: 'result',
              filter: true,
              sorting: true,
              type: TFColumnType.percent,
              link: {
                template: '/audit/{id}/info/{last_submitted_id}',
                properties: ['id', 'last_submitted_id']
              }
            },
            {
              name: 'Submitted Audit',
              property: 'last_submitted_date',
              filter: true,
              sorting: true,
              type: TFColumnType.date,
              class: 'ft-date-width'
            },
            {
              name: 'Last Auditors',
              property: 'auditors_last',
              filter: true,
              type: TFColumnType.multiselect,
              lookup: {
                entity: 'auditors_last',
                propToShow: ['first_name', 'second_name'],
                values: this.auditors,
              },
              class: 'ft-width-250'
            },
            {
              name: 'Next Due Date',
              property: 'last_created_due_date',
              filter: true,
              sorting: true,
              type: TFColumnType.date,
              format: 'dd/MM/yy',
              editable: false,
              class: 'fit'
            },
            {
              name: 'Next Project Audit',
              property: 'next_action',
              filter: true,
              sorting: false,
              type: TFColumnType.link,
              lookup: {
                entity: 'next_action',
                values: this.linkNames,
                propToShow: []
              },
              editable: false,
              class: 'ft-width-120'
            },
            {
              name: 'Next Auditors',
              property: 'auditors_next',
              filter: true,
              sorting: false,
              type: TFColumnType.multiselect,
              lookup: {
                entity: 'auditors_next',
                propToShow: ['first_name', 'second_name'],
                values: this.auditors,
              },
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
