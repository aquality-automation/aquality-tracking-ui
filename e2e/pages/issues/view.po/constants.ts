import { by, element } from 'protractor';
import { Lookup } from '../../../elements/lookup.element';

export const elements = {
    uniqueElement: element(by.id('issue-view')),
    resolution: new Lookup(by.id('issue-resolution')),
    save: element(by.id('save'))
};

export const names = {
    pageName: 'Issue View Page'
};

