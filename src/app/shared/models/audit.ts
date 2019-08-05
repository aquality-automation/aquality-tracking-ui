import { User } from './user';
import { Project } from './project';
import { BaseComment } from './general';

export class Audit {
  id?: number;
  project?: Project;
  project_id?: number;
  status?: AuditStatus;
  status_id?: number;
  due_date?: Date|string|number;
  created?: Date|string|number;
  started?: Date|string|number;
  submitted?: Date|string|number;
  progress_finished?: Date|string|number;
  result?: number;
  summary?: string;
  comments?: AuditComment[];
  auditors?: Auditor[];
  service?: Service;
  service_type_id?: number;
}
export class AuditComment extends BaseComment {
  id?: number;
  audit_id?: number;
}

export class Auditor extends User {
  auditor_id?: number;
  audit_id?: number;
  assignee_user_id?: number;
}

export class AuditNotification {
  last_submitted?: Audit;
  has_opened_audit?: boolean;
  next_due_date?: Date|string|number;
}

export class AuditStatus {
  id?: number;
  name?: string;
  color?: number;
}

export class AuditAttachment {
  audit_id?: number;
  path?: string;
  id?: number;
}

export class AuditStat {
  result?: number;
  name?: string;
  project?: Project;
  id?: number;
  created: Date;
  last_created_due_date?: Date;
  last_submitted_date?: Date;
  last_submitted_id?: number;
  auditors_last?: User[];
  auditors_next?: User[];
  service?: Service;
  last_created_id?: number;
  status_name?: string;
}

export class Service {
  id?: number;
  name?: string;
  color?: string;
}
