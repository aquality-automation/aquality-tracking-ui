import { logIn } from '../../pages/login.po';
import { projectList } from '../../pages/project/list.po';
import { ProjectView } from '../../pages/project/view.po';
import { Project } from '../../../src/app/shared/models/project';
import { prepareProject, setProjectPermissions, prepareTest, prepareStep, addStepToTest } from '../project.hooks';
import { getClipboardText } from '../../utils/js.util';
import { TestView } from '../../pages/test/test.po';
import { userAdministration } from '../../pages/administration/users.po';
import { permissionsAdministration } from '../../pages/administration/permissions.po';
import { ProjectSettingsAdministration } from '../../pages/administration/projectSettings.po';
import { Step } from '../../../src/app/shared/models/steps';
import { Test } from '../../../src/app/shared/models/test';
import projects from '../../data/projects.json';
import usersTestData from '../../data/users.json';
import using from 'jasmine-data-provider';

const projectSettingsAdministration: ProjectSettingsAdministration = new ProjectSettingsAdministration();
const projectView = new ProjectView();
const testView = new TestView();

const test: Test = { name: 'Project can be opened from Projects list' };
const step2: Step = { name: 'I click project row', type_id: 2 };
const step3: Step = { name: 'Project page is opened', type_id: 3 };
let step1: Step = { name: 'Projects page was opened', type_id: 1 };

const editorExamples = {
    localManager: usersTestData.localManager,
    manager: usersTestData.manager,
    localEngineer: usersTestData.localEngineer
};

const notEditorExamples = {
    localAdmin: usersTestData.localAdmin,
    viewer: usersTestData.viewer
};

const fullScenario = (description: string) => `Scenario: ${test.name} ${description}
\t${testView.steps.stepTypes.given} ${step1.name}
\t${testView.steps.stepTypes.when} ${step2.name} ${description}
\t${testView.steps.stepTypes.then} ${step3.name} ${description}`;

const viewerScenario = (description: string) => `Scenario: ${test.name} ${description}
\t${testView.steps.stepTypes.given} ${step1.name}`;

describe('Test Steps:', () => {
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

        return projectSettingsAdministration.menuBar.clickLogOut();
    });

    afterAll(async () => {
        await logIn.logInAs(usersTestData.admin.user_name, usersTestData.admin.password);
        await projectList.isOpened();
        await projectList.removeProject(project.name);
    });

    using(editorExamples, (user, description) => {
        describe(`Permissions: ${description} role:`, () => {
            let customTest: Test = { name: `${test.name} ${description}` };
            const customStep2 = { name: `I click project row ${description}`, type_id: 2 };
            const customStep3 = { name: `Project page is opened ${description}`, type_id: 3 };
            beforeAll(async () => {
                customTest = await prepareTest(customTest, importToken, projectId);
                await logIn.logInAs(user.user_name, user.password);
                await projectList.openProject(project.name);
                await testView.navigateTo(projectId, customTest.id);
            });

            it('I can add existing step', async () => {
                await testView.steps.setAddStepType(testView.steps.stepTypes.given);
                await testView.steps.setAddStep(step1.name);
                await testView.steps.acceptAddStep();
                return expect(testView.steps.isStepAdded(testView.steps.stepTypes.given, step1.name))
                    .toBe(true, 'Existing Step Was not added!');
            });

            it('I can create step inline', async () => {
                await testView.steps.setAddStepType(testView.steps.stepTypes.then);
                await testView.steps.createAddStep(customStep3.name);
                await expect(testView.notification.isSuccess()).toBe(true, 'Notification is not shown on create step!');
                await expect(testView.notification.getContent()).toBe(`The step '${customStep3.name}' was created.`);
                await testView.notification.close();
                await testView.steps.acceptAddStep();
                return expect(testView.steps.isStepAdded(testView.steps.stepTypes.then, customStep3.name))
                    .toBe(true, 'Existing Step Was not added!');
            });

            it('I can change steps order and copy scenario', async () => {
                await testView.steps.setAddStepType(testView.steps.stepTypes.when);
                await testView.steps.createAddStep(customStep2.name);
                await testView.notification.close();
                await testView.steps.acceptAddStep();
                await testView.steps.changeStepOrder(customStep2.name, customStep3.name);
                await testView.copyScenario();
                await expect(testView.notification.isSuccess()).toBe(true, 'Notification is not shown on copy Scenario!');
                await expect(testView.notification.getContent()).toBe(`'${customTest.name}' scenario was copied!`);
                await testView.notification.close();
                return expect(getClipboardText()).toBe(fullScenario(description));
            });

            it('I notified about not saved changes when leaving the page', async () => {
                await testView.menuBar.clickLogo();
                await expect(testView.modal.isVisible()).toBe(true, 'No confirmation modal when leaving test page!');
                return testView.modal.clickNo();
            });

            it('I can save changes', async () => {
                await testView.steps.saveChages();
                await expect(testView.notification.isSuccess()).toBe(true, 'Notification is not shown on save!');
                await expect(testView.notification.getContent()).toBe(`Test steps were updated!`);
                return testView.notification.close();
            });

            it('I not notified about not saved changes after saving changes', async () => {
                await testView.menuBar.clickLogo();
                await expect(testView.modal.isVisible()).toBe(false, 'Confirmation modal shown when leaving test page with saved changes!');
                return projectList.back();
            });

            it('I can discard changes', async () => {
                await testView.steps.changeStepOrder(step1.name, customStep3.name);
                await testView.steps.discardChages();
                await testView.copyScenario();
                await testView.notification.close();
                return expect(getClipboardText()).toBe(fullScenario(description));
            });

            it('I not notified about not saved changes after discarding changes', async () => {
                await testView.menuBar.clickLogo();
                await expect(testView.modal.isVisible())
                    .toBe(false, 'Confirmation modal shown when leaving test page with discard changes!');
                return projectList.back();
            });

            it('I can remove step', async () => {
                await testView.steps.removeStep(step1.name);
                await testView.steps.saveChages();
                await expect(testView.notification.isSuccess()).toBe(true, 'Notification is not shown on save!');
                await expect(testView.notification.getContent()).toBe(`Test steps were updated!`);
                await testView.notification.close();
                return expect(testView.steps.isStepAdded(testView.steps.stepTypes.given, step1.name))
                .toBe(false, 'Step was not removed!');
            });
        });
    });

    using(notEditorExamples, (user, description) => {
        describe(`Permissions: ${description} role:`, () => {
            let customTest: Test = { name: `Project can be opened from Projects list ${description}` };
            beforeAll(async () => {
                customTest = await prepareTest(customTest, importToken, projectId);
                await addStepToTest({step_id: step1.id, test_id: customTest.id, order: 1}, importToken, projectId);

                await logIn.logInAs(user.user_name, user.password);
                await projectList.openProject(project.name);
                return testView.navigateTo(projectId, customTest.id);
            });

            it('I can see steps', async () => {
                return expect(testView.steps.isVisible()).toBe(true, `Steps does not exists for ${description}`);
            });

            it('I cannot change steps', async () => {
                return expect(testView.steps.isAddStepRowExist()).toBe(false, `${description} can add steps to test!`);
            });

            it('I can copy scenario', async () => {
                await testView.copyScenario();
                await expect(testView.notification.isSuccess()).toBe(true, 'Notification is not shown on copy Scenario!');
                await expect(testView.notification.getContent()).toBe(`'${customTest.name}' scenario was copied!`);
                await testView.notification.close();
                return expect(getClipboardText()).toBe(viewerScenario(description));
            });
        });
    });
});
