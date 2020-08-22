import { Locator, ElementFinder, promise } from 'protractor';
import { BaseElement } from './base.element';

export class Checkbox extends BaseElement {
    constructor(locator: Locator | ElementFinder) {
        super(locator);
    }

    select() {
        return this.setState(true);
    }

    deselect() {
        return this.setState(false);
    }

    async setState(state: boolean) {
        await this.scrollIntoView();
        if ((await this.element.isSelected()) !== state) {
            return this.element.click();
        }
    }

    isSelected(): promise.Promise<boolean> {
        return this.element.isSelected();
    }
}
