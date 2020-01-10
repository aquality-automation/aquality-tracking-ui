import { logIn } from '../../pages/login.po';
import { projectList } from '../../pages/project/list.po';
import { Project } from '../../../src/app/shared/models/project';
import { notFound } from '../../pages/notFound.po';
import { ProjectHelper } from '../../helpers/project.helper';
import using from 'jasmine-data-provider';
import usersTestData from '../../data/users.json';
import projects from '../../data/projects.json';
import { userAdministration } from '../../pages/administration/users.po';
import { apiTokenAdministration } from '../../pages/administration/apiToken.po';

const editorExamples = {
    admin: usersTestData.admin,
    localAdmin: usersTestData.localAdmin,
    localManager: usersTestData.localManager,
    manager: usersTestData.manager
};

const notEditorExamples = {
    localEngineer: usersTestData.localEngineer,
};

describe('API Token:', () => {
    const projectHelper: ProjectHelper = new ProjectHelper();
    const project: Project = projects.customerOnly;
    project.name = new Date().getTime().toString();

    beforeAll(async () => {
        await projectHelper.init({
            localAdmin: usersTestData.localAdmin,
            localManager: usersTestData.localManager,
            localEngineer: usersTestData.localEngineer
        });
    });

    afterAll(async () => {
        await projectHelper.dispose();
    });

    using(editorExamples, (user, description) => {
        describe(`API Token: ${description} role:`, () => {
            beforeAll(async () => {
                await logIn.logInAs(user.user_name, user.password);
                await projectHelper.openProject();
            });

            it('I can open API Token page', async () => {
                await (await projectList.menuBar.user()).administration();
                await userAdministration.sidebar.apiToken();
                return expect(apiTokenAdministration.isOpened()).toBe(true, `API Token page is not opened for ${description}`);
            });

            it('I can generate API Token ', async () => {
                await apiTokenAdministration.selectProject(project.name);
                await apiTokenAdministration.clickGenerateToken();
                await expect(apiTokenAdministration.isModalOpened()).toBe(true, 'Confirmation Modal is Missed!');
                await apiTokenAdministration.acceptModal();
                const regexpr = /[a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{25}/;
                const tokenValue = await apiTokenAdministration.getTokenValue();
                return expect(regexpr.test(tokenValue)).toBe(true, `API token has wrong format! ${tokenValue}`);
            });

            it('Generated API Token is not visible after reopening page', async () => {
                await apiTokenAdministration.sidebar.permissions();
                await apiTokenAdministration.sidebar.apiToken();
                return expect(apiTokenAdministration.isTokenValueExists()).toBe(false, `API Token value should be hidden!`);
            });

            it('I can regenerate API Token', async () => {
                await apiTokenAdministration.selectProject(project.name);
                await apiTokenAdministration.clickGenerateToken();
                await apiTokenAdministration.acceptModal();
                const regexpr = /[a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{25}/;
                const tokenValue = await apiTokenAdministration.getTokenValue();
                return expect(regexpr.test(tokenValue)).toBe(true, `API token has wrong format! ${tokenValue}`);
            });
        });
    });

    using(notEditorExamples, (user, description) => {
        describe(`API Token: ${description} role:`, () => {
            beforeAll(async () => {
                await logIn.logInAs(user.user_name, user.password);
                return projectHelper.openProject();
            });

            it('I can not Open API Token page using Menu Bar', async () => {
                return expect((await projectList.menuBar.user()).isAdministrationExists())
                    .toBe(false, `Administartion should not be visible for ${description}`);
            });

            it('I can not Open API Token page using url', async () => {
                await apiTokenAdministration.navigateTo();
                await expect(apiTokenAdministration.isOpened()).toBe(false, `API Token page is opened for ${description}`);
                return expect(notFound.isOpened()).toBe(true, `404 page is not opened for ${description}`);
            });
        });
    });
});

