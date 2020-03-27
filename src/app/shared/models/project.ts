import { User } from './user';
import { Customer } from './customer';

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
