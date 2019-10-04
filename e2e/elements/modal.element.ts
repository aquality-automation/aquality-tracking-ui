import { BaseElement } from './base.element';
import { by } from 'protractor';

export class Modal extends BaseElement {
    constructor() {
        super(by.tagName('simple-popup'));
    }

    private _keys = {
        yes: 'yes'
    };

    private _clickActionBtn(buttonName: string) {
        return this.element.element(by.xpath(`.//button[text()="${buttonName}"]`)).click();
    }

    clickYes() {
        return this._clickActionBtn(this._keys.yes);
    }
}
