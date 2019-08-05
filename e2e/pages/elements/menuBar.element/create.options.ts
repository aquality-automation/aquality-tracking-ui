import { by, element } from 'protractor';

export class CreateOptions {
    async milestone() {
        return element(by.xpath('//*[@id="Create"]//a[text()="Milestone"]')).click();
    }

    async suite() {
        return element(by.xpath('//*[@id="Create"]//a[text()="Suite"]')).click();
    }

    async testRun() {
        return element(by.xpath('//*[@id="Create"]//a[text()="Test Run"]')).click();
    }

    async test() {
        return element(by.xpath('//*[@id="Create"]//a[text()="Test"]')).click();
    }
}
