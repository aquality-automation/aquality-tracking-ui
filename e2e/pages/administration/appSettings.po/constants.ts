import { by, element } from 'protractor';
import { Input } from '../../../elements/input.element';
import { LargeTextContainer } from '../../../elements/largeTextContainer';
import { UiSwitch } from '../../../elements/ui-switch';

export const baseUrl = '#/administration/global/appSettings';

export const elements = {
    uniqueElement: element(by.css('#app-settings-administration.active')),
    defaultEmailPattern: new Input(by.id('defaultEmailPattern')),
    defaultEmailPatternhint: new LargeTextContainer(by.id('defaultEmailPatternHint')),
    saveEmailSettings: element(by.id('saveEmailSettings')),
    saveGeneralSettings: element(by.id('save-general')),
    auditsModuleSwitch: new UiSwitch(by.id('audits-module'))
};

export const names = {
    pageName: 'Application Settings'
};
