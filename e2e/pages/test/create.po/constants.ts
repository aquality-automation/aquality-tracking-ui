import { by, element } from 'protractor';
import { Input } from '../../elements/input.element';
import { Multiselect } from '../../elements/multiselect.element';

export const baseUrl = '/create/test';

export const elements = {
    uniqueElement: element(by.id('create-test-page')),
    createButton: element(by.id('create-test-button')),
    nameField: new Input(by.id('test-name')),
    suiteField: new Multiselect(by.id('test-suite')),
    descriptionField: new Input(by.id('test-description')),
};

export const names = {
    pageName: 'Create Test Page'
};
