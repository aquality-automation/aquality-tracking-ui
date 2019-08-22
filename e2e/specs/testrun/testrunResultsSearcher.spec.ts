import { LogIn } from '../../pages/login.po';
import { ProjectList } from '../../pages/project/list.po';
import { ProjectView } from '../../pages/project/view.po';
import { TestRunView } from '../../pages/testrun/view.po';
import { Project } from '../../../src/app/shared/models/project';

import cucumberImport from '../../data/import/cucumber.json';
import users from '../../data/users.json';
import projects from '../../data/projects.json';
import { doImport } from '../../utils/aqualityTrackingAPI.util';
import { prepareProject } from '../project.hooks';
import { TestRunList } from '../../pages/testrun/list.po';

describe('Test Run Result Searcher', () => {
    const logIn = new LogIn();
    const projectList = new ProjectList();
    const projectView = new ProjectView();
    const testRunView = new TestRunView();
    const testRunList = new TestRunList();
    const project: Project = projects.testRunResultSearcherProject;
    let importToken: string;
    let projectId: number;
    const builds = { build_1: 'Build_1', build_2: 'Build_2' };

    const executeCucumberImport = async () => {
        const result = await doImport({
            projectId,
            importToken,
            format: 'Cucumber',
            suite: 'Test Suite'
        }, [JSON.stringify(cucumberImport), JSON.stringify(cucumberImport)], [`${builds.build_1}.json`, `${builds.build_2}.json`]);
        if (!result) {
            throw Error('Import Failed!');
        }
        return result;
    };

    beforeAll(async () => {
        await logIn.logIn(users.admin.user_name, users.admin.password);
        importToken = await prepareProject(project);
        projectId = await projectView.getCurrentProjectId();
        await executeCucumberImport();
    });

    afterAll(async () => {
        await projectList.removeProject(project.name);
        if (await projectList.menuBar.isLogged()) {
            return projectList.menuBar.clickLogOut();
        }
    });

    it('Can be opened', async () => {
        await projectView.menuBar.testRuns();
        await testRunList.waitForTestRun(builds.build_2);
        await testRunList.openTestRun(builds.build_1);
        await testRunView.resultSearcher.openSearcher();
        expect(testRunView.resultSearcher.isSearcherOpened()).toBe(true, 'Searcher is not Opened');
    });

    it('Can be executed by pressing Enter', async () => {
        await testRunView.resultSearcher.setSearchValue('Random Value');
        await testRunView.resultSearcher.pressEnter();
        expect(testRunView.resultSearcher.hasNoResults()).toBe(true, 'Searcher found some results but should not.');
    });

    it('Can be executed by clicking Search button', async () => {
        const failReason = 'failed';
        await testRunView.resultSearcher.search(failReason);
        expect(testRunView.resultSearcher.hasNoResults()).toBe(false, 'Searcher does not find any results.');
        const incorrectValues = await testRunView.resultSearcher.onlyContainsFailReasonWith(failReason);
        expect(incorrectValues.length).toBe(0, `there are some incorrect fail reasons:\r\n${incorrectValues.join('\r\n')}`);
    });

    it('Can be closed', async () => {
        await testRunView.resultSearcher.closeSearcher();
        expect(testRunView.resultSearcher.isSearcherOpened()).toBe(false, 'Searcher is not Closed');
    });

    it('Can find results by Fail Reason Right Click', async () => {
        const failReason = 'step was skippedstep was skipped';
        await testRunView.rightClickFailReason(failReason);
        expect(testRunView.resultSearcher.isSearcherOpened()).toBe(true, 'Searcher is not Opened');
        expect(testRunView.resultSearcher.getSearchValue())
            .toBe(failReason, 'Search field filled with wrong value!');
        const incorrectValues = await testRunView.resultSearcher.onlyContainsFailReasonWith(failReason);
        expect(incorrectValues.length).toBe(0, `there are some incorrect fail reasons:\r\n${incorrectValues.join('\r\n')}`);
    });
});
