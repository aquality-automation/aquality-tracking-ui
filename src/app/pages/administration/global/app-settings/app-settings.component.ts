import { Component, OnInit } from '@angular/core';
import { Constants } from './app-settings.constants';
import { GeneralAppSettings, LDAPSettings, EmailSettings } from 'src/app/shared/models/app-settings';
import { ApplicationSettingsService } from 'src/app/services/application-settings/application-settings.service';
import { EmailSettingsService } from 'src/app/services/email-settings/email-settings.service';

@Component({
    templateUrl: 'app-settings.component.html',
    styleUrls: ['app-settings.component.scss'],
})

export class AppSettingsComponent implements OnInit {
    public generalSettings: GeneralAppSettings;
    public ldapSettings: LDAPSettings;
    public emailSettings: EmailSettings;
    public emailHelpText = Constants.emailPatternHelpText;
    public emailHelpTextHint = Constants.emailHelpTextHint;

    constructor(
        private appSettingService: ApplicationSettingsService,
        private emailSettingsService: EmailSettingsService
    ) { }

    async ngOnInit() {
        [this.generalSettings, this.ldapSettings, this.emailSettings] = await Promise.all([
            this.appSettingService.getGeneralSettings(),
            this.appSettingService.getLDAPSettings(),
            this.emailSettingsService.getEmailSettings()
        ]);
        this.setBaseURL();
    }

    async saveGeneral() {
        await this.appSettingService.updateGeneralSettings({
            id: this.generalSettings.id,
            ldap_auth: +this.generalSettings.ldap_auth,
            base_auth: +this.generalSettings.base_auth,
            audits: +this.generalSettings.audits
        });
        this.appSettingService.handleSuccess('General settings were saved!');
    }

    setLdap($event) {
        if (!$event) {
            this.generalSettings.ldap_auth = 0;
            this.generalSettings.base_auth = 1;
        } else {
            this.generalSettings.ldap_auth = 1;
        }
    }

    async saveLDAP() {
        await this.appSettingService.updateLDAPSettings(this.ldapSettings);
        this.appSettingService.handleSuccess('LDAP settings were saved!');
    }

    saveEmail() {
        this.emailSettings.enabled = +this.emailSettings.enabled;
        this.emailSettings.use_auth = +this.emailSettings.use_auth;
        if (this.isEmailPatternValid()) {
            this.emailSettingsService.updateEmailSettings(this.emailSettings);
        } else {
            this.emailSettingsService.handleSimpleError(Constants.emailPatternErrorMessageHeader,
                Constants.emailPatternErrorMessage);
        }
    }

    setBaseURL() {
        if (!this.emailSettings.base_url) {
            this.emailSettings.base_url = location.origin;
        }
    }

    isEmailPatternValid(): boolean {
        if (this.emailSettings.default_email_pattern && this.emailSettings.default_email_pattern !== '') {
            const regExp = new RegExp('(.+@.+[.][A-z]+)');
            return regExp.test(this.emailSettings.default_email_pattern);
        }
        return true;
    }
}
