import { by, Locator } from 'protractor';
import { BaseElement } from './base.element';

export class Lookup extends BaseElement {
    constructor(locator: Locator) {
        super(locator);
    }

    private selector = this.element.element(by.css('.selector-main-button'));

    public getSelectedValue() {
        return this.selector.getText();
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
