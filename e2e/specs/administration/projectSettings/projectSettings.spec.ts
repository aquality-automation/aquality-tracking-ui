import { LogIn } from '../../../pages/login.po';
import { ProjectList } from '../../../pages/project/list.po';
import { Project } from '../../../../src/app/shared/models/project';
import { UserAdministration } from '../../../pages/administration/users.po';
import { prepareProject, setProjectPermissions } from '../../project.hooks';
import { NotFound } from '../../../pages/notFound.po';

import using from 'jasmine-data-provider';
import usersTestData from '../../../data/users.json';
import projects from '../../../data/projects.json';
import { ProjectSettingsAdministration } from '../../../pages/administration/projectSettings.po';
import { PermissionsAdministration } from '../../../pages/administration/permissions.po';

const editorExamples = {
    admin: usersTestData.admin,
    localAdmin: usersTestData.localAdmin,
    localManager: usersTestData.localManager,
    manager: usersTestData.manager
};

const notEditorExamples = {
    localEngineer: usersTestData.localEngineer,
};

describe('Administartion:', () => {
    const logInPage: LogIn = new LogIn();
    const projectsList: ProjectList = new ProjectList();
    const userAdministration: UserAdministration = new UserAdministration();
    const permissionsAdministration: PermissionsAdministration = new PermissionsAdministration();
    const projectSettingsAdministration: ProjectSettingsAdministration = new ProjectSettingsAdministration();
    const notFound: NotFound = new NotFound();

    const project: Project = projects.customerOnly;
    project.name = new Date().getTime().toString();

    beforeAll(async () => {
        await logInPage.logInAs(usersTestData.admin.user_name, usersTestData.admin.password);
        await prepareProject(project);
        await (await projectsList.menuBar.user()).administration();
        await userAdministration.sidebar.permissions();
        await setProjectPermissions(project, {
            admin: usersTestData.admin,
            localAdmin: usersTestData.localAdmin,
            localManager: usersTestData.localManager,
            localEngineer: usersTestData.localEngineer,
            manager: usersTestData.manager
        });
        return permissionsAdministration.menuBar.clickLogOut();
    });

    afterAll(async () => {
        await logInPage.logInAs(usersTestData.admin.user_name, usersTestData.admin.password);
        await projectsList.isOpened();
        await projectsList.removeProject(project.name);
    });

    using(editorExamples, (user, description) => {
        describe(`Permissions: ${description} role:`, () => {
            beforeAll(async () => {
                await logInPage.logInAs(user.user_name, user.password);
                await projectsList.openProject(project.name);
            });

            it('I can open Project Settings page', async () => {
                await (await projectsList.menuBar.user()).administration();
                await userAdministration.sidebar.projectSettings();
                return expect(projectSettingsAdministration.isOpened())
                    .toBe(true, `Project Settings page is not opened for ${description}`);
            });

            it('I can enable Steps', async () => {
                await projectSettingsAdministration.selectProject(project.name);
                await projectSettingsAdministration.setSteps(true);
                await projectSettingsAdministration.clickSave();
                await expect(projectSettingsAdministration.notification.isSuccess())
                    .toBe(true, 'Success meessage is not shown on save settings!');
                await expect(projectSettingsAdministration.notification.getContent())
                    .toBe(`'${project.name}' project was updated!`, 'Success meessage is wrong!');
                await projectSettingsAdministration.notification.close();
            });

            it('The confirmation dialog shown when trying to disable steps', async () => {
                await projectSettingsAdministration.setSteps(false);
                await projectSettingsAdministration.clickSave();
                await expect(projectSettingsAdministration.modal.isVisible())
                    .toBe(true, 'Confirmation was not shown!');
            });

            it('Can decline confirmation', async () => {
                await projectSettingsAdministration.modal.clickNo();
                await expect(projectSettingsAdministration.notification.isVisible())
                .toBe(false, 'Mesaage is shown after declining the Save action!');
            });

            it('Can disable steps', async () => {
                await projectSettingsAdministration.setSteps(false);
                await projectSettingsAdministration.clickSave();
                await projectSettingsAdministration.modal.clickYes();
                await expect(projectSettingsAdministration.notification.isSuccess())
                    .toBe(true, 'Success meessage is not shown on save settings!');
                await expect(projectSettingsAdministration.notification.getContent())
                    .toBe(`'${project.name}' project was updated!`, 'Success meessage is wrong!');
                await projectSettingsAdministration.notification.close();
            });
        });
    });

    using(notEditorExamples, (user, description) => {
        describe(`Permissions: ${description} role:`, () => {
            beforeAll(async () => {
                await logInPage.logInAs(user.user_name, user.password);
                return projectsList.openProject(project.name);
            });

            it('I can not Open Project Settings page using Menu Bar', async () => {
                return expect((await projectsList.menuBar.user()).isAdministrationExists())
                    .toBe(false, `Administartion should not be visible for ${description}`);
            });

            it('I can not Open Project Settings page using url', async () => {
                await projectSettingsAdministration.navigateTo();
                await expect(projectSettingsAdministration.isOpened()).toBe(false, `Project Settings page is opened for ${description}`);
                return expect(notFound.isOpened()).toBe(true, `404 page is not opened for ${description}`);
            });
        });
    });
});

