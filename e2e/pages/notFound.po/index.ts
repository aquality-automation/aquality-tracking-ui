import { browser } from 'protractor';
import { baseUrl, elements, names } from './constants';
import { BasePage } from '../base.po';

export class NotFound extends BasePage {
    constructor() {
        super(elements.uniqueElement, names.pageName);
    }

    navigateTo(id: number) {
        return browser.get(baseUrl);
    }
}
