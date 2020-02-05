import { logIn } from '../../pages/login.po';
import { projectList } from '../../pages/project/list.po';
import { notFound } from '../../pages/notFound.po';
import { ProjectHelper } from '../../helpers/project.helper';
import using from 'jasmine-data-provider';
import usersTestData from '../../data/users.json';
import { userAdministration } from '../../pages/administration/users.po';
import { predefinedResolutions } from '../../pages/administration/predefinedResolutions.po';
import resolutions from '../../data/resolutions.json';
import cucumberImport from '../../data/import/cucumber.json';
import { TestRun } from '../../../src/app/shared/models/testRun';
import { TestResult } from '../../../src/app/shared/models/test-result';

const editorExamples = {
    admin: usersTestData.admin,
    localAdmin: usersTestData.localAdmin,
    localManager: usersTestData.localManager,
    manager: usersTestData.manager,
    localEngineer: usersTestData.localEngineer
};

const notEditorExamples = {
    viewer: usersTestData.viewer,
};

const create = {
    resolution: resolutions.global.testIssue,
    comment: 'Test Issue',
    expression: '.* Some error .*'
};

const edit = {
    resolution: resolutions.global.appIssue,
    comment: 'App Issue',
    expression: '.*step.* was skipped.*'
};

const creationError = 'Fill all required fields';

