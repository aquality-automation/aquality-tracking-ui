import stringUtils from '../utils/string.utils';

export class User {
  first_name?: string;
  id?: number;
  role_id?: number;
  second_name?: string;
  user_name?: string;
  admin?: number;
  manager?: number;
  auditor?: number;
  audit_admin?: number;
  unit_coordinator?: number;
  head?: number;
  account_manager?: number;
  email?: string;
  password?: string;
  ldap_user?: boolean;
  audit_notifications?: number;
}

export class Password {
  old_password: any;
  password: any;
  user_id: number;
}
