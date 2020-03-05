import { logIn } from '../../pages/login.po';
import { projectList } from '../../pages/project/list.po';
import { milestoneList } from '../../pages/milestone/list.po';
import { ProjectHelper } from '../../helpers/project.helper';
import { TestSuite } from '../../../src/app/shared/models/testSuite';
import usersTestData from '../../data/users.json';
import using from 'jasmine-data-provider';

const editorExamples = {
    localManager: usersTestData.localManager,
    manager: usersTestData.manager,
    localEngineer: usersTestData.localEngineer
};

const notEditorExamples = {
    localAdmin: usersTestData.localAdmin,
    viewer: usersTestData.viewer
};

describe('Milestone List:', () => {
    const projectHelper: ProjectHelper = new ProjectHelper();

    const milestone = { name: 'List Test' };
    const editedMilestone = { name: 'Edited List Test' };
    let suite: TestSuite = {name: 'My Suite'};

    beforeAll(async () => {
        await projectHelper.init({
            localAdmin: usersTestData.localAdmin,
            localManager: usersTestData.localManager,
            localEngineer: usersTestData.localEngineer,
            manager: usersTestData.manager,
            viewer: usersTestData.viewer
        });

        suite = await projectHelper.editorAPI.createSuite({name: 'My Suite'});
    });

    afterAll(async () => {
        await projectHelper.dispose();
    });

    using(editorExamples, (user, description) => {
        describe(`Permissions: ${description} role:`, () => {
            beforeAll(async () => {
                await logIn.logInAs(user.user_name, user.password);
                await projectList.openProject(projectHelper.project.name);
            });

            it('I can open Milestone List page', async () => {
                await projectList.menuBar.milestones();
                return expect(milestoneList.isOpened())
                    .toBe(true, `Milestone List page is not opened for ${description}`);
            });

            it('I can create Milestone', async () => {
                await milestoneList.openCreationRow();
                await milestoneList.setCreationName(milestone.name);
                await milestoneList.acceptCreation();
                return milestoneList.notification.assertIsSuccess(`The milestone '${milestone.name}' was created.`);
            });

            it('I can edit Milestone name', async () => {
                await milestoneList.updateMilestoneName(editedMilestone.name, milestone.name);
                return milestoneList.notification.assertIsSuccess(`The milestone '${editedMilestone.name}' was updated.`);
            });

            it('I can edit Milestone suites', async () => {
                await milestoneList.addMilestoneSuite(suite.name, editedMilestone.name);
                return milestoneList.notification.assertIsSuccess(`The milestone '${editedMilestone.name}' was updated.`);
            });

            it('I can edit Milestone Due Date', async () => {
                await milestoneList.updateMilestoneDueDate(new Date('December 17, 1995'), editedMilestone.name);
                return milestoneList.notification.assertIsSuccess(`The milestone '${editedMilestone.name}' was updated.`);
            });

            it('I can make Milestone Inactive', async () => {
                await milestoneList.updateMilestoneActive(false, editedMilestone.name);
                return milestoneList.notification.assertIsSuccess(`The milestone '${editedMilestone.name}' was updated.`);
            });

            it('I can not edit Inactive Milestone', async () => {
                const isEditable = await milestoneList.isRowEditable(editedMilestone.name);
                return expect(isEditable).toBe(false, 'Inactive Milestone should not be editable');
            });

            it('I can remove Milestone', async () => {
                await milestoneList.clickRemoveMilestoneButton(editedMilestone.name);
                await expect(milestoneList.modal.isPresent())
                    .toBe(true, 'No confirmations modal when trying to delete milestone!');
                await milestoneList.modal.clickYes();
                return milestoneList.notification.assertIsSuccess();
            });
        });
    });

    using(notEditorExamples, (user, description) => {
        describe(`Permissions: ${description} role:`, () => {
            beforeAll(async () => {
                projectHelper.editorAPI.createMilestone(milestone);
                await logIn.logInAs(user.user_name, user.password);
                return projectList.openProject(projectHelper.project.name);
            });

            it('I can open Milestone List page', async () => {
                await projectList.menuBar.milestones();
                return expect(milestoneList.isOpened())
                    .toBe(true, `Milestone List page is not opened for ${description}`);
            });

            it('I can open Milestones table is not editable', async () => {
                return expect(milestoneList.isTableEditable()).toBe(false, `Milestones table should not be editable for ${description}`);
            });
        });
    });
});

