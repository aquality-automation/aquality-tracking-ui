import { by, element } from 'protractor';

export class UserOptions {
    private administrationOption = element(by.xpath('//*[@id="user-mb"]//a[text()="Administration"]'));

    async editAccount() {
        return element(by.xpath('//*[@id="user-mb"]//a[text()="Edit My Account"]')).click();
    }

    async administration() {
        return this.administrationOption.click();
    }

    async reportIssue() {
        return element(by.xpath('//*[@id="user-mb"]//a[text()="Report an Issue"]')).click();
    }

    async isAdministrationExists() {
        return this.administrationOption.isPresent();
    }
}
