import { by, element } from 'protractor';
import { BaseElement } from './base.element';

export class Notification extends BaseElement {

    constructor() {
        super(by.tagName('simple-notification'));
    }

    async isError() {
        await this.isVisible();
        const classAttr: string = await element(by.tagName('simple-notification > div')).getAttribute('class');
        return classAttr.includes('error');
    }

    async isSuccess() {
        await this.isVisible();
        const classAttr: string = await element(by.tagName('simple-notification > div')).getAttribute('class');
        return classAttr.includes('success');
    }

    getHeader() {
        return element(by.css('simple-notification .sn-title')).getText();
    }

    getContent() {
        return element(by.css('simple-notification .sn-content')).getText();
    }

    close() {
        return element(by.tagName('simple-notification')).click();
    }
}
