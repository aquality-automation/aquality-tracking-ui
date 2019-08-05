import { by, element } from 'protractor';
import { Autocomplete } from '../../elements/autocomplete.element';

export const elements = {
    uniqueElement: element(by.tagName('move-test-modal')),
    fromLookup: new Autocomplete(by.css('.mt-row .mt-from')),
    toLookup: new Autocomplete(by.css('.mt-row .mt-to')),
    moveBtn: element(by.id('Move')),
};

export const names = {
    pageName: 'Move Test Modal'
};
