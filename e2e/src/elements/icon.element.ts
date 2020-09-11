import { by, ElementFinder, Locator } from 'protractor';
import { BaseElement } from './base.element';

export class Icon extends BaseElement {

    constructor(locatorOrElement: Locator | ElementFinder) {
        super(locatorOrElement);
    }
}
