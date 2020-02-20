import { browser } from 'protractor';
import { elements, baseUrl, names } from './constants';
import { BasePage } from '../base.po';
import { projectList } from '../project/list.po';

class LogIn extends BasePage {
  constructor() {
    super(elements.uniqueElement, names.pageName);
  }

  async navigateTo() {
    await browser.get(baseUrl);
    return this.waitForIsOpened();
  }

  async setUserName(text: string) {
    await elements.loginField.clear();
    return elements.loginField.sendKeys(text);
  }

  async setPassword(text: string) {
    await elements.passwordField.clear();
    return elements.passwordField.sendKeys(text);
  }

  async logInAs(userName: string, password: string) {
    if (await this.menuBar.isLogged()) {
      await this.menuBar.clickLogOut();
    }
    await this.setUserName(userName);
    await this.setPassword(password);
    await this.clickLogIn();
    return projectList.waitForIsOpened();
  }

  clickLogIn() {
    return elements.logInButton.click();
  }

  isLogInEnabled() {
    return elements.logInButton.isEnabled();
  }
}

export const logIn = new LogIn();
