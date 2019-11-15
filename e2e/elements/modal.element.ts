import { BaseElement } from './base.element';
import { by } from 'protractor';

export class Modal extends BaseElement {
    constructor() {
        super(by.tagName('simple-popup'));
    }

    private _keys = {
        yes: 'yes',
        no: 'no'
    };

    private async _clickActionBtn(buttonName: string) {
        const isVisible = await this.isVisible();
        if (!isVisible) {
            throw new Error('You are trying to click button on the modal but the modal does not exists');
        }

        return this.element.element(by.xpath(`.//button[text()="${buttonName}"]`)).click();
    }

    clickYes() {
        return this._clickActionBtn(this._keys.yes);
    }

    clickNo() {
        return this._clickActionBtn(this._keys.no);
    }
}
