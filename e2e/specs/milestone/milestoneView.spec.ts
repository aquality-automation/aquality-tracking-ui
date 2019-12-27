import { logIn } from '../../pages/login.po';
import { projectList } from '../../pages/project/list.po';
import { milestoneList } from '../../pages/milestone/list.po';

import usersTestData from '../../data/users.json';
import { ProjectHelper } from '../../helpers/project.helper';

describe('Milestone:', () => {
    const projectHelper: ProjectHelper = new ProjectHelper();

    const milestones = {
        version1: { name: 'v1.1.0' },
        version2: { name: 'v1.2.0' }
    };

    beforeAll(async () => {
        await projectHelper.init({
            viewer: usersTestData.viewer
        });

        milestones.version1 = await projectHelper.editorAPI.createMilestone(milestones.version1);
        milestones.version2 = await projectHelper.editorAPI.createMilestone(milestones.version2);

        return milestoneList.menuBar.clickLogOut();
    });

    afterAll(async () => {
        await logIn.logInAs(usersTestData.admin.user_name, usersTestData.admin.password);
        await projectList.isOpened();
        await projectList.removeProject(projectHelper.project.name);
    });

    describe(`Milestone View: Viewer role:`, () => {
        beforeAll(async () => {
            await logIn.logInAs(usersTestData.viewer.user_name, usersTestData.viewer.password);
            await projectHelper.openProject();
        });

        it('I can open Milestone View page', async () => {
            await projectList.menuBar.milestones();
        });

        it('I can create Milestone', async () => {
        });

        it('I can edit Milestone', async () => {
        });

        it('I can remove Milestone', async () => {
        });
    });
});

