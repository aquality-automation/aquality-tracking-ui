import { logIn } from '../pages/login.po';
import { projectList } from '../pages/project/list.po';
import users from '../data/users.json';
import { browser } from 'protractor';

describe('Report an Issue', () => {
    const githubUrl = 'https://github.com/aquality-automation/aquality-tracking/issues';

    beforeAll(async () => {
        await logIn.logInAs(users.admin.user_name, users.admin.password);
    });

    afterAll(async () => {
        if (await projectList.menuBar.isLogged()) {
            return projectList.menuBar.clickLogOut();
        }
    });

    it('After clicking the option the github page is opened', async () => {
        browser.ignoreSynchronization = true;
        await projectList.menuBar.reportIssue();
        await expect(browser.getCurrentUrl()).toBe(githubUrl, 'Should be navigated to github!');
        browser.ignoreSynchronization = false;
    });

    it('I`m still logged when back to Aquality Tracking', () => {
        browser.navigate().back();
        expect(projectList.menuBar.isLogged()).toBe(true, 'Should be logged in!');
    });
});
