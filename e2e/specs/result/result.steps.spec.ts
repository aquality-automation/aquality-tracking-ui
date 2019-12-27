import { LogIn } from '../../pages/login.po';
import { ProjectList } from '../../pages/project/list.po';
import { ProjectView } from '../../pages/project/view.po';
import { TestRunView } from '../../pages/testrun/view.po';
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
import { userAdministration } from '../../pages/administration/users.po';
import { permissionsAdministration } from '../../pages/administration/permissions.po';
import { ProjectSettingsAdministration } from '../../pages/administration/projectSettings.po';
import { Step } from '../../../src/app/shared/models/steps';
import { Test } from '../../../src/app/shared/models/test';
import projects from '../../data/projects.json';
import usersTestData from '../../data/users.json';
import results from '../../data/results.json';
import using from 'jasmine-data-provider';
import { TestSuite } from '../../../src/app/shared/models/testSuite';
import { TestRun } from '../../../src/app/shared/models/testRun';
import { TestResultView } from '../../pages/testresult/testresult.po';
import { testData } from '../../utils/testData.util';

const logIn = new LogIn();
const projectList = new ProjectList();
const projectSettingsAdministration: ProjectSettingsAdministration = new ProjectSettingsAdministration();
const projectView = new ProjectView();
const testResultView = new TestResultView();
const testRunView = new TestRunView();
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
        await logIn.logInAs(usersTestData.admin.user_name, usersTestData.admin.password);
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
                await logIn.logInAs(user.user_name, user.password);
                await projectList.openProject(project.name);
                await testRunView.navigateTo(projectId, testRun.id);
                await testRunView.openResult(test.name);
            });

            it('I can see steps section', async () => {
                return expect(testResultView.isStepsSectionExists()).toBe(true, `Steps section is missed for ${description}`);
            });

            it('I can set result for the step', async () => {
                await testResultView.setStepResult(step1.name, results.failed.name);
                await testResultView.notification.isSuccess();
                await expect(testResultView.notification.getContent()).toBe(`The step result '${step1.name}' was updated.`);
                return testResultView.notification.close();
            });

            it('I can set comment for the step', async () => {
                await testResultView.setStepComment(step1.name, 'Unathorized user can not open project page.');
                await testResultView.notification.isSuccess();
                await expect(testResultView.notification.getContent()).toBe(`The step result '${step1.name}' was updated.`);
                return testResultView.notification.close();
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
                await testResultView.notification.isSuccess();
                await expect(testResultView.notification.getContent()).toBe(`The step result '${step2.name}' was updated.`);
                await testResultView.notification.close();
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
                await testResultView.notification.isSuccess();
                await expect(testResultView.notification.getContent()).toBe(`The step result '${step2.name}' was updated.`);
                return testResultView.notification.close();
            });

            it('I can download not image attachment', async () => {
                await expect(testResultView.isDownloadAttachExistsForStep(step2.name)).toBe(true, 'Download Attach is not exist!');
                await testResultView.downloadAttachForStep(step2.name);
                return expect(testResultView.attachIsDownloaded('.docx'))
                    .toBe(true, 'Attachment is not downloaded!');
            });

            it('I can remove attachment', async () => {
                await testResultView.removeAttachForStep(step2.name);
                await testResultView.notification.isSuccess();
                await expect(testResultView.notification.getContent()).toBe(`The step result '${step2.name}' was updated.`);
                await testResultView.notification.close();
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
                testRun = await prepareTestRun(testRun, importToken, projectId);

                await logIn.logInAs(user.user_name, user.password);
                await projectList.openProject(project.name);
                await testRunView.navigateTo(projectId, testRun.id);
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
