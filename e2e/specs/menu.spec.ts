import { LogIn } from '../pages/login.po';
import { ProjectList } from '../pages/project/list.po';

import users from '../data/users.json';
import { browser } from 'protractor';

describe('Report an Issue', () => {
    const logIn = new LogIn();
    const projectList = new ProjectList();
    const githubUrl = 'https://github.com/aquality-automation/aquality-tracking/issues';

    beforeAll(() => {
        logIn.navigateTo();
    });

    beforeAll(async () => {
        await logIn.logInAs(users.admin.user_name, users.admin.password);
    });

    afterAll(async () => {
        if (await projectList.menuBar.isLogged()) {
            return projectList.menuBar.clickLogOut();
        }
    });

    it('After clicking the option the github page is opened', async () => {
        const options = await projectList.menuBar.user();
        browser.ignoreSynchronization = true;
        await options.reportIssue();
        await expect(browser.getCurrentUrl()).toBe(githubUrl, 'Should be navigated to github!');
        browser.ignoreSynchronization = false;
    });

    it('I`m still logged when back to Aquality Tracking', () => {
        browser.navigate().back();
        expect(projectList.menuBar.isLogged()).toBe(true, 'Should be logged in!');
    });
});
