import { logIn } from '../../pages/login.po';
import { projectView } from '../../pages/project/view.po';
import { testRunView } from '../../pages/testrun/view.po';
import { testRunList } from '../../pages/testrun/list.po';
import { ProjectHelper } from '../../helpers/project.helper';

import lookupOptions from '../../data/lookupOptions.json';
import resolutions from '../../data/resolutions.json';
import cucumberImport from '../../data/import/cucumber.json';
import users from '../../data/users.json';

describe('Test Run View Charts', () => {
    const projectHelper: ProjectHelper = new ProjectHelper();
    const builds = { build_1: 'Build_1' };

    beforeAll(async () => {
        await projectHelper.init();
        await logIn.logInAs(users.admin.user_name, users.admin.password);
        const imported = await projectHelper.importer.executeCucumberImport('Test', [cucumberImport], [`${builds.build_1}.json`]);
        const issue = await projectHelper.editorAPI.createIssue({title: 'Test Issue', resolution_id: resolutions.global.testIssue.id});
        const results = await projectHelper.editorAPI.getResults({test_run_id: imported[0].id});
        const result = results.find(x => x.test.name === `${cucumberImport[0].name}: ${cucumberImport[0].elements[2].name}`);
        result.issue_id = issue.id;
        await projectHelper.editorAPI.createResult(result);
        await projectHelper.openProject();
        await projectView.menuBar.testRuns();
        const isTestRunAppear = await testRunList.waitForTestRun(builds.build_1);
        expect(isTestRunAppear).toBe(true, 'Import was not finished!');
        await testRunList.openTestRun(builds.build_1);
    });

    afterAll(async () => {
        await projectHelper.dispose();
    });

    it('Can Filter by Result', async () => {
        const clickedChartSection = await testRunView.clickResultPassedChartSection();
        return expect(testRunView.resultsAreFilteredByResult(clickedChartSection))
            .toBe(true, 'Results are not filtered by Result');
    });

    it('Can Filter by Resolution', async () => {
        await testRunView.setResultFilter(lookupOptions.global.none.name);
        const clickedChartSection = await testRunView.clickResolutionTestIssueChartSection();
        return expect(testRunView.resultsAreFilteredByResolution(clickedChartSection))
            .toBe(true, 'Results are not filtered by Resolution');
    });
});
