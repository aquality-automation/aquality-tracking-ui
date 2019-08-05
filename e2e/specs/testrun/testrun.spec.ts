import { LogIn } from '../../pages/login.po';
import { ProjectList } from '../../pages/project/list.po';
import { ProjectCreate } from '../../pages/project/create.po';
import { ProjectView } from '../../pages/project/view.po';
import { SuiteCreate } from '../../pages/suite/create.po';
import { TestRunCreate } from '../../pages/testrun/create.po';
import { TestRunView } from '../../pages/testrun/view.po';
import { MilestoneCreate } from '../../pages/milestone/create.po';
import { TestRunList } from '../../pages/testrun/list.po';
import { Project } from '../../../src/app/shared/models/project';

import users from '../../data/users.json';
import projects from '../../data/projects.json';
import milestones from '../../data/milestones.json';
import testruns from '../../data/testRuns.json';
import suites from '../../data/suites.json';

describe('Full Admin Test Run', () => {
    const logIn = new LogIn();
    const projectList = new ProjectList();
    const projectCreate = new ProjectCreate();
    const projectView = new ProjectView();
    const suiteCreate = new SuiteCreate();
    const testRunCreate = new TestRunCreate();
    const testRunView = new TestRunView();
    const milestoneCreate = new MilestoneCreate();
    const testRunList = new TestRunList();
    let startDateStore: Date;
    const project: Project = projects.testrunProject;

    beforeAll(() => {
        logIn.navigateTo();
    });

    beforeAll(async () => {
        await logIn.logIn(users.admin.user_name, users.admin.password);
        await projectList.clickCreateProjectButton();
        await projectCreate.createProject(project);
        await projectList.openProject(projects.testrunProject.name);
        await (await projectView.menuBar.create()).suite();
        await suiteCreate.createSuite(suites.testRunCreation);
        await (await projectView.menuBar.create()).milestone();
        await milestoneCreate.createMilestone(milestones.testRunCreation);
    });

    afterAll(async () => {
        await projectList.removeProject(projects.testrunProject.name);
        if (await projectList.menuBar.isLogged()) {
            return projectList.menuBar.clickLogOut();
        }
    });

    it('Test Run can be created without Milestone', async () => {
        await projectView.menuBar.project(project.name);
        await (await projectView.menuBar.create()).testRun();
        await expect(testRunCreate.isCreateButtonEnabled()).toBe(false, 'Create button is enabled');
        await testRunCreate.fillBuildNameField(testruns.build1.build_name);
        await expect(testRunCreate.isCreateButtonEnabled()).toBe(false);
        await testRunCreate.selectTestSuite(suites.testRunCreation.name);
        await testRunCreate.clickCreateButton();
        await expect(testRunView.isOpened()).toBe(true, 'Test Run View page has not opened');
    });

    it('Test Run can be created with Milestone', async () => {
        await projectView.menuBar.project(project.name);
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

        await testRunList.modal.clickActionBtn('yes');
        await testRunList.refresh();
        await expect(testRunList.isTestRunRowDisplayed(testruns.build2.build_name)).toBe(false,
            `Test Run ${testruns.build2.build_name} is still displayed`);
    });
});
