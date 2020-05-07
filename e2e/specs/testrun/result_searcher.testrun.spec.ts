import { logIn } from '../../pages/login.po';
import { projectView } from '../../pages/project/view.po';
import { testRunView } from '../../pages/testrun/view.po';
import { ProjectHelper } from '../../helpers/project.helper';
import cucumberImport from '../../data/import/cucumber.json';
import users from '../../data/users.json';
import { testRunList } from '../../pages/testrun/list.po';

describe('Test Run Result Searcher', () => {
    const projectHelper: ProjectHelper = new ProjectHelper();
    const builds = { build_1: 'Build_1', build_2: 'Build_2' };

    beforeAll(async () => {
        await projectHelper.init({
            manager: users.manager
        });
        await logIn.logInAs(users.manager.user_name, users.manager.password);
        await projectHelper.openProject();
        await projectHelper.importer.executeCucumberImport(
            'Test Suite',
            [cucumberImport, cucumberImport],
            [`${builds.build_1}.json`,
            `${builds.build_2}.json`]);
        await projectView.menuBar.testRuns();
        await testRunList.openTestRun(builds.build_1);
    });

    afterAll(async () => {
        await projectHelper.dispose();
    });

    it('Can be opened', async () => {
        await testRunView.resultSearcher.openSearcher();
        expect(testRunView.resultSearcher.isSearcherOpened()).toBe(true, 'Searcher was not Opened');
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
        expect(incorrectValues.length).toBe(0, `There are some incorrect fail reasons:\r\n${incorrectValues.join('\r\n')}`);
    });

    it('Can be closed', async () => {
        await testRunView.resultSearcher.closeSearcher();
        expect(testRunView.resultSearcher.isSearcherOpened()).toBe(false, 'Searcher was not Closed');
    });

    it('Can find results by Fail Reason Right Click', async () => {
        const failReason = 'step was skippedstep was skipped';
        await testRunView.rightClickFailReason(failReason);
        expect(testRunView.resultSearcher.isSearcherOpened()).toBe(true, 'Searcher was not Opened');
        expect(testRunView.resultSearcher.getSearchValue())
            .toBe(failReason, 'Search field filled with wrong value!');
        const incorrectValues = await testRunView.resultSearcher.onlyContainsFailReasonWith(failReason);
        expect(incorrectValues.length).toBe(0, `There are some incorrect fail reasons:\r\n${incorrectValues.join('\r\n')}`);
    });

    it('Can use Regular expression for search', async () => {
        const failReason = 'step was failed';
        await testRunView.resultSearcher.enableRegexpSearch();
        await testRunView.resultSearcher.search('step was (.{4})ed$');
        const incorrectValues = await testRunView.resultSearcher.onlyContainsFailReasonWith(failReason);
        expect(incorrectValues.length).toBe(0, `There are some incorrect fail reasons:\r\n${incorrectValues.join('\r\n')}`);
    });

    it('Can disable Regular expression for search', async () => {
        await testRunView.resultSearcher.disableRegexpSearch();
        await testRunView.resultSearcher.search('step was (.{4})ed$');
        expect(testRunView.resultSearcher.hasNoResults()).toBe(true, 'Searcher found some results but should not.');
    });

    it('Can limit search results', async () => {
        await testRunView.resultSearcher.setLimit('1');
        await testRunView.resultSearcher.search('step was');
        expect(testRunView.resultSearcher.getNumberOfResults()).toBe(1, 'Results Number is wrong!');
    });
});
