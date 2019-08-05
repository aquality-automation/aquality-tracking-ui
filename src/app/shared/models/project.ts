import { User } from './user';
import { Customer } from './customer';

export class Project {
  id?: number;
  name?: string;
  created?: Date;
  coordinator?: User;
  customer_id?: number;
  customer?: Customer;
}

export class ImportBodyPattern {
  id?: number;
  name?: string;
  project_id?: number;
}
