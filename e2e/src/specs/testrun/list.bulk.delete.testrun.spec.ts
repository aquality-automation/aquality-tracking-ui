import { logIn } from '../../pages/login.po';
import { projectView } from '../../pages/project/view.po';
import { ProjectHelper } from '../../helpers/project.helper';
import { TestSuite } from '../../../../src/app/shared/models/test-suite';
import { testRunList } from '../../pages/testrun/list.po';
import { TestRun } from '../../../../src/app/shared/models/testRun';
import users from '../../data/users.json';
import using from 'jasmine-data-provider';
import cucumberImport from '../../data/import/cucumber.json';

const editorExamples = {
    localAdmin: users.localAdmin,
    localManager: users.localManager,
    manager: users.manager,
};

const notEditorExamples = {
    localEngineer: users.localEngineer
};

describe('Test Run List: Bulk Delete:', () => {
    const projectHelper: ProjectHelper = new ProjectHelper();
    const suite: TestSuite = { name: 'Smoke' };
    let testRuns: TestRun[];

    beforeAll(async () => {
        await projectHelper.init({
            localAdmin: users.localAdmin,
            localManager: users.localManager,
            manager: users.manager,
            admin: users.autoAdmin,
            localEngineer: users.localEngineer
        });
    });

    afterAll(async () => {
        return projectHelper.dispose();
    });

    using(editorExamples, (user, description) => {
        describe(`${description} role:`, () => {

            beforeAll(async () => {
                testRuns = await projectHelper.importer
                    .executeCucumberImport(suite.name,
                        [cucumberImport, cucumberImport, cucumberImport, cucumberImport, cucumberImport],
                        [`build_1.json`, `build_2.json`, `build_3.json`, `build_4.json`, `build_5.json`]);
                await logIn.logInAs(user.user_name, user.password);
                await projectHelper.openProject();
                return projectView.menuBar.testRuns();
            });

            it('Can Cancel Bulk Delete', async () => {
                await testRunList.selectTestRun(testRuns[0].build_name, testRuns[1].build_name, testRuns[2].build_name);
                await testRunList.clickDeleteAll();
                await expect(testRunList.modal.isVisible()).toBe(true, 'Modal was not opened on Delete All click');
                await testRunList.modal.clickCancel();
                await expect(testRunList.modal.isPresent()).toBe(false, 'Modal was not closed on Cancel click');
                return expect(testRunList.areAllTestRunsDisplayed(testRuns[0].build_name, testRuns[1].build_name, testRuns[2].build_name))
                    .toBe(true, 'Test runs were removed after cancelling bulk delete');
            });

            it('Can Execute Bulk Delete', async () => {
                await testRunList.clickDeleteAll();
                await testRunList.modal.clickSuccess();
                await expect(testRunList.modal.isPresent()).toBe(false, 'Modal was not closed on Yes click');
                await testRunList.notification.assertIsSuccess('Test runs were deleted.');
                return expect(testRunList.areAllTestRunsDisplayed(testRuns[0].build_name, testRuns[1].build_name, testRuns[2].build_name))
                    .toBe(false, 'Test runs were not removed after bulk delete');
            });
        });
    });

    using(notEditorExamples, (user, description) => {
        describe(`${description} role:`, () => {

            beforeAll(async () => {
                testRuns = await projectHelper.importer
                    .executeCucumberImport(suite.name,
                        [cucumberImport],
                        [`build_1.json`]);
                await logIn.logInAs(user.user_name, user.password);
                await projectHelper.openProject();
                return projectView.menuBar.testRuns();
            });

            it('Table Row selector is not available', async () => {
                return expect(testRunList.isSelectorAvailable()).toBe(false, 'Selector is available!');
            });
        });
    });
});
