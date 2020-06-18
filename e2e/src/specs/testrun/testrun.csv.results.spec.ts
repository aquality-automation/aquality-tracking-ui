import { logIn } from '../../pages/login.po';
import { projectView } from '../../pages/project/view.po';
import { testrunView } from '../../pages/testrun/view.po';
import { testrunList } from '../../pages/testrun/list.po';
import { ProjectHelper } from '../../helpers/project.helper';
import users from '../../data/users.json';
import cucumberImport from '../../data/import/cucumberSpecialSymbols.json';

describe('TestRun view manual:', () => {
    const projectHelper: ProjectHelper = new ProjectHelper();
    const builds = projectHelper.generateBuilds(1);

    beforeAll(async () => {
        await projectHelper.init({
            manager: users.manager
        });
        await projectHelper.importer.executeCucumberImport('test', [cucumberImport], builds.filenames)[0];
        await logIn.logInAs(users.manager.user_name, users.manager.password);
        await projectHelper.openProject();
        await projectView.menuBar.testruns();
        return testrunList.openTestRun(builds.names.build_1);
    });

    afterAll(async () => {
        return projectHelper.dispose();
    });

    it('Can download test run as csv with special symbols', async () => {
        const tableComparisonResult = await testrunView.checkIfTableEqualToCSV('/expected/testrunSpecialSymbols.csv');
        return expect(tableComparisonResult.result).toBe(true, tableComparisonResult.message);
    });
});
