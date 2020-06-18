import { logIn } from '../../pages/login.po';
import { testrunView } from '../../pages/testrun/view.po';
import { suiteView } from '../../pages/suite/view.po';
import { testView } from '../../pages/test/test.po';
import { browser } from 'protractor';

import cucumberImport from '../../data/import/cucumber.json';
import users from '../../data/users.json';
import { ProjectHelper } from '../../helpers/project.helper';

describe('Test', () => {
    const projectHelper: ProjectHelper = new ProjectHelper();
    const builds = projectHelper.generateBuilds(2);
    const suites = { suite_1: 'Test Suite 1', suite_2: 'Test Suite 2' };
    const testName = 'Test Feature with all results: step failed';

    beforeAll(async () => {
        await projectHelper.init({
            manager: users.manager
          });
        await projectHelper.importer.executeCucumberImport(suites.suite_1, [cucumberImport], [builds.filenames[0]]);
        await projectHelper.importer.executeCucumberImport(suites.suite_2, [cucumberImport], [builds.filenames[1]]);
        await logIn.logInAs(users.manager.user_name, users.manager.password);
        await projectHelper.openProject();
    });

    afterAll(async () => {
        await projectHelper.dispose();
    });

    it('Can see all Suites assigned to test', async () => {
        await (await testrunView.menuBar.tests()).all();
        await suiteView.openTest(testName);
        expect(testView.isSuiteLinkExists(suites.suite_1)).toBe(true, `Suite '${suites.suite_1}' is missed!`);
        expect(testView.isSuiteLinkExists(suites.suite_2)).toBe(true, `Suite '${suites.suite_2}' is missed!`);
    });

    it('Can open first suite by link', async () => {
        await testView.clickSuiteLink(suites.suite_1);
        expect(suiteView.isOpened()).toBe(true, 'Suite view was not opened');
        expect(suiteView.getNameOfTestSuite()).toBe(suites.suite_1, 'Wrong Suite is opened!');
    });

    it('Can back to test by clicking back in browser', async () => {
        await browser.navigate().back();
        expect(testView.isOpened()).toBe(true, 'Test View Page was not opened after clicking back!');
    });

    it('Can open second suite by link', async () => {
        await testView.clickSuiteLink(suites.suite_2);
        expect(suiteView.isOpened()).toBe(true, 'Suite view was not opened');
        expect(suiteView.getNameOfTestSuite()).toBe(suites.suite_2, 'Wrong Suite is opened!');
    });
});
