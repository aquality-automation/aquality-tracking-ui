import { elements } from './constants';
import { BasePage } from '../../base.po';
import { ElementFinder, promise } from 'protractor';

export class AdministrationBase extends BasePage {
  constructor(uniqueElement: ElementFinder, pageName: string) {
    super(uniqueElement, pageName);
  }

  public sidebar = {
    appSettings: () => elements.appSettings.click(),
    bodyPattern: () => elements.bodyPattern.click(),
    apiToken: () => elements.apiToken.click(),
    permissions: () => elements.permissions.click(),
    resolutions: () => elements.resolutions.click(),
    users: () => elements.users.click(),
    projectSettings: () => elements.settings.click(),
    isPermissionsExist: (): promise.Promise<boolean> => elements.permissions.isPresent(),
    isProjectSettingsExist: (): promise.Promise<boolean> => elements.settings.isPresent(),
    isApiTokenExist: (): promise.Promise<boolean> => elements.apiToken.isPresent()
  };
}
