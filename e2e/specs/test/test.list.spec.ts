import { logIn } from '../../pages/login.po';
import { projectList } from '../../pages/project/list.po';
import { projectView } from '../../pages/project/view.po';
import { Project } from '../../../src/app/shared/models/project';
import { suiteView } from '../../pages/suite/view.po';
import { prepareProject, setProjectPermissions, prepareTest, prepareSuite } from '../project.hooks';
import { userAdministration } from '../../pages/administration/users.po';
import { ProjectSettingsAdministration } from '../../pages/administration/projectSettings.po';
import { Test } from '../../../src/app/shared/models/test';
import projects from '../../data/projects.json';
import usersTestData from '../../data/users.json';
import using from 'jasmine-data-provider';

const projectSettingsAdministration: ProjectSettingsAdministration = new ProjectSettingsAdministration();
let test: Test = { name: 'Project can be opened from Projects list' };
let suite1: Test = { name: 'First Suite' };
let suite2: Test = { name: 'Second Suite' };

const editorExamples = {
    localManager: usersTestData.localManager,
    manager: usersTestData.manager,
    localEngineer: usersTestData.localEngineer
};

const notEditorExamples = {
    localAdmin: usersTestData.localAdmin,
    viewer: usersTestData.viewer
};

describe('Tests List:', () => {
    const project: Project = projects.customerOnly;
    project.name = new Date().getTime().toString();
    let importToken: string;
    let projectId: number;

    beforeAll(async () => {
        await logIn.logInAs(usersTestData.admin.user_name, usersTestData.admin.password);
        importToken = await prepareProject(project);
        projectId = await projectView.getCurrentProjectId();
        await (await projectList.menuBar.user()).administration();
        await userAdministration.sidebar.permissions();
        await setProjectPermissions(project, {
            localAdmin: usersTestData.localAdmin,
            localManager: usersTestData.localManager,
            localEngineer: usersTestData.localEngineer,
            viewer: usersTestData.viewer
        });

        test = await prepareTest(test, importToken, projectId);
        suite1 = await prepareSuite(suite1, importToken, projectId);
        suite2 = await prepareSuite(suite2, importToken, projectId);

        return projectSettingsAdministration.menuBar.clickLogOut();
    });

    afterAll(async () => {
        await logIn.logInAs(usersTestData.admin.user_name, usersTestData.admin.password);
        await projectList.isOpened();
        await projectList.removeProject(project.name);
    });

    using(editorExamples, (user, description) => {
        describe(`Permissions: ${description} role:`, () => {
            beforeAll(async () => {
                await logIn.logInAs(user.user_name, user.password);
                await projectList.openProject(project.name);
                return (await projectList.menuBar.tests()).all();
            });

            it('I can add suite to test', async () => {
                await suiteView.addSuite(suite1.name, test.name);
                return expect(suiteView.getTestSuites(test.name)).toEqual([suite1.name], 'First Suite was not added');
            });

            it('I can add another suite to test', async () => {
                await suiteView.addSuite(suite2.name, test.name);
                return expect(suiteView.getTestSuites(test.name)).toEqual([suite1.name, suite2.name], 'Second Suite was not added');
            });

            it('I can remove suite from test', async () => {
                await suiteView.removeSuite(suite2.name, test.name);
                return expect(suiteView.getTestSuites(test.name)).toEqual([suite1.name], 'Second Suite was not removed');
            });

            it('I can set suites empty for test', async () => {
                await suiteView.removeSuite(suite1.name, test.name);
                return expect(suiteView.getTestSuites(test.name)).toEqual([], 'First Suite was not removed');
            });
        });
    });

    using(notEditorExamples, (user, description) => {
        describe(`Permissions: ${description} role:`, () => {
            beforeAll(async () => {
                await logIn.logInAs(user.user_name, user.password);
                await projectList.openProject(project.name);
                return (await projectList.menuBar.tests()).all();
            });

            it('I can see tests', async () => {
                return expect(suiteView.isTestPresent(test.name)).toBe(true, 'Cannot see test!');
            });

            it('I cannot change tests', async () => {
                return expect(suiteView.isTableEditable()).toBe(false, 'Table is editable!');
            });
        });
    });
});
