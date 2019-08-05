import { Component, OnInit } from '@angular/core';
import { GeneralAppSettings, LDAPSettings, EmailSettings } from '../../../../shared/models/appSettings';
import { ApplicationSettingsService } from '../../../../services/applicationSettings.service';
import { SimpleRequester } from '../../../../services/simple-requester';
import { EmailSettingsService } from '../../../../services/emailSettings.service';
import { environment } from '../../../../../environments/environment';

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
    public apiHost: string;

    constructor(
        private appSettingService: ApplicationSettingsService,
        private emailSettingsService: EmailSettingsService
    ) {}
    ngOnInit() {
        this.appSettingService.getGeneralSettings().subscribe(res => {
            this.generalSettings = res;
        });
        this.appSettingService.getLDAPSettings().subscribe(res => {
            this.ldapSettings = res;
        });
        this.emailSettingsService.getEmailSettings().subscribe(res => {
            this.emailSettings = res;
        });
    }

    saveGeneral() {
        this.appSettingService.updateGeneralSettings({
            id: this.generalSettings.id,
            ldap_auth: +this.generalSettings.ldap_auth,
            base_auth: +this.generalSettings.base_auth,
            audits: +this.generalSettings.audits
        }).subscribe();
        environment.host = this.apiHost;
    }

    setLdap($event) {
        if (!$event) {
            this.generalSettings.ldap_auth = 0;
            this.generalSettings.base_auth = 1;
        } else {
            this.generalSettings.ldap_auth = 1;
        }
    }

    saveLDAP() {
        this.appSettingService.updateLDAPSettings(this.ldapSettings).subscribe();
    }

    saveEmail() {
        this.emailSettings.enabled = +this.emailSettings.enabled;
        this.emailSettings.use_auth = +this.emailSettings.use_auth;
        this.emailSettingsService.updateEmailSettings(this.emailSettings).subscribe();
    }
}
