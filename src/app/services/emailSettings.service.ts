import { SimpleRequester } from './simple-requester';
import { Injectable } from '@angular/core';
import { EmailSettings } from '../shared/models/appSettings';

@Injectable()
export class EmailSettingsService extends SimpleRequester {

  getEmailSettings(): Promise<EmailSettings> {
    return this.doGet('/settings/email').map(res => res.json()).toPromise();
  }

  async updateEmailSettings(emailSettings: EmailSettings): Promise<EmailSettings> {
    try {
      emailSettings = await this.doPost('/settings/email', emailSettings).map(res => res.json()).toPromise();
      this.handleSuccess('Email Settings were updated!');
      return emailSettings;
    } catch (error) {
      return emailSettings;
    }
  }

  getEmailsStatus() {
    return this.doGet('/settings/email/status').map(res => res.json());
  }
}
