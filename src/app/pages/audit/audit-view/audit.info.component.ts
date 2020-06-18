import { Component, OnInit } from '@angular/core';
import { Audit, AuditAttachment, AuditComment, Service } from '../../../shared/models/audit';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../../shared/models/user';
import { BaseComment } from '../../../shared/models/general';
import BlobUtils from '../../../shared/utils/blob.utils';
import { faTrash, faUpload } from '@fortawesome/free-solid-svg-icons';
import { UserService } from 'src/app/services/user/user.services';
import { AuditService } from 'src/app/services/audit/audits.service';
import { PermissionsService, EGlobalPermissions, ELocalPermissions } from 'src/app/services/permissions/current-permissions.service';

@Component({
  templateUrl: './audit.info.component.html',
  styleUrls: ['./audit.info.component.scss']
})

export class AuditInfoComponent implements OnInit {
  editorConfig: { spellcheck: boolean; placeholder: string; };
  services: Service[];
  public audit: Audit;
  public attachments: AuditAttachment[];

  canEdit: boolean;
  global: boolean;
  local: boolean;
  isAuditAdmin: boolean;

  removingInProgress = false;
  hideModal = true;
  modalTitle: string;
  modalMessage: string;
  disableComments: boolean;
  buttons: { execute: string, name: string }[] = [];
  // DateOpts: DatepickerOptions = {
  //   locale: enLocale,
  //   minYear: new Date().getFullYear(),
  //   displayFormat: 'MM/DD/YY',
  //   barTitleFormat: 'MMMM YYYY',
  //   firstCalendarDay: 1,
  // };
  auditors: User[];
  URL: string;
  events = { remove: 'remove', start: 'start', submit: 'submit', finish: 'finish' };
  icons = { faTrash, faUpload };

  constructor(
    public route: ActivatedRoute,
    private router: Router,
    public userService: UserService,
    public auditService: AuditService,
    private permissions: PermissionsService
  ) { }

  async ngOnInit() {
    const auditId = this.route.snapshot.params.auditId;
    this.URL = `/audit/attachment?audit_id=${auditId}`;
    this.auditors = await this.userService.getUsers({ auditor: 1 });
    this.services = await this.auditService.getServices();
    const audits = await this.auditService.getAudits({ id: auditId });

    if (audits.length === 0) {
      this.router.navigate(['**']);
      return;
    }

    this.audit = audits[0];

    if (!this.audit.due_date) {
      this.audit.due_date = new Date();
    } else {
      this.audit.due_date = new Date(this.audit.due_date);
    }

    this.isAuditAdmin = await this.permissions
      .hasPermissions([EGlobalPermissions.audit_admin]);
    this.global = await this.permissions
      .hasPermissions([EGlobalPermissions.auditor, EGlobalPermissions.audit_admin, EGlobalPermissions.manager]);
    this.local = await this.permissions.hasProjectPermissions(this.audit.project.id, undefined,
      [ELocalPermissions.admin, ELocalPermissions.manager]);
    this.disableComments = !this.global && !this.local;

    await this.updateCanEdit();
    await this.updateAttachments();

    this.editorConfig = {
      spellcheck: false,
      placeholder: 'Enter text here...'
    };
  }

  async updateCanEdit() {
    this.canEdit = this.isAuditAdmin || this.isAuditorOfAudit() && this.audit.status.id !== 4;
  }

  isAuditorOfAudit() {
    return this.audit.auditors.find(x => x.id === this.userService.currentUser().id) ? true : false;
  }

  async updateAttachments() {
    this.attachments = await this.auditService.getAuditAttachments(this.audit.id, this.audit.project.id);
  }

  async removeAttachment(id: number) {
    this.removingInProgress = true;
    await this.auditService.removeAuditAttachment(id, this.audit.project.id);
    this.updateAttachments();
    this.removingInProgress = false;
  }

  async downloadAttach(attach: AuditAttachment) {
    const blob = await this.auditService.downloadAuditAttachment(attach.id, this.audit.project.id);
    BlobUtils.download(blob, this.getAttachName(attach));
    this.updateAttachments();
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

  async auditorsChange($event) {
    await this.auditService.updateAuditors($event, this.audit.id);
    await this.auditService.getAudits({ id: this.audit.id });
    this.updateCanEdit();
  }

  getAuditorsString() {
    let resultString = '';
    this.audit.auditors.forEach(auditor => {
      resultString += `${auditor.first_name} ${auditor.second_name}, `;
    });
    return resultString.slice(0, -2);
  }

  async updateResult() {
    await this.auditService.createOrUpdateAudit({
      id: this.audit.id,
      result: this.audit.result,
      project: this.audit.project
    });
    this.auditService.handleSuccess('Audit Result updated.');
  }

  async updateService() {
    await this.auditService.createOrUpdateAudit({
      id: this.audit.id,
      service: this.audit.service,
      project: this.audit.project
    });
    this.auditService.handleSuccess('Audit Service updated.');
  }

  async update() {
    await this.auditService.createOrUpdateAudit(this.audit);

    this.getAudit();
    this.auditService.handleSuccess('Audit was saved.');
  }

  async getAudit() {
    this.audit = (await this.auditService.getAudits({ id: this.route.snapshot.params['auditId'] }))[0];
    this.updateCanEdit();
  }

  resultError($event) {
    this.auditService.handleSimpleError('Save Audit Result', 'Audit result should be between 1 and 100.');
  }

  startProgress() {
    this.buttons = [{ name: 'yes', execute: this.events.start }, { name: 'no', execute: 'false' }];
    this.modalTitle = `Start Audit for the ${this.audit.project.name} project`;
    this.modalMessage =
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
    this.buttons = [{ name: 'yes', execute: this.events.finish }, { name: 'no', execute: 'false' }];
    this.modalTitle = `Finish Audit for the ${this.audit.project.name} project`;
    this.modalMessage =
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
    this.buttons = [{ name: 'yes', execute: this.events.submit }, { name: 'no', execute: 'false' }];
    this.modalTitle = `Submit Audit for the ${this.audit.project.name} project`;
    this.modalMessage =
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
    this.buttons = [{ name: 'yes', execute: this.events.remove }, { name: 'no', execute: 'false' }];
    this.modalTitle = `Remove Audit for the ${this.audit.project.name} project`;
    this.modalMessage =
      `Are you sure that you want to cancel current Audit?
      This will permanently delete all data assosiated with this audit. Please note that the action cannot be undone.`;
    this.hideModal = false;
  }

  async execute(value: Promise<String | boolean>) {
    this.changeAuditStatus(await value);
    this.hideModal = true;
  }

  async changeAuditStatus(value: String | boolean) {
    switch (value) {
      case this.events.remove:
        await this.auditService.removeAudit(this.audit);
        this.router.navigate(['/audit']);
        break;
      case this.events.start:
        this.start();
        break;
      case this.events.finish:
        this.finish();
        break;
      case this.events.submit:
        this.submit();
        break;
    }
  }

  wasClosed() {
    this.hideModal = true;
  }

  async addComment(comment: BaseComment) {
    const auditComment: AuditComment = comment;
    auditComment.audit_id = this.audit.id;
    await this.auditService.createOrUpdateAuditComment(auditComment, this.audit.project.id);
    this.getAudit();
  }
}
