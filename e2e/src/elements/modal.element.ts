import { BaseElement } from './base.element';
import { by } from 'protractor';

export class Modal extends BaseElement {
    constructor() {
        super(by.tagName('app-modal'));
    }

    private _keys = {
        yes: 'yes',
        no: 'no',
        cancel: 'cancel'
    };

    private async _clickActionBtn(buttonName: string) {
        const isPresent = await this.isPresent();
        if (!isPresent) {
            throw new Error('You are trying to click button on the modal but the modal does not exists');
        }

        return this.element.element(by.xpath(`.//button[text()="${buttonName}"]`)).click();
    }

    private _clickSuccess() {
        return this.element.element(by.css(`button.btn-success`)).click();
    }

    clickYes() {
        return this._clickActionBtn(this._keys.yes);
    }

    clickNo() {
        return this._clickActionBtn(this._keys.no);
    }

    clickCancel() {
        return this._clickActionBtn(this._keys.cancel);
    }

    clickSuccess() {
        return this._clickSuccess();
    }
}
