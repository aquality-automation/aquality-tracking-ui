import { ElementFinder, Locator } from 'protractor';
import { BaseElement } from './base.element';

export class MatRadioButton extends BaseElement {

    constructor(locatorOrElement: Locator | ElementFinder) {
        super(locatorOrElement);
    }

    isOn() {
        return this.element.getAttribute('class').then(value => {
            return value.includes('mat-radio-checked')
        });
    }
}
