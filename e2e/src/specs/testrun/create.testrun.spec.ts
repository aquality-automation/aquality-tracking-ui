import { logIn } from '../../pages/login.po';
import { projectView } from '../../pages/project/view.po';
import { testrunCreate } from '../../pages/testrun/create.po';
import { testrunView } from '../../pages/testrun/view.po';
import { notFound } from '../../pages/notFound.po';
import { ProjectHelper } from '../../helpers/project.helper';
import { TestSuite } from '../../../../src/app/shared/models/test-suite';
import { Milestone } from '../../../../src/app/shared/models/milestone';
import { TestRun } from '../../../../src/app/shared/models/testrun';
import users from '../../data/users.json';
import using from 'jasmine-data-provider';

const editorExamples = {
    localAdmin: users.localAdmin,
    localManager: users.localManager,
    manager: users.manager,
    localEngineer: users.localEngineer
};

const notEditorExamples = {
    viewer: users.viewer,
};

describe('Create Test Run:', () => {
    const projectHelper: ProjectHelper = new ProjectHelper();
    const testrun: TestRun = { build_name: '123' };
    let suite: TestSuite = { name: 'Smoke' };
    let milestone: Milestone = { name: '0.1.2' };

    beforeAll(async () => {
        await projectHelper.init({
            localEngineer: users.localEngineer,
            viewer: users.viewer,
            localAdmin: users.localAdmin,
            localManager: users.localManager
        });
        suite = await projectHelper.editorAPI.createSuite(suite);
        milestone = await projectHelper.editorAPI.createMilestone(milestone);
    });

    afterAll(async () => {
        return projectHelper.dispose();
    });

    using(editorExamples, (user, description) => {
        describe(`${description} role:`, () => {

            beforeAll(async () => {
                await logIn.logInAs(user.user_name, user.password);
                testrun.build_name = `${new Date().getTime()}`;
                return projectHelper.openProject();
            });

            it('Can open Create Test run Page', async () => {
                await projectHelper.openProject();
                await (await projectView.menuBar.create()).testrun();
                return expect(testrunCreate.isOpened()).toBe(true, 'Create Test run page is not opened!');
            });

            it('Create button is disabled when suite is not selected', async () => {
                await expect(testrunCreate.isCreateButtonEnabled()).toBe(false, 'Create button is enabled when all field are empty');
                await testrunCreate.fillBuildNameField(testrun.build_name);
                return expect(testrunCreate.isCreateButtonEnabled()).toBe(false, 'Create button is enabled when Suite is not selected');
            });

            it('Create button is disabled when build name is empty', async () => {
                await testrunCreate.selectTestSuite(suite.name);
                await testrunCreate.fillBuildNameField('');
                return expect(testrunCreate.isCreateButtonEnabled()).toBe(false, 'Create button is enabled when Build Name is empty');
            });

            it('Test Run can be created without Milestone', async () => {
                await testrunCreate.fillBuildNameField(`${testrun.build_name}_no_milestone`);
                await testrunCreate.clickCreateButton();
                return expect(testrunView.isOpened()).toBe(true, 'Test Run View page was not opened');
            });

            it('Test Run can be created with Milestone', async () => {
                await (await projectView.menuBar.create()).testrun();
                await testrunCreate.fillBuildNameField(testrun.build_name);
                await testrunCreate.selectTestSuite(suite.name);
                await testrunCreate.selectMilestone(milestone.name);
                await testrunCreate.clickCreateButton();
                return expect(testrunView.isOpened()).toBe(true, 'Test Run View page has not opened');
            });

            it('Build name should be inherited from create page', async () => {
                return expect(testrunView.getBuildName())
                    .toEqual(testrun.build_name, 'Build Name is incorrect on Test Run View page');
            });

            it('Milestone should be inherited from create page', async () => {
                return expect(testrunView.getMilestone())
                    .toEqual(milestone.name, 'Milestone is incorrect on Test Run View page');
            });

            it('Test Suite should be inherited from create page', async () => {
                return expect(testrunView.getTestSuite())
                    .toEqual(suite.name, 'Test Suite is incorrect on Test Run View page');
            });

            it('Start time should be inherited from create page', async () => {
                const startDateTrashhold = 120000;
                const actualDate = await testrunView.getStartTime();
                const dateDiff = new Date().getTime() - actualDate.getTime();
                return expect(dateDiff).toBeLessThan(startDateTrashhold, 'Start time is incorrect on Test Run View page');
            });
        });
    });

    using(notEditorExamples, (user, description) => {
        describe(`${description} role:`, () => {
            beforeAll(async () => {
                await logIn.logInAs(user.user_name, user.password);
                return projectHelper.openProject();
            });

            it('Create option is missed on Menu Bar', async () => {
                return expect(projectView.menuBar.isCreateExist())
                    .toBe(false, `Create should not be visible for ${description}`);
            });

            it('I can not open Predefined Resolution page using url', async () => {
                await testrunCreate.navigateTo(projectHelper.project.id);
                await expect(testrunCreate.isOpened()).toBe(false, `Test Run create page is opened for ${description}`);
                return expect(notFound.isOpened()).toBe(true, `404 page is not opened for ${description}`);
            });
        });
    });
});
