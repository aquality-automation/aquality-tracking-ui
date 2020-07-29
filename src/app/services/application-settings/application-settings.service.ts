import { Injectable } from '@angular/core';
import { GeneralAppSettings, LDAPSettings } from 'src/app/shared/models/app-settings';
import { BaseHttpService } from '../base-http/base-http.service';

@Injectable()
export class ApplicationSettingsService extends BaseHttpService {

  getGeneralSettings() {
    return this.http.get<GeneralAppSettings>('/settings').toPromise();
  }

  getLDAPSettings() {
    return this.http.get('/settings/ldap').toPromise();
  }

  updateGeneralSettings(generalSettings: GeneralAppSettings) {
    return this.http.post('/settings', generalSettings).toPromise();
  }

  updateLDAPSettings(ldapSettings: LDAPSettings) {
    return this.http.post('/settings/ldap', ldapSettings, { observe: 'response' }).toPromise();
  }
}
