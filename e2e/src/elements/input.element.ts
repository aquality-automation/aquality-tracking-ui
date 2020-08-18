import { ElementFinder, Locator, Key } from 'protractor';
import { BaseElement } from './base.element';

export class Input extends BaseElement {

    constructor(locatorOrElement: Locator | ElementFinder) {
        super(locatorOrElement);
    }
    public async typeText(value: string) {
        await this.clear();
        if (value) {
            return this.element.sendKeys(value);
        }
        return;
    }

    public async clear() {
        await this.element.sendKeys(Key.chord(Key.CONTROL, 'a'));
        return this.element.sendKeys(Key.DELETE);
    }

    public async clearNative() {
        return this.element.clear();
    }

    getValue() {
        return this.element.getAttribute('value');
    }
}
