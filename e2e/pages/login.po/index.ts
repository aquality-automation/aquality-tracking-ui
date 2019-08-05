import { browser } from 'protractor';
import { elements, baseUrl, names } from './constants';
import { BasePage } from '../base.po';

export class LogIn extends BasePage {
  constructor() {
    super(elements.uniqueElement, names.pageName);
  }

  navigateTo() {
    return browser.get(baseUrl);
  }

  async setUserName(text: string) {
    await elements.loginField.clear();
    return elements.loginField.sendKeys(text);
  }

  async setPassword(text: string) {
    await elements.passwordField.clear();
    return elements.passwordField.sendKeys(text);
  }

  async logIn(userName: string, password: string) {
    await this.navigateTo();
    if (await this.menuBar.isLogged()) {
      await this.menuBar.clickLogOut();
    }
    await this.setUserName(userName);
    await this.setPassword(password);
    return this.clickLogIn();
  }

  clickLogIn() {
    return elements.logInButton.click();
  }

  isLogInEnabled() {
    return elements.logInButton.isEnabled();
  }
}
