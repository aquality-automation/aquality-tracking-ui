import { logIn } from '../../pages/login.po';
import { projectList } from '../../pages/project/list.po';
import { ProjectHelper } from '../../helpers/project.helper';
import { Issue } from '../../../src/app/shared/models/issue';
import { projectView } from '../../pages/project/view.po';
import { issuesList } from '../../pages/issues/list.po';
import { issueCreateModal } from '../../pages/modals/issueCreate.po';
import usersTestData from '../../data/users.json';
import using from 'jasmine-data-provider';
import resolutions from '../../data/resolutions.json';

const editorExamples = {
  localManager: usersTestData.localManager,
  manager: usersTestData.manager,
  localEngineer: usersTestData.localEngineer,
};

const existingIssue: Issue = {
  resolution_id: 1,
  title: 'Issue Existing',
  status_id: 1,
  expression: '.*step skipped.*',
};

const onlyTitleIssue: Issue = {
  title: 'Only Title Issue',
};

const fullIssue: Issue = {
  resolution: resolutions.global.appIssue,
  title: 'Full Issue',
  expression: '.*step failed.*',
  assignee: usersTestData.localEngineer,
  external_url: 'https://github.com/aquality-automation/aquality-tracking',
};

describe('Issue Create from List:', () => {
  using(editorExamples, (user, description) => {
    describe(`Permissions: ${description} role:`, () => {
      let projectHelper: ProjectHelper;
      beforeAll(async () => {
        projectHelper = new ProjectHelper();
        await projectHelper.init({
          localManager: usersTestData.localManager,
          localEngineer: usersTestData.localEngineer,
          manager: usersTestData.manager,
        });
        await projectHelper.editorAPI.createIssue(existingIssue);
        await logIn.logInAs(user.user_name, user.password);
        await projectList.openProject(projectHelper.project.name);
        await projectView.menuBar.issues();
        return issuesList.clickCreate();
      });

      afterAll(async () => {
        await projectHelper.dispose();
        projectHelper = undefined;
      });

      it('I can not Create issue without title', async () => {
        await issueCreateModal.save();
        return issueCreateModal.notification.assertIsError(
          'You should fill Title and Resolution fields!',
          'Fill all required fields!'
        );
      });

      it('I can not Create issue with existing issue title', async () => {
        await issueCreateModal.setTitle(existingIssue.title);
        await issueCreateModal.save();
        return issueCreateModal.notification.assertIsError(
          'Cannot create! Issue with this title already exists in this Project!',
          'Ooops! 409 code'
        );
      });

      it('I can Create issue with only title', async () => {
        await issueCreateModal.setTitle(onlyTitleIssue.title);
        await issueCreateModal.save();
        return issueCreateModal.notification.assertIsSuccess(
          `The issue '${onlyTitleIssue.title}' was created.`
        );
      });

      it('Create Issue modal is closed after creation', async () => {
        return expect(issueCreateModal.isOpened()).toBe(
          false,
          'Create Issue modal was not closed after issue creation!'
        );
      });

      it('I can see created issue in issues list', async () => {
        return expect(issuesList.isIssuePresent(onlyTitleIssue.title)).toBe(
          true,
          'Created Issue does not appear in Issues List!'
        );
      });

      it('I can fill Resolution', async () => {
        await issuesList.clickCreate();
        await issueCreateModal.setTitle(fullIssue.title);
        await issueCreateModal.setResolution(fullIssue.resolution.name);
        return expect(issueCreateModal.getResolution()).toBe(
          fullIssue.resolution.name,
          'Resolution was not selected'
        );
      });

      it('I can fill Assignee', async () => {
        await issueCreateModal.setAssignee(
          `${fullIssue.assignee.first_name} ${fullIssue.assignee.second_name}`
        );
        return expect(issueCreateModal.getAssignee()).toBe(
          `${fullIssue.assignee.first_name} ${fullIssue.assignee.second_name}`,
          'Assignee was not selected'
        );
      });

      it('I can fill External Issue', async () => {
        await issueCreateModal.setExternalIssue(fullIssue.external_url);
        return expect(issueCreateModal.getExternalIssue()).toBe(
          fullIssue.external_url,
          'External Issue was not filled'
        );
      });

      it('I can see error message when entered overlapped Expression', async () => {
        await issueCreateModal.setExpression('.*');
        return expect(issueCreateModal.getExpressionError()).toBe(
          'Expression is overlapped!',
          'Error message is not appeared'
        );
      });

      it('I can see Issue with overlapped expression in table below', async () => {
        await expect(issueCreateModal.isOverlappedIssuesTableExist()).toBe(
          true,
          'Overlapped Issues Table does not Exist!'
        );
        return expect(
          issueCreateModal.isIssueInOverlappedTable(existingIssue.title)
        ).toBe(true, 'Existing Issue is not in Overlapped Issues Table !');
      });

      it('I cannot create issue when expression is overlapped', async () => {
        await issueCreateModal.save();
        return issueCreateModal.notification.assertIsError(
          'The Regular Expression sould not be overlapped with other issues!',
          'Expression is overlapped!'
        );
      });

      it('Overlapped expressions table is hidden when expression is not overlapped', async () => {
        await issueCreateModal.setExpression(fullIssue.expression);
        return expect(issueCreateModal.isOverlappedIssuesTableExist()).toBe(
          false,
          'Overlapped Issues Table Exists!'
        );
      });

      it('I can Create issue with all field filled', async () => {
        await issueCreateModal.save();
        return issueCreateModal.notification.assertIsSuccess(
          `The issue '${fullIssue.title}' was created.`
        );
      });
    });
  });
});
