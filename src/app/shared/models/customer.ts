import { Project } from './project';
import { User } from './user';
import { BaseComment } from './general';

export class Customer {
  id?: number;
  name?: string;
  projects?: Project[];
  coordinator_id?: number;
  coordinator?: User;
  accounting?: number;
  account_manager_id?: number;
  account_manager?: User;
  created?: Date;
  comments?: CustomerComment[];
  attachments?: CustomerAttachment[];
  projects_count?: number;
  account_team?: User[];
}

export class CustomerComment extends BaseComment {
  id?: number;
  customer_id?: number;
}

export class CustomerAttachment {
  customer_id?: number;
  path?: string;
  id?: number;
}
