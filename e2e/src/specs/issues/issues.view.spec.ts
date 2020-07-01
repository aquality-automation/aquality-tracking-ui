import { logIn } from '../../pages/login.po';
import { projectList } from '../../pages/project/list.po';
import { ProjectHelper } from '../../helpers/project.helper';
import { Issue } from '../../../../src/app/shared/models/issue';
import { projectView } from '../../pages/project/view.po';
import { issuesList } from '../../pages/issues/list.po';
import { issueView } from '../../pages/issues/view.po';
import usersTestData from '../../data/users.json';
import using from 'jasmine-data-provider';
import issueStatuses from '../../data/issueStatuses.json';
import resolutions from '../../data/resolutions.json';
import cucumberImport from '../../data/import/cucumber.issue.json';

const editorExamples = {
  localManager: usersTestData.localManager,
  manager: usersTestData.manager,
  localEngineer: usersTestData.localEngineer,
};

const notEditorExamples = {
  localAdmin: usersTestData.localAdmin,
  viewer: usersTestData.viewer
};

const existingIssue: Issue = {
  resolution_id: 1,
  title: 'Issue Existing',
  status_id: 1,
  expression: '.*step skipped.*',
};

const issue: Issue = {
  title: 'Full Issue',
};

let issueIsUse: Issue;

