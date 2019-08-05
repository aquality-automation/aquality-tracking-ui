import { Component } from '@angular/core';
import { Audit, AuditAttachment, AuditComment, Service } from '../../shared/models/audit';
import { AuditService } from '../../services/audits.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.services';
import { User } from '../../shared/models/user';
import { BaseComment } from '../../shared/models/general';
import { DatepickerOptions } from 'custom-a1qa-ng2-datepicker';
import * as enLocale from 'date-fns/locale/en';
import { TransformationsService } from '../../services/transformations.service';
import BlobUtils from '../../shared/utils/blob.utils';

@Component({
  templateUrl: './audit.info.component.html',
  styleUrls: ['./audit.info.component.css'],
  providers: [
    TransformationsService,
    AuditService,
    UserService
  ]
})
export class AuditInfoComponent {
  editorConfig: { spellcheck: boolean; placeholder: string; };
  services: Service[];
  public audit: Audit;
  public attachments: AuditAttachment[];

  canEdit = false;

  removingInProgress = false;
  hideModal = true;
  ModalTitle: string;
  ModalMessage: string;
  disableComments: boolean;
  buttons: { execute: string, name: string }[] = [];
  DateOpts: DatepickerOptions = {
    locale: enLocale,
    minYear: new Date().getFullYear(),
    displayFormat: 'DD/MM/YY',
    barTitleFormat: 'MMMM YYYY',
    firstCalendarDay: 1,
  };
  auditors: User[];
  URL: string;

  constructor(
    public route: ActivatedRoute,
    private router: Router,
    public userService: UserService,
    public auditService: AuditService
  ) {
    this.URL = `/audit/attachment?audit_id=${this.route.snapshot.params['auditId']}`;
    this.userService.getUsers().subscribe(users => {
      this.auditors = users.filter(x => x.auditor === 1);
      this.auditService.getServices().subscribe(services => this.services = services);
      this.auditService.getAudits({ id: this.route.snapshot.params['auditId'] }).subscribe(audits => {
        if (audits.length === 0) {
          this.router.navigate(['**']);
        }
        this.audit = audits[0];

        const global = (!this.userService.IsAuditor() && !this.userService.IsAuditAdmin() && !this.userService.IsManager());

        this.userService.IsLocalAdminById(this.audit.project.id).then(isAdmin => {
          const admin = isAdmin;
          this.userService.IsLocalManagerById(this.audit.project.id).then(isManager => {
            const manager = isManager;
            this.disableComments = global && !admin && !manager;
          });
        });

        if (!this.audit.due_date) {
          this.audit.due_date = new Date();
        } else {
          this.audit.due_date = new Date(this.audit.due_date);
        }

        this.updateCanEdit();

        this.getAttachments();

        this.editorConfig = {
          spellcheck: false,
          placeholder: 'Enter text here...'
        };
      }, () => {
        this.router.navigate([`**`]);
      });
    });
  }

  updateCanEdit() {
    this.canEdit = (this.userService.IsAuditAdmin() || this.isAuditorOfAudit()) && this.audit.status.id !== 4;
  }

  isAuditorOfAudit() {
    return this.audit.auditors.find(x => x.id === this.userService.currentUser().id) ? true : false;
  }

  getAttachments() {
    this.auditService.getAuditAttachments(this.audit.id, this.audit.project.id).subscribe(res => {
      this.attachments = res;
    });
  }

  removeAttachment(id) {
    this.removingInProgress = true;
    this.auditService.removeAuditAttachment(id).subscribe(res => {
      this.getAttachments();
      this.removingInProgress = false;
    });
  }

  downloadAttach(attach) {
    this.auditService.downloadAuditAttachment(attach.id, this.audit.project.id).subscribe(blob => {
      BlobUtils.download(blob, this.getAttachName(attach));
    }, () => this.getAttachments());
  }

  getAttachName(attach: AuditAttachment) {
    return attach.path.split('\\').pop().split('/').pop();
  }

  dateUpdate($event, date: string) {
    this.audit[date] = new Date(new Date($event).setHours(0, 0, 0, 0));
    this.update();
  }

  getDueDate() {
    return this.audit.due_date ? new Date(this.audit.due_date.toString()) : new Date();
  }

