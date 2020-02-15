import { by, element } from 'protractor';
import { BaseElement } from './base.element';

export class Notification extends BaseElement {
    private pageName: string;

    constructor(pageName: string) {
        super(by.tagName('simple-notification'));
        this.pageName = pageName;
    }

    async isError() {
        await this.isVisible();
        const classAttr: string = await this.getContainer().getAttribute('class');
        return classAttr.includes('error');
    }

    async isSuccess() {
        await this.isVisible();
        const classAttr: string = await this.getContainer().getAttribute('class');
        return classAttr.includes('success');
    }

    async isWarning() {
        await this.isVisible();
        const classAttr: string = await this.getContainer().getAttribute('class');
        return classAttr.includes('warn');
    }

    getHeader() {
        return element(by.css('simple-notification .sn-title')).getText();
    }

    getContent() {
        return element(by.css('simple-notification .sn-content')).getText();
    }

    close() {
        return this.getContainer().click();
    }

    assertIsSuccess(message?: string, header?: string) {
        return this.assert('success', message, header);
    }

    assertIsError(message?: string, header?: string) {
        return this.assert('error', message, header);
    }

    assertIsWarning(message?: string, header?: string) {
        return this.assert('warn', message, header);
    }

    private async assert(type: string, message?: string, header?: string) {
        await expect(type === 'error' ? this.isError() : type === 'success' ? this.isSuccess() : type === 'warn' ? this.isWarning() : false)
            .toBe(true, `${this.pageName}: No Success notification message!`);
        if (message) {
            await expect(this.getContent())
                .toBe(message, `${this.pageName}: Notification message is wrong!`);
        }
        if (header) {
            await expect(this.getHeader())
                .toEqual(header);
        }
        await this.close();
    }

    private getContainer() {
        return element(by.tagName('simple-notification > div'));
    }
}
