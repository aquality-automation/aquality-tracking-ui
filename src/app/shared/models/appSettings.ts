export class GeneralAppSettings {
  id?: number;
  ldap_auth?: number;
  base_auth?: number;
  audits?: number;
  frontURL?: string;
}

export class LDAPSettings {
  ldapAdServer?: string;
  ldapSearchBaseUsers?: string;
  security_auntification?: string;
  userSearchFilter?: string;
  domain?: string;
  mailAttribute?: string;
  firstNameAttribute?: string;
  userNameAttribute?: string;
  lastNameAttribute?: string;
  id?: number;
  adminUserName?: string;
  adminSecret?: string;
}

export class EmailSettings {
  id?: number;
  host?: string;
  user?: string;
  password?: string;
  enabled?: number;
  from_email?: string;
  port?: number;
  use_auth?: number;
}
