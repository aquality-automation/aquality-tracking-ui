import { Locator, ElementFinder } from 'protractor';
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
        if ((await this.element.isSelected()) !== state) {
            return this.element.click();
        }
    }
}
