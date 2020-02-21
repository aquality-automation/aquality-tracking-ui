import { logIn } from '../../pages/login.po';
import { projectView } from '../../pages/project/view.po';
import { testRunView } from '../../pages/testrun/view.po';
import { testRunList } from '../../pages/testrun/list.po';
import { ProjectHelper } from '../../helpers/project.helper';
import users from '../../data/users.json';
import cucumberImport from '../../data/import/cucumberSpecialSymbols.json';

fdescribe('TestRun view manual:', () => {
    const projectHelper: ProjectHelper = new ProjectHelper();
    const builds = projectHelper.generateBuilds(1);

    beforeAll(async () => {
        await projectHelper.init();
        await projectHelper.importer.executeCucumberImport('test', [cucumberImport], builds.filenames)[0];
        await logIn.logInAs(users.admin.user_name, users.admin.password);
        await projectHelper.openProject();
        await projectView.menuBar.testRuns();
        return testRunList.openTestRun(builds.names.build_1);
    });

    afterAll(async () => {
        return projectHelper.dispose();
    });

    it('Can download test run as csv with special symbols', async () => {
        const tableComparisonResult = await testRunView.checkIfTableEqualToCSV('/expected/testRunSpecialSymbols.csv');
        return expect(tableComparisonResult.result).toBe(true, tableComparisonResult.message);
    });
});
