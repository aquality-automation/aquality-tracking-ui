import { projectList } from '../../../pages/project/list.po';
import { userAdministration } from '../../../pages/administration/users.po';
import { ProjectHelper } from '../../../helpers/project.helper';
import using from 'jasmine-data-provider';
import usersTestData from '../../../data/users.json';
import { projectSettingsAdministration } from '../../../pages/administration/projectSettings.po';
import { logIn } from '../../../pages/login.po';
import { predefinedResolutions } from '../../../pages/administration/predefinedResolutions.po';

const editorExamples = {
    admin: usersTestData.admin,
    localAdmin: usersTestData.localAdmin,
    localManager: usersTestData.localManager,
    manager: usersTestData.manager
};

const notEditorExamples = {
    localEngineer: usersTestData.localEngineer,
};

describe('Administartion: Project Settings:', () => {
    const projectHelper: ProjectHelper = new ProjectHelper();

    beforeAll(async () => {
        await projectHelper.init({
            admin: usersTestData.admin,
            localAdmin: usersTestData.localAdmin,
            localManager: usersTestData.localManager,
            localEngineer: usersTestData.localEngineer,
            manager: usersTestData.manager
        });
    });

    afterAll(async () => {
        await projectHelper.dispose();
    });

    using(editorExamples, (user, description) => {
        describe(`Permissions: ${description} role:`, () => {
            beforeAll(async () => {
                await logIn.logInAs(user.user_name, user.password);
                await projectHelper.openProject();
            });

            it('I can open Project Settings page', async () => {
                await projectList.menuBar.administration();
                await userAdministration.sidebar.projectSettings();
                return expect(projectSettingsAdministration.isOpened())
                    .toBe(true, `Project Settings page is not opened for ${description}`);
            });

            it('I can enable Steps', async () => {
                await projectSettingsAdministration.selectProject(projectHelper.project.name);
                await projectSettingsAdministration.setSteps(true);
                await projectSettingsAdministration.clickSave();

                return projectSettingsAdministration.notification.assertIsSuccess(`'${projectHelper.project.name}' project was updated!`);
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
                return projectSettingsAdministration.notification.assertIsSuccess(`'${projectHelper.project.name}' project was updated!`);
            });
        });
    });

    using(notEditorExamples, (user, description) => {
        describe(`Permissions: ${description} role:`, () => {
            beforeAll(async () => {
                await logIn.logInAs(user.user_name, user.password);
                await projectHelper.openProject();
            });

            it('I can not Open Project Settings page using Menu Bar', async () => {
                await projectList.menuBar.administration();
                return expect(projectSettingsAdministration.sidebar.isProjectSettingsExist())
                    .toBe(false, `Project Settings should not be visible for ${description}`);
            });

            it('I can not Open Project Settings page using url', async () => {
                await projectSettingsAdministration.navigateTo();
                await expect(projectSettingsAdministration.isOpened()).toBe(false, `Project Settings page is opened for ${description}`);
                return expect(predefinedResolutions.isOpened()).toBe(true, `Predefined Resolutions page is not opened for ${description}`);
            });
        });
    });
});

