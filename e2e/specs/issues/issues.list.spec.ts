import { logIn } from '../../pages/login.po';
import { projectList } from '../../pages/project/list.po';
import { ProjectHelper } from '../../helpers/project.helper';
import { Issue } from '../../../src/app/shared/models/issue';
import { projectView } from '../../pages/project/view.po';
import { issuesList } from '../../pages/issues/list.po';
import { issueCreateModal } from '../../pages/modals/issueCreate.po';
import { issueView } from '../../pages/issues/view.po';
import usersTestData from '../../data/users.json';
import using from 'jasmine-data-provider';
import resolutions from '../../data/resolutions.json';

const editorExamples = {
    localManager: usersTestData.localManager,
    manager: usersTestData.manager,
    localEngineer: usersTestData.localEngineer
};

const notEditorExamples = {
    localAdmin: usersTestData.localAdmin,
    viewer: usersTestData.viewer
};

const issue: Issue = {
    resolution_id: 1,
    title: 'Issue list example',
    status_id: 1
};
let createdIssue: Issue;

describe('Issues List:', () => {
    const projectHelper: ProjectHelper = new ProjectHelper();

    beforeAll(async () => {
        await projectHelper.init({
            localAdmin: usersTestData.localAdmin,
            localManager: usersTestData.localManager,
            localEngineer: usersTestData.localEngineer,
            manager: usersTestData.manager,
            viewer: usersTestData.viewer
        });
    });

    afterAll(async () => {
        await projectHelper.dispose();
    });

    using(editorExamples, (user, description) => {
        describe(`Permissions: ${description} role:`, () => {
            beforeAll(async () => {
                await logIn.logInAs(user.user_name, user.password);
                await projectList.openProject(projectHelper.project.name);
                if (createdIssue) {
                    issue.id = createdIssue.id;
                    issue.assignee_id = 0;
                }
                createdIssue = await projectHelper.editorAPI.createIssue(issue);
            });

            it('I can open Issues List page', async () => {
                await projectView.menuBar.issues();
                return expect(issuesList.isOpened()).toBe(true, 'Issues List is not opened!');
            });

            it('I can open create Issue Modal', async () => {
                await issuesList.clickCreate();
                await expect(issueCreateModal.isOpened()).toBe(true, 'Create Issue modal was not opened!');
                await issueCreateModal.cancel();
            });

            it('I can edit Issue status', async () => {
                await issuesList.setStatus('In Progress', createdIssue.title);
                await issuesList.notification.assertIsSuccess(`The issue '${createdIssue.title}' was updated.`);
                await issuesList.refreshByBackButton();
                return expect(issuesList.getStatus(createdIssue.title)).toBe('In Progress', 'Status was not updated!');
            });

            it('I can edit Issue resolution', async () => {
                await issuesList.setResolution(resolutions.global.appIssue.name, createdIssue.title);
                await issuesList.notification.assertIsSuccess(`The issue '${createdIssue.title}' was updated.`);
                await issuesList.refreshByBackButton();
                return expect(issuesList.getResolution(createdIssue.title))
                    .toBe(resolutions.global.appIssue.name, 'Resolution was not updated!');
            });

            it('I can edit Issue Title', async () => {
                createdIssue.title = `${createdIssue.title} Updated`;
                await issuesList.setTitle(createdIssue.title, `${createdIssue.id}`);
                await issuesList.notification.assertIsSuccess(`The issue '${createdIssue.title}' was updated.`);
                await issuesList.refreshByBackButton();
                return expect(issuesList.getTitle(`${createdIssue.id}`)).toBe(createdIssue.title, 'Title was not updated!');
            });

            it('I can edit Issue assignee', async () => {
                await issuesList
                    .setAssignee(`${usersTestData.localEngineer.first_name} ${usersTestData.localEngineer.second_name}`
                        , createdIssue.title);
                await issuesList.notification.assertIsSuccess(`The issue '${createdIssue.title}' was updated.`);
                await issuesList.refreshByBackButton();
                return expect(issuesList.getAssignee(createdIssue.title))
                    .toBe(`${usersTestData.localEngineer.first_name} ${usersTestData.localEngineer.second_name}`
                        , 'Status was not updated!');
            });

            it('I can open Issue by clicking row', async () => {
                await issuesList.openIssue(createdIssue.title);
                return expect(issueView.isOpened()).toBe(true, 'Issue view is not opened!');
            });
        });
    });

    using(notEditorExamples, (user, description) => {
        describe(`Permissions: ${description} role:`, () => {
            beforeAll(async () => {
                await logIn.logInAs(user.user_name, user.password);
                await projectList.openProject(projectHelper.project.name);
                if (createdIssue) {
                    issue.id = createdIssue.id;
                    issue.assignee_id = 0;
                }
                createdIssue = await projectHelper.editorAPI.createIssue(issue);
            });

            it('I can open Issues List page', async () => {
                await projectView.menuBar.issues();
                return expect(issuesList.isOpened()).toBe(true, 'Issues List is not opened!');
            });

            it('Issues table is not editable', async () => {
                return expect(issuesList.isTableEditable()).toBe(false, 'Issues List is editable!');
            });

            it('Create button is not available', async () => {
                return expect(issuesList.isCreateButtonExist()).toBe(false, 'Issues List has create button!');
            });
        });
    });
});

