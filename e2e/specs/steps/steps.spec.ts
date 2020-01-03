import { logIn } from '../../pages/login.po';
import { projectList } from '../../pages/project/list.po';
import { stepsList } from '../../pages/steps.po';
import { ProjectHelper } from '../../helpers/project.helper';

import using from 'jasmine-data-provider';
import usersTestData from '../../data/users.json';

const editorExamples = {
    localManager: usersTestData.localManager,
    manager: usersTestData.manager,
    localEngineer: usersTestData.localEngineer
};

const notEditorExamples = {
    localAdmin: usersTestData.localAdmin,
    viewer: usersTestData.viewer
};

describe('Steps:', () => {
    const projectHelper: ProjectHelper = new ProjectHelper();
    const step = { name: 'test step', type: 'When' };
    const editedStep = { name: 'test step edited', type: 'Given' };

    beforeAll(async () => {
        return projectHelper.init({
            admin: usersTestData.admin,
            localAdmin: usersTestData.localAdmin,
            localManager: usersTestData.localManager,
            localEngineer: usersTestData.localEngineer,
            manager: usersTestData.manager,
            viewer: usersTestData.viewer
        }, true);
    });

    afterAll(async () => {
        return projectHelper.dispose();
    });

    using(editorExamples, (user, description) => {
        describe(`Permissions: ${description} role:`, () => {
            beforeAll(async () => {
                await logIn.logInAs(user.user_name, user.password);
                await projectHelper.openProject();
            });

            it('I can open Steps page', async () => {
                await (await projectList.menuBar.tests()).steps();
                return expect(stepsList.isOpened())
                    .toBe(true, `Steps page is not opened for ${description}`);
            });

            it('I can create step', async () => {
                await stepsList.openCreationRow();
                await stepsList.setCreationName(step.name);
                await stepsList.setCreationType(step.type);
                await stepsList.acceptCreation();
                await expect(stepsList.notification.isSuccess())
                    .toBe(true, 'Success meessage is not shown on save step!');
                await expect(stepsList.notification.getContent())
                    .toBe(`The step '${step.name}' was created.`, 'Success meessage is wrong!');
                return stepsList.notification.close();
            });

            it('I can edit step', async () => {
                await stepsList.updateStepName(editedStep.name, step.name);
                await expect(stepsList.notification.isSuccess())
                    .toBe(true, 'Success meessage is not shown on update step!');
                await stepsList.notification.close();
                await stepsList.updateStepType(editedStep.name, editedStep.type);
                await expect(stepsList.notification.isSuccess())
                    .toBe(true, 'Success meessage is not shown on update step!');
                return stepsList.notification.close();
            });

            it('I can remove step', async () => {
                await stepsList.clickRemoveStepButton(editedStep.name);
                await expect(stepsList.notification.isSuccess())
                    .toBe(true, 'Success meessage is not shown on delete step!');
                return stepsList.notification.close();
            });
        });
    });

    using(notEditorExamples, (user, description) => {
        describe(`Permissions: ${description} role:`, () => {
            beforeAll(async () => {
                projectHelper.editorAPI.createStep({name: step.name, type_id: 2});
                await logIn.logInAs(user.user_name, user.password);
                return projectHelper.openProject();
            });

            it('I can open Steps page', async () => {
                await (await projectList.menuBar.tests()).steps();
                return expect(stepsList.isOpened())
                    .toBe(true, `Steps page is not opened for ${description}`);
            });

            it('I can open Steps table is not editable', async () => {
                return expect(stepsList.isTableEditable()).toBe(false, `Steps table should not be editable for ${description}`);
            });
        });
    });
});

