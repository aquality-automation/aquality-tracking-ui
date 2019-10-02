import { by, element, Locator } from 'protractor';
import { BaseElement } from './base.element';

export class Attachments extends BaseElement {
    constructor(locator: Locator) {
        super(locator);
    }
}