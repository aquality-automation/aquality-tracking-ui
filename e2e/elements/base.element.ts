import { element, ElementFinder, Locator } from 'protractor';
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

    async isVisible(): Promise<boolean> {
        return waiter.forTrue(() => this.element.isPresent(), 2, 500);
    }
}
