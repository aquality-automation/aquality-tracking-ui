import { by, element } from 'protractor';

export class AuditsOptions {
    async dashboard() {
        return element(by.xpath('//*[@id="Audits"]//a[text()="Dashboard"]')).click();
    }

    async project() {
        return element(by.xpath('//*[@id="Audits"]//a[text()="Project"]')).click();
    }
}
