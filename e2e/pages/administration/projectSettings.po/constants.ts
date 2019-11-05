import { by, element } from 'protractor';
import { UiSwitch } from '../../../elements/ui-switch';
import { Autocomplete } from '../../../elements/autocomplete.element';

export const baseUrl = '#/administration/project/projectSettings';

export const elements = {
    uniqueElement: element(by.css('#projectSettings-administration.active')),
    stepsSwitcher: new UiSwitch(by.css('#steps-feature ui-switch')),
    projectSelector: new Autocomplete(by.id('project-selector')),
    saveFeatures: element(by.id('save-features'))
};

export const names = {
    pageName: 'Project Settings Page'
};


