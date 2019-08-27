import { browser } from 'protractor';
import { elements, baseUrl, names } from './constants';
import { AdministrationBase } from '../base.po';

export class ImportTokenAdministration extends AdministrationBase {
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

  async generateToken(projectName: string): Promise<string> {
    await this.selectProject(projectName);
    await this.clickGenerateToken();
    await this.modal.clickActionBtn('yes');
    await this.getTokenValue();
    return await elements.tokenValue.getText();
  }
}
