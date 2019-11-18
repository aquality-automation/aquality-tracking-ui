import { Project } from './project';
import { User } from './user';

export class Customer {
  id?: number;
  name?: string;
  projects?: Project[];
  coordinator_id?: number;
  coordinator?: User;
  created?: Date;
  projects_count?: number;
}
