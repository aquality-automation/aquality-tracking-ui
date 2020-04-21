import { by, Locator, browser } from 'protractor';
import { BaseElement } from './base.element';
import { Input } from './input.element';
import { WithSearch } from './interfaces/elementWithSearch';

export class Autocomplete extends BaseElement implements WithSearch {
    constructor(locator: Locator) {
        super(locator);
    }

    private input = new Input(this.element.element(by.tagName('input')));
    private disabledElement = this.element.element(by.css('.disabled-lookup'));
    private selectedOptionAction = this.element.element(by.css('.input-group-append > .autocomplete-action, .disabled-lookup > .autocomplete-action'));

    public enterValue(value: string) {
        return this.input.typeText(value);
    }

    public async clickAddOption(value: string) {
        await this.enterValue(value);
        return this.selectOption('Add');
    }

    public selectOption(value: string) {
        const option = this.findOption(value);
        browser.executeScript('arguments[0].scrollIntoView();', option.getWebElement());
        return option.click();
    }

    public async select(value: string) {
        await this.enterValue(value);
        return this.selectOption(value);
    }

    private findOption(value: string) {
        return this.element.element(by.xpath(`.//*[contains(@class, "selector-suggestions")]//li[contains(@title,"${value}")]`));
    }

    public async getValue() {
        if (await this.input.isPresent()) {
            return this.input.getValue();
        }

        return this.disabledElement.getText();
    }

    public async createAndSelect(value) {
        await this.input.typeText(value);
        await this.findOption('Add').click();
    }

    async isEnabled() {
        return !(await this.disabledElement.isPresent());
    }

    async hasOption(value: string) {
        await this.enterValue(value);
        return this.findOption(value).isPresent();
    }

    clickActionForSelected() {
        return this.selectedOptionAction.click();
    }

    async clickActionForOption(option: string) {
        await this.enterValue(option);
        return this.findOption(option).element(by.css('.autocomplete-action')).click();
    }
}
