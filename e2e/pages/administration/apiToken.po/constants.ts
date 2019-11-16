import { by, element } from 'protractor';
import { Autocomplete } from '../../../elements/autocomplete.element';

export const baseUrl = '#/administration/project/apiToken';

export const elements = {
    uniqueElement: element(by.css('#api-token-administration.active')),
    projectSelector: new Autocomplete(by.id('project-selector')),
    generateToken: element(by.id('generateTocken')),
    tokenValue: element(by.id('tokenValue'))
};

export const names = {
    pageName: 'Import Token Page'
};


