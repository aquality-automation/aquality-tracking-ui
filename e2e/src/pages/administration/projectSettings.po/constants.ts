import { by, element } from 'protractor';
import { UiSwitch } from '../../../elements/ui-switch';
import { Autocomplete } from '../../../elements/autocomplete.element';
import { Input } from '../../../elements/input.element';

export const baseUrl = '/#/administration/project/projectSettings';

export const elements = {
    uniqueElement: element(by.css('#projectSettings-administration.active')),
    stepsSwitcher: new UiSwitch(by.css('#steps-feature')),
    importCompareResultsPattern: new Input(by.css('#compare-result-pattern-feature input')),
    projectSelector: new Autocomplete(by.id('project-selector')),
    saveFeatures: element(by.id('save-features')),
    stabilityResultsCount: new Input(by.css('#stability_count input'))
};

export const names = {
    pageName: 'Project Settings Page'
};


