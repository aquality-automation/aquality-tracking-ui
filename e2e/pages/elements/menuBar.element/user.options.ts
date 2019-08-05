import { by, element } from 'protractor';

export class UserOptions {
    async editAccount() {
        return element(by.xpath('//*[@id="user-mb"]//a[text()="Edit My Account"]')).click();
    }

    async administration() {
        return element(by.xpath('//*[@id="user-mb"]//a[text()="Administration"]')).click();
    }

    async reportIssue() {
        return element(by.xpath('//*[@id="user-mb"]//a[text()="Report an Issue"]')).click();
    }
}
