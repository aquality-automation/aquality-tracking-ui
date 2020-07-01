import { by, element } from 'protractor';

export const baseUrl = '/create/project';

export const elements = {
    uniqueElement: element(by.id('milestone-create')),
    createButton: element(by.id('milestone-create-button')),
    nameField: element(by.name('name'))
};

export const names = {
    pageName: 'Create Milestone Page'
};
