import { by, element } from 'protractor';

export class TestsOptions {
    private _optionLocator = (optionName: string) => by.xpath(`//*[@id="Tests"]//a[text()="${optionName}"]`);

    async all() {
        return element(this._optionLocator('All')).click();
    }

    async suites() {
        return element(this._optionLocator('Suites')).click();
    }

    async dashboard() {
        return element(this._optionLocator('Dashboard')).click();
    }

    async steps() {
        return element(this._optionLocator('Steps')).click();
    }
}
