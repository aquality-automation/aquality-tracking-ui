import { logIn } from '../../pages/login.po';
import { ProjectList } from '../../pages/project/list.po';
import { Project } from '../../../src/app/shared/models/project';
import { userAdministration } from '../../pages/administration/users.po';
import { prepareProject, setProjectPermissions } from '../project.hooks';

import using from 'jasmine-data-provider';
import usersTestData from '../../data/users.json';
import projects from '../../data/projects.json';
import { ProjectSettingsAdministration } from '../../pages/administration/projectSettings.po';
import { permissionsAdministration } from '../../pages/administration/permissions.po';
import { StepsList } from '../../pages/steps.po';

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
    const projectsList: ProjectList = new ProjectList();
    const projectSettingsAdministration: ProjectSettingsAdministration = new ProjectSettingsAdministration();
    const stepsList: StepsList = new StepsList();

    const project: Project = projects.customerOnly;
    project.name = new Date().getTime().toString();
    const step = { name: 'test step', type: 'When' };
    const editedStep = { name: 'test step edited', type: 'Given' };

    beforeAll(async () => {
        await logIn.logInAs(usersTestData.admin.user_name, usersTestData.admin.password);
        await prepareProject(project);
        await (await projectsList.menuBar.user()).administration();
        await userAdministration.sidebar.permissions();
        await setProjectPermissions(project, {
            admin: usersTestData.admin,
            localAdmin: usersTestData.localAdmin,
            localManager: usersTestData.localManager,
            localEngineer: usersTestData.localEngineer,
            manager: usersTestData.manager,
            viewer: usersTestData.viewer
        });
        await permissionsAdministration.sidebar.projectSettings();
        await projectSettingsAdministration.setStepsForProject(project, { stepsState: true });
        return projectSettingsAdministration.menuBar.clickLogOut();
    });

    afterAll(async () => {
        await logIn.logInAs(usersTestData.admin.user_name, usersTestData.admin.password);
        await projectsList.isOpened();
        await projectsList.removeProject(project.name);
    });

    using(editorExamples, (user, description) => {
        describe(`Permissions: ${description} role:`, () => {
            beforeAll(async () => {
                await logIn.logInAs(user.user_name, user.password);
                await projectsList.openProject(project.name);
            });

            it('I can open Steps page', async () => {
                await (await projectsList.menuBar.tests()).steps();
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
                await logIn.logInAs(usersTestData.admin.user_name, usersTestData.admin.password);
                await projectsList.isOpened();
                await projectsList.openProject(project.name);
                await (await projectsList.menuBar.tests()).steps();
                await stepsList.isOpened();
                if (await stepsList.hasNoData()) {
                    await stepsList.createStep(step.type, step.name);
                }
                await stepsList.menuBar.clickLogOut();
                await logIn.logInAs(user.user_name, user.password);
                return projectsList.openProject(project.name);
            });

            it('I can open Steps page', async () => {
                await (await projectsList.menuBar.tests()).steps();
                return expect(stepsList.isOpened())
                    .toBe(true, `Steps page is not opened for ${description}`);
            });

            it('I can open Steps table is not editable', async () => {
                return expect(stepsList.isTableEditable()).toBe(false, `Steps table should not be editable for ${description}`);
            });
        });
    });
});

