import { element, ElementFinder, browser, protractor, Locator } from 'protractor';
const EC = protractor.ExpectedConditions;

export class BaseElement {
    public element: ElementFinder;
    constructor(locatorOrElement: ElementFinder | Locator) {
        if (locatorOrElement['locator']) {
            this.element = locatorOrElement as ElementFinder;
        } else {
            this.element = element(locatorOrElement as Locator);
        }
    }

    async isVisible() {
        return browser.wait(EC.presenceOf(this.element), 5000, 'Notification does not appear!');
    }
}
