import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from '../../../shared/models/user';
import * as JsEncryptModule from 'jsencrypt';
import { GeneralAppSettings } from 'src/app/shared/models/app-settings';
import { CookieService } from 'ngx-cookie-service';
import { GlobalDataService } from 'src/app/services/globaldata.service';
import { ApplicationSettingsService } from 'src/app/services/application-settings/application-settings.service';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  templateUrl: './Login.component.html',
  styleUrls: ['./Login.component.scss']
})
export class LoginComponent implements OnInit {
  userName: string;
  userPassword: string;
  session_id: string;
  user: User;
  ldapLogin: boolean;
  appSettings: GeneralAppSettings;
  returnUrl: string;

  constructor(
    public auth: AuthService,
    private cookieService: CookieService,
    private router: Router,
    private route: ActivatedRoute,
    private globaldata: GlobalDataService,
    private appSettingsService: ApplicationSettingsService
  ) { }

  async ngOnInit() {
    this.appSettings = await this.appSettingsService.getGeneralSettings();
    this.ldapLogin = !!this.appSettings.ldap_auth;
  }

  setLdap(state: boolean) {
    this.ldapLogin = state;
  }

  async tryAuth() {
    this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/project';
    const encrypter = new JsEncryptModule.JSEncrypt();
    const token = await this.auth.getToken(this.userName);
    encrypter.setPublicKey(token);
    const encryptedPass = encrypter.encrypt(this.userPassword);

    try {
      const response = await this.auth.doAuth(this.userName, encryptedPass, this.ldapLogin);
      const header = response.headers.get('iio78');
      this.globaldata.teamMember = response.headers.get('accountMember') === 'true';
      this.cookieService.set('iio78', header, undefined, '/');
      this.router.navigateByUrl(this.returnUrl);
    } catch (error) {
      this.userPassword = '';
    }
  }
}
