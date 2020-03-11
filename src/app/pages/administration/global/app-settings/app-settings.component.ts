import { Component, OnInit } from '@angular/core';
import { GeneralAppSettings, LDAPSettings, EmailSettings } from '../../../../shared/models/appSettings';
import { ApplicationSettingsService } from '../../../../services/applicationSettings.service';
import { SimpleRequester } from '../../../../services/simple-requester';
import { EmailSettingsService } from '../../../../services/emailSettings.service';
import { Constants } from './app-settings.constants';
import { GlobalDataService } from '../../../../services/globaldata.service';

@Component({
    templateUrl: 'app-settings.component.html',
    styleUrls: ['app-settings.component.css'],
    providers: [
        SimpleRequester,
        ApplicationSettingsService,
        EmailSettingsService
    ]
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
        this.appSettingService.getGeneralSettings().subscribe(res => {
            this.generalSettings = res;
        });
        this.appSettingService.getLDAPSettings().subscribe(res => {
            this.ldapSettings = res;
        });
        this.emailSettings = await this.emailSettingsService.getEmailSettings();
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
        await this.appSettingService.updateLDAPSettings(this.ldapSettings).toPromise();
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
