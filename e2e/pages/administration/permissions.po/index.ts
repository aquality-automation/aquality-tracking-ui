import { browser } from 'protractor';
import { elements, baseUrl, names, columns } from './constants';
import { User } from '../../../../src/app/shared/models/user';
import { AdministrationBase } from '../base.po';
import { LocalPermissions } from '../../../../src/app/shared/models/LocalPermissions';

export class PermissionsAdministration extends AdministrationBase {
  constructor() {
    super(elements.uniqueElement, names.pageName);
  }

  public columns = columns;

  navigateTo() {
    return browser.get(baseUrl);
  }

  selectProject(value: string) {
    return elements.projectSelector.select(value);
  }

  openCreation() {
    return elements.permissionsTable.openCreation();
  }

  getCreationError() {
    return elements.permissionsTable.getCreationError();
  }

  fillUserName(username: string) {
    return elements.permissionsTable.fillCreation(username, columns.username);
  }

  getUserName(): any {
    return elements.permissionsTable.getCreationTextFieldValue(columns.username);
  }

  async getPermissionData(user: User) {
    return elements.permissionsTable.getRowValues(user.user_name, columns.username);
  }

  clickCreate() {
    return elements.permissionsTable.clickCreateAction();
  }

  setManager(state: boolean | number) {
    return elements.permissionsTable.fillCreation(state, columns.manager);
  }

  setAdmin(state: boolean | number) {
    return elements.permissionsTable.fillCreation(state, columns.admin);
  }

  setEngineer(state: boolean | number) {
    return elements.permissionsTable.fillCreation(state, columns.engineer);
  }

  isUserDisplayed(user_name: string): any {
    return elements.permissionsTable.isRowExists(user_name, columns.username);
  }

  clickRemoveUserButton(user_name: string) {
    return elements.permissionsTable.clickAction(user_name, columns.username);
  }

  updateUser(value: string | boolean, column: string, searchValue: string, searchColumn: string) {
    return elements.permissionsTable.editRow(value, column, searchValue, searchColumn);
  }

  async create(localPermissions: LocalPermissions) {
    await this.openCreation();
    await this.fillUserName(localPermissions.user.user_name);
    await this.setAdmin(localPermissions.admin);
    await this.setManager(localPermissions.manager);
    await this.setEngineer(localPermissions.engineer);
    return this.clickCreate();
  }

  async remove(user_name: string) {
    await this.clickRemoveUserButton(user_name);
    await this.modal.clickYes();
  }
}

export const permissionsAdministration = new PermissionsAdministration();

