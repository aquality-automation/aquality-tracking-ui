import { logIn } from '../../pages/login.po';
import { projectView } from '../../pages/project/view.po';
import { ProjectHelper } from '../../helpers/project.helper';
import { TestSuite } from '../../../../src/app/shared/models/test-suite';
import { testrunList } from '../../pages/testrun/list.po';
import { TestRun } from '../../../../src/app/shared/models/testrun';
import { Milestone } from '../../../../src/app/shared/models/milestones/milestone';
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
    const testruns: { build_1: TestRun, build_2: TestRun } = {
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
        testruns.build_1 = (await projectHelper.importer
            .executeCucumberImport(suite.name, [cucumberImport], [`${testruns.build_1.build_name}.json`]))[0];
        testruns.build_2 = (await projectHelper.importer
            .executeCucumberImport(suite.name, [cucumberImport], [`${testruns.build_2.build_name}.json`]))[0];
        testruns.build_1.milestone_id = milestones.inactive.id;
        testruns.build_1 = await projectHelper.editorAPI.createTestRun(testruns.build_1);
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
                await projectView.menuBar.testruns();
                return expect(testrunList.isOpened()).toBe(true, 'Should be able to open Test Run List!');
            });

            it('Can edit Test Run milestones with only active Milestone', async () => {
                return expect(testrunList.doesMilestonePresentInEdit(milestones.inactive.name, testruns.build_2.build_name))
                    .toBe(false, 'Inactive milestones should not be available in edit!');
            });

            it('Can add Test Run Milestone', async () => {
                await testrunList.setMilestone(milestones.active.name, testruns.build_2.build_name);
                return testrunList.notification.assertIsSuccess();
            });

            it('Can filter by inactive Milestone', async () => {
                await testrunList.filterByMilestone(milestones.inactive.name);
                await expect(testrunList.areAllTestRunsDisplayed(testruns.build_2.build_name))
                    .toBe(false, 'Test run with another milestone is still present');
                return expect(testrunList.areAllTestRunsDisplayed(testruns.build_1.build_name))
                    .toBe(true, 'Test run with milestone is not present');
            });

            it('Can filter by active Milestone', async () => {
                await testrunList.filterByMilestone(milestones.active.name);
                await expect(testrunList.areAllTestRunsDisplayed(testruns.build_1.build_name))
                    .toBe(false, 'Test run with another milestone is still present');
                return expect(testrunList.areAllTestRunsDisplayed(testruns.build_2.build_name))
                    .toBe(true, 'Test run with milestone is not present');
            });

            it('Can remove Test Run Milestone', async () => {
                await testrunList.setMilestone('Not Assigned', testruns.build_2.build_name);
                return testrunList.notification.assertIsSuccess();
            });
        });
    });

    using(notEditorExamples, (user, description) => {
        describe(`${description} role:`, () => {

            beforeAll(async () => {
                testruns.build_2.milestone_id = milestones.active.id;
                testruns.build_2 = await projectHelper.editorAPI.createTestRun(testruns.build_2);
                await logIn.logInAs(user.user_name, user.password);
                return projectHelper.openProject();
            });

            it('Can open Test Run List Page', async () => {
                await projectView.menuBar.testruns();
                return expect(testrunList.isOpened()).toBe(true, 'Should be able to open Test Run List!');
            });

            it('Can not edit Test Runs table', async () => {
                await projectView.menuBar.testruns();
                return expect(testrunList.isTableEditable()).toBe(false, 'Should not be able to edit Test Runs!');
            });

            it('Can filter by inactive Milestone', async () => {
                await testrunList.filterByMilestone(milestones.inactive.name);
                await expect(testrunList.areAllTestRunsDisplayed(testruns.build_2.build_name))
                    .toBe(false, 'Test run with another milestone is still present');
                return expect(testrunList.areAllTestRunsDisplayed(testruns.build_1.build_name))
                    .toBe(true, 'Test run with milestone is not present');
            });

            it('Can filter by active Milestone', async () => {
                await testrunList.filterByMilestone(milestones.active.name);
                await expect(testrunList.areAllTestRunsDisplayed(testruns.build_1.build_name))
                    .toBe(false, 'Test run with another milestone is still present');
                return expect(testrunList.areAllTestRunsDisplayed(testruns.build_2.build_name))
                    .toBe(true, 'Test run with milestone is not present');
            });
        });
    });
});
