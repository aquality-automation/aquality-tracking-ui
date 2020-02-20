import { User } from './user';
import { Customer } from './customer';
import { ResultResolution } from './result_resolution';

export class Project {
  id?: number;
  name?: string;
  created?: Date;
  coordinator?: User;
  customer_id?: number;
  customer?: Customer;
  steps?: boolean | number;
  compare_result_pattern?: string;
  stability_count?: number;
}

export class ImportBodyPattern {
  id?: number;
  name?: string;
  project_id?: number;
}

export class PredefinedResolution {
  id?: number;
  project_id?: number;
  resolution_id?: number;
  comment?: string;
  assignee?: number;
  expression?: string;
  resolution?: ResultResolution;
  assigned_user?: User;
}
