import { by, element } from 'protractor';
import { CreateOptions } from './create.options';
import { TestsOptions } from './tests.options';
import { UserOptions } from './user.options';

export class MenuBar {
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

    clickLogOut() {
        return element(by.id('logout')).click();
    }

    import() {
        return element(by.id('Import')).click();
    }

    async create() {
        await element(by.id('Create')).click();
        return new CreateOptions();
    }

    testRuns() {
        return element(by.id('Test Runs')).click();
    }

    project(projectName: string) {
        return element(by.id(projectName)).click();
    }

    async tests() {
        await element(by.id('Tests')).click();
        return new TestsOptions();
    }

    async user() {
        await element(by.id('user-mb')).click();
        return new UserOptions();
    }
}
