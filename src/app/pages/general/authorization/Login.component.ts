import { Component, OnInit } from '@angular/core';
import { CookieService } from 'angular2-cookie/core';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from '../../../shared/models/user';
import { UserService } from '../../../services/user.services';
import { GlobalDataService } from '../../../services/globaldata.service';
import { SimpleRequester } from '../../../services/simple-requester';
import { ApplicationSettingsService } from '../../../services/applicationSettings.service';
import { GeneralAppSettings } from '../../../shared/models/appSettings';
import * as JsEncryptModule from 'jsencrypt';

@Component({
  templateUrl: './Login.component.html',
  providers: [
    ApplicationSettingsService,
    SimpleRequester,
    UserService
  ]
})
export class LoginComponent implements OnInit {
  userName: string;
  userPassword: string;
  session_id: string;
  user: User;
  ldapLogin: boolean;
  appSettings: GeneralAppSettings;
  returnUrl;

  constructor(
    public userService: UserService,
    private cookieService: CookieService,
    private router: Router,
    private route: ActivatedRoute,
    private globaldata: GlobalDataService,
    private appSettingsService: ApplicationSettingsService
  ) { }

  ngOnInit() {
    this.appSettingsService.getAuthSettings().subscribe(res => {
      this.appSettings = res;
      this.ldapLogin = this.appSettings.ldap_auth === 1;
    });
  }

  setLdap(state: boolean) {
    this.ldapLogin = state;
  }

  async tryAuth() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl']
      || this.globaldata.returnURL
      || '/project';
    const encrypter = new JsEncryptModule.JSEncrypt();
    const token = await this.userService.getToken(this.userName);
    encrypter.setPublicKey(token);
    const encryptedPass = encrypter.encrypt(this.userPassword);

    try {
      const response = await this.userService.doAuth(this.userName, encryptedPass, this.ldapLogin);
      const header = response.headers.get('iio78');
      this.globaldata.teamMember = response.headers.get('accountMember') === 'true';
      this.cookieService.put('iio78', header);
      this.router.navigateByUrl(this.returnUrl);
    } catch (error) {
      this.userPassword = '';
    }
  }
}
