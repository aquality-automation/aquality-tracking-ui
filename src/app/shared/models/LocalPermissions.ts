import { User } from './user';

export class LocalPermissions {
  user?: User;
  user_id?: number;
  project_id?: number;
  admin= 0;
  manager= 0;
  engineer= 0;
  viewer?: number;
}
