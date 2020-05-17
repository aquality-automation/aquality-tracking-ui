import { logIn } from '../../pages/login.po';
import { projectView } from '../../pages/project/view.po';
import { testRunView } from '../../pages/testrun/view.po';
import { testRunList } from '../../pages/testrun/list.po';
import { suiteView } from '../../pages/suite/view.po';
import { ProjectHelper } from '../../helpers/project.helper';
import { TestSuite } from '../../../src/app/shared/models/testSuite';
import { Milestone } from '../../../src/app/shared/models/milestone';
import { TestRun } from '../../../src/app/shared/models/testRun';
import users from '../../data/users.json';
import using from 'jasmine-data-provider';
import cucumberImport from '../../data/import/cucumber.json';

const editorExamples = {
    localAdmin: users.localAdmin,
    localManager: users.localManager,
    manager: users.manager,
    localEngineer: users.localEngineer
};

const notEditorExamples = {
    viewer: users.viewer,
};

describe('View Manual Test Run:', () => {
    const projectHelper: ProjectHelper = new ProjectHelper();
    let suite: TestSuite = { name: 'Smoke' };
    let testrun: TestRun;
    let milestone: Milestone = { name: '0.1.2' };

    beforeAll(async () => {
        await projectHelper.init({
            localEngineer: users.localEngineer,
            viewer: users.viewer,
            localAdmin: users.localAdmin,
            localManager: users.localManager
        });
        milestone = await projectHelper.editorAPI.createMilestone(milestone);
        suite = await projectHelper.editorAPI.createSuite(suite);
        return projectHelper.importer.executeCucumberImport(suite.name, [cucumberImport], [`build_1.json`]);
    });

    afterAll(async () => {
        return projectHelper.dispose();
    });

    using(editorExamples, (user, description) => {
        describe(`${description} role:`, () => {

            beforeAll(async () => {
                testrun = await projectHelper.editorAPI.createTestRun({
                    build_name: `build_${user.user_name}`,
                    label_id: 2,
                    test_suite_id: suite.id,
                    start_time: new Date()
                });
                await logIn.logInAs(user.user_name, user.password);
                return projectHelper.openProject();
            });

            it('Can open View Test Run Page', async () => {
                await projectView.menuBar.testRuns();
                await testRunList.openTestRun(testrun.build_name);
                return expect(testRunView.isOpened()).toBe(true, 'View Test Run page is not opened!');
            });

            it('Can edit Build Name', async () => {
                testrun.build_name = `${new Date().getTime()}_${testrun.build_name}`;
                await testRunView.setBuildName(testrun.build_name);
                await testRunView.refreshByBackButton();
                return expect(testRunView.getBuildName()).toBe(testrun.build_name, 'Build Name was not updated!');
            });

            it('Can not set empty Build Name', async () => {
                await testRunView.setBuildName('');
                await expect(testRunView.getBuildNameErrorMessage()).toBe('This field is required!', 'Error is not correct!')
                await testRunView.cancelBuilNameEditor();
                return expect(testRunView.getBuildName()).toBe(testrun.build_name, 'Build Name was cleared!');
            });

            it('Can edit Milestone', async () => {
                await testRunView.setMilestone(milestone.name);
                await testRunView.refreshByBackButton();
                return expect(testRunView.getMilestone()).toBe(milestone.name, 'Milestone was not updated!');
            });

            it('Can remove Milestone', async () => {
                await testRunView.setMilestone('Not Selected');
                await testRunView.refreshByBackButton();
                return expect(testRunView.getMilestone()).toBe('', 'Milestone was not cleared!');
            });

            it('Can edit Executor', async () => {
                testrun.author = `John Doe`;
                await testRunView.setExecutor(testrun.author);
                await testRunView.refreshByBackButton();
                return expect(testRunView.getExecutor()).toBe(testrun.author, 'Executor was not updated!');
            });

            it('Can remove Executor', async () => {
                testrun.author = '';
                await testRunView.setExecutor(testrun.author);
                await testRunView.refreshByBackButton();
                return expect(testRunView.getExecutor()).toBe('', 'Executor was not cleared!');
            });

            it('Can edit Execution Environment', async () => {
                testrun.execution_environment = `Chrome Win 10`;
                await testRunView.setExecutionEnvironment(testrun.execution_environment);
                await testRunView.refreshByBackButton();
                return expect(testRunView.getExecutionEnvironment())
                    .toBe(testrun.execution_environment, 'Execution Environment was not updated!');
            });

            it('Can remove Execution Environment', async () => {
                testrun.execution_environment = '';
                await testRunView.setExecutionEnvironment(testrun.execution_environment);
                await testRunView.refreshByBackButton();
                return expect(testRunView.getExecutionEnvironment())
                    .toBe('', 'Execution Environment was not cleared!');
            });

            it('Can not see CI Build', async () => {
                return expect(testRunView.isCILinkPresent())
                    .toBe(false, 'CI Link is shown for Manual Test Run!');
            });

            it('Can Finish Test Run', async () => {
                await testRunView.clickFinish();
                return expect(testRunView.getDuration()).not.toEqual('0h:0m:0s', 'Test Run was not finished!');
            });

            it('Can Reopen Test Run', async () => {
                await testRunView.clickReopen();
                return expect(testRunView.getDuration()).toEqual('0h:0m:0s', 'Test Run was not reopened!');
            });

            it('Can Mark Test Run as Debug', async () => {
                await testRunView.setDebug(true);
                await testRunView.refreshByBackButton();
                return expect(testRunView.getDebugState()).toBe(true, 'Test Run was not marked as Debug!');
            });

            it('Can Mark Test Run as not Debug', async () => {
                await testRunView.setDebug(false);
                await testRunView.refreshByBackButton();
                return expect(testRunView.getDebugState()).toBe(false, 'Test Run was not marked as Non Debug!');
            });

            it('Can open Suite by link', async () => {
                await testRunView.clickSuiteLink();
                await expect(suiteView.isOpened()).toBe(true, 'Suite Link does not lead to Suite!');
                return expect(suiteView.getNameOfTestSuite()).toBe(suite.name, 'Wrong suite is opened!');
            });
        });
    });

    using(notEditorExamples, (user, description) => {
        describe(`${description} role:`, () => {
            beforeAll(async () => {
                testrun = await projectHelper.editorAPI.createTestRun({
                    build_name: `build_${user.user_name}`,
                    label_id: 2,
                    milestone_id: milestone.id,
                    test_suite_id: suite.id,
                    start_time: new Date(),
                    finish_time: new Date(),
                    author: 'John Doe',
                    execution_environment: 'Chrome Windows 10'
                });
                await logIn.logInAs(user.user_name, user.password);
                return projectHelper.openProject();
            });

            it('Can open View Test Run Page', async () => {
                await projectView.menuBar.testRuns();
                await testRunList.openTestRun(testrun.build_name);
                return expect(testRunView.isOpened()).toBe(true, 'View Test Run page is not opened!');
            });

            it('Cannot edit testrun', async () => {
                await expect(testRunView.isBuildNameEditable())
                    .toBe(false, `Build Name should not be editable for ${description}`);
                await expect(testRunView.isMilestoneEditable())
                    .toBe(false, `Milestone should not be editable for ${description}`);
                await expect(testRunView.isExecutorEditable())
                    .toBe(false, `Executor should not be editable for ${description}`);
                await expect(testRunView.isExecutionEnvironmentEditable())
                    .toBe(false, `Execution Environment should not be editable for ${description}`);
                return expect(testRunView.isDebugEditable())
                    .toBe(false, `Debug should not be editable for ${description}`);
            });
        });
    });
});
