import { logIn } from '../../pages/login.po';
import { projectList } from '../../pages/project/list.po';
import { milestoneList } from '../../pages/milestone/list.po';

import { ProjectHelper } from '../../helpers/project.helper';
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

    beforeAll(async () => {
        await projectHelper.init({
            admin: usersTestData.admin,
            localAdmin: usersTestData.localAdmin,
            localManager: usersTestData.localManager,
            localEngineer: usersTestData.localEngineer,
            manager: usersTestData.manager,
            viewer: usersTestData.viewer
        });
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

            it('I can edit Milestone', async () => {
                await milestoneList.updateMilestoneName(editedMilestone.name, milestone.name);
                return milestoneList.notification.assertIsSuccess();
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

