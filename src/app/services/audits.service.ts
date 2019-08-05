import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { SimpleRequester } from './simple-requester';
import { Audit, AuditComment, Auditor } from '../shared/models/audit';


@Injectable()
export class AuditService extends SimpleRequester {

  getAudits(audit: Audit) {
    const objectToSend: Audit = {
      id: audit.id,
      project_id: audit.project ? audit.project.id : undefined,
      status_id: audit.status ? audit.status.id : undefined,
    };
    return this.doPost('/audit/get', objectToSend).map(res => res.json());
  }

  getServices() {
    return this.doGet('/audit/service').map(res => res.json());
  }

  getAuditStats() {
    return this.doGet('/audit/stat').map(res => res.json());
  }

  createOrUpdateAudit(audit: Audit) {
    const objectToSend: Audit = {
      id: audit.id,
      project_id: audit.project.id,
      status_id: audit.status ? audit.status.id : undefined,
      created: audit.created,
      started: audit.started,
      progress_finished: audit.progress_finished,
      due_date: audit.due_date,
      submitted: audit.submitted,
      result: audit.result,
      summary: audit.summary,
      service_type_id: audit.service ? audit.service.id : undefined,
      auditors: audit.auditors
    };
    return this.doPost('/audit/create', objectToSend).map(res => res.json());
  }

  removeAudit(audit: Audit) {
    return this.doDelete(`/audit?id=${audit.id}`).map(res => this.handleSuccess(`Audit for the project ${audit.project.name} was deleted`));
  }

  updateAuditors(auditors: Auditor[], audit_id: number) {
    return this.doPost(`/audit/auditors?audit_id=${audit_id}`, auditors).map(res => res);
  }

  createOrUpdateAuditComment(comment: AuditComment, project_id: number) {
    return this.doPost(`/audit/comment?project_id=${project_id}`, comment).map(res => this.handleSuccess(`Comment was added.`));
  }

  getAuditAttachments(audit_id: number, project_id: number) {
    return this.doGet(`/audit/attachment?audit_id=${audit_id}&project_id=${project_id}`).map(res => res.json());
  }

  removeAuditAttachment(id: number) {
    return this.doDelete(`/audit/attachment?id=${id}`).map(res => this.handleSuccess(`Audit attachment was deleted.`));
  }

  downloadAuditAttachment(id: number, project_id: number): Observable<Blob> {
    return this.doDownload(`/audit/attachment/download?id=${id}&project_id=${project_id}`).map(res => {
      return new Blob([res.blob()], { type: res.headers.get('Content-Type') });
    });
  }
  downloadSubmittedAuditExports(type: string, all: boolean) {
    return this.doDownload(`/audit/export?type=${type}&all=${all}`).map(res => {
      return {
        blob: new Blob([res.blob()], {
          type: res.headers.get('Content-Type')
        }),
        fileName: res.headers.get('Content-Disposition').match(/filename=\"(.*)\"/)[1].toString()
      };
    });
  }

  createDueDate(date: Date): Date {
    return new Date(new Date(date.setMonth(date.getMonth() + 6)).setHours(0, 0, 0, 0));
  }
}