describe('Issue View:', () => {
  using(editorExamples, (user, description) => {
    describe(`Permissions: ${description} role:`, () => {
      const projectHelper: ProjectHelper = new ProjectHelper();

      beforeAll(async () => {
        const users = {
          localEngineer: usersTestData.localEngineer,
        };
        users[description] = user;
        await projectHelper.init(users);
        await projectHelper.editorAPI.createIssue(existingIssue);
        issueIsUse = await projectHelper.editorAPI.createIssue(issue);
        await logIn.logInAs(user.user_name, user.password);
        await projectList.openProject(projectHelper.project.name);
        await projectView.menuBar.issues();
        return issuesList.openIssue(issueIsUse.title);
      });

      afterAll(async () => {
        return projectHelper.dispose();
      });

      it('I can not set empty issue title', async () => {
        await issueView.setTitle('');
        await issueView.save();
        return issueView.notification.assertIsError('Title cannot be empty!');
      });

      it('I can not duplicate issue title', async () => {
        await issueView.setTitle(existingIssue.title);
        await issueView.save();
        return issueView.notification.assertIsError(
          'Cannot create! Issue with this title already exists in this Project!');
      });

      it('I can rename issue', async () => {
        issueIsUse.title = `renamed ${user.user_name} ${new Date().getMilliseconds()}`;
        await issueView.setTitle(issueIsUse.title);
        await issueView.save();
        await issueView.notification.assertIsSuccess(`The issue '${issueIsUse.title}' was updated.`);
        return expect(issueView.getTitle()).toBe(issueIsUse.title, 'Title was not updated!');
      });

      it('I can change resolution', async () => {
        issueIsUse.resolution = resolutions.global.appIssue;
        await issueView.setResolution(issueIsUse.resolution.name);
        await issueView.save();
        await issueView.notification.assertIsSuccess(`The issue '${issueIsUse.title}' was updated.`);
        return expect(issueView.getResolution()).toBe(issueIsUse.resolution.name, 'Resolution was not updated!');
      });

      it('I can change assignee', async () => {
        issueIsUse.assignee = usersTestData.localEngineer;
        await issueView.setAssignee(`${issueIsUse.assignee.first_name} ${issueIsUse.assignee.second_name}`);
        await issueView.save();
        await issueView.notification.assertIsSuccess(`The issue '${issueIsUse.title}' was updated.`);
        return expect(issueView.getAssignee())
          .toBe(`${issueIsUse.assignee.first_name} ${issueIsUse.assignee.second_name}`, 'Assignee was not updated!');
      });

      it('I can remove assignee', async () => {
        issueIsUse.assignee = undefined;
        await issueView.setAssignee(`Assignee`);
        await issueView.save();
        await issueView.notification.assertIsSuccess(`The issue '${issueIsUse.title}' was updated.`);
        return expect(issueView.getAssignee()).toBe('', 'Assignee was not cleared!');
      });

      it('I can set external issue link', async () => {
        issueIsUse.external_url = 'https://github.com/aquality-automation/aquality-tracking';
        await issueView.setExternalIssue(issueIsUse.external_url);
        await issueView.save();
        await issueView.notification.assertIsSuccess(`The issue '${issueIsUse.title}' was updated.`);
        return expect(issueView.getExternalIssue()).toBe(issueIsUse.external_url, 'External Issue was not updated!');
      });

      it('I can remove external issue link', async () => {
        issueIsUse.external_url = '';
        await issueView.setExternalIssue(issueIsUse.external_url);
        await issueView.save();
        await issueView.notification.assertIsSuccess(`The issue '${issueIsUse.title}' was updated.`);
        return expect(issueView.getExternalIssue()).toBe(issueIsUse.external_url, 'External Issue was not cleared!');
      });

      it('I can add description', async () => {
        issueIsUse.description = `1) step 1
        \n2) step 2
        \n3) step 3`;
        await issueView.setDescription(issueIsUse.description);
        await issueView.save();
        await issueView.notification.assertIsSuccess(`The issue '${issueIsUse.title}' was updated.`);
        return expect(issueView.getDescription()).toBe(issueIsUse.description, 'External Issue was not updated!');
      });

      it('I can remove description', async () => {
        issueIsUse.description = '';
        await issueView.setDescription(issueIsUse.description);
        await issueView.save();
        await issueView.notification.assertIsSuccess(`The issue '${issueIsUse.title}' was updated.`);
        return expect(issueView.getDescription()).toBe(issueIsUse.description, 'External Issue was not updated!');
      });

      it('I can see error message when issue expression is overlapped', async () => {
        issueIsUse.expression = '.*';
        await issueView.setExpression(issueIsUse.expression);
        return expect(issueView.getExpressionError()).toBe('Expression is overlapped!', '`Expression is overlapped!` message is missed!');
      });

      it('I can not see Save and Assign button when issue expression is overlapped', async () => {
        return expect(issueView.isSaveAndAssignAvailable()).toBe(false, 'Save and Assign button available when expression is overlapped');
      });

      it('Save and Flow buttons are disabled when issue expression is overlapped', async () => {
        return expect(issueView.isFlowButtonsDisabled()).toBe(true, 'Flow buttonsa are not disabled when expression is overlapped');
      });

      it('I can see overlapped issue', async () => {
        return expect(issueView.isIssueOverlappedWith(existingIssue.title)).toBe(true, 'Overlapped issue is not shown in table!');
      });

      it('I can add Fail Reason Example text', async () => {
        const expectedHTML = '<b style=" margin: 0 1px; background-color: #b0d0e9; font-weight: normal;">was failed as expected</b>' +
          '<b style=" margin: 0 1px; background-color: #b0d0e9; font-weight: normal;"></b>';
        await issueView.setFailReasonExample('was failed as expected');
        return expect(issueView.getRegexpTesterHtml()).toBe(expectedHTML, 'Regexp tester works wrong when changing test text!');
      });

      it('Regexp tester updated when Expression updated', async () => {
        const expectedHTMLPart = '<b style=" margin: 0 1px; background-color: #b0d0e9; font-weight: normal;">was</b> failed as expected';
        issueIsUse.expression = '.*was';
        await issueView.setExpression(issueIsUse.expression);
        await expect(issueView.getRegexpTesterHtml()).toBe(expectedHTMLPart, 'Regexp tester works wrong when changing expression!');
        const expectedHTMLFull = '<b style=" margin: 0 1px; background-color: #b0d0e9; font-weight: normal;">was failed as expected</b>';
        issueIsUse.expression = '.*was.*as expected.*';
        await issueView.setExpression(issueIsUse.expression);
        return expect(issueView.getRegexpTesterHtml()).toBe(expectedHTMLFull, 'Regexp tester works wrong when changing expression!');
      });

      it('I see Save and Assign button when issue expression is not overlapped', async () => {
        return expect(issueView.isSaveAndAssignAvailable()).toBe(true, 'Save and Assign button available when expression is overlapped');
      });

      it('Issue can be assigned automatically after saving the issue.', async () => {
        const imported = await projectHelper.importer.executeCucumberImport('All', [cucumberImport], ['cucumber.json']);
        await issueView.clickSaveAndAssigne();
        await issueView.notification.assertIsSuccess(`The issue '${issueIsUse.title}' was updated.`);
        const results = await projectHelper.editorAPI.getResults({ test_run_id: imported[0].id });
        const result = results.find(x => x.issue_id === issueIsUse.id);
        expect(result)
          .toBeDefined('Issue was not assigned to any results in imported test run!');
        expect(new RegExp(issueIsUse.expression, 'gs').test(result.fail_reason))
          .toBe(true, `${result.fail_reason} does not match ${issueIsUse.expression} expression!`);
      });

      it('I can see affected test in affected tests table', async () => {
        return expect(issueView.isTestInAffectedTestsTable(cucumberImport[0].elements.find(x => x.id === 'failed').name))
          .toBe(true, 'Test does not appear in Affected tests table!');
      });

      it('I can start progress on issue', async () => {
        await issueView.startProgress();
        await issueView.notification.assertIsSuccess(`The issue '${issueIsUse.title}' was updated.`);
        return expect(issueView.getStatusBadge()).toBe(issueStatuses.inProgress, 'Issue status is wrong!');
      });

      it('I can reopen started issue', async () => {
        await issueView.reopen();
        await issueView.notification.assertIsSuccess(`The issue '${issueIsUse.title}' was updated.`);
        return expect(issueView.getStatusBadge()).toBe(issueStatuses.open, 'Issue status is wrong!');
      });

      it('I can start progress on issue and mark it as can not reproduce', async () => {
        await issueView.startProgress();
        await issueView.cannotReproduce();
        await issueView.notification.assertIsSuccess(`The issue '${issueIsUse.title}' was updated.`);
        return expect(issueView.getStatusBadge()).toBe(issueStatuses.canNotReproduce, 'Issue status is wrong!');
      });

      it('I can reopen can not reproduce issue', async () => {
        await issueView.reopen();
        await issueView.notification.assertIsSuccess(`The issue '${issueIsUse.title}' was updated.`);
        return expect(issueView.getStatusBadge()).toBe(issueStatuses.open, 'Issue status is wrong!');
      });

      it('I can start progress on issue and mark it as closed', async () => {
        await issueView.startProgress();
        await issueView.close();
        await issueView.notification.assertIsSuccess(`The issue '${issueIsUse.title}' was updated.`);
        return expect(issueView.getStatusBadge()).toBe(issueStatuses.closed, 'Issue status is wrong!');
      });

      it('I can reopen closed issue', async () => {
        await issueView.reopen();
        await issueView.notification.assertIsSuccess(`The issue '${issueIsUse.title}' was updated.`);
        return expect(issueView.getStatusBadge()).toBe(issueStatuses.open, 'Issue status is wrong!');
      });

      it('I can mark closed issue as done', async () => {
        await issueView.startProgress();
        await issueView.close();
        await issueView.done();
        await issueView.notification.assertIsSuccess(`The issue '${issueIsUse.title}' was updated.`);
        return expect(issueView.getStatusBadge()).toBe(issueStatuses.done, 'Issue status is wrong!');
      });

      it('I can not edit done issue', async () => {
        return expect(issueView.isPageEditable()).toBe(false, 'Page is Editable when issue is Done!');
      });

      it('Done Issue is not assigned to imported result', async () => {
        const imported = await projectHelper.importer.executeCucumberImport('All', [cucumberImport], ['cucumber2.json']);
        const results = await projectHelper.editorAPI.getResults({ test_run_id: imported[0].id });
        const result = results.find(x => x.issue_id === issueIsUse.id);
        expect(result)
          .toBeUndefined('Issue was assigned to result in imported test run!');
      });

      it('I can reopen done issue', async () => {
        await issueView.reopen();
        await issueView.notification.assertIsSuccess(`The issue '${issueIsUse.title}' was updated.`);
        return expect(issueView.getStatusBadge()).toBe(issueStatuses.open, 'Issue status is wrong!');
      });
    });
  });

  using(notEditorExamples, (user, description) => {
    describe(`Permissions: ${description} role:`, () => {
      const projectHelper: ProjectHelper = new ProjectHelper();

      beforeAll(async () => {
        const users = {};
        users[description] = user;
        await projectHelper.init(users);
        issueIsUse = await projectHelper.editorAPI.createIssue(issue);
        await logIn.logInAs(user.user_name, user.password);
        await projectList.openProject(projectHelper.project.name);
        await projectView.menuBar.issues();
        return issuesList.openIssue(issueIsUse.title);
      });

      afterAll(async () => {
        return projectHelper.dispose();
      });

      it('I can not edit Issue', async () => {
        return expect(issueView.isPageEditable()).toBe(false, `Page is Editable for ${description}`);
      });

      it('I can not change issue status Issue', async () => {
        return expect(issueView.areFlowButtonsPresent()).toBe(false, `User ${description} has buttons to change status!`);
      });
    });
  });
});
