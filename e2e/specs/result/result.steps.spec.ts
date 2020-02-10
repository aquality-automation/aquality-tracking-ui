import { logIn } from '../../pages/login.po';
import { testRunView } from '../../pages/testrun/view.po';
import { Step } from '../../../src/app/shared/models/steps';
import { Test } from '../../../src/app/shared/models/test';
import usersTestData from '../../data/users.json';
import results from '../../data/results.json';
import using from 'jasmine-data-provider';
import { TestSuite } from '../../../src/app/shared/models/testSuite';
import { TestRun } from '../../../src/app/shared/models/testRun';
import { testResultView } from '../../pages/testresult/testresult.po';
import { testData } from '../../utils/testData.util';
import { ProjectHelper } from '../../helpers/project.helper';

const imageAttachName = 'image.jpg';
const docAttachName = 'attach.docx';

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

describe('Result Steps:', () => {
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
        step2 = await projectHelper.editorAPI.createStep(step2);
        step3 = await projectHelper.editorAPI.createStep(step3);
        test = await projectHelper.editorAPI.createTest(test);
        await projectHelper.editorAPI.addStepToTest({ step_id: step1.id, test_id: test.id, order: 1 });
        await projectHelper.editorAPI.addStepToTest({ step_id: step2.id, test_id: test.id, order: 2 });
        await projectHelper.editorAPI.addStepToTest({ step_id: step3.id, test_id: test.id, order: 3 });
        suite = await projectHelper.editorAPI.createSuite(suite);
        await await projectHelper.editorAPI.addTestToSuite(test.id, suite.id);
    });

    afterAll(async () => {
        return projectHelper.dispose();
    });

    using(editorExamples, (user, description) => {
        describe(`Permissions: ${description} role:`, () => {
            beforeAll(async () => {
                testRun = {
                    test_suite_id: suite.id,
                    build_name: `build_${new Date().getTime().toString()}`,
                    start_time: new Date()
                };
                testRun = await projectHelper.editorAPI.createTestRun(testRun);
                await logIn.logInAs(user.user_name, user.password);
                await testRunView.navigateTo(projectHelper.project.id, testRun.id);
                await testRunView.openResult(test.name);
            });

            it('I can see steps section', async () => {
                return expect(testResultView.isStepsSectionExists()).toBe(true, `Steps section is missed for ${description}`);
            });

            it('I can set result for the step', async () => {
                await testResultView.setStepResult(step1.name, results.failed.name);
                return testResultView.notification.assertIsSuccess(`The step result '${step1.name}' was updated.`);
            });

            it('I can set comment for the step', async () => {
                await testResultView.setStepComment(step1.name, 'Unathorized user can not open project page.');
                return testResultView.notification.assertIsSuccess(`The step result '${step1.name}' was updated.`);
            });

            it('I can set result for the step in a bulk', async () => {
                const comment = 'Skipped step';
                await testResultView.selectStep(step2.name);
                await testResultView.selectStep(step3.name);
                await testResultView.setBulkStepResult(results.pending.name);
                await testResultView.setBulkStepComment(comment);
                await testResultView.acceptBulkStepEdit();
                await testResultView.notification.close();
                await testResultView.notification.close();
                await expect(testResultView.getStepResult(step2.name)).toBe(results.pending.name, 'Step result is wrong after bulk update');
                await expect(testResultView.getStepResult(step3.name)).toBe(results.pending.name, 'Step result is wrong after bulk update');
                await expect(testResultView.getStepComment(step2.name)).toBe(comment, 'Step comment is wrong after bulk update');
                return expect(testResultView.getStepComment(step3.name)).toBe(comment, 'Step comment is wrong after bulk update');
            });

            it('I can add image attachmet to the step', async () => {
                await testResultView.addAttachToStep(testData.getFullPath(`/attachments/${imageAttachName}`), step2.name);
                await testResultView.notification.assertIsSuccess(`The step result '${step2.name}' was updated.`);
                return expect(testResultView.isAttachAddedToStep(step2.name)).toBe(true, 'Attach is not added!');
            });

            it('I can view image attachmet', async () => {
                await testResultView.openImageAttachmentFromStep(step2.name);
                await expect(testResultView.isAttachmentOpened(step2.name)).toBe(true, 'Image attachment is not opened!');
                await testResultView.closeImageAttachment(step2.name);
                return expect(testResultView.isAttachmentOpened(step2.name)).toBe(false, 'Image attachment is not closed!');
            });

            it('I can change attachmet', async () => {
                await expect(testResultView.isChangeAttachExistsForStep(step2.name)).toBe(true, 'Change Attach is not exist!');
                await testResultView.addAttachToStep(testData.getFullPath(`/attachments/${docAttachName}`), step2.name);
                return testResultView.notification.assertIsSuccess(`The step result '${step2.name}' was updated.`);
            });

            it('I can download not image attachment', async () => {
                await expect(testResultView.isDownloadAttachExistsForStep(step2.name)).toBe(true, 'Download Attach is not exist!');
                await testResultView.downloadAttachForStep(step2.name);
                return expect(testResultView.attachIsDownloaded('.docx'))
                    .toBe(true, 'Attachment is not downloaded!');
            });

            it('I can remove attachment', async () => {
                await testResultView.removeAttachForStep(step2.name);
                await testResultView.notification.assertIsSuccess(`The step result '${step2.name}' was updated.`);
                await expect(testResultView.isChangeAttachExistsForStep(step2.name)).toBe(false, 'Change Attach is not removed!');
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
                testRun = await projectHelper.editorAPI.createTestRun(testRun);

                await logIn.logInAs(user.user_name, user.password);
                await testRunView.navigateTo(projectHelper.project.id, testRun.id);
                return testRunView.openResult(test.name);
            });

            it('I can see steps section', async () => {
                return expect(testResultView.isStepsSectionExists()).toBe(true, `Steps section is missed for ${description}`);
            });

            it('I can see steps section is not editable', async () => {
                return expect(testResultView.isStepsTableEditable()).toBe(false, `Steps Table is editable for ${description}!`);
            });
        });
    });
});
