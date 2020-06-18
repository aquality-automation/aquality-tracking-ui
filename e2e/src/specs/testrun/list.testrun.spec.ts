import { logIn } from '../../pages/login.po';
import { projectView } from '../../pages/project/view.po';
import { ProjectHelper } from '../../helpers/project.helper';
import { TestSuite } from '../../../../src/app/shared/models/test-suite';
import { testRunList } from '../../pages/testrun/list.po';
import { TestRun } from '../../../../src/app/shared/models/testRun';
import { Milestone } from '../../../../src/app/shared/models/milestone';
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

describe('Test Run List:', () => {
    const projectHelper: ProjectHelper = new ProjectHelper();
    const testRuns: { build_1: TestRun, build_2: TestRun } = {
        build_1: { build_name: 'build_1' },
        build_2: { build_name: 'build_2' }
    };
    const suite: TestSuite = { name: 'Smoke' };
    const milestones: { inactive: Milestone, active: Milestone } = {
        inactive: { name: '0.1.1', active: 0 },
        active: { name: '0.1.2' }
    };

    beforeAll(async () => {
        await projectHelper.init({
            localEngineer: users.localEngineer,
            viewer: users.viewer,
            localAdmin: users.localAdmin,
            localManager: users.localManager
        });
        milestones.active = await projectHelper.editorAPI.createMilestone(milestones.active);
        milestones.inactive = await projectHelper.editorAPI.createMilestone(milestones.inactive);
        testRuns.build_1 = (await projectHelper.importer
            .executeCucumberImport(suite.name, [cucumberImport], [`${testRuns.build_1.build_name}.json`]))[0];
        testRuns.build_2 = (await projectHelper.importer
            .executeCucumberImport(suite.name, [cucumberImport], [`${testRuns.build_2.build_name}.json`]))[0];
        testRuns.build_1.milestone_id = milestones.inactive.id;
        testRuns.build_1 = await projectHelper.editorAPI.createTestRun(testRuns.build_1);
    });

    afterAll(async () => {
        return projectHelper.dispose();
    });

    using(editorExamples, (user, description) => {
        describe(`${description} role:`, () => {

            beforeAll(async () => {
                await logIn.logInAs(user.user_name, user.password);
                return projectHelper.openProject();
            });

            it('Can open Test Run List Page', async () => {
                await projectView.menuBar.testRuns();
                return expect(testRunList.isOpened()).toBe(true, 'Should be able to open Test Run List!');
            });

            it('Can edit Test Run Milestone with only active milestones', async () => {
                return expect(testRunList.doesMilestonePresentInEdit(milestones.inactive.name, testRuns.build_2.build_name))
                    .toBe(false, 'Inactive milestones should not be available in edit!');
            });

            it('Can add Test Run Milestone', async () => {
                await testRunList.setMilestone(milestones.active.name, testRuns.build_2.build_name);
                return testRunList.notification.assertIsSuccess();
            });

            it('Can filter by inactive Milestone', async () => {
                await testRunList.filterByMilestone(milestones.inactive.name);
                await expect(testRunList.areAllTestRunsDisplayed(testRuns.build_2.build_name))
                    .toBe(false, 'Test run with another milestone is still present');
                return expect(testRunList.areAllTestRunsDisplayed(testRuns.build_1.build_name))
                    .toBe(true, 'Test run with milestone is not present');
            });

            it('Can filter by active Milestone', async () => {
                await testRunList.filterByMilestone(milestones.active.name);
                await expect(testRunList.areAllTestRunsDisplayed(testRuns.build_1.build_name))
                    .toBe(false, 'Test run with another milestone is still present');
                return expect(testRunList.areAllTestRunsDisplayed(testRuns.build_2.build_name))
                    .toBe(true, 'Test run with milestone is not present');
            });

            it('Can remove Test Run Milestone', async () => {
                await testRunList.setMilestone('Not Assigned', testRuns.build_2.build_name);
                return testRunList.notification.assertIsSuccess();
            });
        });
    });

    using(notEditorExamples, (user, description) => {
        describe(`${description} role:`, () => {

            beforeAll(async () => {
                testRuns.build_2.milestone_id = milestones.active.id;
                testRuns.build_2 = await projectHelper.editorAPI.createTestRun(testRuns.build_2);
                await logIn.logInAs(user.user_name, user.password);
                return projectHelper.openProject();
            });

            it('Can open Test Run List Page', async () => {
                await projectView.menuBar.testRuns();
                return expect(testRunList.isOpened()).toBe(true, 'Should be able to open Test Run List!');
            });

            it('Can not edit Test Runs table', async () => {
                await projectView.menuBar.testRuns();
                return expect(testRunList.isTableEditable()).toBe(false, 'Should not be able to edit Test Runs!');
            });

            it('Can filter by inactive Milestone', async () => {
                await testRunList.filterByMilestone(milestones.inactive.name);
                await expect(testRunList.areAllTestRunsDisplayed(testRuns.build_2.build_name))
                    .toBe(false, 'Test run with another milestone is still present');
                return expect(testRunList.areAllTestRunsDisplayed(testRuns.build_1.build_name))
                    .toBe(true, 'Test run with milestone is not present');
            });

            it('Can filter by active Milestone', async () => {
                await testRunList.filterByMilestone(milestones.active.name);
                await expect(testRunList.areAllTestRunsDisplayed(testRuns.build_1.build_name))
                    .toBe(false, 'Test run with another milestone is still present');
                return expect(testRunList.areAllTestRunsDisplayed(testRuns.build_2.build_name))
                    .toBe(true, 'Test run with milestone is not present');
            });
        });
    });
});
