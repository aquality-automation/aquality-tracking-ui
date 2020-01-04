import { logIn } from '../../pages/login.po';
import { projectView } from '../../pages/project/view.po';
import { suiteCreate } from '../../pages/suite/create.po';
import { testRunCreate } from '../../pages/testrun/create.po';
import { testRunView } from '../../pages/testrun/view.po';
import { milestoneCreate } from '../../pages/milestone/create.po';
import { testRunList } from '../../pages/testrun/list.po';
import { ProjectHelper } from '../../helpers/project.helper';
import users from '../../data/users.json';
import milestones from '../../data/milestones.json';
import testruns from '../../data/testRuns.json';
import suites from '../../data/suites.json';

describe('Full Admin Test Run', () => {
    let startDateStore: Date;
    const projectHelper: ProjectHelper = new ProjectHelper();

    beforeAll(async () => {
        await projectHelper.init();
        await logIn.logInAs(users.admin.user_name, users.admin.password);
        await projectHelper.openProject();
        await (await projectView.menuBar.create()).suite();
        await suiteCreate.createSuite(suites.testRunCreation);
        await (await projectView.menuBar.create()).milestone();
        await milestoneCreate.createMilestone(milestones.testRunCreation);
    });

    afterAll(async () => {
        await projectHelper.dispose();
    });

    it('Test Run can be created without Milestone', async () => {
        await projectHelper.openProject();
        await (await projectView.menuBar.create()).testRun();
        await expect(testRunCreate.isCreateButtonEnabled()).toBe(false, 'Create button is enabled');
        await testRunCreate.fillBuildNameField(testruns.build1.build_name);
        await expect(testRunCreate.isCreateButtonEnabled()).toBe(false);
        await testRunCreate.selectTestSuite(suites.testRunCreation.name);
        await testRunCreate.clickCreateButton();
        await expect(testRunView.isOpened()).toBe(true, 'Test Run View page has not opened');
    });

    it('Test Run can be created with Milestone', async () => {
        await projectHelper.openProject();
        await (await projectView.menuBar.create()).testRun();
        await testRunCreate.fillBuildNameField(testruns.build2.build_name);
        await testRunCreate.selectTestSuite(suites.testRunCreation.name);
        await testRunCreate.selectMilestone(milestones.testRunCreation.name);
        startDateStore = await testRunCreate.getStartDate();
        await testRunCreate.clickCreateButton();
        return expect(testRunView.isOpened()).toBe(true, 'Test Run View page has not opened');
    });

    it('Build name should be inherited from create page', async () => {
        return expect(testRunView.getBuildName())
            .toEqual(testruns.build2.build_name, 'Build Name is incorrect on Test Run View page');
    });

    it('Milestone should be inherited from create page', async () => {
        return expect(testRunView.getMilestone())
            .toEqual(milestones.testRunCreation.name, 'Milestone is incorrect on Test Run View page');
    });

    it('Test Suite should be inherited from create page', async () => {
        return expect(testRunView.getTestSuite())
            .toEqual(suites.testRunCreation.name, 'Test Suite is incorrect on Test Run View page');
    });

    it('Start time should be inherited from create page', async () => {
        return expect(testRunView.getStartTime()).toEqual(startDateStore, 'Start time is incorrect on Test Run View page');
    });

    it('Test run can be removed by clicking remove button from Actions column', async () => {
        await testRunView.menuBar.testRuns();
        await expect(testRunList.isOpened()).toBe(true, 'Test Run List page has not opened');

        await testRunList.clickTestRunRemoveButton(testruns.build2.build_name);
        await expect(testRunList.modal.isVisible()).toBe(true, 'Remove Test Run modal is not opened');

        await testRunList.modal.clickYes();
        await testRunList.refresh();
        await expect(testRunList.isTestRunRowDisplayed(testruns.build2.build_name)).toBe(false,
            `Test Run ${testruns.build2.build_name} is still displayed`);
    });
});
