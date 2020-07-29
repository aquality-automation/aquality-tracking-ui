import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Injectable()
export class AuthService {
    private authCookieName = 'iio78';

    constructor(
        private http: HttpClient,
        private cookieService: CookieService,
        private router: Router
    ) { }

    public hasAuthCookie() {
        return this.cookieService.check('iio78');
    }

    public async getToken(userName: string): Promise<string> {
        const resp = await this.http.get(`/users/authToken?username=${userName}`, { observe: 'response' }).toPromise();
        return resp.headers.get('pubKey');
    }

    public doAuth(userName: string, password: string, isLDAP: boolean): Promise<HttpResponse<object>> {
        const auth = btoa(`${userName}:${password}`);
        return this.http.get('/users/auth', { observe: 'response', params: { auth, ldap: isLDAP.toString() } }).toPromise();
    }

    public async redirectToLogin(returnUrl?: string) {
        if (!(await this.router.navigate(['/'], { queryParams: { returnUrl } }))) {
            await this.router.navigate(['/'], { queryParams: { returnUrl } });
        }
    }

    public async handleIsLogged(): Promise<boolean> {
        const isLogged = await this.isAuthorized();
        if (!isLogged) {
            this.cookieService.delete(this.authCookieName);
        }
        return isLogged;
    }

    public logOut() {
        localStorage.clear();
        this.cookieService.delete(this.authCookieName, '/');
    }

    private async isAuthorized(): Promise<boolean> {
        if (this.hasAuthCookie()) {
            try {
                const resp = await this.http.get('/users/isAuthorized', { observe: 'response' }).toPromise();
                localStorage.teamMember = resp.headers.get('accountMember') === 'true';
                localStorage.currentUser = JSON.stringify(resp.body);
                return true;
            } catch (err) {
                return false;
            }
        }
        return false;
    }
}
