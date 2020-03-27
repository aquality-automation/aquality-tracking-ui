import { by, Locator } from 'protractor';
import { BaseElement } from './base.element';
import { logger } from '../utils/log.util';

export class Lookup extends BaseElement {
    constructor(locator: Locator) {
        super(locator);
    }

    private selector = this.element.element(by.css('.selector-main-button'));

    public async getSelectedValue() {
        if (await this.selector.isPresent()) {
            return this.selector.getText();
        }

        logger.warn(`Colored Lookup '${this.element.locator()}' is hidden!`);
        return '';
    }

    public openSelector() {
        return this.selector.click();
    }

    public async select(value: string) {
        await this.openSelector();
        return this.findOption(value).click();
    }

    public async isOptionPresent(value: string) {
        return this.findOption(value).isPresent();
    }

    private findOption(value: string) {
        return this.element.element(by.xpath(`//*[contains(@class, "selector-suggestions")]//li[@title="${value}"]`));
    }

    public async isEnabled() {
        return this.selector.isEnabled();
    }
}
