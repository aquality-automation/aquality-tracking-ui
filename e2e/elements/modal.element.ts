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

    async clickYes() {
        const isVisible = await this.isVisible();
        if (!isVisible) {
            throw new Error('You are trying to click button on the modal but the modal does not exists');
        }
        return this._clickActionBtn(this._keys.yes);
    }
}
