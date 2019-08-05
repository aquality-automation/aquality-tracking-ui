import { by, element } from 'protractor';

export class TestsOptions {
    async all() {
        return element(by.xpath('//*[@id="Tests"]//a[text()="All"]')).click();
    }

    async suites() {
        return element(by.xpath('//*[@id="Tests"]//a[text()="Suites"]')).click();
    }

    async dashboard() {
        return element(by.xpath('//*[@id="Tests"]//a[text()="Dashboard"]')).click();
    }
}
