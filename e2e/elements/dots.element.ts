import { ElementFinder, Locator, Key, by } from 'protractor';
import { BaseElement } from './base.element';

export class Dots extends BaseElement {

    constructor(locatorOrElement: Locator | ElementFinder) {
        super(locatorOrElement);
    }

    public async getDotsCount() {
        return (await this.element.all(by.tagName('span'))).length;
    }
}
