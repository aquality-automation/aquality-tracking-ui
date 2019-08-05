import { by, element } from 'protractor';
import { Autocomplete } from '../../elements/autocomplete.element';

export const baseUrl = '/create/project';

export const elements = {
    uniqueElement: element(by.id('create-project-button')),
    createButton: element(by.id('create-project-button')),
    projectNameField: element(by.id('name')),
    customerField: new Autocomplete(by.id('customer'))
};

export const names = {
    pageName: 'Create Project Page'
};
