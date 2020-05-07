import { projectList } from '../../../pages/project/list.po';
import { userAdministration } from '../../../pages/administration/users.po';
import { ProjectHelper } from '../../../helpers/project.helper';
import { projectSettingsAdministration } from '../../../pages/administration/projectSettings.po';
import { logIn } from '../../../pages/login.po';
import { Test } from '../../../../src/app/shared/models/test';
import { TestRun } from '../../../../src/app/shared/models/testRun';
import { TestResult } from '../../../../src/app/shared/models/test-result';
import using from 'jasmine-data-provider';
import usersTestData from '../../../data/users.json';
import cucumberImport from '../../../data/import/cucumber.json';
import resolutions from '../../../data/resolutions.json';
import { notFound } from '../../../pages/notFound.po';
import { Issue } from '../../../../src/app/shared/models/issue';

const editorExamples = {
    admin: usersTestData.autoAdmin,
    localAdmin: usersTestData.localAdmin,
    localManager: usersTestData.localManager,
    manager: usersTestData.manager
};

const notEditorExamples = {
    localEngineer: usersTestData.localEngineer,
};

describe('Administartion: Project Settings:', () => {
    let projectHelper: ProjectHelper;

    using(editorExamples, (user, description) => {
        describe(`Permissions: ${description} role:`, () => {

            beforeAll(async () => {
                const projectUsers = {};
                projectUsers[description] = user;
                projectHelper = new ProjectHelper();
                await projectHelper.init(projectUsers);
                await logIn.logInAs(user.user_name, user.password);
                return projectHelper.openProject();
            });

            afterAll(async () => {
                return projectHelper.dispose();
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
                return expect(projectSettingsAdministration.notification.isVisible())
                    .toBe(false, 'Mesaage is shown after declining the Save action!');
            });

            it('Can disable steps', async () => {
                await projectSettingsAdministration.setSteps(false);
                await projectSettingsAdministration.clickSave();
                await projectSettingsAdministration.modal.clickYes();
                return projectSettingsAdministration.notification.assertIsSuccess(`'${projectHelper.project.name}' project was updated!`);
            });

            it('Number Of Results To Track Stability is 5 by default', async () => {
                const stability = await projectSettingsAdministration.getNumberOfResultsToTrackStability();
                return expect(stability).toBe('5', 'Number Of Results To Track Stability is not 5 by default!');
            });

            it('Application works well when test has no results', async () => {
                let test: Test = await projectHelper.editorAPI.createTest({ name: 'Empty Test' });
                test = (await projectHelper.editorAPI.getTests({ id: test.id, project_id: projectHelper.project.id }))[0];
                expect(test.resolution_colors).toBe(undefined, 'resolution_colors should be empty for empty test!');
                expect(test.result_colors).toBe(undefined, 'result_colors should be empty for empty test!');
                expect(test.result_ids).toBe(undefined, 'result_ids should be empty for empty test!');
            });

            it('When new results were added Last results are added to test', async () => {
                const imported: TestRun[] = await projectHelper.importer
                    .executeCucumberImport('Stability',
                        [cucumberImport],
                        ['cucumber1.json']);

                const results: TestResult[] = await projectHelper.editorAPI
                    .getResults({ test_run_id: imported[0].id, project_id: projectHelper.project.id });
                results.forEach(result => {
                    expect(result.test.resolution_colors)
                        .toBe(`${result.issue
                            ? result.issue.resolution.color
                            : resolutions.global.notAssigned.color}`, 'resolution_colors is wrong!');
                    expect(result.test.result_colors).toBe(`${result.final_result.color}`, 'result_colors is wrong!');
                    expect(result.test.result_ids).toBe(`${result.id}`, 'result_ids is wrong!');
                });
            });

            it('Only specified number of results are shown', async () => {
                await projectHelper.importer
                    .executeCucumberImport('Stability',
                        [cucumberImport, cucumberImport, cucumberImport, cucumberImport],
                        ['cucumber2.json', 'cucumber3.json', 'cucumber4.json', 'cucumber5.json']);
                const imported: TestRun[] = await projectHelper.importer
                    .executeCucumberImport('Stability',
                        [cucumberImport],
                        ['cucumber6.json']);
                let result: TestResult = (await projectHelper.editorAPI
                    .getResults({ test_run_id: imported[0].id, project_id: projectHelper.project.id }))
                    .find(x => x.final_result_id === 5);
                const issue: Issue = await projectHelper.editorAPI.createIssue({
                    title: `${user.user_name} issue`,
                    resolution_id: 4
                });
                result.final_result_id = 1;
                result.issue_id = issue.id;
                result = await projectHelper.editorAPI.createResult(result);
                result = (await projectHelper.editorAPI.getResults(result))[0];
                expect(result.test.resolution_colors).toBe(`${result.issue.resolution.color},3,3,3,3`, 'resolution_colors is wrong!');
                expect(result.test.result_colors).toBe(`${result.final_result.color},4,4,4,4`, 'result_colors is wrong!');
                expect(result.test.result_ids.startsWith(`${result.id}`)).toBe(true, 'result_ids is wrong!');
            });

            it('Number Of Results To Track Stability is changed the correct number of results is returned', async () => {
                await projectSettingsAdministration.setNumberOfResultsToTrackStability(3);
                await projectSettingsAdministration.clickSave();
                await projectSettingsAdministration.notification.assertIsSuccess(`'${projectHelper.project.name}' project was updated!`);
                const tests = await projectHelper.editorAPI.getTests({ project_id: projectHelper.project.id });
                const testWithLastResults = tests.find(x => x.resolution_colors !== undefined);
                expect(testWithLastResults).toBeDefined('Test with Last Results was npt found');
                expect(testWithLastResults.resolution_colors.split(',').length)
                    .toBe(3, 'the resolution_colors number was not changed to 3!');
                expect(testWithLastResults.result_colors.split(',').length).toBe(3, 'the result_colors number was not changed to 3!');
                expect(testWithLastResults.result_ids.split(',').length).toBe(3, 'the result_ids number was not changed to 3!');
            });
        });
    });

    using(notEditorExamples, (user, description) => {
        describe(`Permissions: ${description} role:`, () => {
            beforeAll(async () => {
                const projectUsers = {};
                projectUsers[description] = user;
                projectHelper = new ProjectHelper();
                await projectHelper.init(projectUsers);
                await logIn.logInAs(user.user_name, user.password);
                return projectHelper.openProject();
            });

            afterAll(async () => {
                return projectHelper.dispose();
            });

            it('I can not Open Project Settings page using Menu Bar', async () => {
                return expect(projectList.menuBar.isAdministrationExists())
                    .toBe(false, `Administration should not be visible for ${description}`);
            });

            it('I can not Open Project Settings page using url', async () => {
                await projectSettingsAdministration.navigateTo();
                await expect(projectSettingsAdministration.isOpened()).toBe(false, `Project Settings page is opened for ${description}`);
                return expect(notFound.isOpened()).toBe(true, `Not Found page is not opened for ${description}`);
            });
        });
    });
});

