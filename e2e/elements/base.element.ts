import { element, ElementFinder, Locator, browser } from 'protractor';
import { waiter } from '../utils/wait.util';

export class BaseElement {
    public element: ElementFinder;
    constructor(locatorOrElement: ElementFinder | Locator) {
        if (locatorOrElement['locator']) {
            this.element = locatorOrElement as ElementFinder;
        } else {
            this.element = element(locatorOrElement as Locator);
        }
    }

    async click() {
        return this.element.click();
    }

    async isVisible(): Promise<boolean> {
        return waiter.forTrue(() => this.element.isPresent(), 2, 500);
    }

    async isPresent(): Promise<boolean> {
        return this.element.isPresent();
    }

    async dragAndDrop(moveTo: BaseElement) {
        return browser.actions()
            .mouseDown(this.element)
            .mouseMove(moveTo.element)
            .mouseUp()
            .perform();
    }
}
