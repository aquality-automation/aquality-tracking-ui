import { Component, OnInit } from '@angular/core';
import { User } from '../../../shared/models/user';
import { UserService } from 'src/app/services/user/user.services';
import { CookieService } from 'ngx-cookie-service';

@Component({
    templateUrl: 'user-settings.component.html',
    styleUrls: ['user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit {
    public user: User;
    public confirmPass: string;
    public oldPass: string;
    public newPass: string;
    public constructor(
        private userService: UserService,
        private cookieService: CookieService
    ) { }

    ngOnInit() {
        this.user = this.userService.currentUser();
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

    async updateUser() {
        this.user.audit_notifications = +this.user.audit_notifications;
        await this.userService.createOrUpdateUser(this.user);
    }

    async updatePassword() {
        try {
            const res = await this.userService
                .UpdatePassword({ password: this.newPass, old_password: this.oldPass, user_id: this.user.id });
            this.userService.handleSuccess('Password was changed.');
            const header = res.headers.get('iio78');
            this.cookieService.set('iio78', header, undefined, '/');
            this.oldPass = '';
            this.confirmPass = '';
            this.newPass = '';
        } catch (err) {
            this.oldPass = '';
        }
    }
}
