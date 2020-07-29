import { logIn } from '../../pages/login.po';
import { projectList } from '../../pages/project/list.po';
import { getClipboardText } from '../../utils/js.util';
import { testView } from '../../pages/test/test.po';
import { Step } from '../../../../src/app/shared/models/steps';
import { Test } from '../../../../src/app/shared/models/test';
import usersTestData from '../../data/users.json';
import using from 'jasmine-data-provider';
import { ProjectHelper } from '../../helpers/project.helper';

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
    const projectHelper: ProjectHelper = new ProjectHelper();

    beforeAll(async () => {
        await projectHelper.init({
            localAdmin: usersTestData.localAdmin,
            localManager: usersTestData.localManager,
            localEngineer: usersTestData.localEngineer,
            manager: usersTestData.manager,
            viewer: usersTestData.viewer
        }, true);
        step1 = await projectHelper.editorAPI.createStep(step1);
    });

    afterAll(async () => {
        return projectHelper.dispose();
    });

    using(editorExamples, (user, description) => {
        describe(`Permissions: ${description} role:`, () => {
            let customTest: Test = { name: `${test.name} ${description}` };
            const customStep2 = { name: `I click project row ${description}`, type_id: 2 };
            const customStep3 = { name: `Project page is opened ${description}`, type_id: 3 };
            beforeAll(async () => {
                customTest = await projectHelper.editorAPI.createTest(customTest);
                await logIn.logInAs(user.user_name, user.password);
                await testView.navigateTo(projectHelper.project.id, customTest.id);
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
                await testView.notification.assertIsSuccess(`The step '${customStep3.name}' was created.`);
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
                await testView.notification.assertIsSuccess(`'${customTest.name}' scenario was copied!`);
                return expect(getClipboardText()).toBe(fullScenario(description));
            });

            it('I notified about not saved changes when leaving the page', async () => {
                await testView.menuBar.clickLogo();
                await expect(testView.modal.isVisible()).toBe(true, 'No confirmation modal when leaving test page!');
                return testView.modal.clickNo();
            });

            it('I can save changes', async () => {
                await testView.steps.saveChages();
                return testView.notification.assertIsSuccess(`Test steps were updated!`);
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
                await testView.notification.assertIsSuccess(`Test steps were updated!`);
                return expect(testView.steps.isStepAdded(testView.steps.stepTypes.given, step1.name))
                .toBe(false, 'Step was not removed!');
            });
        });
    });

    using(notEditorExamples, (user, description) => {
        describe(`Permissions: ${description} role:`, () => {
            let customTest: Test = { name: `Project can be opened from Projects list ${description}` };
            beforeAll(async () => {
                customTest = await projectHelper.editorAPI.createTest(customTest);
                await projectHelper.editorAPI.addStepToTest({step_id: step1.id, test_id: customTest.id, order: 1});

                await logIn.logInAs(user.user_name, user.password);
                return testView.navigateTo(projectHelper.project.id, customTest.id);
            });

            it('I can see steps', async () => {
                return expect(testView.steps.isVisible()).toBe(true, `Steps does not exists for ${description}`);
            });

            it('I cannot change steps', async () => {
                return expect(testView.steps.isAddStepRowExist()).toBe(false, `${description} can add steps to test!`);
            });

            it('I can copy scenario', async () => {
                await testView.copyScenario();
                await testView.notification.assertIsSuccess(`'${customTest.name}' scenario was copied!`);
                return expect(getClipboardText()).toBe(viewerScenario(description));
            });
        });
    });
});
