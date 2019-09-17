import { browser } from 'protractor';
import { elements, baseUrl, names, columns } from './constants';
import { User } from '../../../../src/app/shared/models/user';
import { AdministrationBase } from '../base.po';

export class UserAdministration extends AdministrationBase {
  constructor() {
    super(elements.uniqueElement, names.pageName);
  }

  public columns = columns;

  navigateTo() {
    return browser.get(baseUrl);
  }

  openCreation() {
    return elements.usersTable.openCreation();
  }

  getCreationError() {
    return elements.usersTable.getCreationError();
  }

  fillFirstName(value: string) {
    return elements.usersTable.fillCreation(value, columns.firstName);
  }

  fillLastName(value: string) {
    return elements.usersTable.fillCreation(value, columns.lastName);
  }

  fillUserName(value: string) {
    return elements.usersTable.fillCreation(value, columns.userName);
  }

  fillEmail(value: string) {
    return elements.usersTable.fillCreation(value, columns.email);
  }

  fillPassword(value: string) {
    return elements.usersTable.fillCreationPassword(value, columns.password);
  }

  fillConfirmPassword(value: string) {
    return elements.usersTable.fillCreationConfirmPassword(value, columns.password);
  }

  getEmail(): any {
    return elements.usersTable.getCreationTextFieldValue(columns.email);
  }

  getUserName(): any {
    return elements.usersTable.getCreationTextFieldValue(columns.userName);
  }

  async getUserData(user: User) {
    return elements.usersTable.getRowValues(user.user_name, columns.userName);
  }

  clickCreate() {
    return elements.usersTable.clickCreateAction();
  }

  setAuditAdmin(state: boolean | number) {
    return elements.usersTable.fillCreation(state, columns.auditAdmin);
  }

  setAuditor(state: boolean | number) {
    return elements.usersTable.fillCreation(state, columns.auditor);
  }

  setCoordinator(state: boolean | number) {
    return elements.usersTable.fillCreation(state, columns.coordinator);
  }

  setAdmin(state: boolean | number) {
    return elements.usersTable.fillCreation(state, columns.admin);
  }

  setAccountManager(state: boolean | number) {
    return elements.usersTable.fillCreation(state, columns.accountManager);
  }

  setUnitCoordinator(state: boolean | number) {
    return elements.usersTable.fillCreation(state, columns.unitCoordinator);
  }

  isUserDisplayed(user_name: string): any {
    return elements.usersTable.isRowExists(user_name, columns.userName);
  }

  clickRemoveUserButton(user_name: string) {
    return elements.usersTable.clickAction(user_name, columns.userName);
  }

  updateUser(value: string | boolean, column: string, searchValue: string, searchColumn: string) {
    return elements.usersTable.editRow(value, column, searchValue, searchColumn);
  }

  clickResetPassword(user_name: string) {
    return elements.usersTable.clickCellLink(columns.password, user_name, columns.userName);
  }

  async create(user: User) {
    await this.openCreation();
    await this.fillFirstName(user.first_name);
    await this.fillLastName(user.second_name);
    await this.fillUserName(user.user_name);
    await this.fillEmail(user.email);
    await this.fillPassword(user.password);
    await this.fillConfirmPassword(user.password);
    await this.setUnitCoordinator(user.unit_coordinator);
    await this.setAccountManager(user.account_manager);
    await this.setAdmin(user.admin);
    await this.setCoordinator(user.manager);
    await this.setAuditor(user.auditor);
    await this.setAuditAdmin(user.audit_admin);
    return this.clickCreate();
  }

  async remove(user_name: string) {
    await this.clickRemoveUserButton(user_name);
    await this.modal.clickActionBtn('yes');
  }
}
