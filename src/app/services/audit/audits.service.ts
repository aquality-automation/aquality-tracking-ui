import { Injectable } from '@angular/core';
import { BaseHttpService } from '../base-http/base-http.service';
import { Audit, AuditStat, Auditor, AuditComment, Service, AuditAttachment } from 'src/app/shared/models/audit';


@Injectable()
export class AuditService extends BaseHttpService {

  getAudits(audit: Audit): Promise<Audit[]> {
    const objectToSend: Audit = {
      id: audit.id,
      project_id: audit.project ? audit.project.id : undefined,
      status_id: audit.status ? audit.status.id : undefined,
    };
    return this.http.get<Audit[]>('/audit', { params: this.convertToParams(objectToSend) }).toPromise();
  }

  getServices(): Promise<Service[]> {
    return this.http.get<Service[]>('/audit/service').toPromise();
  }

  getAuditStats(): Promise<AuditStat[]> {
    return this.http.get<AuditStat[]>('/audit/stat').toPromise();
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
    return this.http.post<Audit>('/audit', this.convertToParams(objectToSend)).toPromise();
  }

  async removeAudit(audit: Audit) {
    await this.http.delete(`/audit`, { params: { id: audit.id.toString() } }).toPromise();
    this.handleSuccess(`Audit for the project ${audit.project.name} was deleted`);
  }

  updateAuditors(auditors: Auditor[], audit_id: number) {
    return this.http.post(`/audit/auditors`, auditors, { params: { audit_id: audit_id.toString() } }).toPromise();
  }

  async createOrUpdateAuditComment(comment: AuditComment, project_id: number) {
    await this.http.post(`/audit/comment`, comment, { params: { project_id: project_id.toString() } }).toPromise();
    this.handleSuccess(`Comment was added.`);
  }

  getAuditAttachments(audit_id: number, project_id: number) {
    return this.http.get<AuditAttachment[]>(`/audit/attachment`,
      { params: { audit_id: audit_id.toString(), project_id: project_id.toString() } }).toPromise();
  }

  async removeAuditAttachment(id: number, project_id: number) {
    await this.http.delete(`/audit/attachment`, { params: { id: id.toString(), project_id: project_id.toString() } }).toPromise();
    this.handleSuccess(`Audit attachment was deleted.`);
  }

  downloadAuditAttachment(id: number, project_id: number): Promise<Blob> {
    return this.http.get<Blob>(`/audit/attachment/download`, {
      params: { id: id.toString(), project_id: project_id.toString() },
      responseType: 'blob' as 'json'
    }).toPromise();
  }

  async downloadSubmittedAuditExports(type: string, all: boolean) {

    const blob = await this.http.get<Blob>(`/audit/export`, {
      params: { type: type, all: String(all) },
      responseType: 'blob' as 'json'
    }).toPromise();
    return {
      blob: blob
    };
  }

  createDueDate(date: Date): Date {
    return new Date(new Date(date.setMonth(date.getMonth() + 6)).setHours(0, 0, 0, 0));
  }
}
