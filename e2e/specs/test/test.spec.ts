import { logIn } from '../../pages/login.po';
import { projectList } from '../../pages/project/list.po';
import { projectView } from '../../pages/project/view.po';
import { testRunView } from '../../pages/testrun/view.po';
import { Project } from '../../../src/app/shared/models/project';
import { prepareProject, executeCucumberImport, generateBuilds } from '../project.hooks';
import { testRunList } from '../../pages/testrun/list.po';
import { suiteView } from '../../pages/suite/view.po';
import { testView } from '../../pages/test/test.po';
import { browser } from 'protractor';

import cucumberImport from '../../data/import/cucumber.json';
import users from '../../data/users.json';
import projects from '../../data/projects.json';

describe('Test', () => {
    const project: Project = projects.customerOnly;
    project.name = new Date().getTime().toString();
    let importToken: string;
    let projectId: number;
    const builds = generateBuilds(2);
    const suites = { suite_1: 'Test Suite 1', suite_2: 'Test Suite 2' };
    const testName = 'Test Feature with all results: step failed';

    const executeImport = async (suite: string, buildIndex: number) => {
        await executeCucumberImport(projectId, suite,
            importToken, [JSON.stringify(cucumberImport)], [builds.filenames[buildIndex]]);
        await projectView.menuBar.testRuns();
        const isTestRunAppear = await testRunList.waitForTestRun(builds.names[`build_${buildIndex + 1}`]);
        expect(isTestRunAppear).toBe(true, 'Import was not finished!');
    };

    beforeAll(async () => {
        await logIn.logInAs(users.admin.user_name, users.admin.password);
        importToken = await prepareProject(project);
        projectId = await projectView.getCurrentProjectId();
        await executeImport(suites.suite_1, 0);
        return executeImport(suites.suite_2, 1);
    });

    afterAll(async () => {
        await suiteView.menuBar.clickLogo();
        await projectList.removeProject(project.name);
        if (await projectList.menuBar.isLogged()) {
            return projectList.menuBar.clickLogOut();
        }
    });

    it('Can see all Suites assigned to test', async () => {
        await (await testRunView.menuBar.tests()).all();
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
