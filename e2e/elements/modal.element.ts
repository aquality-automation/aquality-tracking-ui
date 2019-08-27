import { BaseElement } from './base.element';
import { by } from 'protractor';

export class Modal extends BaseElement {
    constructor() {
        super(by.tagName('simple-popup'));
    }

    async clickActionBtn(buttonName: string) {
        return this.element.element(by.xpath(`.//button[text()="${buttonName}"]`)).click();
    }
}
