import { logIn } from '../../pages/login.po';
import { projectView } from '../../pages/project/view.po';
import { testRunView } from '../../pages/testrun/view.po';
import { ProjectHelper } from '../../helpers/project.helper';
import cucumberImport from '../../data/import/cucumber.json';
import users from '../../data/users.json';
import { testRunList } from '../../pages/testrun/list.po';

fdescribe('Test Run View Charts', () => {
    const projectHelper: ProjectHelper = new ProjectHelper();
    const builds = { build_1: 'Build_1' };

    beforeAll(async () => {
        await projectHelper.init();
        await logIn.logInAs(users.admin.user_name, users.admin.password);        
        await projectHelper.importer.executeCucumberImport('Test', [cucumberImport], [`${builds.build_1}.json`]);
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
        await testRunView.clickResultPieChartSection(testRunView.results.passed.chartId);
        return expect(testRunView.resultsAreFilteredByResult(testRunView.results.passed.name))
            .toBe(true, 'Results are not filtered by Result');
    });

    it('Can Filter by Resolution', async () => {
        await testRunView.setResultFilter(testRunView.results.none.name);
        await testRunView.setResolution(testRunView.resolutions.testIssue.name,
            `${cucumberImport[0].name}: ${cucumberImport[0].elements[2].name}`);
        await testRunView.clickResolutionPieChartSection(testRunView.resolutions.testIssue.chartId);
        return expect(testRunView.resultsAreFilteredByResolution(testRunView.resolutions.testIssue.name))
            .toBe(true, 'Results are not filtered by Resolution');
    });
});
