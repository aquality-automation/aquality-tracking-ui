import { by, Locator } from 'protractor';
import { BaseElement } from './base.element';
import { WithSearch } from './interfaces/elementWithSearch';

export class Multiselect extends BaseElement implements WithSearch {
    constructor(locator: Locator) {
        super(locator);
    }

    private search = this.element.element(by.css('.ms-search'));
    private selector = this.element.element(by.css('.ms-main-selector'));

    public openSelector() {
        return this.selector.click();
    }

    public async enterValue(value: string) {
        await this.openSelector();
        return this.search.sendKeys(value);
    }

    public selectOption(value: string) {
        return this.findOption(value).click();
    }

    public async select(value: string) {
        await this.enterValue(value);
        return this.selectOption(value);
    }

    private findOption(value: string) {
        return this.element.element(by.xpath(`//*[contains(@class, "selector-suggestions")]//li[@title="${value}"]`));
    }
}
