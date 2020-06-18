import { logIn } from '../../pages/login.po';
import { projectView } from '../../pages/project/view.po';
import { suiteList } from '../../pages/suite/list.po';
import { syncSuite } from '../../pages/modals/syncSuite.po';
import { suiteView } from '../../pages/suite/view.po';
import { ProjectHelper } from '../../helpers/project.helper';
import { TestResult } from '../../../../src/app/shared/models/test-result';
import using from 'jasmine-data-provider';
import cucumberImport from '../../data/import/cucumber.json';
import syncImport from '../../data/import/oneTestCucumber.json';
import users from '../../data/users.json';
import { TestRun } from '../../../../src/app/shared/models/testRun';
import { EditorAPI } from '../../api/editor.api';

const editorExamples = {
  localAdmin: users.localAdmin,
  localManager: users.localManager,
  localEngineer: users.localEngineer,
  manager: users.manager
};

const notEditorExamples = {
  viewer: users.viewer,
  audit_admin: users.auditAdmin,
  auditor: users.assignedAuditor
};

const isTestRunCorrect = (testResults: TestResult[], includedTests: string[], removedTests: string[]) => {
  const tests = Array.from(testResults, testResult => testResult.test.name);
  const included = includedTests.every((includedTest) => tests.includes(includedTest));
  const removed = removedTests.every((removedTest) => !tests.includes(removedTest));
  return included && removed;
};

const updateTestRunDates = (api: EditorAPI, testRun: TestRun, started: Date, finished: Date) => {
  testRun.start_time = started;
  testRun.finish_time = finished;
  return api.createTestRun(testRun);
};

const testSuite = 'Sync Test Suite';
const defaultNumberOfTestRuns = '5';
const numberOfTestRunsForSync = '2';
const noSyncTest = 'Test Feature with all results: All passed';
const syncTest = 'Test Feature with all results: step failed';
const syncAndRemoveTest = 'Test Feature with all results: Step skipped';

