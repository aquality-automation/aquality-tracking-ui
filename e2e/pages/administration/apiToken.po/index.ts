import { browser } from 'protractor';
import { elements, baseUrl, names } from './constants';
import { AdministrationBase } from '../base.po';

export class APITokenAdministration extends AdministrationBase {
  constructor() {
    super(elements.uniqueElement, names.pageName);
  }

  navigateTo() {
    return browser.get(baseUrl);
  }

  selectProject(value: string) {
    return elements.projectSelector.select(value);
  }

  clickGenerateToken() {
    return elements.generateToken.click();
  }

  getTokenValue() {
    return elements.tokenValue.getText();
  }

  isTokenValueExists() {
    return elements.tokenValue.isPresent();
  }

  isModalOpened() {
    return this.modal.isVisible();
  }

  acceptModal() {
    return this.modal.clickActionBtn('yes');
  }

  async generateToken(projectName: string): Promise<string> {
    await this.selectProject(projectName);
    await this.clickGenerateToken();
    await this.modal.clickYes();
    await this.getTokenValue();
    return await elements.tokenValue.getText();
  }
}
