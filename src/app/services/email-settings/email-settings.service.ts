
import { Injectable } from '@angular/core';
import { BaseHttpService } from '../base-http/base-http.service';
import { EmailSettings } from 'src/app/shared/models/app-settings';

@Injectable()
export class EmailSettingsService extends BaseHttpService {

  getEmailSettings(): Promise<EmailSettings> {
    return this.http.get<EmailSettings>('/settings/email').toPromise();
  }

  async updateEmailSettings(emailSettings: EmailSettings): Promise<EmailSettings> {
    try {
      emailSettings = await this.http.post<EmailSettings>('/settings/email', emailSettings).toPromise();
      this.handleSuccess('Email Settings were updated!');
      return emailSettings;
    } catch (error) {
      return emailSettings;
    }
  }

  async getEmailsStatus(): Promise<boolean> {
    return !!(await this.http.get<EmailSettings>('/settings/email/status').toPromise()).enabled;
  }
}
