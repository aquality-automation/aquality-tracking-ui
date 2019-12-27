import { browser } from 'protractor';
import { elements, baseUrl, names } from './constants';
import { AdministrationBase } from '../base.po';

export class AppSettings extends AdministrationBase {
  constructor() {
    super(elements.uniqueElement, names.pageName);
  }

  navigateTo() {
    return browser.get(baseUrl);
  }

  setDefaultEmailPattern(pattern: string) {
    return elements.defaultEmailPattern.typeText(pattern);
  }

  clearDefaultEmailPattern() {
    return elements.defaultEmailPattern.clear();
  }

  saveEmailSettings() {
    return elements.saveEmailSettings.click();
  }

  getHintText() {
    return elements.defaultEmailPatternhint.getText();
  }

  toggleHint() {
    return elements.defaultEmailPatternhint.toggle();
  }

  saveGeneralSettings() {
    return elements.saveGeneralSettings.click();
  }

  disableAuditModule() {
    return elements.auditsModuleSwitch.switchOff();
  }

  enableAuditModule() {
    return elements.auditsModuleSwitch.switchOn();
  }
}

export const appSettings = new AppSettings();