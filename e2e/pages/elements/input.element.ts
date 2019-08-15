import { ElementFinder, Locator, Key } from 'protractor';
import { BaseElement } from './base.element';

export class Input extends BaseElement {

    constructor(locatorOrElement: Locator | ElementFinder) {
        super(locatorOrElement);
    }
    public async typeText(value: string) {
        await this.element.clear();
        return this.element.sendKeys(value);
    }

    public async clear() {
        await this.element.sendKeys(Key.chord(Key.CONTROL, 'a'));
        await this.element.sendKeys(Key.DELETE);
    }

    getValue() {
        return this.element.getAttribute('value');
    }
}
