import { by, element, promise, browser } from 'protractor';
import { CreateOptions } from './create.options';
import { TestsOptions } from './tests.options';
import { AuditsOptions } from './audits.options';

export class MenuBar {
    private auditsButton = element(by.css('#Audits > a'));
    private administrationOption = element(by.id('administration-nav'));

    clickLogo() {
        return element(by.css('.navbar-brand')).click();
    }

    isLogged() {
        return element(by.id('logout')).isPresent();
    }

    async getCurrentUserName() {
        return await this.isLogged()
            ? element(by.css('#navigation-right-side > li > a')).getText()
            : undefined;
    }

    async clickLogOut() {
        if(element(by.css('.loader')).isPresent()) {
            browser.navigate().back();
        }
        return element(by.id('logout')).click();
    }

    import() {
        return element(by.id('Import')).click();
    }

    async audits() {
        await this.auditsButton.click();
        return new AuditsOptions();
    }

    milestones() {
        return element(by.id('Milestones')).click();
    }

    async create() {
        await element(by.id('Create')).click();
        return new CreateOptions();
    }

    isCreateExist() {
        return element(by.css('#Create > a')).isPresent();
    }

    testRuns() {
        return element(by.id('Test Runs')).click();
    }

    issues() {
        return element(by.id('Issues')).click();
    }

    project(projectName: string) {
        return element(by.id(projectName)).click();
    }

    async tests() {
        await element(by.id('Tests')).click();
        return new TestsOptions();
    }

    isAuditTabExists(): promise.Promise<boolean> {
        return this.auditsButton.isPresent();
    }

    administration() {
        return this.administrationOption.click();
    }

    isAdministrationExists() {
        return this.administrationOption.element(by.tagName('a')).isPresent();
    }

    editAccount() {
        return element(by.id('user-mb')).click();
    }

    reportIssue() {
        return element(by.id('bug-nav')).click();
    }
}
