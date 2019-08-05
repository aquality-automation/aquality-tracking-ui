import { ElementFinder, Locator } from 'protractor';
import { BaseElement } from './base.element';

export class Input extends BaseElement {

    constructor(locatorOrElement: Locator | ElementFinder) {
        super(locatorOrElement);
    }
    public async typeText(value: string) {
        await this.element.clear();
        return this.element.sendKeys(value);
    }

    getValue() {
        return this.element.getAttribute('value');
    }
}