  auditorsChange($event) {
    this.auditService.updateAuditors($event, this.audit.id).finally(() => {
      this.auditService.getAudits({ id: this.route.snapshot.params['auditId'] }).subscribe(res => {
        this.audit.auditors = res[0].auditors;
        this.updateCanEdit();
      });
    }).subscribe();
  }

  getAuditorsString() {
    let resultString = '';
    this.audit.auditors.forEach(auditor => {
      resultString += `${auditor.first_name} ${auditor.second_name}, `;
    });
    return resultString.slice(0, -2);
  }

  updateResult() {
    this.auditService.createOrUpdateAudit({ id: this.audit.id, result: this.audit.result, project: this.audit.project }).subscribe();
  }

  updateService() {
    this.auditService.createOrUpdateAudit({ id: this.audit.id, service: this.audit.service, project: this.audit.project }).subscribe();
  }

  update() {
    this.auditService.createOrUpdateAudit(this.audit).subscribe(res => {
      this.getAudit();
    });
  }
  getAudit() {
    this.auditService.getAudits({ id: this.route.snapshot.params['auditId'] }).subscribe(res => {
      this.audit = res[0];
      this.updateCanEdit();
    });
  }

  resultError($event) {
    this.auditService.handleSimpleError('Save Audit Result', 'Audit result should be between 1 and 100.');
  }

  startProgress() {
    this.buttons = [{ name: 'yes', execute: 'start' }, { name: 'no', execute: 'false' }];
    this.ModalTitle = `Start Audit for the ${this.audit.project.name} project`;
    this.ModalMessage =
      `Are you sure that you want to move current Audit to 'In Progress' status? Please note that the action cannot be undone.`;
    this.hideModal = false;
  }

  start() {
    if (this.audit.due_date) {
      this.audit.status.id = 2;
      this.audit.started = new Date();
      this.update();
    }
  }

  finishProgress() {
    this.buttons = [{ name: 'yes', execute: 'finish' }, { name: 'no', execute: 'false' }];
    this.ModalTitle = `Finish Audit for the ${this.audit.project.name} project`;
    this.ModalMessage =
      `Are you sure that you want to move current Audit to 'In Review' status? Please note that the action cannot be undone.`;
    this.hideModal = false;
  }

  finish() {
    if (this.audit.result && this.audit.summary && this.attachments.length > 0) {
      this.audit.progress_finished = new Date();
      this.audit.status.id = 3;
      this.update();
    }
  }

  submitAudit() {
    this.buttons = [{ name: 'yes', execute: 'submit' }, { name: 'no', execute: 'false' }];
    this.ModalTitle = `Submit Audit for the ${this.audit.project.name} project`;
    this.ModalMessage =
      `Are you sure that you want to move current Audit to 'Submitted' status? Please note that the action cannot be undone.`;
    this.hideModal = false;
  }

  submit() {
    if (this.audit.result && this.audit.summary && this.attachments.length > 0) {
      this.audit.submitted = new Date();
      this.audit.status.id = 4;
      this.update();
    }
  }

  cancelAudit() {
    this.buttons = [{ name: 'yes', execute: 'remove' }, { name: 'no', execute: 'false' }];
    this.ModalTitle = `Remove Audit for the ${this.audit.project.name} project`;
    this.ModalMessage =
      `Are you sure that you want to cancel current Audit?
      This will permanently delete all data assosiated with this audit. Please note that the action cannot be undone.`;
    this.hideModal = false;
  }

  execute($event) {
    if ($event === 'remove') {
      this.auditService.removeAudit(this.audit).subscribe(() => this.router.navigate(['/audit']));
    } else if ($event === 'start') {
      this.start();
    } else if ($event === 'finish') {
      this.finish();
    } else if ($event === 'submit') {
      this.submit();
    }
    this.hideModal = true;
  }

  wasClosed($event) {
    this.hideModal = $event;
  }

  addComment(comment: BaseComment) {
    const auditComment: AuditComment = comment;
    auditComment.audit_id = this.audit.id;
    this.auditService.createOrUpdateAuditComment(auditComment, this.audit.project.id).subscribe(res => this.getAudit());
  }
}
