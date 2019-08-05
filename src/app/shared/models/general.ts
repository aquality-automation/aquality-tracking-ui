import { User } from './user';

export class BaseComment {
  body?: string;
  author?: User;
  created?: Date;
}
