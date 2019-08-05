import { by, element } from 'protractor';

export const baseUrl = '/create/testsuite';

export const elements = {
    uniqueElement: element(by.id('create-test-suite')),
    createButton: element(by.id('create-test-suite-button')),
    suiteNameField: element(by.name('name')),
};

export const names = {
    pageName: 'Create Suite Page'
};
