import { logIn } from '../../pages/login.po';
import { projectView } from '../../pages/project/view.po';
import { testRunView } from '../../pages/testrun/view.po';
import { testRunList } from '../../pages/testrun/list.po';
import { ProjectHelper } from '../../helpers/project.helper';
import usersTestData from '../../data/users.json';
import using from 'jasmine-data-provider';
import cucumberImport from '../../data/import/cucumber.json';
import resolutions from '../../data/resolutions.json';
import { Issue } from '../../../src/app/shared/models/issue';
import { issueCreateModal } from '../../pages/modals/issueCreate.po';
import { TestRun } from '../../../src/app/shared/models/testRun';
import { TestResult } from '../../../src/app/shared/models/test-result';

const editorExamples = {
  localManager: usersTestData.localManager,
  manager: usersTestData.manager,
  localEngineer: usersTestData.localEngineer
};

const notEditorExamples = {
  localAdmin: usersTestData.localAdmin,
  viewer: usersTestData.viewer,
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
  expression: '.*was failed.*',
  assignee: usersTestData.localEngineer,
  external_url: 'https://github.com/aquality-automation/aquality-tracking',
};

const doneIssue: Issue = {
  resolution: resolutions.global.appIssue,
  title: 'Done Issue',
  status_id: 4
};

describe('Test Run: Issue:', () => {
  using(editorExamples, (user, description) => {
    describe(`${description} role:`, () => {
      const projectHelper: ProjectHelper = new ProjectHelper();
      let imported: TestRun[];
      let resultCurrent: TestResult;
      const resultPrevious = async (): Promise<TestResult> => {
        const results = await projectHelper.editorAPI.getResults({ test_run_id: imported[0].id });
        return results.find(x => x.final_result_id === 1);
      };

      beforeAll(async () => {
        const users = {
          localEngineer: usersTestData.localEngineer,
        };
        users[description] = user;
        await projectHelper.init(users);
        await projectHelper.editorAPI.createIssue(existingIssue);
        imported = await projectHelper.importer.executeCucumberImport('All', [cucumberImport, cucumberImport], [`build_1.json`, `build_2.json`]);
        await logIn.logInAs(user.user_name, user.password);
        await projectHelper.openProject();
        await projectView.menuBar.testRuns();
        return testRunList.openTestRun('build_2');
      });

      afterAll(async () => {
        return projectHelper.dispose();
      });

      it('I can Open Create Issue modal from issue lookup', async () => {
        const results = await projectHelper.editorAPI.getResults({ test_run_id: imported[1].id })
        resultCurrent = results.find(x => x.final_result_id === 1);
        await testRunView.addIssue(onlyTitleIssue.title, resultCurrent.test.name);
        return expect(issueCreateModal.isOpened()).toBe(true, 'Issue create modal is not opened')
      });

      it('The Title is inherited from lookup', async () => {
        return expect(issueCreateModal.getTitle()).toBe(onlyTitleIssue.title, 'Title is not inherited')
      });

      it('The Fail Reason is shown on modal as match example', async () => {
        return expect(issueCreateModal.getMatchExample()).toBe(resultCurrent.fail_reason, 'Fail Reason is not inherited')
      });

      it('I can not Create issue without title', async () => {
        await issueCreateModal.setTitle('');
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

      it('I can fill Resolution', async () => {
        await testRunView.addIssue(fullIssue.title, resultCurrent.test.name);
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

      it('Add to Results without issue is selected by default on Create modal', async () => {
        return expect(issueCreateModal.isAddToResultsSelected()).toBe(
          true,
          'Add to Results without issue is not selected by default on Create modal'
        );
      });

      it('I can Create issue with all field filled and not assign to all results', async () => {
        await issueCreateModal.setAddToResults(false);
        await issueCreateModal.save();
        await issueCreateModal.notification.assertIsSuccess(
          `The issue '${fullIssue.title}' was created.`
        );
        await expect(testRunView.getIssue(resultCurrent.test.name)).toContain(fullIssue.title, 'Issue was not asigned to result created for');
        const previousResult = await resultPrevious();
        return expect(previousResult.issue_id).toBeUndefined('Issue was assigned to previous results!');
      });

      it('I can open View Issue modal for selected issue', async () => {
        await testRunView.openSelectedIssue(resultCurrent.test.name);
        return expect(issueCreateModal.isOpened()).toBe(true, 'View Issue modal is not opened')
      });

      it('Add to Results without issue is not selected by default on View modal', async () => {
        return expect(issueCreateModal.isAddToResultsSelected()).toBe(
          false,
          'Add to Results without issue is selected by default on View modal'
        );
      });

      it('I can Create issue with all field filled and assign to all results', async () => {
        await issueCreateModal.setAddToResults(true);
        await issueCreateModal.save();
        await issueCreateModal.notification.assertIsSuccess(
          `The issue '${fullIssue.title}' was updated.`
        );
        const previousResult = await resultPrevious();
        return expect(previousResult.issue.title).toBe(fullIssue.title, 'Issue was not assigned to previous results!');
      });

      it('I can open View Issue modal for not selected issue', async () => {
        await testRunView.openNotSelectedIssue(onlyTitleIssue.title, resultCurrent.test.name);
        await expect(issueCreateModal.isOpened()).toBe(true, 'View Issue modal is not opened');
      });

      it('I can cancel View Issue modal', async () => {
        await issueCreateModal.cancel();
        return expect(issueCreateModal.isOpened()).toBe(false, 'View Issue modal is not closed')
      })

      it('I can not select Done issue for result', async () => {
        return expect(testRunView.isIssuePresent(doneIssue.title, resultCurrent.test.name)).toBe(false, 'Done Issue is present in issue lookup')
      })
    });
  });

  using(notEditorExamples, (user, description) => {
    describe(`${description} role:`, () => {
      const projectHelper: ProjectHelper = new ProjectHelper();
      let result: TestResult;

      beforeAll(async () => {
        const users = {};
        users[description] = user;
        await projectHelper.init(users);

        const issue = await projectHelper.editorAPI.createIssue(existingIssue);
        const imported = await projectHelper.importer.executeCucumberImport('All', [cucumberImport], [`build_1.json`]);
        const results = await projectHelper.editorAPI.getResults({test_run_id: imported[0].id});
        result = results.find(x => x.final_result_id === 1);
        result.issue_id = issue.id;
        await projectHelper.editorAPI.createResult(result)
        await logIn.logInAs(user.user_name, user.password);
        await projectHelper.openProject();
        await projectView.menuBar.testRuns();
        return testRunList.openTestRun('build_1');
      });

      afterAll(async () => {
        return projectHelper.dispose();
      });

      it('I can open View Issue modal for selected issue', async () => {
        await testRunView.openSelectedIssue(result.test.name);
        return expect(issueCreateModal.isOpened()).toBe(true, 'View Issue modal is not opened')
      });

      it('I can not edit View Issue modal', async () => {
        return expect(issueCreateModal.isEditable()).toBe(false, 'View Issue modal is editable')
      });

      it('I can cancel View Issue modal', async () => {
        await issueCreateModal.cancel();
        return expect(issueCreateModal.isOpened()).toBe(false, 'View Issue modal is not closed')
      })
    });
  });
});
