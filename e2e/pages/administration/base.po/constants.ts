import { by, element } from 'protractor';

export const elements = {
    appSettings: element(by.css('#app-settings-administration')),
    users: element(by.css('#users-administration')),
    permissions: element(by.css('#permissions-administration')),
    resolutions: element(by.css('#resolutions-administration')),
    bodyPattern: element(by.css('#body-pattern-administration')),
    apiToken: element(by.css('#api-token-administration')),
    settings: element(by.css('#projectSettings-administration')),
    predefinedResolutions: element(by.css('#predefined-resolution')),
};


