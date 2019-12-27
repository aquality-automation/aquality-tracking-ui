import { logIn } from '../../pages/login.po';
import { ProjectList } from '../../pages/project/list.po';
import { Project } from '../../../src/app/shared/models/project';
import { userAdministration } from '../../pages/administration/users.po';
import { prepareProject, setProjectPermissions } from '../project.hooks';
import { permissionsAdministration } from '../../pages/administration/permissions.po';
import { NotFound } from '../../pages/notFound.po';

import using from 'jasmine-data-provider';
import usersTestData from '../../data/users.json';
import projects from '../../data/projects.json';

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
    const projectsList: ProjectList = new ProjectList();
    const notFound: NotFound = new NotFound();

    const project: Project = projects.customerOnly;
    project.name = new Date().getTime().toString();

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
            manager: usersTestData.manager
        });
        return permissionsAdministration.menuBar.clickLogOut();
    });

    afterAll(async () => {
        await logIn.logInAs(usersTestData.admin.user_name, usersTestData.admin.password);
        await projectsList.isOpened();
        await projectsList.removeProject(project.name);
    });

    using(editorExamples, (user, description) => {
        describe(`Permissions: ${description} role:`, () => {
            const tempUser = usersTestData.projectTemp;
            beforeAll(async () => {
                await logIn.logInAs(user.user_name, user.password);
                await projectsList.openProject(project.name);
            });

            it('I can open Permissions page', async () => {
                await (await projectsList.menuBar.user()).administration();
                await userAdministration.sidebar.permissions();
                return expect(permissionsAdministration.isOpened()).toBe(true, `Permissions page is not opened for ${description}`);
            });

            it('I can add Permission', async () => {
                await permissionsAdministration.selectProject(project.name);
                await permissionsAdministration.openCreation();
                await permissionsAdministration.fillUserName(tempUser.user_name);
                await permissionsAdministration.setAdmin(true);
                await permissionsAdministration.setManager(true);
                await permissionsAdministration.clickCreate();
                await expect(permissionsAdministration.notification.isSuccess()).toBe(true, 'Success meessage is not shown on create!');
                await expect(permissionsAdministration.notification.getContent())
                    .toBe('Permissions were updated.', 'Success meessage is wrong!');
                await permissionsAdministration.notification.close();
                await expect(permissionsAdministration.isUserDisplayed(tempUser.user_name)).toBe(true, 'User was not added!');
                const data = await permissionsAdministration.getPermissionData(tempUser);
                await expect(data[permissionsAdministration.columns.admin]).toBe(true,
                    `${permissionsAdministration.columns.admin} is not correct`);
                await expect(data[permissionsAdministration.columns.manager]).toBe(true,
                    `${permissionsAdministration.columns.manager} is not correct`);
                return expect(data[permissionsAdministration.columns.engineer]).toBe(false,
                    `${permissionsAdministration.columns.engineer} is not correct`);
            });

            it('I can edit Permission', async () => {
                await permissionsAdministration.updateUser(false, permissionsAdministration.columns.admin,
                    tempUser.user_name, permissionsAdministration.columns.username);
                await expect(permissionsAdministration.notification.isSuccess()).toBe(true, 'Success meessage is not shown on update!');
                await expect(permissionsAdministration.notification.getContent())
                    .toBe('Permissions were updated.', 'Success meessage is wrong!');
                await permissionsAdministration.notification.close();
                await permissionsAdministration.updateUser(false, permissionsAdministration.columns.manager,
                    tempUser.user_name, permissionsAdministration.columns.username);
                await permissionsAdministration.updateUser(true, permissionsAdministration.columns.engineer,
                    tempUser.user_name, permissionsAdministration.columns.username);
                await userAdministration.sidebar.resolutions();
                await userAdministration.sidebar.permissions();
                await permissionsAdministration.selectProject(project.name);
                const data = await permissionsAdministration.getPermissionData(tempUser);
                await expect(data[permissionsAdministration.columns.admin]).toBe(false,
                    `${permissionsAdministration.columns.admin} is not correct`);
                await expect(data[permissionsAdministration.columns.manager]).toBe(false,
                    `${permissionsAdministration.columns.admin} is not correct`);
                return expect(data[permissionsAdministration.columns.engineer]).toBe(true,
                    `${permissionsAdministration.columns.admin} is not correct`);
            });

            it('I can remove Permission', async () => {
                await permissionsAdministration.clickRemoveUserButton(tempUser.user_name);
                await permissionsAdministration.modal.clickYes();
                await expect(permissionsAdministration.notification.isSuccess()).toBe(true, 'Success meessage is not shown on create!');
                await expect(permissionsAdministration.notification.getContent())
                    .toBe(`Permissions for '${tempUser.first_name} ${tempUser.second_name}' were deleted.`, 'Success meessage is wrong!');
                await permissionsAdministration.notification.close();
                return expect(permissionsAdministration.isUserDisplayed(tempUser.user_name)).toBe(false, 'User was not removed!');
            });
        });
    });

    using(notEditorExamples, (user, description) => {
        describe(`Permissions: ${description} role:`, () => {
            beforeAll(async () => {
                await logIn.logInAs(user.user_name, user.password);
                return projectsList.openProject(project.name);
            });

            it('I can not Open Permissions page using Menu Bar', async () => {
                return expect((await projectsList.menuBar.user()).isAdministrationExists())
                    .toBe(false, `Administartion should not be visible for ${description}`);
            });

            it('I can not Open Permissions page using url', async () => {
                await permissionsAdministration.navigateTo();
                await expect(permissionsAdministration.isOpened()).toBe(false, `Permissions page is opened for ${description}`);
                return expect(notFound.isOpened()).toBe(true, `404 page is not opened for ${description}`);
            });
        });
    });
});