fdescribe('Predefined Resolution:', () => {
    const projectHelper: ProjectHelper = new ProjectHelper();

    beforeAll(async () => {
        await projectHelper.init({
            localAdmin: usersTestData.localAdmin,
            localManager: usersTestData.localManager,
            localEngineer: usersTestData.localEngineer,
            viewer: usersTestData.viewer,
        });
    });

    afterAll(async () => {
        await projectHelper.dispose();
    });

    using(editorExamples, (user, description) => {
        describe(`${description} role:`, () => {
            beforeAll(async () => {
                await logIn.logInAs(user.user_name, user.password);
                await projectHelper.openProject();
            });

            it('I can open Predefined Resolution page', async () => {
                await (await projectList.menuBar.user()).administration();
                await userAdministration.sidebar.predefinedResolutions();
                return expect(predefinedResolutions.isOpened()).toBe(true, `Predefined Resolution page is not opened for ${description}`);
            });

            it('I can not create Predefined Resolution without Resolution', async () => {
                await predefinedResolutions.selectProject(projectHelper.project.name);
                await predefinedResolutions.openCreation();
                await predefinedResolutions.fillComment(create.comment);
                await predefinedResolutions.fillExpression(create.expression);
                return expect(await predefinedResolutions.getCreationError()).toBe(creationError, 'Error is not shown on creation!');
            });

            it('I can not create Predefined Resolution without Resolution', async () => {
                await predefinedResolutions.selectResolution(create.resolution.name);
                await predefinedResolutions.fillComment('');
                return expect(await predefinedResolutions.getCreationError()).toBe(creationError, 'Error is not shown on creation!');
            });

            it('I can not create Predefined Resolution without Resolution', async () => {
                await predefinedResolutions.selectResolution(create.resolution.name);
                await predefinedResolutions.fillComment(create.comment);
                await predefinedResolutions.fillExpression('');
                return expect(await predefinedResolutions.getCreationError()).toBe(creationError, 'Error is not shown on creation!');
            });

            it('I can create Predefined Resolution without Assignee', async () => {
                await predefinedResolutions.selectResolution(create.resolution.name);
                await predefinedResolutions.fillComment(create.comment);
                await predefinedResolutions.fillExpression(create.expression);
                await predefinedResolutions.clickCreate();
                return predefinedResolutions.notification.assertIsSuccess('Predefined Resolution was created!');
            });

            it('I can remove Predefined Resolution without Assignee', async () => {
                await predefinedResolutions.clickRemoveResolution(create.expression);
                await expect(predefinedResolutions.modal.isPresent())
                    .toBe(true, 'Confirmation modal is not shown!');
                await predefinedResolutions.modal.clickYes();
                return predefinedResolutions.notification.assertIsSuccess('Predefined Resolution was removed!');
            });

            it('I can create Predefined Resolution', async () => {
                await predefinedResolutions.selectResolution(create.resolution.name);
                await predefinedResolutions.fillComment(create.comment);
                await predefinedResolutions.fillExpression(create.expression);
                await predefinedResolutions.selectAssignee(usersTestData.localEngineer.user_name);
                await predefinedResolutions.clickCreate();
                return predefinedResolutions.notification.assertIsSuccess('Predefined Resolution was created!');
            });

            it('I can Update Predefined Resolution', async () => {
                const updateMessage = 'Predefined Resolution was updated!';
                await predefinedResolutions.updateResolution(edit.resolution.name, predefinedResolutions.columns.resolution,
                    create.resolution.name, predefinedResolutions.columns.resolution);
                await predefinedResolutions.notification.assertIsSuccess(updateMessage);

                await predefinedResolutions.updateResolution(edit.comment, predefinedResolutions.columns.comment,
                    edit.resolution.name, predefinedResolutions.columns.resolution);
                await predefinedResolutions.notification.assertIsSuccess(updateMessage);

                await predefinedResolutions.updateResolution(edit.expression, predefinedResolutions.columns.expression,
                    edit.resolution.name, predefinedResolutions.columns.resolution);
                await predefinedResolutions.notification.assertIsSuccess(updateMessage);

                await predefinedResolutions.updateResolution(usersTestData.localAdmin.user_name, predefinedResolutions.columns.assignee,
                    edit.resolution.name, predefinedResolutions.columns.resolution);
                return predefinedResolutions.notification.assertIsSuccess(updateMessage);
            });

            it('I can see that import affected by Predefined Resolution', async () => {
                const imported: TestRun = (await projectHelper.importer
                    .executeCucumberImport('Predefined Resolution', [cucumberImport], ['cucumber.json']))[0];
                const results: TestResult[] = await projectHelper.editorAPI.getResults({
                    test_run_id: imported.id,
                    project_id: projectHelper.project.id
                });

                const result = results.find(x => x.fail_reason === 'step was skippedstep was skipped');
                if (result) {
                    expect(result.assigned_user.user.user_name).toBe(usersTestData.localAdmin.user_name, 'Assignee was not filled!');
                    expect(result.test_resolution.name).toBe(edit.resolution.name, 'Resolution was not filled!');
                    expect(result.comment).toBe(edit.comment, 'Comment was not filled!');
                } else {
                    expect(result).toBeDefined('The imported results do not contain expected result!');
                }
            });

            it('I can remove Predefined Resolution', async () => {
                await predefinedResolutions.clickRemoveResolution(edit.expression);
                await expect(predefinedResolutions.modal.isPresent())
                    .toBe(true, 'Confirmation modal is not shown!');
                await predefinedResolutions.modal.clickYes();
                return predefinedResolutions.notification.assertIsSuccess('Predefined Resolution was removed!');
            });
        });
    });

    using(notEditorExamples, (user, description) => {
        describe(`${description} role:`, () => {
            beforeAll(async () => {
                await logIn.logInAs(user.user_name, user.password);
                return projectHelper.openProject();
            });

            it('I can not open Predefined Resolution page using Menu Bar', async () => {
                return expect((await projectList.menuBar.user()).isAdministrationExists())
                    .toBe(false, `Administartion should not be visible for ${description}`);
            });

            it('I can not open Predefined Resolution page using url', async () => {
                await predefinedResolutions.navigateTo();
                await expect(predefinedResolutions.isOpened()).toBe(false, `API Token page is opened for ${description}`);
                return expect(notFound.isOpened()).toBe(true, `404 page is not opened for ${description}`);
            });
        });
    });
});

