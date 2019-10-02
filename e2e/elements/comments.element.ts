import { by, element, Locator } from 'protractor';
import { BaseElement } from './base.element';

export class Comments extends BaseElement {
    constructor(locator: Locator) {
        super(locator);
    }
}