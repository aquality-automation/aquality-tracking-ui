import { by, Locator, ElementFinder, protractor } from 'protractor';
import { BaseElement } from './base.element';
import { WithSearch } from './interfaces/elementWithSearch';

export class Multiselect extends BaseElement implements WithSearch {
    constructor(locator: Locator) {
        super(locator);
    }

    private search = this.element.element(by.css('.ms-search'));
    private selector = this.element.element(by.css('.ms-main-selector'));
    private disabledElement = this.element.element(by.css('.disabled-lookup'));
    private msBoxes = this.element.all(by.css('.ms-box > .ms-box-text'));
    private removeMsBox = (name: string): ElementFinder => this.element.element(by.css(`.ms-box[title='${name}'] > .remove-ms-box`));

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
        await this.selectOption(value);
        if (await this.isOpened()) {
            return this.search.sendKeys(protractor.Key.ESCAPE);
        }
    }

    public async remove(name: string) {
        await this.removeMsBox(name).click();
        if (await this.isOpened()) {
            return this.search.sendKeys(protractor.Key.ESCAPE);
        }
    }

    public async isEditable() {
        return !(await this.disabledElement.isPresent());
    }

    public async getValue() {
        if (this.isEditable()) {
            const values = [];
            const msBoxes = await this.msBoxes;
            for (let i = 0; i < msBoxes.length; i++) {
                values.push(await msBoxes[i].getText());
            }
            return values;
        }

        return (await this.disabledElement.getText()).split(', ');
    }

    private isOpened() {
        return this.search.isPresent();
    }

    private findOption(value: string) {
        return this.element.element(by.css(`.selector-suggestions li[title="${value}"]`));
    }
}