describe('Sync Test Suite', () => {
  const projectHelper: ProjectHelper = new ProjectHelper();
  const builds = projectHelper.generateBuilds(3);

  beforeAll(async () => {
    return projectHelper.init({
      localAdmin: users.localAdmin,
      localManager: users.localManager,
      localEngineer: users.localEngineer,
      manager: users.manager,
      viewer: users.viewer,
      audit_admin: users.auditAdmin,
      auditor: users.assignedAuditor
    });
  });

  afterAll(async () => {
    return projectHelper.dispose();
  });

  using(notEditorExamples, (user, description) => {
    describe(`${description} role:`, () => {
      beforeAll(async () => {
        await logIn.logInAs(user.user_name, user.password);
        return projectHelper.openProject();
      });

      it(`Sync suite is not present for role ${description}`, async () => {
        await (await projectView.menuBar.tests()).all();
        return expect(suiteView.isSyncButtonPresent()).toBe(false, `Sync suite should be disable`);
      });
    });
  });

  using(editorExamples, (user, description) => {
    describe(`${description} role:`, () => {
      let notSyncTestRun: TestResult[];
      let syncTestRuns: TestResult[];

      beforeAll(async () => {
        notSyncTestRun = await projectHelper.importer.executeCucumberImport(testSuite, [cucumberImport], [builds.filenames[0]]);
        syncTestRuns = await projectHelper.importer.executeCucumberImport(
          testSuite, [syncImport, syncImport], [builds.filenames[1], builds.filenames[2]]);
        await updateTestRunDates(projectHelper.editorAPI, notSyncTestRun[0], new Date('03/09/2020'), new Date('03/10/2020'));
        await updateTestRunDates(projectHelper.editorAPI, syncTestRuns[0], new Date('03/10/2020'), new Date('03/11/2020'));
        await updateTestRunDates(projectHelper.editorAPI, syncTestRuns[1], new Date('03/11/2020'), new Date('03/12/2020'));
        await logIn.logInAs(user.user_name, user.password);
        return projectHelper.openProject();
      });

      afterAll(async () => {
        await projectHelper.adminAPI.removeTestRun(notSyncTestRun[0].id, projectHelper.project.id);
        await projectHelper.adminAPI.removeTestRun(syncTestRuns[0].id, projectHelper.project.id);
        return projectHelper.adminAPI.removeTestRun(syncTestRuns[1].id, projectHelper.project.id);
      });

      it('Check default fields if suite was not chosen', async () => {
        await (await projectView.menuBar.tests()).all();
        await suiteView.clickSync();
        await expect(syncSuite.getSelectedSuite()).toBe('', 'Selected suite should be empty');
        await expect(syncSuite.isFindTestsButtonEnabled()).toBe(false, 'Find Tests button should be disable if suite is not selected');
        await expect(syncSuite.isSyncButtonEnabled()).toBe(false, 'Sync button should be disable if suite is not selected');
        await expect(syncSuite.isRemoveResultsSelected()).toBe(true, 'Remove results checkbox should be selected by default');
        return expect(syncSuite.getNumberOfTestRuns()).toBe(defaultNumberOfTestRuns,
          `Number of test runs should be ${defaultNumberOfTestRuns} by default`);
      });

      it('Select suite for sync', async () => {
        await syncSuite.selectSuite(testSuite);
        await expect(syncSuite.isSyncButtonEnabled()).toBe(true, 'Sync button should be enable if suite is selected');
        return syncSuite.cancel();
      });

      it('Check default fields if suite was chosen', async () => {
        await (await projectView.menuBar.tests()).suites();
        await suiteList.clickTestSuite(testSuite);
        await suiteView.clickSync();
        await expect(syncSuite.getSelectedSuite()).toBe(testSuite, 'Test suite should be selected by default');
        await expect(syncSuite.isSyncButtonEnabled()).toBe(true, 'Sync button should be enabled');
        return expect(syncSuite.isFindTestsButtonEnabled()).toBe(true, 'Find Tests button should be enabled');
      });

      it('Check fields if number of test runs to sync is empty', async () => {
        await syncSuite.setNumberOfTestRuns('');
        await expect(syncSuite.isSyncButtonEnabled()).toBe(false, 'Sync button should be disable if number of test run is empty');
        return expect(syncSuite.isFindTestsButtonEnabled()).
          toBe(false, 'Find Tests button should be disable if number of test run is empty');
      });

      it('Cancel suite synchronization', async () => {
        await syncSuite.cancel();
        return expect(syncSuite.isOpened()).toBe(false, `Sync suite should be closed`);
      });

      it('No tests found for sync', async () => {
        await suiteView.clickSync();
        await syncSuite.setNumberOfTestRuns(defaultNumberOfTestRuns);
        await syncSuite.findTests();
        return suiteList.notification.assertIsWarning(
          `No test were stored with Not Executed result for at least ${defaultNumberOfTestRuns} last test runs for ${testSuite} suite!`,
          'No tests found');
      });

      it('Tests were found for sync', async () => {
        await syncSuite.setNumberOfTestRuns(numberOfTestRunsForSync);
        await syncSuite.findTests();
        return expect(syncSuite.getTestsForSync()).toEqual([syncTest, syncAndRemoveTest], 'Tests for sync should be found');
      });

      it('Sync no tests selected', async () => {
        await syncSuite.sync();
        return suiteList.notification.assertIsWarning('You should select at least one test to sync!', 'No tests selected');
      });

      it('Sync suite without removing results', async () => {
        await syncSuite.setRemoveResultsState(false);
        await syncSuite.selectTest(syncTest);
        await syncSuite.sync();
        await suiteList.notification.assertIsSuccess(`Tests were synchronized!`, 'Successful');

        await suiteView.refresh();
        await expect(suiteView.isTestPresent(noSyncTest)).toEqual(true, 'noSyncTest should be exist in suite');
        await expect(suiteView.isTestPresent(syncAndRemoveTest)).toEqual(true, 'syncAndRemoveTest should be exist in suite');
        await expect(suiteView.isTestPresent(syncTest)).toEqual(false, 'syncTest should be removed from suite');

        const testResults: TestResult[] = await projectHelper.editorAPI.getResults({
          test_run_id: syncTestRuns[1].id, project_id: projectHelper.project.id
        });

        expect(isTestRunCorrect(testResults, [syncTest, syncAndRemoveTest, noSyncTest], [])).
          toBe(true, 'No test results were removed');
      });

      it('Sync suite with removing results', async () => {
        await (await projectView.menuBar.tests()).suites();
        await suiteList.clickTestSuite(testSuite);
        await suiteView.clickSync();
        await syncSuite.setRemoveResultsState(true);
        await syncSuite.setNumberOfTestRuns(numberOfTestRunsForSync);
        await syncSuite.findTests();
        await syncSuite.selectTest(syncAndRemoveTest);
        await syncSuite.sync();

        const notSyncResults: TestResult[] = await projectHelper.editorAPI.getResults({
          test_run_id: notSyncTestRun[0].id, project_id: projectHelper.project.id
        });

        const syncTestResults1: TestResult[] = await projectHelper.editorAPI.getResults({
          test_run_id: syncTestRuns[0].id, project_id: projectHelper.project.id
        });

        const syncTestResults2: TestResult[] = await projectHelper.editorAPI.getResults({
          test_run_id: syncTestRuns[1].id, project_id: projectHelper.project.id
        });

        expect(isTestRunCorrect(notSyncResults, [syncTest, syncAndRemoveTest, noSyncTest], [])).
          toBe(true, 'notSyncTestRun should contains all tests');
        expect(isTestRunCorrect(syncTestResults1, [syncTest, noSyncTest], [syncAndRemoveTest])).
          toBe(true, 'syncAndRemoveTest should be removed from syncTestRuns1');
        expect(isTestRunCorrect(syncTestResults2, [syncTest, noSyncTest], [syncAndRemoveTest])).
          toBe(true, 'syncAndRemoveTest should be removed from syncTestRuns2');
      });
    });
  });
});
