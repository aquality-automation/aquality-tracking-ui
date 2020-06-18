import { Injectable } from '@angular/core';
import { User, Password } from 'src/app/shared/models/user';
import StringUtils from 'src/app/shared/utils/string.utils';
import { LocalPermissions } from 'src/app/shared/models/local-permissions';
import { BaseHttpService } from '../base-http/base-http.service';

@Injectable()
export class UserService extends BaseHttpService {

  isLoginFailed = false;
  user: User;

  getPermissionsForProject(projectId: number): Promise<LocalPermissions> {
    return this.http.get<LocalPermissions>('/users/permissions', { params: { project_id: projectId.toString() } }).toPromise();
  }

  getProjectUsers(projectId: number): Promise<LocalPermissions[]> {
    return this.http.get<LocalPermissions[]>('/project/users', { params: { project_id: projectId.toString() } }).toPromise();
  }

  getUserProjects(userId: number): Promise<LocalPermissions[]> {
    return this.http.get<LocalPermissions[]>('/project/users', { params: { userId: userId.toString() } }).toPromise();
  }

  async createOrUpdateProjectUser(localPermissions: LocalPermissions): Promise<LocalPermissions> {
    const result = await this.http.post<LocalPermissions>('/users/permissions', localPermissions).toPromise();
    this.handleSuccess(`Permissions were updated.`);
    return result;
  }

  async removeProjectUser(user: LocalPermissions) {
    await this.http.delete(`/users/permissions`, {
      params: { project_id: user.project_id.toString(), userId: user.user.id.toString() }
    }).toPromise();
    this.handleSuccess(`Permissions for '${user.user.first_name} ${user.user.second_name}' were deleted.`);
  }

  getUsers(user: User) {
    return this.http.get<User[]>('/users', { params: this.convertToParams(user) }).toPromise();
  }

  createOrUpdateUser(user: User) {
    if (!user.password) {
      user.password = undefined;
    }
    return this.http.post<User>('/users', user).toPromise();
  }

  async removeUser(user: User) {
    await this.http.delete(`/users`, { params: { id: user.id.toString() } }).toPromise();
    this.handleSuccess(`User '${user.first_name} ${user.second_name}' was deleted.`);
  }

  currentUser(): User {
    return JSON.parse(localStorage.currentUser);
  }

  getUserFullName(user: User) {
    return `${StringUtils.capitalize(user.first_name)} ${StringUtils.capitalize(user.second_name)}`;
  }

  UpdatePassword(password: Password) {
    return this.http.post('/users/password', password, { observe: 'response' }).toPromise();
  }
}
