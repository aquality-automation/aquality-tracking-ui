import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.services';
import { GlobalDataService } from '../../../services/globaldata.service';
import { User } from '../../../shared/models/user';
import { CookieService } from 'angular2-cookie/core';

@Component({
    templateUrl: 'user-settings.component.html',
    styleUrls: ['user-settings.component.css']
})
export class UserSettingsComponent implements OnInit {
    public user: User;
    public confirmPass: string;
    public oldPass: string;
    public newPass: string;
    public constructor(
        private userService: UserService,
        private globalDataService: GlobalDataService,
        private cookieService: CookieService
    ) { }

    ngOnInit() {
        this.user = this.globalDataService.currentUser;
        this.user.password = undefined;
    }

    IsPasswordFormValide() {
        return this.confirmPass && this.oldPass && this.newPass && this.IsConfirmValide() && this.IsNewPasswordValide();
    }

    IsConfirmValide() {
        return this.newPass === this.confirmPass;
    }

    IsNewPasswordValide() {
        if (this.newPass) { return this.newPass.length > 5; }
        return true;
    }

    updateUser() {
        this.user.audit_notifications = +this.user.audit_notifications;
        this.userService.createOrUpdateUser(this.user).subscribe();
    }

    updatePassword() {
        this.userService.UpdatePassword({ password: this.newPass, old_password: this.oldPass, user_id: this.user.id }).subscribe(res => {
            this.userService.handleSuccess('Password was changed.');
            const header = res.headers.get('iio78');
            this.cookieService.put('iio78', header);
            this.oldPass = '';
            this.confirmPass = '';
            this.newPass = '';
        }, err => {
            this.oldPass = '';
        });
    }
}
