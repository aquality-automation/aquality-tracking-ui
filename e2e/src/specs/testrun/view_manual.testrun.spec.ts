import { logIn } from '../../pages/login.po';
import { projectView } from '../../pages/project/view.po';
import { testrunView } from '../../pages/testrun/view.po';
import { testrunList } from '../../pages/testrun/list.po';
import { suiteView } from '../../pages/suite/view.po';
import { ProjectHelper } from '../../helpers/project.helper';
import { TestSuite } from '../../../../src/app/shared/models/test-suite';
import { Milestone } from '../../../../src/app/shared/models/milestones/milestone';
import { TestRun } from '../../../../src/app/shared/models/testrun';
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
                await projectView.menuBar.testruns();
                await testrunList.openTestRun(testrun.build_name);
                return expect(testrunView.isOpened()).toBe(true, 'View Test Run page is not opened!');
            });

            it('Can edit Build Name', async () => {
                testrun.build_name = `${new Date().getTime()}_${testrun.build_name}`;
                await testrunView.setBuildName(testrun.build_name);
                await testrunView.refreshByBackButton();
                return expect(testrunView.getBuildName()).toBe(testrun.build_name, 'Build Name was not updated!');
            });

            it('Can not set empty Build Name', async () => {
                await testrunView.setBuildName('');
                await expect(testrunView.getBuildNameErrorMessage()).toBe('This field is required!', 'Error is not correct!');
                await testrunView.cancelBuilNameEditor();
                return expect(testrunView.getBuildName()).toBe(testrun.build_name, 'Build Name was cleared!');
            });

            it('Can edit Milestone', async () => {
                await testrunView.setMilestone(milestone.name);
                await testrunView.refreshByBackButton();
                return expect(testrunView.getMilestone()).toBe(milestone.name, 'milestones was not updated!');
            });

            it('Can remove Milestone', async () => {
                await testrunView.setMilestone('Not Selected');
                await testrunView.refreshByBackButton();
                return expect(testrunView.getMilestone()).toBe('', 'milestones was not cleared!');
            });

            it('Can edit Executor', async () => {
                testrun.author = `John Doe`;
                await testrunView.setExecutor(testrun.author);
                await testrunView.refreshByBackButton();
                return expect(testrunView.getExecutor()).toBe(testrun.author, 'Executor was not updated!');
            });

            it('Can remove Executor', async () => {
                testrun.author = '';
                await testrunView.setExecutor(testrun.author);
                await testrunView.refreshByBackButton();
                return expect(testrunView.getExecutor()).toBe('', 'Executor was not cleared!');
            });

            it('Can edit Execution Environment', async () => {
                testrun.execution_environment = `Chrome Win 10`;
                await testrunView.setExecutionEnvironment(testrun.execution_environment);
                await testrunView.refreshByBackButton();
                return expect(testrunView.getExecutionEnvironment())
                    .toBe(testrun.execution_environment, 'Execution Environment was not updated!');
            });

            it('Can remove Execution Environment', async () => {
                testrun.execution_environment = '';
                await testrunView.setExecutionEnvironment(testrun.execution_environment);
                await testrunView.refreshByBackButton();
                return expect(testrunView.getExecutionEnvironment())
                    .toBe('', 'Execution Environment was not cleared!');
            });

            it('Can not see CI Build', async () => {
                return expect(testrunView.isCILinkPresent())
                    .toBe(false, 'CI Link is shown for Manual Test Run!');
            });

            it('Can Finish Test Run', async () => {
                await testrunView.clickFinish();
                return expect(testrunView.getDuration()).not.toEqual('0h:0m:0s', 'Test Run was not finished!');
            });

            it('Can Reopen Test Run', async () => {
                await testrunView.clickReopen();
                return expect(testrunView.getDuration()).toEqual('0h:0m:0s', 'Test Run was not reopened!');
            });

            it('Can Mark Test Run as Debug', async () => {
                await testrunView.setDebug(true);
                await testrunView.refreshByBackButton();
                return expect(testrunView.getDebugState()).toBe(true, 'Test Run was not marked as Debug!');
            });

            it('Can Mark Test Run as not Debug', async () => {
                await testrunView.setDebug(false);
                await testrunView.refreshByBackButton();
                return expect(testrunView.getDebugState()).toBe(false, 'Test Run was not marked as Non Debug!');
            });

            it('Can open Suite by link', async () => {
                await testrunView.clickSuiteLink();
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
                await projectView.menuBar.testruns();
                await testrunList.openTestRun(testrun.build_name);
                return expect(testrunView.isOpened()).toBe(true, 'View Test Run page is not opened!');
            });

            it('Cannot edit testrun', async () => {
                await expect(testrunView.isBuildNameEditable())
                    .toBe(false, `Build Name should not be editable for ${description}`);
                await expect(testrunView.isMilestoneEditable())
                    .toBe(false, `Milestone should not be editable for ${description}`);
                await expect(testrunView.isExecutorEditable())
                    .toBe(false, `Executor should not be editable for ${description}`);
                await expect(testrunView.isExecutionEnvironmentEditable())
                    .toBe(false, `Execution Environment should not be editable for ${description}`);
                return expect(testrunView.isDebugEditable())
                    .toBe(false, `Debug should not be editable for ${description}`);
            });
        });
    });
});
