import { SimpleRequester } from './simple-requester';
import { Injectable } from '@angular/core';
import { EmailSettings } from '../shared/models/appSettings';

@Injectable()
export class EmailSettingsService extends SimpleRequester {

  getEmailSettings() {
    return this.doGet('/settings/email').map(res => res.json());
  }

  updateEmailSettings(emailSettings: EmailSettings) {
    return this.doPost('/settings/email', emailSettings).map(res => res);
  }

  getEmailsStatus() {
    return this.doGet('/settings/email/status').map(res => res.json());
  }
}
