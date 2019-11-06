import { LogIn } from '../../pages/login.po';
import { ProjectList } from '../../pages/project/list.po';
import { ProjectView } from '../../pages/project/view.po';
import { TestRunView } from '../../pages/testRun/view.po';
import { Project } from '../../../src/app/shared/models/project';
import {
    prepareProject,
    setProjectPermissions,
    prepareTest,
    prepareStep,
    addStepToTest,
    prepareSuite,
    addTestToSuite,
    prepareTestRun
} from '../project.hooks';
import { TestView } from '../../pages/test/test.po';
import { UserAdministration } from '../../pages/administration/users.po';
import { PermissionsAdministration } from '../../pages/administration/permissions.po';
import { ProjectSettingsAdministration } from '../../pages/administration/projectSettings.po';
import { Step } from '../../../src/app/shared/models/steps';
import { Test } from '../../../src/app/shared/models/test';
import projects from '../../data/projects.json';
import usersTestData from '../../data/users.json';
import using from 'jasmine-data-provider';
import { TestSuite } from '../../../src/app/shared/models/testSuite';
import { TestRun } from '../../../src/app/shared/models/testRun';

const logIn = new LogIn();
const projectList = new ProjectList();
const userAdministration: UserAdministration = new UserAdministration();
const permissionsAdministration: PermissionsAdministration = new PermissionsAdministration();
const projectSettingsAdministration: ProjectSettingsAdministration = new ProjectSettingsAdministration();
const projectView = new ProjectView();
const testView = new TestView();
const testRunView = new TestRunView();

let test: Test = { name: 'Project can be opened from Projects list' };
let step2: Step = { name: 'I click project row', type_id: 2 };
let step3: Step = { name: 'Project page is opened', type_id: 3 };
let step1: Step = { name: 'Projects page was opened', type_id: 1 };
let suite: TestSuite = { name: 'Smoke' };
let testRun: TestRun;

const editorExamples = {
    localManager: usersTestData.localManager,
    manager: usersTestData.manager,
    localEngineer: usersTestData.localEngineer
};

const notEditorExamples = {
    localAdmin: usersTestData.localAdmin,
    viewer: usersTestData.viewer
};

fdescribe('Result Steps:', () => {
    const project: Project = projects.customerOnly;
    project.name = new Date().getTime().toString();
    let importToken: string;
    let projectId: number;

    beforeAll(async () => {
        await logIn.logIn(usersTestData.admin.user_name, usersTestData.admin.password);
        importToken = await prepareProject(project);
        projectId = await projectView.getCurrentProjectId();
        await (await projectList.menuBar.user()).administration();
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

        step1 = await prepareStep(step1, importToken, projectId);
        step2 = await prepareStep(step2, importToken, projectId);
        step3 = await prepareStep(step3, importToken, projectId);
        test = await prepareTest(test, importToken, projectId);
        await addStepToTest({ step_id: step1.id, test_id: test.id, order: 1 }, importToken, projectId);
        await addStepToTest({ step_id: step2.id, test_id: test.id, order: 2 }, importToken, projectId);
        await addStepToTest({ step_id: step3.id, test_id: test.id, order: 3 }, importToken, projectId);
        suite = await prepareSuite(suite, importToken, projectId);
        await addTestToSuite(test.id, suite.id, importToken, projectId);

        return projectSettingsAdministration.menuBar.clickLogOut();
    });

    afterAll(async () => {
        await logIn.logIn(usersTestData.admin.user_name, usersTestData.admin.password);
        await projectList.isOpened();
        await projectList.removeProject(project.name);
    });

    using(editorExamples, (user, description) => {
        describe(`Permissions: ${description} role:`, () => {
            beforeAll(async () => {
                testRun = {
                    test_suite_id: suite.id,
                    build_name: `build_${new Date().getTime().toString()}`,
                    start_time: new Date()
                };
                testRun = await prepareTestRun(testRun, importToken, projectId);
                await logIn.logIn(user.user_name, user.password);
                await projectList.openProject(project.name);
                await testRunView.navigateTo(projectId, testRun.id);
                await testRunView.openResult(test.name);
            });

            it('I can see steps section', async () => {
                console.log('yeah');
            });

            it('I can set result for the step', async () => {
            });

            it('I can set comment for the step', async () => {
            });

            it('I can set result for the step in a bulk', async () => {
            });

            it('I can add image attachmet to the step', async () => {
            });

            it('I can view image attachmet', async () => {
            });

            it('I can change attachmet', async () => {
            });

            it('I can download not image attachment', async () => {
            });

            it('I can remove attachment', async () => {
            });
        });
    });

    using(notEditorExamples, (user, description) => {
        describe(`Permissions: ${description} role:`, () => {
            beforeAll(async () => {
                testRun = {
                    test_suite_id: suite.id,
                    build_name: `build_${new Date().getTime().toString()}`,
                    start_time: new Date()
                };
                testRun = await prepareTestRun(testRun, importToken, projectId);
                // prepare step results

                await logIn.logIn(user.user_name, user.password);
                await projectList.openProject(project.name);
                await testRunView.navigateTo(projectId, testRun.id);
                return testRunView.openResult(test.name);
            });

            it('I can see steps section', async () => {
            });

            it('I can see steps section is not editable', async () => {
            });

            it('I can view image attachmet', async () => {
            });

            it('I can download not image attachment', async () => {
            });
        });
    });
});
