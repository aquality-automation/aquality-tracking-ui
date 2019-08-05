import { by, Locator } from 'protractor';
import { BaseElement } from './base.element';
import { Input } from './input.element';
import { WithSearch } from './interfaces/elementWithSearch';

export class Autocomplete extends BaseElement implements WithSearch {
    constructor(locator: Locator) {
        super(locator);
    }

    private input = new Input(this.element.element(by.tagName('input')));

    public enterValue(value: string) {
        return this.input.typeText(value);
    }

    public selectOption(value: string) {
        return this.findOption(value).click();
    }

    public async select(value: string) {
        await this.enterValue(value);
        return this.selectOption(value);
    }

    private findOption(value: string) {
        return this.element.element(by.xpath(`.//*[contains(@class, "selector-suggestions")]//li[@title="${value}"]`));
    }

    public getValue() {
        return this.input.getValue();
    }
}
