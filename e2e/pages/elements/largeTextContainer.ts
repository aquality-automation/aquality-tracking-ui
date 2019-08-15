import { ElementFinder, Locator, browser } from 'protractor';
import { BaseElement } from './base.element';

export class LargeTextContainer extends BaseElement {

    constructor(locatorOrElement: Locator | ElementFinder) {
        super(locatorOrElement);
    }

    public getText() {
        return this.element.getText();
    }

    public async toggle() {
        await browser.actions().doubleClick(this.element).perform();
        return await this.animationPromise();
    }

    private animationPromise() {
        return new Promise((resolve) => {
            setTimeout(() => resolve(), 600);
        });
    }
}
