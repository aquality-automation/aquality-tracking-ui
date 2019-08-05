import { SimpleRequester } from './simple-requester';
import { Injectable } from '@angular/core';
import { LDAPSettings, GeneralAppSettings } from '../shared/models/appSettings';

@Injectable()
export class ApplicationSettingsService extends SimpleRequester {

  getGeneralSettings() {
    return this.doGet('/settings').map(res => res.json());
  }

  getLDAPSettings() {
    return this.doGet('/settings/ldap').map(res => res.json());
  }

  updateGeneralSettings(generalSettings: GeneralAppSettings) {
    return this.doPost('/settings', generalSettings).map(res => res);
  }

  updateLDAPSettings(ldapSettings: LDAPSettings) {
    return this.doPost('/settings/ldap', ldapSettings).map(res => res);
  }

  getAuthSettings() {
    return this.doGet('/authInfo').map(res => res.json());
  }
}
