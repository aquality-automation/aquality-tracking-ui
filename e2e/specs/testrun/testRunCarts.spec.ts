import { LogIn } from '../../pages/login.po';
import { ProjectList } from '../../pages/project/list.po';
import { ProjectView } from '../../pages/project/view.po';
import { TestRunView } from '../../pages/testrun/view.po';
import { Project } from '../../../src/app/shared/models/project';

import cucumberImport from '../../data/import/cucumber.json';
import users from '../../data/users.json';
import projects from '../../data/projects.json';
import { prepareProject, executeCucumberImport } from '../project.hooks';
import { TestRunList } from '../../pages/testrun/list.po';

fdescribe('Test Run View Charts', () => {
    const logIn = new LogIn();
    const projectList = new ProjectList();
    const projectView = new ProjectView();
    const testRunView = new TestRunView();
    const testRunList = new TestRunList();
    const project: Project = projects.testrunChartsTest;
    let importToken: string;
    let projectId: number;
    const builds = { build_1: 'Build_1' };

    beforeAll(async () => {
        await logIn.logIn(users.admin.user_name, users.admin.password);
        importToken = await prepareProject(project);
        projectId = await projectView.getCurrentProjectId();
        await executeCucumberImport(projectId, 'Test',
            importToken, [JSON.stringify(cucumberImport)], [`${builds.build_1}.json`]);
        await projectView.menuBar.testRuns();
        const isTestRunAppear = await testRunList.waitForTestRun(builds.build_1);
        expect(isTestRunAppear).toBe(true, 'Import was not finished!');
        await testRunList.openTestRun(builds.build_1);
    });

    afterAll(async () => {
        await projectList.removeProject(project.name);
        if (await projectList.menuBar.isLogged()) {
            return projectList.menuBar.clickLogOut();
        }
    });

    it('Can Filter by Result', async () => {
        await testRunView.clickResultPieChartSection(1);
        console.log('did');
    });

    it('Can Filter by Resolution', async () => {
    });
});
