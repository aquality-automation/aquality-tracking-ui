import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import 'rxjs/add/operator/map';
import { SimpleRequester } from './simple-requester';
import { User, Password } from '../shared/models/user';
import { LocalPermissions } from '../shared/models/LocalPermissions';
import StringUtils from '../shared/utils/string.utils';


@Injectable()
export class UserService extends SimpleRequester {
  isLoginFailed = false;
  user: User;

  getToken(userName: string): Promise<string> {
    return this.doGetWithoutAuthHeader(`/users/authToken?username=${userName}`).map(res => {
      return res.headers.get('pubKey');
    }).toPromise();
  }

  doAuth(userName: string, password, ldap: boolean): Promise<Response> {
    const authString = btoa(`${userName}:${password}`);
    const query = `/users/auth?auth=${authString}&ldap=${ldap}`;
    return this.doGetWithoutAuthHeader(query).map(res => {
      return res;
    }).toPromise();
  }

  getPermissionsForProject(projectId: number) {
    return this.doGet('/users/permissions?projectId=' + projectId).map(res => res.json());
  }

  getProjectUsers(projectId: number) {
    return this.doGet('/project/users?projectId=' + projectId).map(res => res.json());
  }

  getUserProjects(userId: number): Promise<LocalPermissions[]> {
    return this.doGet('/project/users', { userId }).map(res => res.json()).toPromise();
  }

  createOrUpdateProjectUser(localPermissions: LocalPermissions): Promise<LocalPermissions> {
    return this.doPost('/users/permissions', localPermissions).map(res => {
      const permissions: LocalPermissions = res.json();
      this.handleSuccess(`Permissions were updated.`);
      return permissions;
    }).toPromise();
  }

  removeProjectUser(user: LocalPermissions) {
    return this.doDelete(`/users/permissions?projectId=${user.project_id}&userId=${user.user.id}`).map(res => {
      this.handleSuccess(`Permissions for '${user.user.first_name} ${user.user.second_name}' were deleted.`);
      return res;
    });
  }

  getUsers(user: User) {
    return this.doGet('/users', user).map(res => res.json());
  }

  createOrUpdateUser(user: User) {
    if (!user.password) {
      user.password = undefined;
    }
    return this.doPost('/users', user).map(res => res, err => {
      this.handleError(err);
    });
  }

  removeUser(user: User) {
    return this.doDelete(`/users?id=${user.id}`).map(res => {
      this.handleSuccess(`User '${user.first_name} ${user.second_name}' was deleted.`);
      return res;
    });
  }

  private isAuthorized(handleError: boolean = true): Promise<User> {
    const result = new Promise(async (resolve, reject) => {
      if (this.isAuthHeaderExists()) {
        try {
          const checkHeaderPromise = await this.doGet('/users/isAuthorized', undefined, false, handleError).map(res => {
            this.globaldata.teamMember = res.headers.get('accountMember') === 'true';
            return res.json();
          }).toPromise();
          resolve(checkHeaderPromise);
        } catch (err) {
          reject();
        }
      }
      reject();
    });
    return result;
  }

  private async checkAuth(handleError: boolean = true): Promise<boolean> {
    try {
      this.globaldata.currentUser = await this.isAuthorized(handleError);
      return true;
    } catch (error) {
      this.globaldata.currentUser = undefined;
      return false;
    }
  }

  async redirectToLogin(returnUrl?: string) {
    if (!(await this.router.navigate(['/'], { queryParams: { returnUrl } }))) {
      await this.router.navigate(['/'], { queryParams: { returnUrl } });
    }
  }

  async handleIsLogged(handleError: boolean = true): Promise<boolean> {
    const isLogged = await this.checkAuth(handleError);
    if (!isLogged) {
      this.cookieService.remove('iio78');
    }
    return isLogged;
  }

  logOut() {
    localStorage.clear();
    this.cookieService.remove('iio78');
    this.globaldata.clear();
  }

  currentUser(): User {
    return this.globaldata.currentUser;
  }

  getUserFullName(user: User) {
    return `${StringUtils.capitalize(user.first_name)} ${StringUtils.capitalize(user.second_name)}`;
  }

  UpdatePassword(password: Password) {
    return this.doPost('/users/password', password).map(res => res);
  }

}
