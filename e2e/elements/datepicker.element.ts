import { ElementFinder, Locator } from 'protractor';
import { BaseElement } from './base.element';

export class DatePicker extends BaseElement {
    constructor(locatorOrElement: Locator | ElementFinder) {
        super(locatorOrElement);
    }

    async select(date: Date) {
        throw new Error('Date Picker is not implemented.');
    }
}
