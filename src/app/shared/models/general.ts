import { User } from './user';

export class BaseComment {
  body?: string;
  author?: User;
  created?: Date;
}

export class Label {
  id?: number;
  name?: String;
  color?: number;
  project_id?: number;
}
