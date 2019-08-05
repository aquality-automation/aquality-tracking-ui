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

  private isAuthorized() {
    return this.doGet('/users/isAuthorized').map(res => {
      this.globaldata.teamMember = res.headers.get('accountMember') === 'true';
      return res.json();
    });
  }

  getPermissionsForProject(projectId: number) {
    return this.doGet('/users/permissions?projectId=' + projectId).map(res => res.json());
  }

  getProjectUsers(projectId: number) {
    return this.doGet('/project/users?projectId=' + projectId).map(res => res.json());
  }

  createOrUpdateProjectUser(localPermissions: LocalPermissions) {
    return this.doPost('/users/permissions', localPermissions).map(res => res);
  }

  checkIsAccountTeamMember() {
    return this.doGet('/users/accountTeam').map(res => res);
  }

  removeProjectUser(user: LocalPermissions) {
    return this.doDelete(`/users/permissions?projectId=${user.project_id}&userId=${user.user.id}`).map(res => {
      this.handleSuccess(`Permissions for '${user.user.first_name} ${user.user.second_name}' were deleted.`);
      return res;
    });
  }

  getUsers() {
    return this.doGet('/users').map(res => res.json());
  }

  getUsersWithFilter(user: User) {
    let params = '';
    if (user.unit_coordinator) { params = `?unit_coordinator=${user.unit_coordinator}`; }
    return this.doGet(`/users${params}`).map(res => res.json());
  }

  createOrUpdateUser(user: User) {
    if (!user.password) {
      user.password = undefined;
    }
    return this.doPost('/users', user).map(res => res, err => {
      this.handleError(err);
    });
  }

  private checkAuth(): Promise<boolean> {
    return this.isAuthorized().map(result => {
      if (result) {
        const user: User = result;
        if (user && user.user_name) {
          this.globaldata.currentUser = user;
          return true;
        }
      } else {
        this.globaldata.currentUser = undefined;
        return false;
      }
    }, error => {
      return false;
    }).toPromise();
  }

  removeUser(user: User) {
    return this.doDelete(`/users?id=${user.id}`).map(res => {
      this.handleSuccess(`User '${user.first_name} ${user.second_name}' was deleted.`);
      return res;
    });
  }

  async handleIsLogged(returnUrl) {
    let isLogged = false;
    await this.IsLogged().then(res => {
      isLogged = res;
      if (!res) {
        this.globaldata.returnURL = returnUrl || this.router.url;
        this.router.navigate(['/'], { queryParams: { returnUrl: returnUrl }});
      }
    });
    return isLogged;
  }

  async IsLogged(): Promise<boolean> {
    return this.checkAuth().catch(e => {
      this.globaldata.returnURL = this.router.url;
      this.router.navigate(['/'], { queryParams: { returnUrl: this.router.url }});
      this.cookieService.remove('iio78');
      return false;
    });
  }

  IsAdmin(): boolean {
    if (this.globaldata.currentUser) {
      if (this.globaldata.currentUser.admin) {
        return true;
      }
    }
    return false;
  }

  IsAuditor(): boolean {
    if (this.globaldata.currentUser) {
      if (this.globaldata.currentUser.auditor) {
        return true;
      }
    }
    return false;
  }

  IsAuditAdmin(): boolean {
    if (this.globaldata.currentUser) {
      if (this.globaldata.currentUser.audit_admin) {
        return true;
      }
    }
    return false;
  }

  IsManager(): boolean {
    if (this.globaldata.currentUser) {
      if (this.globaldata.currentUser.manager) {
        return true;
      }
    }
    return false;
  }

  IsHead(): boolean {
    if (this.globaldata.currentUser) {
      if (this.globaldata.currentUser.head) {
        return true;
      }
    }
    return false;
  }

  IsUnitCoordinator(): boolean {
    if (this.globaldata.currentUser) {
      if (this.globaldata.currentUser.unit_coordinator) {
        return true;
      }
    }
    return false;
  }

  IsAccountManager(): boolean {
    if (this.globaldata.currentUser) {
      if (this.globaldata.currentUser.account_manager) {
        return true;
      }
    }
    return false;
  }

  updateLocalPermissions(projectId: number) {
    this.getPermissionsForProject(projectId).subscribe(result => {
      const permissions = new LocalPermissions;
      permissions.admin = result[0]['admin'];
      permissions.engineer = result[0]['engineer'];
      permissions.manager = result[0]['manager'];
      permissions.viewer = result[0]['viewer'];
      this.globaldata.localPermissions = permissions;
    }, error => { console.log(error); });
  }

  IsViewerById(projectId: number): Promise<boolean> {
    return this.getPermissionsForProject(projectId).
      map(result => {
        this.globaldata.localPermissions = result.length > 0 ? result[0] : new LocalPermissions;
        if (result[0]['viewer'] === 1) {
          return true;
        }
        return false;
      }, error => { console.log(error); return false; }).toPromise();
  }

  IsLocalAdminById(projectId: number): Promise<boolean> {
    return this.getPermissionsForProject(projectId).
      map(result => {
        if (result.length > 0 && result[0]['admin'] === 1) {
          return true;
        }
        return false;
      }, error => { console.log(error); return false; }).toPromise();
  }

  IsLocalManagerById(projectId: number): Promise<boolean> {
    return this.getPermissionsForProject(projectId).
      map(result => {
        if (result.length > 0 && result[0]['manager'] === 1) {
          return true;
        }
        return false;
      }, error => { console.log(error); return false; }).toPromise();
  }

  IsEngineerById(projectId: number): Promise<boolean> {
    return this.getPermissionsForProject(projectId).
      map(result => {
        this.globaldata.localPermissions = result.length > 0 ? result[0] : new LocalPermissions;
        if (result[0]['engineer'] === 1) {
          return true;
        }
        this.router.navigate(['**']);
        return false;
      }, error => { console.log(error); return false; }).toPromise();
  }

  IsViewer(): boolean {
    if (this.globaldata.localPermissions) {
      if (this.globaldata.localPermissions.viewer) {
        return true;
      }
    }
    return false;
  }

  IsLocalAdmin(): boolean {
    if (this.globaldata.localPermissions) {
      if (this.globaldata.localPermissions.admin) {
        return true;
      }
    }
    return false;
  }

  IsLocalManager(): boolean {
    if (this.globaldata.localPermissions) {
      if (this.globaldata.localPermissions.manager) {
        return true;
      }
    }
    return false;
  }

  IsEngineer(): boolean {
    if (this.globaldata.localPermissions) {
      if (this.globaldata.localPermissions.engineer) {
        return true;
      }
    }
    return false;
  }

  async HaveAnyLocalPermissions(projectId: number) {
    let has: boolean;
    await new Promise(resolve => {
      this.getPermissionsForProject(projectId).subscribe(result => {
        this.globaldata.localPermissions = result.length > 0 ? result[0] : new LocalPermissions;
        has = this.IsLocalManager() || this.IsEngineer() || this.IsLocalAdmin() || this.IsViewer();
        resolve();
      }, error => { console.log(error); return false; });
    });
    return has;
  }

  async HaveAnyLocalPermissionsExceptViewer(projectId: number) {
    let has: boolean;
    await new Promise(resolve => {
      this.getPermissionsForProject(projectId).subscribe(result => {
        this.globaldata.localPermissions = result.length > 0 ? result[0] : new LocalPermissions;
        has = this.IsLocalManager() || this.IsEngineer() || this.IsLocalAdmin();
        resolve();
      }, error => { console.log(error); return false; });
    });
    return has;
  }

  HaveAnyLocalPermissionsWithoutPUpdating(): boolean {
    return this.IsLocalManager() || this.IsEngineer() || this.IsLocalAdmin() || this.IsViewer();
  }

  HaveAnyLocalPermissionsExceptViewerWithoutPUpdating(): boolean {
    return this.IsLocalManager() || this.IsEngineer() || this.IsLocalAdmin();
  }

  getAnyLocalPermissions() {
    if (!this.globaldata.currentUser) {
      this.IsLogged().then(isLogged => {
        if (isLogged) {
          return this.doGet(`/users/permissions?userId=${this.globaldata.currentUser.id}`).map(res => res.json());
        }
      });
    } else {
      return this.doGet(`/users/permissions?userId=${this.globaldata.currentUser.id}`).map(res => res.json());
    }
  }

  async AnyLocalPermissions() {
    const result = await this.getAnyLocalPermissions().toPromise();
    this.globaldata.anyLocalPermissions = result;
  }

  AnyLocalAdmin(): boolean {
    return this.globaldata.anyLocalPermissions ? this.globaldata.anyLocalPermissions.find(x => x.admin === 1) !== undefined : false;
  }

  AnyLocalManager(): boolean {
    return this.globaldata.anyLocalPermissions ? this.globaldata.anyLocalPermissions.find(x => x.manager === 1) !== undefined : false;
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
