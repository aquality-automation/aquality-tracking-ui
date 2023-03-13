import { Component, OnInit } from '@angular/core';
import { AuditStat, Service, Audit } from '../../../shared/models/audit';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../../shared/models/user';
import BlobUtils from '../../../shared/utils/blob.utils';
import { TFOrder, TFColumn, TFColumnType } from 'src/app/elements/table-filter/tfColumn';
import { AuditService } from 'src/app/services/audit/audits.service';
import { UserService } from 'src/app/services/user/user.services';
import { PermissionsService, EGlobalPermissions } from 'src/app/services/permissions/current-permissions.service';
import DateUtils from 'src/app/shared/utils/date.utils';

@Component({
  templateUrl: './audit.component.html'
})
export class AuditComponent implements OnInit {
  services: Service[];
  coordinators: User[];
  stats: AuditStat[];
  auditors: User[];
  auditsList: Audit[];
  defSort = { property: 'last_created_due_date', order: TFOrder.desc };
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
    private permissions: PermissionsService
  ) { }

  async ngOnInit() {
    const isAuditAdmin = await this.permissions.hasPermissions([EGlobalPermissions.audit_admin]);
    this.stats = await this.auditService.getAuditStats();
    this.coordinators = await this.userService.getUsers({ unit_coordinator: 1 });
    this.auditors = await this.userService.getUsers({ auditor: 1 });
    isAuditAdmin ? this.linkNames.push('Create New') : this.linkNames.push('Not created');
    this.stats.forEach(async (stat) => {
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
      } else if (isAuditAdmin) {
        stat['next_action'] = { text: 'Create New', link: `/audit/${stat.id}/create` };
      } else {
        stat['next_action'] = { text: 'Not created' };
      }

      this.auditsList = await this.auditService.getAudits({ project: { id: stat.id } } );
      let datesArray: (Date|string|number)[] = [];
      this.auditsList.forEach(audit => {datesArray.push(audit.created)});
      stat.last_audit_created_date = new Date(Math.max.apply(null, datesArray));
    });
    this.services = await this.auditService.getServices();
    this.createColumns();
  }

  async download(all: boolean) {
    const result = await this.auditService.downloadSubmittedAuditExports('xlsx', all);
    const filename = all
      ? `Aquality_Tracking_All_Submitted_Audits_${DateUtils.getDateFormat()}.xlsx`
      : `Aquality_Tracking_Last_Submitted_Audits_${DateUtils.getDateFormat()}.xlsx`;
    BlobUtils.download(result.blob, filename);
  }

  rowClicked($event) {
    this.router.navigate([`/audit/${$event.id}`]);
  }

  createColumns() {
    this.columns = [
      { name: 'Project', property: 'name', filter: true, sorting: true, type: TFColumnType.text },
      {
        name: 'Unit Coordinator',
        property: 'project.customer.coordinator',
        filter: true,
        type: TFColumnType.autocomplete,
        lookup: {
          propToShow: ['first_name', 'second_name'],
          values: this.coordinators,
        },
        class: 'ft-width-150'
      },
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
      {
        name: 'Last Audit Created Date',
        property: 'last_audit_created_date',
        filter: true,
        sorting: true,
        type: TFColumnType.date,
        format: 'MMM dd, yyyy',
        class: 'fit'
      },
      {
        name: 'Last Audit Result',
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
        format: 'MMM dd, yyyy',
        class: 'fit'
      },
      {
        name: 'Last Auditors',
        property: 'auditors_last',
        filter: true,
        type: TFColumnType.multiselect,
        lookup: {
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
        format: 'MMM dd, yyyy',
        class: 'fit'
      },
      {
        name: 'Next Project Audit',
        property: 'next_action',
        filter: true,
        sorting: false,
        type: TFColumnType.link,
        lookup: {
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
          propToShow: ['first_name', 'second_name'],
          values: this.auditors,
        },
        class: 'ft-width-250'
      },
    ];
  }
}
